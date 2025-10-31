/**
 * 文件系统服务
 * 负责笔记文件的读写操作
 */

import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { promisify } from 'util';
import { ConfigService } from './ConfigService';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

export class FileSystemService {
  private notesDir: string;
  private fileWatcher: any = null; // FileWatcherService reference (avoid circular dependency)

  constructor() {
    // 从配置中读取工作区路径
    this.notesDir = this.getWorkspaceNotesDir();
    this.ensureNotesDir();
  }

  /**
   * 设置文件监听器引用（用于防止循环更新）
   */
  setFileWatcher(fileWatcher: any) {
    this.fileWatcher = fileWatcher;
  }

  /**
   * 更新笔记目录（用于工作区切换）
   */
  updateNotesDir() {
    this.notesDir = this.getWorkspaceNotesDir();
    this.ensureNotesDir();
  }
  
  /**
   * 从配置获取笔记目录
   */
  private getWorkspaceNotesDir(): string {
    const configService = ConfigService.getInstance();
    const appConfig = configService.get('app');
    
    if (appConfig && appConfig.workspace) {
      // 使用配置的工作区路径
      return path.join(appConfig.workspace, 'notes');
    }
    
    // 降级到默认路径
    const documentsDir = app.getPath('documents');
    return path.join(documentsDir, 'MemoryNote', 'notes');
  }
  
  /**
   * 更新笔记目录（用于热切换工作区）
   */
  updateNotesDir(): void {
    this.notesDir = this.getWorkspaceNotesDir();
    this.ensureNotesDir();
    console.log('✅ FileSystemService notes directory updated:', this.notesDir);
  }

  /**
   * 确保笔记目录存在
   */
  private ensureNotesDir() {
    if (!fs.existsSync(this.notesDir)) {
      fs.mkdirSync(this.notesDir, { recursive: true });
    }
  }

  /**
   * 获取笔记根目录
   */
  getNotesDir(): string {
    return this.notesDir;
  }

  /**
   * 获取绝对路径
   */
  getAbsolutePath(relativePath: string): string {
    return path.join(this.notesDir, relativePath);
  }

  /**
   * 获取相对路径
   */
  getRelativePath(absolutePath: string): string {
    return path.relative(this.notesDir, absolutePath);
  }

  /**
   * 读取笔记内容
   */
  async readNote(filePath: string): Promise<string> {
    const absolutePath = this.getAbsolutePath(filePath);
    
    try {
      const content = await readFile(absolutePath, 'utf-8');
      return content;
    } catch (error) {
      console.error('读取笔记失败:', error);
      throw new Error(`无法读取笔记: ${filePath}`);
    }
  }

  /**
   * 写入笔记内容
   */
  async writeNote(filePath: string, content: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(filePath);
    const dirPath = path.dirname(absolutePath);

    try {
      // 通知文件监听器忽略即将发生的变化
      if (this.fileWatcher && typeof this.fileWatcher.ignoreNextChangeFor === 'function') {
        this.fileWatcher.ignoreNextChangeFor(filePath);
      }

      // 确保目录存在
      if (!fs.existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
      }

      await writeFile(absolutePath, content, 'utf-8');
    } catch (error) {
      console.error('写入笔记失败:', error);
      throw new Error(`无法写入笔记: ${filePath}`);
    }
  }

  /**
   * 删除笔记文件
   */
  async deleteNote(filePath: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(filePath);

    try {
      await unlink(absolutePath);
    } catch (error) {
      console.error('删除笔记失败:', error);
      throw new Error(`无法删除笔记: ${filePath}`);
    }
  }

  /**
   * 移动/重命名笔记
   */
  async moveNote(oldPath: string, newPath: string): Promise<void> {
    const oldAbsolutePath = this.getAbsolutePath(oldPath);
    const newAbsolutePath = this.getAbsolutePath(newPath);
    const newDirPath = path.dirname(newAbsolutePath);

    try {
      // 确保目标目录存在
      if (!fs.existsSync(newDirPath)) {
        await mkdir(newDirPath, { recursive: true });
      }

      await rename(oldAbsolutePath, newAbsolutePath);
    } catch (error) {
      console.error('移动笔记失败:', error);
      throw new Error(`无法移动笔记: ${oldPath} -> ${newPath}`);
    }
  }

