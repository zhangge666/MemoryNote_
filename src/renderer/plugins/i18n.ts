/**
 * Vue I18n 配置
 * 阶段 0: 项目初始化
 */

import { createI18n } from 'vue-i18n';
import zhCN from '../locales/zh-CN.json';
import enUS from '../locales/en-US.json';
import { DEFAULT_LANGUAGE } from '../../shared/constants';

// 类型定义
export type MessageSchema = typeof zhCN;

// 支持的语言
export const SUPPORTED_LOCALES = {
  'zh-CN': '简体中文',
  'en-US': 'English',
} as const;

export type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

// 创建 i18n 实例
const i18n = createI18n<[MessageSchema], SupportedLocale>({
  legacy: false, // 使用 Composition API 模式
  locale: DEFAULT_LANGUAGE as SupportedLocale,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
});

/**
 * 切换语言
 */
export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale;
}

/**
 * 获取当前语言
 */
export function getLocale(): SupportedLocale {
  return i18n.global.locale.value;
}

/**
 * 翻译函数（用于非组件环境）
 */
export function t(key: string, ...args: unknown[]): string {
  return i18n.global.t(key, ...args);
}

export default i18n;


