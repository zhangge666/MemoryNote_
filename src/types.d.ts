/**
 * 全局类型声明
 */

import type { IPCResponse } from './shared/interfaces/ipc';
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

// Electron API 类型声明
export interface ElectronAPI {
  invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<IPCResponse<T>>;
  send: (channel: string, ...args: unknown[]) => void;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  off: (channel: string, callback: (...args: unknown[]) => void) => void;
  once: (channel: string, callback: (...args: unknown[]) => void) => void;
}

// IPC API 类型声明
export interface IPCAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
  
  // 笔记操作
  note: {
    create: (options: CreateNoteOptions) => Promise<Note>;
    get: (id: string) => Promise<Note | null>;
    update: (options: UpdateNoteOptions) => Promise<Note | null>;
    delete: (id: string) => Promise<boolean>;
    list: (filter?: NoteFilter) => Promise<Note[]>;
    search: (query: string) => Promise<Note[]>;
    stats: () => Promise<NoteStats>;
    readContent: (filePath: string) => Promise<string>;
    writeContent: (filePath: string, content: string) => Promise<void>;
    getNotesDir: () => Promise<string>;
  };
  
  // 文件夹操作
  folder: {
    create: (options: CreateFolderOptions) => Promise<Folder>;
    get: (id: string) => Promise<Folder | null>;
    tree: () => Promise<Folder[]>;
    delete: (id: string) => Promise<boolean>;
  };
  
  // 标签操作
  tag: {
    create: (name: string, color?: string) => Promise<Tag>;
    list: () => Promise<Tag[]>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipc: IPCAPI;
  }
}

// Vite 环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
