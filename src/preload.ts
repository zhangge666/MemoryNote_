// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type {
  Note,
  Folder,
  Tag,
  NoteFilter,
  CreateNoteOptions,
  UpdateNoteOptions,
  CreateFolderOptions,
  NoteStats,
} from './shared/types/note';

// 暴露基础 Electron API（用于窗口控制等）
contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
  once: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args));
  },
  
  // 对话框 API
  dialog: {
    selectDirectory: (options?: { title?: string; defaultPath?: string }): Promise<string | null> =>
      ipcRenderer.invoke('dialog:select-directory', options),
    
    selectFile: (options?: { 
      title?: string; 
      defaultPath?: string;
      filters?: { name: string; extensions: string[] }[];
    }): Promise<string | null> =>
      ipcRenderer.invoke('dialog:select-file', options),
    
    saveFile: (options?: { 
      title?: string; 
      defaultPath?: string;
      filters?: { name: string; extensions: string[] }[];
    }): Promise<string | null> =>
      ipcRenderer.invoke('dialog:save-file', options),
    
    showMessage: (options: {
      type?: 'none' | 'info' | 'error' | 'question' | 'warning';
      title?: string;
      message: string;
      detail?: string;
      buttons?: string[];
    }): Promise<number> =>
      ipcRenderer.invoke('dialog:show-message', options),
  },
});

// 暴露扩展 IPC API（用于笔记管理等特定功能）
contextBridge.exposeInMainWorld('ipc', {
  // 窗口控制
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
  
  // 笔记操作
  note: {
    create: (options: CreateNoteOptions): Promise<Note> => 
      ipcRenderer.invoke('note:create', options),
    
    get: (id: string): Promise<Note | null> => 
      ipcRenderer.invoke('note:get', id),
    
    update: (options: UpdateNoteOptions): Promise<Note | null> => 
      ipcRenderer.invoke('note:update', options),
    
    delete: (id: string): Promise<boolean> => 
      ipcRenderer.invoke('note:delete', id),
    
    list: (filter?: NoteFilter): Promise<Note[]> => 
      ipcRenderer.invoke('note:list', filter || {}),
    
    search: (query: string): Promise<Note[]> => 
      ipcRenderer.invoke('note:search', query),
    
    stats: (): Promise<NoteStats> => 
      ipcRenderer.invoke('note:stats'),
    
    readContent: (filePath: string): Promise<string> => 
      ipcRenderer.invoke('note:read-content', filePath),
    
    writeContent: (filePath: string, content: string): Promise<void> => 
      ipcRenderer.invoke('note:write-content', filePath, content),
    
    getNotesDir: (): Promise<string> => 
      ipcRenderer.invoke('note:get-notes-dir'),
  },
  
  // 文件夹操作
  folder: {
    create: (options: CreateFolderOptions): Promise<Folder> => 
      ipcRenderer.invoke('folder:create', options),
    
    get: (id: string): Promise<Folder | null> => 
      ipcRenderer.invoke('folder:get', id),
    
    tree: (): Promise<Folder[]> => 
      ipcRenderer.invoke('folder:tree'),
    
    update: (id: string, options: { name?: string; parentId?: string }): Promise<Folder | null> =>
      ipcRenderer.invoke('folder:update', id, options),
    
    delete: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('folder:delete', id),
  },
  
  // 标签操作
  tag: {
    create: (name: string, color?: string): Promise<Tag> => 
      ipcRenderer.invoke('tag:create', name, color),
    
    list: (): Promise<Tag[]> => 
      ipcRenderer.invoke('tag:list'),
  },
});
