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
    
    // 插入数据库（不存储 content）
    await this.db.execute(
      `INSERT INTO notes (id, title, file_path, folder_id, excerpt, word_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, options.title, filePath, options.folderId || null, excerpt, wordCount, now, now]
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
    
    // 从文件系统读取内容
    const content = await this.fs.readNote(row.file_path);
    
    return this.mapRowToNote(row, tags, content);
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
      
      // 不更新 content 到数据库，只更新元数据
      updates.push('excerpt = ?', 'word_count = ?');
      values.push(excerpt, wordCount);
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

  /**
   * 同步外部文件到数据库
   * 用于 FileWatcher 检测到外部添加的文件时
   * 只创建数据库记录，不写文件
   */
  async syncExternalNote(filePath: string, title: string, content: string, folderId?: string): Promise<Note> {
    const id = randomUUID();
    const now = Date.now();
    
    // 提取摘要和字数
    const excerpt = this.fs.extractExcerpt(content);
    const wordCount = this.fs.countWords(content);
    
    // 插入数据库（文件已存在，只插入元数据）
    await this.db.execute(
      `INSERT INTO notes (id, title, file_path, folder_id, excerpt, word_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, filePath, folderId || null, excerpt, wordCount, now, now]
    );
    
    return await this.getNoteById(id) as Note;
  }

  // ==================== 文件夹操作 ====================

  /**
   * 创建文件夹
   */
  async createFolder(options: CreateFolderOptions): Promise<Folder> {
    console.log('📁 [NoteService] 创建文件夹:', options);
    
    const id = randomUUID();
    const now = Date.now();
    
    // 计算路径
    let folderPath = options.name;
    if (options.parentId) {
      const parent = await this.getFolderById(options.parentId);
      console.log('   父文件夹:', parent);
      if (parent) {
        folderPath = path.join(parent.path, options.name);
      }
    }
    
    console.log('   文件夹路径:', folderPath);
    
    try {
      // 创建文件系统文件夹
      await this.fs.createFolder(folderPath);
      console.log('   ✅ 文件系统文件夹创建成功');
      
      // 插入数据库
      await this.db.execute(
        `INSERT INTO folders (id, name, parent_id, path, icon, color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, options.name, options.parentId || null, folderPath, options.icon || null, options.color || null, now, now]
      );
      console.log('   ✅ 数据库记录创建成功');
      
      const result = await this.getFolderById(id) as Folder;
      console.log('   ✅ 文件夹创建完成:', result);
      return result;
    } catch (error) {
      console.error('   ❌ 创建文件夹失败:', error);
      throw error;
    }
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
    
    console.log('📂 [NoteService] getFolderTree 返回文件夹数量:', folders.length);
    
    // 直接返回扁平数组，前端会自己构建树形结构
    return folders;
  }

  /**
   * 删除文件夹
   */
  async updateFolder(id: string, options: { name?: string; parentId?: string }): Promise<Folder | null> {
    const folder = await this.getFolderById(id);
    if (!folder) return null;
    
    const updates: string[] = [];
    const params: any[] = [];
    
    // 如果修改了名称，需要重命名文件夹
    if (options.name && options.name !== folder.name) {
      const oldPath = folder.path;
      
      console.log('📝 更新文件夹名称:');
      console.log('   文件夹ID:', id);
      console.log('   旧名称:', folder.name);
      console.log('   新名称:', options.name);
      console.log('   旧路径:', oldPath);
      
      // 规范化路径（统一使用系统路径分隔符）
      const normalizedOldPath = path.normalize(oldPath);
      
      // 计算新路径
      let newPath: string;
      const pathParts = normalizedOldPath.split(path.sep);
      
      console.log('   路径部分:', pathParts);
      
      if (pathParts.length === 1) {
        // 根目录下的文件夹，直接使用新名称
        newPath = options.name;
      } else {
        // 子文件夹，保留父路径，替换文件夹名
        pathParts[pathParts.length - 1] = options.name;
        newPath = pathParts.join(path.sep);
      }
      
      console.log('   新路径:', newPath);
      
      // 重命名文件系统文件夹
      await this.fs.renameFolder(oldPath, newPath);
      
      // 更新该文件夹及其子文件夹下所有笔记的 file_path
      await this.updateNotesPathAfterFolderRename(oldPath, newPath);
      
      // 递归更新所有子文件夹的 path
      await this.updateSubfoldersPathAfterRename(id, oldPath, newPath);
      
      updates.push('name = ?', 'path = ?');
      params.push(options.name, newPath);
    }
    
    if (updates.length === 0) {
      return folder;
    }
    
    params.push(Date.now(), id);
    
    await this.db.execute(
      `UPDATE folders SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`,
      params
    );
    
    return await this.getFolderById(id);
  }

  /**
   * 文件夹重命名后更新笔记路径
   */
  private async updateNotesPathAfterFolderRename(oldFolderPath: string, newFolderPath: string): Promise<void> {
    console.log('📝 更新笔记路径:', oldFolderPath, '->', newFolderPath);
    
    // 规范化路径分隔符
    const normalizedOldPath = oldFolderPath.replace(/\\/g, '/');
    const normalizedNewPath = newFolderPath.replace(/\\/g, '/');
    
    // 获取所有笔记
    const allNotes = await this.getNotes({});
    
    for (const note of allNotes) {
      const normalizedNotePath = note.filePath.replace(/\\/g, '/');
      
      // 检查笔记是否在重命名的文件夹下
      if (normalizedNotePath.startsWith(normalizedOldPath + '/')) {
        // 替换路径前缀
        const relativePath = normalizedNotePath.substring(normalizedOldPath.length + 1);
        const newFilePath = path.join(newFolderPath, relativePath);
        
        console.log(`   更新笔记路径: ${note.title}`);
        console.log(`   旧路径: ${note.filePath}`);
        console.log(`   新路径: ${newFilePath}`);
        
        // 更新数据库中的 file_path
        await this.db.execute(
          'UPDATE notes SET file_path = ?, updated_at = ? WHERE id = ?',
          [newFilePath, Date.now(), note.id]
        );
      }
    }
  }
  
  /**
   * 文件夹重命名后递归更新子文件夹路径
   */
  private async updateSubfoldersPathAfterRename(parentFolderId: string, oldParentPath: string, newParentPath: string): Promise<void> {
    console.log('📁 更新子文件夹路径:', oldParentPath, '->', newParentPath);
    
    // 规范化路径分隔符
    const normalizedOldPath = oldParentPath.replace(/\\/g, '/');
    const normalizedNewPath = newParentPath.replace(/\\/g, '/');
    
    // 获取所有子文件夹
    const subfolders = await this.db.query<any>(
      'SELECT * FROM folders WHERE parent_id = ?',
      [parentFolderId]
    );
    
    for (const subfolder of subfolders) {
      const normalizedSubfolderPath = subfolder.path.replace(/\\/g, '/');
      
      // 检查子文件夹是否在重命名的文件夹下
      if (normalizedSubfolderPath.startsWith(normalizedOldPath + '/')) {
        // 替换路径前缀
        const relativePath = normalizedSubfolderPath.substring(normalizedOldPath.length + 1);
        const newFolderPath = path.join(newParentPath, relativePath);
        
        console.log(`   更新子文件夹路径: ${subfolder.name}`);
        console.log(`   旧路径: ${subfolder.path}`);
        console.log(`   新路径: ${newFolderPath}`);
        
        // 更新数据库中的 path
        await this.db.execute(
          'UPDATE folders SET path = ?, updated_at = ? WHERE id = ?',
          [newFolderPath, Date.now(), subfolder.id]
        );
        
        // 递归更新子文件夹的子文件夹
        await this.updateSubfoldersPathAfterRename(subfolder.id, subfolder.path, newFolderPath);
      }
    }
  }

  async deleteFolder(id: string): Promise<boolean> {
    const folder = await this.getFolderById(id);
    if (!folder) return false;
    
    console.log('🗑️ 删除文件夹:', folder.name, folder.path);
    
    // 1. 先获取该文件夹下的所有笔记
    const notes = await this.getNotes({ folderId: id });
    console.log('   文件夹内的笔记数量:', notes.length);
    
    // 2. 删除所有笔记的数据库记录（文件会随文件夹一起删除）
    for (const note of notes) {
      console.log('   删除笔记记录:', note.title);
      await this.db.execute('DELETE FROM notes WHERE id = ?', [note.id]);
    }
    
    // 3. 递归获取所有子文件夹
    const subfolders = await this.db.query<any>(
      'SELECT * FROM folders WHERE parent_id = ?',
      [id]
    );
    console.log('   子文件夹数量:', subfolders.length);
    
    // 4. 递归删除子文件夹
    for (const subfolder of subfolders) {
      console.log('   递归删除子文件夹:', subfolder.name);
      await this.deleteFolder(subfolder.id);
    }
    
    // 5. 删除文件系统文件夹（此时里面已经没有笔记记录了）
    await this.fs.deleteFolder(folder.path);
    console.log('   ✅ 文件系统文件夹已删除');
    
    // 6. 删除文件夹数据库记录
    await this.db.execute('DELETE FROM folders WHERE id = ?', [id]);
    console.log('   ✅ 数据库记录已删除');
    
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

  private mapRowToNote(row: any, tags: Tag[] = [], content: string = ''): Note {
    return {
      id: row.id,
      title: row.title,
      filePath: row.file_path,
      folderId: row.folder_id,
      content: content,  // 从参数传入，而不是从数据库读取
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

