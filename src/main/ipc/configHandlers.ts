/**
 * 配置管理 IPC 处理器
 */
import { ipcMain, BrowserWindow, shell } from 'electron';
import * as path from 'path';
import { IPCChannel } from '@shared/interfaces/ipc';
import { ConfigService } from '../services/ConfigService';

let configService: ConfigService | null = null;

/**
 * 初始化配置服务
 */
const initConfigService = async () => {
  if (!configService) {
    configService = ConfigService.getInstance();
    await configService.load();
  }
  return configService;
};

/**
 * 注册配置相关的 IPC 处理器
 */
export const registerConfigHandlers = () => {
  // 获取单个配置
  ipcMain.handle(IPCChannel.CONFIG_GET, async (_event, key: string) => {
    try {
      const service = await initConfigService();
      const value = service.get(key as any);
      console.log(`[ConfigService] GET "${key}":`, value);
      return value;
    } catch (error) {
      console.error(`Failed to get config "${key}":`, error);
      throw error;
    }
  });

  // 获取所有配置
  ipcMain.handle(IPCChannel.CONFIG_GET_ALL, async () => {
    try {
      const service = await initConfigService();
      return service.getAll();
    } catch (error) {
      console.error('Failed to get all config:', error);
      throw error;
    }
  });

  // 设置单个配置
  ipcMain.handle(IPCChannel.CONFIG_SET, async (_event, key: string, value: unknown) => {
    try {
      const service = await initConfigService();
      console.log(`[ConfigService] SET "${key}":`, JSON.stringify(value).substring(0, 200));
      service.set(key as any, value as any);
      await service.save();
      console.log(`[ConfigService] Config saved successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to set config "${key}":`, error);
      throw error;
    }
  });

  // 设置所有配置
  ipcMain.handle(IPCChannel.CONFIG_SET_ALL, async (_event, config: Record<string, unknown>) => {
    try {
      const service = await initConfigService();

      Object.entries(config).forEach(([key, value]) => {
        service.set(key as any, value as any);
      });
      await service.save();
      return true;
    } catch (error) {
      console.error('Failed to set all config:', error);
      throw error;
    }
  });

  // 重置配置
  ipcMain.handle(IPCChannel.CONFIG_RESET, async (_event, key?: string) => {
    try {
      const service = await initConfigService();
      if (key) {
        // 重置单个配置项
        await service.reset(key as any);
      } else {
        // 重置所有配置
        await service.resetAll();
      }
      return true;
    } catch (error) {
      console.error('Failed to reset config:', error);
      throw error;
    }
  });

  // 切换工作区（热切换，无需重启）
  ipcMain.handle('app:switch-workspace', async (_event, newWorkspacePath: string) => {
    try {
      console.log('🔄 Switching workspace to:', newWorkspacePath);
      
      // 更新配置
      const service = await initConfigService();
      const appConfig = service.get('app');
      appConfig.workspace = newWorkspacePath;
      service.set('app', appConfig);
      await service.save();
      
      // 动态导入 reinitializeServices
      const { reinitializeServices } = await import('../../main');
      
      // 重新初始化所有服务
      await reinitializeServices();
      
      // 通知渲染进程工作区已切换
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(win => {
        win.webContents.send('workspace:changed', newWorkspacePath);
      });
      
      console.log('✅ Workspace switched successfully');
      return true;
    } catch (error) {
      console.error('Failed to switch workspace:', error);
      throw error;
    }
  });

  // 在文件管理器中显示文件
  ipcMain.handle('app:show-in-folder', async (_event, filePath: string) => {
    try {
      console.log('📁 Showing in folder:', filePath);
      
      // 标准化路径（处理不同操作系统的路径分隔符）
      const normalizedPath = path.normalize(filePath);
      console.log('📂 Normalized path:', normalizedPath);
      
      shell.showItemInFolder(normalizedPath);
      return true;
    } catch (error) {
      console.error('Failed to show in folder:', error);
      throw error;
    }
  });

  console.log('✅ Config IPC handlers registered');
};

/**
 * 获取配置服务实例（用于其他模块）
 */
export const getConfigService = async (): Promise<ConfigService> => {
  return initConfigService();
};