  /**
   * 创建文件夹
   */
  async createFolder(folderPath: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(folderPath);

    try {
      await mkdir(absolutePath, { recursive: true });
    } catch (error) {
      console.error('创建文件夹失败:', error);
      throw new Error(`无法创建文件夹: ${folderPath}`);
    }
  }

  /**
   * 重命名文件夹
   */
  async renameFolder(oldPath: string, newPath: string): Promise<void> {
    const oldAbsolutePath = this.getAbsolutePath(oldPath);
    const newAbsolutePath = this.getAbsolutePath(newPath);
    const newDirPath = path.dirname(newAbsolutePath);

    console.log('📁 重命名文件夹:');
    console.log('   旧路径(相对):', oldPath);
    console.log('   新路径(相对):', newPath);
    console.log('   旧路径(绝对):', oldAbsolutePath);
    console.log('   新路径(绝对):', newAbsolutePath);
    console.log('   目标父目录:', newDirPath);

    try {
      // 检查源文件夹是否存在
      if (!fs.existsSync(oldAbsolutePath)) {
        throw new Error(`源文件夹不存在: ${oldAbsolutePath}`);
      }

      // 检查目标文件夹是否已存在
      if (fs.existsSync(newAbsolutePath)) {
        throw new Error(`目标文件夹已存在: ${newAbsolutePath}`);
      }

      // 确保目标父目录存在
      if (!fs.existsSync(newDirPath)) {
        await mkdir(newDirPath, { recursive: true });
      }

      await rename(oldAbsolutePath, newAbsolutePath);
      console.log('✅ 文件夹重命名成功');
    } catch (error) {
      console.error('❌ 重命名文件夹失败:', error);
      throw new Error(`无法重命名文件夹: ${oldPath} -> ${newPath} (${error.message})`);
    }
  }

  /**
   * 删除文件夹
   */
  async deleteFolder(folderPath: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(folderPath);

    try {
      fs.rmSync(absolutePath, { recursive: true, force: true });
    } catch (error) {
      console.error('删除文件夹失败:', error);
      throw new Error(`无法删除文件夹: ${folderPath}`);
    }
  }

  /**
   * 检查文件/文件夹是否存在
   */
  exists(filePath: string): boolean {
    const absolutePath = this.getAbsolutePath(filePath);
    return fs.existsSync(absolutePath);
  }

  /**
   * 获取文件统计信息
   */
  async getStats(filePath: string): Promise<fs.Stats> {
    const absolutePath = this.getAbsolutePath(filePath);
    return await stat(absolutePath);
  }

  /**
   * 生成唯一文件名
   */
  generateUniqueFileName(title: string, folderPath: string = ''): string {
    const sanitized = title.replace(/[<>:"/\\|?*]/g, '_');
    let fileName = `${sanitized}.md`;
    let fullPath = path.join(folderPath, fileName);
    let counter = 1;

    while (this.exists(fullPath)) {
      fileName = `${sanitized}_${counter}.md`;
      fullPath = path.join(folderPath, fileName);
      counter++;
    }

    return fullPath;
  }

  /**
   * 扫描目录获取所有笔记文件
   */
  async scanDirectory(dirPath: string = ''): Promise<string[]> {
    const absolutePath = this.getAbsolutePath(dirPath);
    const files: string[] = [];

    try {
      const entries = await readdir(absolutePath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.scanDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error('扫描目录失败:', error);
    }

    return files;
  }

  /**
   * 提取笔记摘要（前几行）
   */
  extractExcerpt(content: string, maxLength: number = 200): string {
    // 移除 Markdown 标记
    const plainText = content
      .replace(/^#{1,6}\s+/gm, '') // 标题
      .replace(/\*\*(.+?)\*\*/g, '$1') // 粗体
      .replace(/\*(.+?)\*/g, '$1') // 斜体
      .replace(/`(.+?)`/g, '$1') // 行内代码
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 链接
      .replace(/!\[.+?\]\(.+?\)/g, '') // 图片
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .replace(/>\s+/g, '') // 引用
      .replace(/^\s*[-*+]\s+/gm, '') // 列表
      .replace(/^\s*\d+\.\s+/gm, '') // 有序列表
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength) + '...';
  }

  /**
   * 计算字数
   */
  countWords(content: string): number {
    // 移除 Markdown 标记
    const plainText = this.extractExcerpt(content, Infinity);
    
    // 中文字符数
    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
    
    // 英文单词数
    const englishWords = plainText
      .replace(/[\u4e00-\u9fa5]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0).length;

    return chineseChars + englishWords;
  }
}


