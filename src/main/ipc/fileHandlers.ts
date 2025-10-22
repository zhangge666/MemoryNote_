/**
 * 文件操作 IPC 处理器
 * 阶段 2: 文件系统与数据库
 */

import { ipcMain } from 'electron';
import { getInstance as getFileService } from '../services/FileService';
import { IPCChannel } from '@shared/interfaces/ipc';

/**
 * 注册文件操作相关的 IPC 处理器
 */
export function registerFileHandlers(): void {
  const fileService = getFileService();

  // 读取文件（文本）
  ipcMain.handle(IPCChannel.FILE_READ, async (_event, filepath: string) => {
    try {
      const content = await fileService.readFile(filepath);
      return { success: true, data: content };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 读取文件（二进制）
  ipcMain.handle(IPCChannel.FILE_READ_BUFFER, async (_event, filepath: string) => {
    try {
      const buffer = await fileService.readFileBuffer(filepath);
      return { success: true, data: buffer };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 写入文件（文本）
  ipcMain.handle(IPCChannel.FILE_WRITE, async (_event, filepath: string, content: string) => {
    try {
      await fileService.writeFile(filepath, content);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 写入文件（二进制）
  ipcMain.handle(IPCChannel.FILE_WRITE_BUFFER, async (_event, filepath: string, buffer: Buffer) => {
    try {
      await fileService.writeFileBuffer(filepath, buffer);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 删除文件
  ipcMain.handle(IPCChannel.FILE_DELETE, async (_event, filepath: string) => {
    try {
      await fileService.deleteFile(filepath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 检查文件是否存在
  ipcMain.handle(IPCChannel.FILE_EXISTS, async (_event, filepath: string) => {
    try {
      const exists = await fileService.exists(filepath);
      return { success: true, data: exists };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取文件信息
  ipcMain.handle(IPCChannel.FILE_STAT, async (_event, filepath: string) => {
    try {
      const stats = await fileService.stat(filepath);
      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 读取目录
  ipcMain.handle(IPCChannel.DIR_READ, async (_event, dirpath: string) => {
    try {
      const files = await fileService.readDir(dirpath);
      return { success: true, data: files };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 创建目录
  ipcMain.handle(IPCChannel.DIR_CREATE, async (_event, dirpath: string) => {
    try {
      await fileService.createDir(dirpath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 删除目录
  ipcMain.handle(IPCChannel.DIR_DELETE, async (_event, dirpath: string, recursive: boolean = false) => {
    try {
      await fileService.deleteDir(dirpath, recursive);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 路径工具方法
  ipcMain.handle(IPCChannel.PATH_JOIN, async (_event, ...paths: string[]) => {
    try {
      const result = fileService.join(...paths);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPCChannel.PATH_DIRNAME, async (_event, filepath: string) => {
    try {
      const result = fileService.dirname(filepath);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPCChannel.PATH_BASENAME, async (_event, filepath: string, ext?: string) => {
    try {
      const result = fileService.basename(filepath, ext);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPCChannel.PATH_EXTNAME, async (_event, filepath: string) => {
    try {
      const result = fileService.extname(filepath);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  console.log('✅ File IPC handlers registered');
}


