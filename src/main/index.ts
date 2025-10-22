/**
 * 主进程入口文件
 * 阶段 0: 项目初始化 - 基础配置
 * 阶段 2: 文件系统与数据库
 */

/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />

import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { registerWindowHandlers } from './ipc/windowHandlers';
import { registerConfigHandlers } from './ipc/configHandlers';
import { registerFileHandlers } from './ipc/fileHandlers';
import { registerDatabaseHandlers } from './ipc/databaseHandlers';
import { initDatabaseService } from './database/DatabaseManager';
import { getInstance as getFileService } from './services/FileService';

// Windows 安装启动处理
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 */
const createWindow = (): void => {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // 无边框窗口（为自定义标题栏准备）
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // 启用上下文隔离
      nodeIntegration: false, // 禁用 Node 集成（安全）
      sandbox: false, // 禁用沙箱以允许 preload 访问 Node API
    },
  });

  // 加载应用
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // 开发环境打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 窗口关闭时清理引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 注册 IPC 处理器
  registerWindowHandlers(mainWindow);
};

/**
 * 应用准备就绪
 */
app.on('ready', async () => {
  try {
    // 注册配置 IPC 处理器（会自动初始化配置服务）
    registerConfigHandlers();
    
    // 注册文件和数据库 IPC 处理器
    registerFileHandlers();
    registerDatabaseHandlers();
    
    // 初始化数据库
    await initDatabaseService();
    console.log('✅ Database service initialized');
    
    // 确保 workspace 目录存在
    const workspacePath = path.join(app.getPath('userData'), 'workspace');
    const fileService = getFileService();
    await fileService.ensureDir(workspacePath);
    console.log('✅ Workspace directory ready:', workspacePath);
    
    createWindow();

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 MemoryNote - Main Process Started');
      console.log('Electron version:', process.versions.electron);
      console.log('Node version:', process.versions.node);
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
});

/**
 * 所有窗口关闭时退出（macOS 除外）
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 应用退出前清理
 */
app.on('before-quit', async () => {
  console.log('Cleaning up before quit...');
  
  // 停止所有文件监控
  const fileService = getFileService();
  fileService.cleanup();
  
  // 关闭数据库连接
  const { getInstance: getDatabaseManager } = await import('./database/DatabaseManager');
  const db = getDatabaseManager();
  await db.close();
  
  console.log('✅ Cleanup complete');
});

/**
 * 应用激活时重新创建窗口（macOS）
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * 获取主窗口实例
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

