/**
 * 主题服务
 * 阶段 8: 主题系统
 */

import type { Theme, ThemeColors, ThemeMetadata } from '@shared/types/theme';

/**
 * 主题服务接口
 */
export interface IThemeService {
  // 加载主题
  loadTheme(themeId: string): Promise<void>;
  
  // 获取主题
  getCurrentTheme(): Theme | null;
  getTheme(themeId: string): Theme | null;
  getAllThemes(): ThemeMetadata[];
  
  // 应用主题
  applyTheme(theme: Theme): void;
  
  // 监听主题变化
  onThemeChange(callback: (theme: Theme) => void): () => void;
}

/**
 * 主题服务实现
 */
export class ThemeService implements IThemeService {
  private themes: Map<string, Theme> = new Map();
  private currentTheme: Theme | null = null;
  private listeners: Array<(theme: Theme) => void> = [];
  
  constructor() {
    // 在构造函数中不初始化，等待外部调用 initialize
  }
  
  /**
   * 初始化主题服务
   */
  async initialize(): Promise<void> {
    // 主题将由外部注册，这里不自动加载
  }
  
  /**
   * 注册主题
   */
  registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }
  
  /**
   * 加载主题
   */
  async loadTheme(themeId: string): Promise<void> {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.notifyListeners(theme);
    
    // 保存主题选择
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        await window.electronAPI.invoke('config:set', 'theme', themeId);
      } catch (error) {
        // Failed to save theme preference
      }
    }
  }
  
  /**
   * 获取当前主题
   */
  getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }
  
  /**
   * 获取指定主题
   */
  getTheme(themeId: string): Theme | null {
    return this.themes.get(themeId) || null;
  }
  
  /**
   * 获取所有主题元数据
   */
  getAllThemes(): ThemeMetadata[] {
    return Array.from(this.themes.values()).map(theme => ({
      id: theme.id,
      name: theme.name,
      version: theme.version,
      author: theme.author,
      description: theme.description,
      type: theme.type,
      isBuiltin: true,
    }));
  }
  
  /**
   * 应用主题
   */
  applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // 应用颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--theme-${this.kebabCase(key)}`;
      root.style.setProperty(cssVarName, value);
    });
    
    // 应用字体变量
    if (theme.fonts) {
      root.style.setProperty('--theme-font-body', theme.fonts.body);
      root.style.setProperty('--theme-font-heading', theme.fonts.heading);
      root.style.setProperty('--theme-font-mono', theme.fonts.mono);
      
      if (theme.fonts.size) {
        Object.entries(theme.fonts.size).forEach(([key, value]) => {
          root.style.setProperty(`--theme-font-size-${key}`, value);
        });
      }
      
      if (theme.fonts.lineHeight) {
        Object.entries(theme.fonts.lineHeight).forEach(([key, value]) => {
          root.style.setProperty(`--theme-line-height-${key}`, value);
        });
      }
    }
    
    // 设置主题类型
    root.setAttribute('data-theme', theme.type);
    root.setAttribute('data-theme-id', theme.id);
  }
  
  /**
   * 监听主题变化
   */
  onThemeChange(callback: (theme: Theme) => void): () => void {
    this.listeners.push(callback);
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * 通知监听器
   */
  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        // Listener error
      }
    });
  }
  
  /**
   * 将驼峰命名转为短横线命名
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
  
  /**
   * 获取系统主题偏好
   */
  getSystemThemePreference(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  /**
   * 监听系统主题变化
   */
  watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
    if (typeof window === 'undefined') return () => {};
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }
}

// 单例实例
let instance: ThemeService | null = null;

/**
 * 获取主题服务单例
 */
export function getThemeService(): ThemeService {
  if (!instance) {
    instance = new ThemeService();
  }
  return instance;
}


