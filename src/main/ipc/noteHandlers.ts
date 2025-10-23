/**
 * 笔记相关 IPC 处理器
 */

import { ipcMain } from 'electron';
import { NoteService } from '../services/NoteService';
import { FileSystemService } from '../services/FileSystemService';
import type {
  Note,
  Folder,
  Tag,
  NoteFilter,
  CreateNoteOptions,
  UpdateNoteOptions,
  CreateFolderOptions,
  NoteStats,
} from '@shared/types/note';

let noteService: NoteService;
let fileSystemService: FileSystemService;
let isRegistered = false;

/**
 * 更新服务实例（用于热切换工作区）
 */
export function updateNoteServices(
  noteServiceInstance: NoteService,
  fileSystemServiceInstance: FileSystemService
) {
  noteService = noteServiceInstance;
  fileSystemService = fileSystemServiceInstance;
  console.log('✅ Note services updated');
}

export function registerNoteHandlers(
  noteServiceInstance: NoteService,
  fileSystemServiceInstance: FileSystemService
) {
  // 更新服务实例
  updateNoteServices(noteServiceInstance, fileSystemServiceInstance);

  // 如果已经注册过，直接返回
  if (isRegistered) {
    console.log('⚠️ Note handlers already registered, skipping...');
    return;
  }

  // ==================== 笔记操作 ====================

  ipcMain.handle('note:create', async (_event, options: CreateNoteOptions): Promise<Note> => {
    return await noteService.createNote(options);
  });

  ipcMain.handle('note:get', async (_event, id: string): Promise<Note | null> => {
    const note = await noteService.getNoteById(id);
    if (note) {
      await noteService.touchNote(id);
    }
    return note;
  });

  ipcMain.handle('note:update', async (_event, options: UpdateNoteOptions): Promise<Note | null> => {
    return await noteService.updateNote(options);
  });

  ipcMain.handle('note:delete', async (_event, id: string): Promise<boolean> => {
    return await noteService.deleteNote(id);
  });

  ipcMain.handle('note:list', async (_event, filter: NoteFilter): Promise<Note[]> => {
    return await noteService.getNotes(filter);
  });

  ipcMain.handle('note:search', async (_event, query: string): Promise<Note[]> => {
    return await noteService.getNotes({ searchQuery: query });
  });

  // ==================== 文件夹操作 ====================

  ipcMain.handle('folder:create', async (_event, options: CreateFolderOptions): Promise<Folder> => {
    return await noteService.createFolder(options);
  });

  ipcMain.handle('folder:get', async (_event, id: string): Promise<Folder | null> => {
    return await noteService.getFolderById(id);
  });

  ipcMain.handle('folder:tree', async (): Promise<Folder[]> => {
    return await noteService.getFolderTree();
  });

  ipcMain.handle('folder:update', async (_event, id: string, options: { name?: string; parentId?: string }): Promise<Folder | null> => {
    return await noteService.updateFolder(id, options);
  });

  ipcMain.handle('folder:delete', async (_event, id: string): Promise<boolean> => {
    return await noteService.deleteFolder(id);
  });

  // ==================== 标签操作 ====================

  ipcMain.handle('tag:create', async (_event, name: string, color?: string): Promise<Tag> => {
    return await noteService.createTag(name, color);
  });

  ipcMain.handle('tag:list', async (): Promise<Tag[]> => {
    return await noteService.getAllTags();
  });

  // ==================== 统计 ====================

  ipcMain.handle('note:stats', async (): Promise<NoteStats> => {
    return await noteService.getStats();
  });

  // ==================== 文件系统 ====================

  ipcMain.handle('note:read-content', async (_event, filePath: string): Promise<string> => {
    return await fileSystemService.readNote(filePath);
  });

  ipcMain.handle('note:write-content', async (_event, filePath: string, content: string): Promise<void> => {
    return await fileSystemService.writeNote(filePath, content);
  });

  ipcMain.handle('note:get-notes-dir', (): string => {
    return fileSystemService.getNotesDir();
  });

  isRegistered = true;
  console.log('✅ Note IPC handlers registered');
}


