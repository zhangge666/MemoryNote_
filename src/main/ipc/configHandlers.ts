/**
 * 配置管理 IPC 处理器
 */
import { ipcMain } from 'electron';
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
      service.set(key as any, value as any);
      await service.save();
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

  console.log('✅ Config IPC handlers registered');
};

/**
 * 获取配置服务实例（用于其他模块）
 */
export const getConfigService = async (): Promise<ConfigService> => {
  return initConfigService();
};
