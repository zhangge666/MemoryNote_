/**
 * 对话框相关 IPC 处理器
 */
import { ipcMain, dialog, BrowserWindow } from 'electron';

/**
 * 注册对话框相关的 IPC 处理器
 */
export const registerDialogHandlers = () => {
  // 选择文件夹
  ipcMain.handle('dialog:select-directory', async (_event, options?: { title?: string; defaultPath?: string }) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    if (!focusedWindow) {
      return null;
    }

    const result = await dialog.showOpenDialog(focusedWindow, {
      title: options?.title || '选择文件夹',
      defaultPath: options?.defaultPath,
      properties: ['openDirectory', 'createDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // 选择文件
  ipcMain.handle('dialog:select-file', async (_event, options?: { 
    title?: string; 
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    if (!focusedWindow) {
      return null;
    }

    const result = await dialog.showOpenDialog(focusedWindow, {
      title: options?.title || '选择文件',
      defaultPath: options?.defaultPath,
      filters: options?.filters,
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // 保存文件对话框
  ipcMain.handle('dialog:save-file', async (_event, options?: { 
    title?: string; 
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    if (!focusedWindow) {
      return null;
    }

    const result = await dialog.showSaveDialog(focusedWindow, {
      title: options?.title || '保存文件',
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  });

  // 显示消息框
  ipcMain.handle('dialog:show-message', async (_event, options: {
    type?: 'none' | 'info' | 'error' | 'question' | 'warning';
    title?: string;
    message: string;
    detail?: string;
    buttons?: string[];
    checkboxLabel?: string;
    checkboxChecked?: boolean;
  }) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    
    if (!focusedWindow) {
      return null;
    }

    const result = await dialog.showMessageBox(focusedWindow, {
      type: options.type || 'info',
      title: options.title || '提示',
      message: options.message,
      detail: options.detail,
      buttons: options.buttons || ['确定'],
      checkboxLabel: options.checkboxLabel,
      checkboxChecked: options.checkboxChecked || false,
    });

    return {
      response: result.response,
      checkboxChecked: result.checkboxChecked,
    };
  });

  console.log('✅ Dialog IPC handlers registered');
};


