/**
 * 前端笔记服务
 * 封装笔记相关的 IPC 调用
 */

import type {
  Note,
  Folder,
  Tag,
  NoteFilter,
  CreateNoteOptions,
  UpdateNoteOptions,
  CreateFolderOptions,
  NoteStats,
  FileTreeNode,
} from '@shared/types/note';

export interface INoteService {
  // 笔记操作
  createNote(options: CreateNoteOptions): Promise<Note>;
  getNote(id: string): Promise<Note | null>;
  updateNote(options: UpdateNoteOptions): Promise<Note | null>;
  deleteNote(id: string): Promise<boolean>;
  getNotes(filter?: NoteFilter): Promise<Note[]>;
  searchNotes(query: string): Promise<Note[]>;
  getStats(): Promise<NoteStats>;

  // 文件夹操作
  createFolder(options: CreateFolderOptions): Promise<Folder>;
  getFolder(id: string): Promise<Folder | null>;
  getFolderTree(): Promise<Folder[]>;
  updateFolder(id: string, options: { name?: string; parentId?: string }): Promise<Folder | null>;
  deleteFolder(id: string): Promise<boolean>;

  // 标签操作
  createTag(name: string, color?: string): Promise<Tag>;
  getAllTags(): Promise<Tag[]>;

  // 工具方法
  buildFileTree(folders: Folder[], notes: Note[]): FileTreeNode[];
  getNotesDir(): Promise<string>;
}

export class NoteService implements INoteService {
  constructor() {
  }

  // ==================== 笔记操作 ====================

  async createNote(options: CreateNoteOptions): Promise<Note> {
    if (!window.ipc?.note?.create) {
      throw new Error('IPC API not available. Preload script may not have loaded correctly.');
    }
    return await window.ipc.note.create(options);
  }

  async getNote(id: string): Promise<Note | null> {
    return await window.ipc.note.get(id);
  }

  async updateNote(options: UpdateNoteOptions): Promise<Note | null> {
    return await window.ipc.note.update(options);
  }

  async deleteNote(id: string): Promise<boolean> {
    return await window.ipc.note.delete(id);
  }

  async getNotes(filter?: NoteFilter): Promise<Note[]> {
    return await window.ipc.note.list(filter);
  }

  async searchNotes(query: string): Promise<Note[]> {
    return await window.ipc.note.search(query);
  }

  async getStats(): Promise<NoteStats> {
    return await window.ipc.note.stats();
  }

  // ==================== 文件夹操作 ====================

  async createFolder(options: CreateFolderOptions): Promise<Folder> {
    return await window.ipc.folder.create(options);
  }

  async getFolder(id: string): Promise<Folder | null> {
    return await window.ipc.folder.get(id);
  }

  async getFolderTree(): Promise<Folder[]> {
    return await window.ipc.folder.tree();
  }

  async updateFolder(id: string, options: { name?: string; parentId?: string }): Promise<Folder | null> {
    return await window.ipc.folder.update(id, options);
  }

  async deleteFolder(id: string): Promise<boolean> {
    return await window.ipc.folder.delete(id);
  }

  // ==================== 标签操作 ====================

  async createTag(name: string, color?: string): Promise<Tag> {
    return await window.ipc.tag.create(name, color);
  }

  async getAllTags(): Promise<Tag[]> {
    return await window.ipc.tag.list();
  }

  // ==================== 工具方法 ====================

  /**
   * 构建文件树
   */
  buildFileTree(folders: Folder[], notes: Note[]): FileTreeNode[] {
    const tree: FileTreeNode[] = [];
    const folderMap = new Map<string, FileTreeNode>();

    // 创建文件夹节点
    folders.forEach(folder => {
      const node: FileTreeNode = {
        id: folder.id,
        type: 'folder',
        name: folder.name,
        path: folder.path,
        children: [],
        isExpanded: false,
        icon: folder.icon,
        color: folder.color,
      };
      folderMap.set(folder.id, node);
    });

    // 构建文件夹层级
    folders.forEach(folder => {
      const node = folderMap.get(folder.id)!;
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children!.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    // 添加笔记节点
    notes.forEach(note => {
      const noteNode: FileTreeNode = {
        id: note.id,
        type: 'note',
        name: note.title,
        path: note.filePath,
      };

      if (note.folderId) {
        const folder = folderMap.get(note.folderId);
        if (folder) {
          folder.children!.push(noteNode);
        }
      } else {
        tree.push(noteNode);
      }
    });

    // 排序：文件夹在前，然后按名称排序
    const sortNodes = (nodes: FileTreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'zh-CN');
      });

      nodes.forEach(node => {
        if (node.children) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(tree);
    return tree;
  }

  async getNotesDir(): Promise<string> {
    return await window.ipc.note.getNotesDir();
  }
}

// 导出单例
export const noteService = new NoteService();

