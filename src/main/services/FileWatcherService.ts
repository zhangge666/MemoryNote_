/**
 * 文件监听服务
 * 监听笔记文件的变化并同步到数据库
 */

import chokidar from 'chokidar';
import { FileSystemService } from './FileSystemService';
import { NoteService } from './NoteService';
import path from 'path';

export class FileWatcherService {
  private watcher: chokidar.FSWatcher | null = null;
  private isWatching = false;
  private ignoreNextChange = new Set<string>(); // 忽略即将发生的文件变化
  private processingFiles = new Set<string>(); // 正在处理的文件

  constructor(
    private fs: FileSystemService,
    private noteService: NoteService
  ) {}

  /**
   * 忽略下一次文件变化（用于应用内部写入）
   */
  ignoreNextChangeFor(filePath: string, duration = 2000) {
    this.ignoreNextChange.add(filePath);
    setTimeout(() => {
      this.ignoreNextChange.delete(filePath);
    }, duration);
  }

  /**
   * 启动文件监听
   */
  start() {
    if (this.isWatching) return;

    const notesDir = this.fs.getNotesDir();
    
    console.log('[FileWatcher] 开始监听笔记目录:', notesDir);

    this.watcher = chokidar.watch(notesDir, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true, // 不触发初始文件的事件
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath) => this.handleFileAdded(filePath))
      .on('change', (filePath) => this.handleFileChanged(filePath))
      .on('unlink', (filePath) => this.handleFileDeleted(filePath))
      .on('addDir', (dirPath) => this.handleDirAdded(dirPath))
      .on('unlinkDir', (dirPath) => this.handleDirDeleted(dirPath))
      .on('error', (error) => console.error('[FileWatcher] 错误:', error));

    this.isWatching = true;
  }

  /**
   * 停止文件监听
   */
  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.isWatching = false;
      console.log('[FileWatcher] 停止监听');
    }
  }

  /**
   * 处理文件添加
   */
  private async handleFileAdded(absolutePath: string) {
    if (!absolutePath.endsWith('.md')) return;

    console.log('[FileWatcher] 文件添加:', absolutePath);

    try {
      const relativePath = this.fs.getRelativePath(absolutePath);
      const content = await this.fs.readNote(relativePath);
      const fileName = path.basename(relativePath, '.md');
      
      // 检查笔记是否已存在
      const existingNotes = await this.noteService.getNotes({});
      const existing = existingNotes.find(n => n.filePath === relativePath);
      
      if (!existing) {
        // ⚠️ 外部文件已存在，直接创建数据库记录，不要再写文件
        // 使用特殊方法直接同步外部文件到数据库
        await this.noteService.syncExternalNote(relativePath, fileName, content);
        
        console.log('[FileWatcher] 已同步外部笔记:', relativePath);
      }
    } catch (error) {
      console.error('[FileWatcher] 处理文件添加失败:', error);
    }
  }

  /**
   * 处理文件修改
   */
  private async handleFileChanged(absolutePath: string) {
    if (!absolutePath.endsWith('.md')) return;

    const relativePath = this.fs.getRelativePath(absolutePath);
    
    // 检查是否应该忽略此次变化（应用内部写入）
    if (this.ignoreNextChange.has(relativePath)) {
      console.log('[FileWatcher] 忽略应用内部写入:', relativePath);
      this.ignoreNextChange.delete(relativePath);
      return;
    }

    // 检查是否正在处理此文件（防止并发）
    if (this.processingFiles.has(relativePath)) {
      console.log('[FileWatcher] 文件正在处理中，跳过:', relativePath);
      return;
    }

    this.processingFiles.add(relativePath);
    console.log('[FileWatcher] 文件修改:', absolutePath);

    try {
      const content = await this.fs.readNote(relativePath);
      
      // 查找对应的笔记
      const notes = await this.noteService.getNotes({});
      const note = notes.find(n => n.filePath === relativePath);
      
      if (note) {
        // 标记要忽略接下来的变化（因为 updateNote 可能会触发文件系统事件）
        this.ignoreNextChange.add(relativePath);
        
        await this.noteService.updateNote({
          id: note.id,
          content,
        });
        
        console.log('[FileWatcher] 已同步笔记修改:', relativePath);
      }
    } catch (error) {
      console.error('[FileWatcher] 处理文件修改失败:', error);
    } finally {
      this.processingFiles.delete(relativePath);
    }
  }

  /**
   * 处理文件删除
   */
  private async handleFileDeleted(absolutePath: string) {
    if (!absolutePath.endsWith('.md')) return;

    console.log('[FileWatcher] 文件删除:', absolutePath);

    try {
      const relativePath = this.fs.getRelativePath(absolutePath);
      
      // 查找对应的笔记
      const notes = await this.noteService.getNotes({});
      const note = notes.find(n => n.filePath === relativePath);
      
      if (note) {
        // 只删除数据库记录，不删除文件（因为文件已被外部删除）
        await this.noteService.deleteNote(note.id);
        
        console.log('[FileWatcher] 已删除笔记记录:', relativePath);
      }
    } catch (error) {
      console.error('[FileWatcher] 处理文件删除失败:', error);
    }
  }

  /**
   * 处理目录添加
   */
  private async handleDirAdded(absolutePath: string) {
    console.log('[FileWatcher] 目录添加:', absolutePath);
    
    // 目录创建可能由应用内部触发，这里不自动同步
    // 避免重复创建
  }

  /**
   * 处理目录删除
   */
  private async handleDirDeleted(absolutePath: string) {
    console.log('[FileWatcher] 目录删除:', absolutePath);
    
    // 目录删除同理
  }
}


