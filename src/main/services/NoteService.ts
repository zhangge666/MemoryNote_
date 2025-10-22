/**
 * 笔记服务
 * 负责笔记的数据库操作和文件同步
 */

import { randomUUID } from 'crypto';
import { DatabaseManager } from '../database/DatabaseManager';
import { FileSystemService } from './FileSystemService';
import type { 
  Note, 
  Folder, 
  Tag, 
  NoteFilter, 
  CreateNoteOptions, 
  UpdateNoteOptions,
  CreateFolderOptions,
  NoteStats
} from '@shared/types/note';
import path from 'path';

export class NoteService {
  constructor(
    private db: DatabaseManager,
    private fs: FileSystemService
  ) {}

  // ==================== 笔记操作 ====================

  /**
   * 创建笔记
   */
  async createNote(options: CreateNoteOptions): Promise<Note> {
    const id = randomUUID();
    const now = Date.now();
    
    // 生成文件路径
    let folderPath = '';
    if (options.folderId) {
      const folder = await this.getFolderById(options.folderId);
      if (folder) {
        folderPath = folder.path;
      }
    }
    
    const filePath = this.fs.generateUniqueFileName(options.title, folderPath);
    const content = options.content || '';
    
    // 写入文件
    await this.fs.writeNote(filePath, content);
    
    // 提取摘要和字数
    const excerpt = this.fs.extractExcerpt(content);
    const wordCount = this.fs.countWords(content);
    
    // 插入数据库
    await this.db.execute(
      `INSERT INTO notes (id, title, file_path, folder_id, content, excerpt, word_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, options.title, filePath, options.folderId || null, content, excerpt, wordCount, now, now]
    );
    
    // 添加标签
    if (options.tags && options.tags.length > 0) {
      await this.setNoteTags(id, options.tags);
    }
    
    return await this.getNoteById(id) as Note;
  }

  /**
   * 获取笔记详情
   */
  async getNoteById(id: string): Promise<Note | null> {
    const row = await this.db.queryOne<any>(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );
    
    if (!row) return null;
    
    // 获取标签
    const tags = await this.getNoteTags(id);
    
    return this.mapRowToNote(row, tags);
  }

  /**
   * 更新笔记
   */
  async updateNote(options: UpdateNoteOptions): Promise<Note | null> {
    const note = await this.getNoteById(options.id);
    if (!note) return null;
    
    const now = Date.now();
    const updates: string[] = [];
    const values: any[] = [];
    
    // 处理内容更新
    if (options.content !== undefined) {
      await this.fs.writeNote(note.filePath, options.content);
      
      const excerpt = this.fs.extractExcerpt(options.content);
      const wordCount = this.fs.countWords(options.content);
      
      updates.push('content = ?', 'excerpt = ?', 'word_count = ?');
      values.push(options.content, excerpt, wordCount);
    }
    
    // 处理标题更新
    if (options.title !== undefined && options.title !== note.title) {
      updates.push('title = ?');
      values.push(options.title);
      
      // 如果标题变化，可能需要重命名文件
      const newFilePath = this.fs.generateUniqueFileName(
        options.title, 
        path.dirname(note.filePath)
      );
      
      if (newFilePath !== note.filePath) {
        await this.fs.moveNote(note.filePath, newFilePath);
        updates.push('file_path = ?');
        values.push(newFilePath);
      }
    }
    
    // 处理文件夹移动
    if (options.folderId !== undefined) {
      let newFolderPath = '';
      if (options.folderId) {
        const folder = await this.getFolderById(options.folderId);
        if (folder) {
          newFolderPath = folder.path;
        }
      }
      
      const fileName = path.basename(note.filePath);
      const newFilePath = path.join(newFolderPath, fileName);
      
      if (newFilePath !== note.filePath) {
        await this.fs.moveNote(note.filePath, newFilePath);
        updates.push('file_path = ?', 'folder_id = ?');
        values.push(newFilePath, options.folderId || null);
      }
    }
    
    // 处理其他字段
    if (options.isPinned !== undefined) {
      updates.push('is_pinned = ?');
      values.push(options.isPinned ? 1 : 0);
    }
    
    if (options.isArchived !== undefined) {
      updates.push('is_archived = ?');
      values.push(options.isArchived ? 1 : 0);
    }
    
    if (options.isFavorite !== undefined) {
      updates.push('is_favorite = ?');
      values.push(options.isFavorite ? 1 : 0);
    }
    
    // 更新数据库
    if (updates.length > 0) {
      updates.push('updated_at = ?');
      values.push(now, options.id);
      
      await this.db.execute(
        `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    // 更新标签
    if (options.tags !== undefined) {
      await this.setNoteTags(options.id, options.tags);
    }
    
    return await this.getNoteById(options.id);
  }

  /**
   * 删除笔记
   */
  async deleteNote(id: string): Promise<boolean> {
    const note = await this.getNoteById(id);
    if (!note) return false;
    
    // 删除文件
    await this.fs.deleteNote(note.filePath);
    
    // 删除数据库记录（级联删除标签关联）
    await this.db.execute('DELETE FROM notes WHERE id = ?', [id]);
    
    return true;
  }

  /**
   * 查询笔记列表
   */
  async getNotes(filter: NoteFilter = {}): Promise<Note[]> {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    
    if (filter.folderId !== undefined) {
      conditions.push('folder_id = ?');
      params.push(filter.folderId);
    }
    
    if (filter.isPinned !== undefined) {
      conditions.push('is_pinned = ?');
      params.push(filter.isPinned ? 1 : 0);
    }
    
    if (filter.isArchived !== undefined) {
      conditions.push('is_archived = ?');
      params.push(filter.isArchived ? 1 : 0);
    }
    
    if (filter.isFavorite !== undefined) {
      conditions.push('is_favorite = ?');
      params.push(filter.isFavorite ? 1 : 0);
    }
    
    // 全文搜索
    if (filter.searchQuery) {
      const noteIds = (await this.db.query<{ id: string }>(
        `SELECT notes.id FROM notes 
         INNER JOIN notes_fts ON notes.rowid = notes_fts.rowid 
         WHERE notes_fts MATCH ?`,
        [filter.searchQuery]
      )).map(row => row.id);
      
      if (noteIds.length === 0) {
        return [];
      }
      
      conditions.push(`id IN (${noteIds.map(() => '?').join(', ')})`);
      params.push(...noteIds);
    }
    
    // 标签筛选
    if (filter.tagIds && filter.tagIds.length > 0) {
      conditions.push(`id IN (
        SELECT note_id FROM note_tags 
        WHERE tag_id IN (${filter.tagIds.map(() => '?').join(', ')})
        GROUP BY note_id
        HAVING COUNT(DISTINCT tag_id) = ?
      )`);
      params.push(...filter.tagIds, filter.tagIds.length);
    }
    
    // 排序
    const sortBy = filter.sortBy || 'updatedAt';
    const sortOrder = filter.sortOrder || 'desc';
    const sortColumn = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      accessedAt: 'accessed_at',
      title: 'title'
    }[sortBy];
    
    let query = `
      SELECT * FROM notes 
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
    `;
    
    if (filter.limit) {
      query += ` LIMIT ${filter.limit}`;
      if (filter.offset) {
        query += ` OFFSET ${filter.offset}`;
      }
    }
    
    const rows = await this.db.query<any>(query, params);
    
    // 加载标签
    const notes = await Promise.all(
      rows.map(async (row) => {
        const tags = await this.getNoteTags(row.id);
        return this.mapRowToNote(row, tags);
      })
    );
    
    return notes;
  }

