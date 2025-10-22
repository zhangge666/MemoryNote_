/**
 * Preload 脚本
 * 阶段 0: 项目初始化 - 基础设置
 * 
 * 此脚本在渲染进程加载之前运行，可以安全地暴露 IPC API
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { IPCResponse } from '../shared/interfaces/ipc';

// 暴露安全的 IPC API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送消息到主进程并等待响应
  invoke: async <T = unknown>(channel: string, ...args: unknown[]): Promise<IPCResponse<T>> => {
    return await ipcRenderer.invoke(channel, ...args);
  },

  // 发送单向消息到主进程
  send: (channel: string, ...args: unknown[]): void => {
    ipcRenderer.send(channel, ...args);
  },

  // 监听主进程消息
  on: (channel: string, callback: (...args: unknown[]) => void): void => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },

  // 移除监听器
  off: (channel: string, callback: (...args: unknown[]) => void): void => {
    ipcRenderer.off(channel, callback);
  },

  // 监听一次
  once: (channel: string, callback: (...args: unknown[]) => void): void => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args));
  },
});




