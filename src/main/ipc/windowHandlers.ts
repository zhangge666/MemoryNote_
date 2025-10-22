/**
 * 窗口控制相关的 IPC 处理器
 */

import { ipcMain, BrowserWindow } from 'electron';
import { IPCChannel } from '@shared/interfaces/ipc';

export function registerWindowHandlers(): void {
  // 最小化窗口
  ipcMain.handle(IPCChannel.WINDOW_MINIMIZE, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  });

  // 最大化窗口
  ipcMain.handle(IPCChannel.WINDOW_MAXIMIZE, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window?.restore();
    } else {
      window?.maximize();
    }
  });

  // 还原窗口
  ipcMain.handle(IPCChannel.WINDOW_RESTORE, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.restore();
  });

  // 关闭窗口
  ipcMain.handle(IPCChannel.WINDOW_CLOSE, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  });

  // 检查是否最大化
  ipcMain.handle(IPCChannel.WINDOW_IS_MAXIMIZED, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window?.isMaximized() ?? false;
  });

  // 切换开发者工具
  ipcMain.handle('toggle-dev-tools', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      if (window.webContents.isDevToolsOpened()) {
        window.webContents.closeDevTools();
      } else {
        window.webContents.openDevTools();
      }
    }
  });

  console.log('✅ Window IPC handlers registered');
}
