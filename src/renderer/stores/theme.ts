/**
 * 主题 Store
 * 阶段 8: 主题系统
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Theme, ThemeMetadata } from '@shared/types/theme';
import { getThemeService } from '@renderer/services/ThemeService';
import { lightTheme } from '@renderer/themes/light';
import { darkTheme } from '@renderer/themes/dark';

export const useThemeStore = defineStore('theme', () => {
  const themeService = getThemeService();
  
  // 状态
  const currentTheme = ref<Theme | null>(null);
  const availableThemes = ref<ThemeMetadata[]>([]);
  
  // Getter
  const themeId = computed(() => currentTheme.value?.id || 'light');
  const themeName = computed(() => currentTheme.value?.name || '亮色主题');
  const themeType = computed(() => currentTheme.value?.type || 'light');
  const isLight = computed(() => themeType.value === 'light');
  const isDark = computed(() => themeType.value === 'dark');
  
  /**
   * 初始化主题系统
   */
  async function initialize() {
    // 注册内置主题
    themeService.registerTheme(lightTheme);
    themeService.registerTheme(darkTheme);
    
    // 获取可用主题列表
    availableThemes.value = themeService.getAllThemes();
    
    // 从配置中加载上次选择的主题
    let savedThemeId = 'light';
    
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const config = await window.electronAPI.invoke('config:get', 'theme');
        if (config && typeof config === 'string') {
          savedThemeId = config;
        }
      } catch (error) {
        // Failed to load theme config
      }
    }
    
    // 如果保存的主题不存在，使用系统偏好
    const theme = themeService.getTheme(savedThemeId);
    if (!theme) {
      const systemPreference = themeService.getSystemThemePreference();
      savedThemeId = systemPreference;
    }
    
    // 加载主题
    await loadTheme(savedThemeId);
  }
  
  /**
   * 加载主题
   */
  async function loadTheme(themeId: string) {
    try {
      await themeService.loadTheme(themeId);
      currentTheme.value = themeService.getCurrentTheme();
    } catch (error) {
      // 加载失败，使用默认亮色主题
      await themeService.loadTheme('light');
      currentTheme.value = themeService.getCurrentTheme();
    }
  }
  
  /**
   * 切换主题
   */
  async function switchTheme(themeId: string) {
    await loadTheme(themeId);
  }
  
  /**
   * 切换亮色/暗色主题
   */
  async function toggleTheme() {
    const newThemeId = isLight.value ? 'dark' : 'light';
    await switchTheme(newThemeId);
  }
  
  /**
   * 跟随系统主题
   */
  function followSystemTheme() {
    const systemPreference = themeService.getSystemThemePreference();
    switchTheme(systemPreference);
    
    // 监听系统主题变化
    return themeService.watchSystemTheme((preference) => {
      switchTheme(preference);
    });
  }
  
  /**
   * 监听主题变化
   */
  function onThemeChange(callback: (theme: Theme) => void) {
    return themeService.onThemeChange(callback);
  }
  
  /**
   * 获取主题
   */
  function getTheme(themeId: string) {
    return themeService.getTheme(themeId);
  }
  
  /**
   * 获取所有主题
   */
  function getAllThemes() {
    return themeService.getAllThemes();
  }
  
  return {
    // 状态
    currentTheme,
    availableThemes,
    
    // Getters
    themeId,
    themeName,
    themeType,
    isLight,
    isDark,
    
    // Actions
    initialize,
    loadTheme,
    switchTheme,
    toggleTheme,
    followSystemTheme,
    onThemeChange,
    getTheme,
    getAllThemes,
  };
});


