/**
 * 全局类型声明
 */

import type { IPCResponse } from './shared/interfaces/ipc';

// Electron API 类型声明
export interface ElectronAPI {
  invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<IPCResponse<T>>;
  send: (channel: string, ...args: unknown[]) => void;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  off: (channel: string, callback: (...args: unknown[]) => void) => void;
  once: (channel: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
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


