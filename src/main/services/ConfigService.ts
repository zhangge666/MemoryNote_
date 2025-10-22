/**
 * 配置管理服务
 * 阶段 1: 核心框架搭建
 */

import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import type { UserConfig } from '../../shared/types';
import {
  DEFAULT_WORKSPACE,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEFAULT_WINDOW_CONFIG,
  DEFAULT_EDITOR_CONFIG,
  DEFAULT_REVIEW_CONFIG,
  CONFIG_FILE_NAME,
} from '../../shared/constants';

export class ConfigService {
  private static instance: ConfigService | null = null;
  private config: UserConfig;
  private configPath: string;
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  constructor() {
    this.configPath = path.join(app.getPath('userData'), CONFIG_FILE_NAME);
    this.config = this.getDefaultConfig();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * 初始化配置
   */
  async initialize(): Promise<void> {
    try {
      const exists = await this.fileExists(this.configPath);
      if (exists) {
        const data = await fs.readFile(this.configPath, 'utf-8');
        this.config = { ...this.config, ...JSON.parse(data) };
      } else {
        await this.save();
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * 获取配置
   */
  get<K extends keyof UserConfig>(key: K): UserConfig[K] {
    return this.config[key];
  }

  /**
   * 获取所有配置
   */
  getAll(): UserConfig {
    return { ...this.config };
  }

  /**
   * 设置配置（不自动保存，需要手动调用 save）
   */
  set<K extends keyof UserConfig>(key: K, value: UserConfig[K]): void {
    this.config[key] = value;
    this.notifyListeners(key as string, value);
  }

  /**
   * 设置配置并保存
   */
  async setAndSave<K extends keyof UserConfig>(key: K, value: UserConfig[K]): Promise<void> {
    this.set(key, value);
    await this.save();
  }

  /**
   * 批量设置配置
   */
  async setAll(config: Partial<UserConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.save();
    
    Object.entries(config).forEach(([key, value]) => {
      this.notifyListeners(key, value);
    });
  }

  /**
   * 重置单个配置项
   */
  async reset<K extends keyof UserConfig>(key: K): Promise<void> {
    const defaultConfig = this.getDefaultConfig();
    this.config[key] = defaultConfig[key];
    await this.save();
    this.notifyListeners(key as string, defaultConfig[key]);
  }

  /**
   * 重置所有配置
   */
  async resetAll(): Promise<void> {
    this.config = this.getDefaultConfig();
    await this.save();
  }

  /**
   * 监听配置变化
   */
  onChange<K extends keyof UserConfig>(
    key: K,
    callback: (value: UserConfig[K]) => void
  ): void {
    if (!this.listeners.has(key as string)) {
      this.listeners.set(key as string, new Set());
    }
    this.listeners.get(key as string)!.add(callback);
  }

  /**
   * 加载配置
   */
  async load(): Promise<void> {
    try {
      const exists = await this.fileExists(this.configPath);
      if (exists) {
        const data = await fs.readFile(this.configPath, 'utf-8');
        this.config = { ...this.config, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  /**
   * 保存配置到文件
   */
  async save(): Promise<void> {
    try {
      const dir = path.dirname(this.configPath);
      const dirExists = await this.fileExists(dir);
      if (!dirExists) {
        await fs.mkdir(dir, { recursive: true });
      }
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(key: string, value: any): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach((callback) => callback(value));
    }
  }

  /**
   * 检查文件是否存在
   */
  private async fileExists(filepath: string): Promise<boolean> {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): UserConfig {
    const workspacePath = path.join(app.getAppPath(), DEFAULT_WORKSPACE);
    
    return {
      app: {
        workspace: workspacePath,
        language: DEFAULT_LANGUAGE,
        theme: DEFAULT_THEME,
        pluginDir: path.join(workspacePath, '.plugins'),
      },
      window: { ...DEFAULT_WINDOW_CONFIG },
      editor: { ...DEFAULT_EDITOR_CONFIG },
      review: { ...DEFAULT_REVIEW_CONFIG },
    };
  }
}

// 单例实例
let instance: ConfigService | null = null;

/**
 * 获取 ConfigService 单例
 */
export const getInstance = (): ConfigService => {
  if (!instance) {
    instance = new ConfigService();
  }
  return instance;
};

