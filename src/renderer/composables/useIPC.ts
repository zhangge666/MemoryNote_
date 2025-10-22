/**
 * IPC 通信 Composable
 * 阶段 0: 项目初始化 - 基础 IPC 封装
 */

import type { IPCResponse } from '@shared/interfaces/ipc';

/**
 * IPC Bridge 接口
 */
export interface IIPCBridge {
  invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<IPCResponse<T>>;
  send: (channel: string, ...args: unknown[]) => void;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  off: (channel: string, callback: (...args: unknown[]) => void) => void;
  once: (channel: string, callback: (...args: unknown[]) => void) => void;
}

/**
 * 使用 IPC 通信
 */
export function useIPC(): IIPCBridge {
  // 检查 Electron API 是否可用
  if (typeof window === 'undefined' || !window.electronAPI) {
    // 返回模拟实现（用于开发/测试）
    return {
      async invoke<T = unknown>(): Promise<IPCResponse<T>> {
        return { success: false, error: 'Electron API not available' };
      },
      send: () => {
        // Mock implementation
      },
      on: () => {
        // Mock implementation
      },
      off: () => {
        // Mock implementation
      },
      once: () => {
        // Mock implementation
      },
    };
  }

  return {
    /**
     * 发送消息到主进程并等待响应
     */
    async invoke<T = unknown>(
      channel: string,
      ...args: unknown[]
    ): Promise<IPCResponse<T>> {
      try {
        return await window.electronAPI.invoke<T>(channel, ...args);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    /**
     * 发送单向消息到主进程
     */
    send(channel: string, ...args: unknown[]): void {
      window.electronAPI.send(channel, ...args);
    },

    /**
     * 监听主进程消息
     */
    on(channel: string, callback: (...args: unknown[]) => void): void {
      window.electronAPI.on(channel, callback);
    },

    /**
     * 移除监听器
     */
    off(channel: string, callback: (...args: unknown[]) => void): void {
      window.electronAPI.off(channel, callback);
    },

    /**
     * 监听一次主进程消息
     */
    once(channel: string, callback: (...args: unknown[]) => void): void {
      window.electronAPI.once(channel, callback);
    },
  };
}