  /**
   * 更新笔记访问时间
   */
  async touchNote(id: string): Promise<void> {
    await this.db.execute(
      'UPDATE notes SET accessed_at = ? WHERE id = ?',
      [Date.now(), id]
    );
  }

  // ==================== 文件夹操作 ====================

  /**
   * 创建文件夹
   */
  async createFolder(options: CreateFolderOptions): Promise<Folder> {
    const id = randomUUID();
    const now = Date.now();
    
    // 计算路径
    let folderPath = options.name;
    if (options.parentId) {
      const parent = await this.getFolderById(options.parentId);
      if (parent) {
        folderPath = path.join(parent.path, options.name);
      }
    }
    
    // 创建文件系统文件夹
    await this.fs.createFolder(folderPath);
    
    // 插入数据库
    await this.db.execute(
      `INSERT INTO folders (id, name, parent_id, path, icon, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, options.name, options.parentId || null, folderPath, options.icon || null, options.color || null, now, now]
    );
    
    return await this.getFolderById(id) as Folder;
  }

  /**
   * 获取文件夹
   */
  async getFolderById(id: string): Promise<Folder | null> {
    const row = await this.db.queryOne<any>(
      'SELECT * FROM folders WHERE id = ?',
      [id]
    );
    
    if (!row) return null;
    
    return this.mapRowToFolder(row);
  }

  /**
   * 获取所有文件夹（树形结构）
   */
  async getFolderTree(): Promise<Folder[]> {
    const rows = await this.db.query<any>(
      'SELECT * FROM folders ORDER BY path ASC'
    );
    
    const folders = rows.map(row => this.mapRowToFolder(row));
    
    // 构建树形结构
    const folderMap = new Map<string, Folder>();
    const rootFolders: Folder[] = [];
    
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });
    
    folders.forEach(folder => {
      const mappedFolder = folderMap.get(folder.id)!;
      
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(mappedFolder);
        }
      } else {
        rootFolders.push(mappedFolder);
      }
    });
    
    return rootFolders;
  }

  /**
   * 删除文件夹
   */
  async deleteFolder(id: string): Promise<boolean> {
    const folder = await this.getFolderById(id);
    if (!folder) return false;
    
    // 删除文件系统文件夹
    await this.fs.deleteFolder(folder.path);
    
    // 删除数据库记录（级联删除子文件夹和笔记）
    await this.db.execute('DELETE FROM folders WHERE id = ?', [id]);
    
    return true;
  }

  // ==================== 标签操作 ====================

  /**
   * 创建标签
   */
  async createTag(name: string, color?: string): Promise<Tag> {
    const id = randomUUID();
    const now = Date.now();
    
    await this.db.execute(
      'INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)',
      [id, name, color || null, now]
    );
    
    return { id, name, color, createdAt: now };
  }

  /**
   * 获取所有标签
   */
  async getAllTags(): Promise<Tag[]> {
    const rows = await this.db.query<any>(
      'SELECT * FROM tags ORDER BY name ASC'
    );
    
    return rows.map(row => this.mapRowToTag(row));
  }

  /**
   * 获取笔记的标签
   */
  private async getNoteTags(noteId: string): Promise<Tag[]> {
    const rows = await this.db.query<any>(
      `SELECT t.* FROM tags t
       INNER JOIN note_tags nt ON t.id = nt.tag_id
       WHERE nt.note_id = ?
       ORDER BY t.name ASC`,
      [noteId]
    );
    
    return rows.map(row => this.mapRowToTag(row));
  }

  /**
   * 设置笔记的标签
   */
  private async setNoteTags(noteId: string, tagNames: string[]): Promise<void> {
    // 删除现有标签
    await this.db.execute('DELETE FROM note_tags WHERE note_id = ?', [noteId]);
    
    if (tagNames.length === 0) return;
    
    const now = Date.now();
    
    for (const tagName of tagNames) {
      // 查找或创建标签
      let tag = await this.db.queryOne<any>(
        'SELECT * FROM tags WHERE name = ?',
        [tagName]
      );
      
      if (!tag) {
        const tagId = randomUUID();
        await this.db.execute(
          'INSERT INTO tags (id, name, created_at) VALUES (?, ?, ?)',
          [tagId, tagName, now]
        );
        tag = { id: tagId };
      }
      
      // 关联标签
      await this.db.execute(
        'INSERT INTO note_tags (note_id, tag_id, created_at) VALUES (?, ?, ?)',
        [noteId, tag.id, now]
      );
    }
  }

  // ==================== 统计 ====================

  /**
   * 获取统计信息
   */
  async getStats(): Promise<NoteStats> {
    const stats = await this.db.queryOne<any>(`
      SELECT 
        COUNT(*) as totalNotes,
        SUM(word_count) as totalWords,
        SUM(CASE WHEN is_pinned = 1 THEN 1 ELSE 0 END) as pinnedNotes,
        SUM(CASE WHEN is_archived = 1 THEN 1 ELSE 0 END) as archivedNotes
      FROM notes
    `);
    
    const folderCount = await this.db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM folders'
    );
    
    const tagCount = await this.db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM tags'
    );
    
    return {
      totalNotes: stats?.totalNotes || 0,
      totalFolders: folderCount?.count || 0,
      totalTags: tagCount?.count || 0,
      totalWords: stats?.totalWords || 0,
      pinnedNotes: stats?.pinnedNotes || 0,
      archivedNotes: stats?.archivedNotes || 0,
    };
  }

  // ==================== 辅助方法 ====================

  private mapRowToNote(row: any, tags: Tag[] = []): Note {
    return {
      id: row.id,
      title: row.title,
      filePath: row.file_path,
      folderId: row.folder_id,
      content: row.content,
      excerpt: row.excerpt,
      isPinned: row.is_pinned === 1,
      isArchived: row.is_archived === 1,
      isFavorite: row.is_favorite === 1,
      wordCount: row.word_count || 0,
      tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      accessedAt: row.accessed_at,
    };
  }

  private mapRowToFolder(row: any): Folder {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      path: row.path,
      icon: row.icon,
      color: row.color,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapRowToTag(row: any): Tag {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      createdAt: row.created_at,
    };
  }
}

