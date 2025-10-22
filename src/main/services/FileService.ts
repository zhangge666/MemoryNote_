/**
 * 文件系统服务
 * 阶段 2: 文件系统与数据库
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';

export interface FileStats {
  size: number;
  mtime: Date;
  isFile: boolean;
  isDirectory: boolean;
}

export interface IFileService {
  // 读取文件
  readFile(filepath: string): Promise<string>;
  readFileBuffer(filepath: string): Promise<Buffer>;
  
  // 写入文件
  writeFile(filepath: string, content: string): Promise<void>;
  writeFileBuffer(filepath: string, buffer: Buffer): Promise<void>;
  
  // 删除文件
  deleteFile(filepath: string): Promise<void>;
  
  // 文件是否存在
  exists(filepath: string): Promise<boolean>;
  
  // 文件信息
  stat(filepath: string): Promise<FileStats>;
  
  // 目录操作
  readDir(dirpath: string): Promise<string[]>;
  createDir(dirpath: string): Promise<void>;
  deleteDir(dirpath: string, recursive?: boolean): Promise<void>;
  
  // 文件监控
  watch(watchPath: string, callback: (event: 'add' | 'change' | 'unlink', filepath: string) => void): void;
  unwatch(watchPath: string): void;
  
  // 工具方法
  ensureDir(dirpath: string): Promise<void>;
  isAbsolute(filepath: string): boolean;
  join(...paths: string[]): string;
  dirname(filepath: string): string;
  basename(filepath: string, ext?: string): string;
  extname(filepath: string): string;
}

export class FileService implements IFileService {
  private watchers: Map<string, FSWatcher> = new Map();

  /**
   * 读取文件（文本）
   */
  async readFile(filepath: string): Promise<string> {
    try {
      return await fs.readFile(filepath, 'utf-8');
    } catch (error) {
      console.error(`Failed to read file: ${filepath}`, error);
      throw error;
    }
  }

  /**
   * 读取文件（二进制）
   */
  async readFileBuffer(filepath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filepath);
    } catch (error) {
      console.error(`Failed to read file buffer: ${filepath}`, error);
      throw error;
    }
  }

  /**
   * 写入文件（文本）
   */
  async writeFile(filepath: string, content: string): Promise<void> {
    try {
      // 确保目录存在
      await this.ensureDir(path.dirname(filepath));
      await fs.writeFile(filepath, content, 'utf-8');
    } catch (error) {
      console.error(`Failed to write file: ${filepath}`, error);
      throw error;
    }
  }

  /**
   * 写入文件（二进制）
   */
  async writeFileBuffer(filepath: string, buffer: Buffer): Promise<void> {
    try {
      // 确保目录存在
      await this.ensureDir(path.dirname(filepath));
      await fs.writeFile(filepath, buffer);
    } catch (error) {
      console.error(`Failed to write file buffer: ${filepath}`, error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(filepath: string): Promise<void> {
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error(`Failed to delete file: ${filepath}`, error);
      throw error;
    }
  }

  /**
   * 检查文件/目录是否存在
   */
  async exists(filepath: string): Promise<boolean> {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取文件/目录信息
   */
  async stat(filepath: string): Promise<FileStats> {
    try {
      const stats = await fs.stat(filepath);
      return {
        size: stats.size,
        mtime: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      console.error(`Failed to stat file: ${filepath}`, error);
      throw error;
    }
  }

  /**
   * 读取目录内容
   */
  async readDir(dirpath: string): Promise<string[]> {
    try {
      return await fs.readdir(dirpath);
    } catch (error) {
      console.error(`Failed to read directory: ${dirpath}`, error);
      throw error;
    }
  }

  /**
   * 创建目录
   */
  async createDir(dirpath: string): Promise<void> {
    try {
      await fs.mkdir(dirpath, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory: ${dirpath}`, error);
      throw error;
    }
  }

  /**
   * 删除目录
   */
  async deleteDir(dirpath: string, recursive: boolean = false): Promise<void> {
    try {
      if (recursive) {
        await fs.rm(dirpath, { recursive: true, force: true });
      } else {
        await fs.rmdir(dirpath);
      }
    } catch (error) {
      console.error(`Failed to delete directory: ${dirpath}`, error);
      throw error;
    }
  }

  /**
   * 监控文件/目录变化
   */
  watch(watchPath: string, callback: (event: 'add' | 'change' | 'unlink', filepath: string) => void): void {
    try {
      // 如果已经在监控，先停止
      if (this.watchers.has(watchPath)) {
        this.unwatch(watchPath);
      }

      const watcher = chokidar.watch(watchPath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 100,
        },
      });

      watcher
        .on('add', (filepath) => callback('add', filepath))
        .on('change', (filepath) => callback('change', filepath))
        .on('unlink', (filepath) => callback('unlink', filepath))
        .on('error', (error) => console.error(`Watcher error for ${watchPath}:`, error));

      this.watchers.set(watchPath, watcher);
      console.log(`Started watching: ${watchPath}`);
    } catch (error) {
      console.error(`Failed to watch: ${watchPath}`, error);
      throw error;
    }
  }

  /**
   * 停止监控
   */
  unwatch(watchPath: string): void {
    const watcher = this.watchers.get(watchPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(watchPath);
      console.log(`Stopped watching: ${watchPath}`);
    }
  }

  /**
   * 确保目录存在（如果不存在则创建）
   */
  async ensureDir(dirpath: string): Promise<void> {
    if (!(await this.exists(dirpath))) {
      await this.createDir(dirpath);
    }
  }

  /**
   * 检查是否为绝对路径
   */
  isAbsolute(filepath: string): boolean {
    return path.isAbsolute(filepath);
  }

  /**
   * 拼接路径
   */
  join(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * 获取目录名
   */
  dirname(filepath: string): string {
    return path.dirname(filepath);
  }

  /**
   * 获取文件名
   */
  basename(filepath: string, ext?: string): string {
    return path.basename(filepath, ext);
  }

  /**
   * 获取文件扩展名
   */
  extname(filepath: string): string {
    return path.extname(filepath);
  }

  /**
   * 清理所有监控器（应用关闭时调用）
   */
  cleanup(): void {
    for (const [watchPath, watcher] of this.watchers.entries()) {
      watcher.close();
      console.log(`Cleanup: stopped watching ${watchPath}`);
    }
    this.watchers.clear();
  }
}

// 单例
let instance: FileService | null = null;

/**
 * 获取 FileService 单例
 */
export const getInstance = (): FileService => {
  if (!instance) {
    instance = new FileService();
  }
  return instance;
};


