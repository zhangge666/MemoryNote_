import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { DatabaseManager } from './main/database/DatabaseManager';
import { FileSystemService } from './main/services/FileSystemService';
import { NoteService } from './main/services/NoteService';
import { FileWatcherService } from './main/services/FileWatcherService';
import { registerWindowHandlers } from './main/ipc/windowHandlers';
import { registerNoteHandlers } from './main/ipc/noteHandlers';
import { registerConfigHandlers } from './main/ipc/configHandlers';
import { registerDialogHandlers } from './main/ipc/dialogHandlers';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// 全局服务实例
let dbManager: DatabaseManager;
let fileSystemService: FileSystemService;
let noteService: NoteService;
let fileWatcherService: FileWatcherService;
let mainWindow: BrowserWindow | null = null;

// 初始化服务
async function initializeServices() {
  try {
    // 初始化数据库
    dbManager = new DatabaseManager();
    await dbManager.initialize();

    // 初始化文件系统服务
    fileSystemService = new FileSystemService();

    // 初始化笔记服务
    noteService = new NoteService(dbManager, fileSystemService);

    // 初始化文件监听服务
    fileWatcherService = new FileWatcherService(fileSystemService, noteService);
    fileWatcherService.start();

    // 注册 IPC 处理器
    registerWindowHandlers();
    registerConfigHandlers();
    registerDialogHandlers();
    registerNoteHandlers(noteService, fileSystemService);
  } catch (error) {
    console.error('Failed to initialize services:', error);
    app.quit();
  }
}

// 清理现有服务
async function cleanupServices() {
  try {
    // 停止文件监听
    if (fileWatcherService) {
      await fileWatcherService.stop();
    }
    
    // 关闭数据库
    if (dbManager) {
      dbManager.close();
    }
    
    console.log('✅ Services cleaned up');
  } catch (error) {
    console.error('Failed to cleanup services:', error);
  }
}

// 重新初始化服务（用于热切换工作区）
async function reinitializeServices() {
  try {
    console.log('🔄 Reinitializing services...');
    
    // 清理现有服务
    await cleanupServices();
    
    // 更新文件系统服务的笔记目录（读取新的 workspace 配置）
    fileSystemService.updateNotesDir();
    
    // 重新初始化数据库
    dbManager = new DatabaseManager();
    await dbManager.initialize();
    
    // 重新初始化笔记服务
    noteService = new NoteService(dbManager, fileSystemService);
    
    // 重新初始化文件监听服务
    fileWatcherService = new FileWatcherService(fileSystemService, noteService);
    fileWatcherService.start();
    
    // 更新笔记处理器的服务实例（不重新注册handlers）
    const { updateNoteServices } = await import('./main/ipc/noteHandlers');
    updateNoteServices(noteService, fileSystemService);
    
    console.log('✅ Services reinitialized');
    return true;
  } catch (error) {
    console.error('Failed to reinitialize services:', error);
    throw error;
  }
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    frame: false, // 无边框窗口
    icon: path.join(__dirname, '../resources/icon.png'), // 应用图标
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 窗口关闭时不做特殊处理，依赖自动保存

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await initializeServices();
  createWindow();
});

// 移除 isQuitting 相关逻辑，简化窗口关闭流程

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 应用退出前清理
app.on('before-quit', async () => {
  await cleanupServices();
});

// 导出 reinitializeServices 供 IPC 使用
export { reinitializeServices };

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
