/**
 * 默认亮色主题
 * 阶段 8: 主题系统
 */

import type { Theme } from '@shared/types/theme';

export const lightTheme: Theme = {
  id: 'light',
  name: '亮色主题',
  version: '1.0.0',
  author: 'MemoryNote',
  description: '清新明亮的默认主题',
  type: 'light',
  colors: {
    // 基础颜色
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#64748b',
    accent: '#8b5cf6',
    
    // 背景颜色
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    backgroundTertiary: '#f1f5f9',
    backgroundHover: '#f1f5f9',
    
    // 文本颜色
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',
    
    // 边框颜色
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderActive: '#3b82f6',
    
    // 状态颜色
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // 侧边栏
    sidebarBackground: '#f8fafc',
    sidebarText: '#475569',
    sidebarHover: '#f1f5f9',
    sidebarActive: '#e0e7ff',
    
    // 标题栏
    titlebarBackground: '#ffffff',
    titlebarText: '#0f172a',
    
    // 标签页
    tabBackground: '#f1f5f9',
    tabActive: '#ffffff',
    tabHover: '#e2e8f0',
    tabText: '#64748b',
    tabActiveText: '#0f172a',
    
    // 编辑器颜色
    editorBackground: '#ffffff',
    editorText: '#0f172a',
    editorSelection: '#dbeafe',
    editorCursor: '#3b82f6',
    editorLineNumber: '#94a3b8',
    editorGutter: '#f8fafc',
    
    // 语法高亮
    syntaxKeyword: '#8b5cf6',
    syntaxString: '#10b981',
    syntaxComment: '#94a3b8',
    syntaxFunction: '#3b82f6',
    syntaxVariable: '#ef4444',
    syntaxNumber: '#f59e0b',
    syntaxOperator: '#64748b',
    syntaxTag: '#ec4899',
    syntaxAttribute: '#3b82f6',
    
    // Markdown 高亮
    markdownHeading: '#0f172a',
    markdownBold: '#0f172a',
    markdownItalic: '#475569',
    markdownCode: '#ef4444',
    markdownCodeBlock: '#f1f5f9',
    markdownLink: '#3b82f6',
    markdownQuote: '#64748b',
    
    // 滚动条
    scrollbarTrack: '#f1f5f9',
    scrollbarThumb: '#cbd5e1',
    scrollbarThumbHover: '#94a3b8',
    
    // 输入框
    inputBackground: '#ffffff',
    inputBorder: '#e2e8f0',
    inputFocus: '#3b82f6',
    inputText: '#0f172a',
    inputPlaceholder: '#94a3b8',
    
    // 按钮
    buttonBackground: '#3b82f6',
    buttonHover: '#2563eb',
    buttonActive: '#1d4ed8',
    buttonText: '#ffffff',
    buttonDisabled: '#e2e8f0',
    
    // 通知
    notificationBackground: '#ffffff',
    notificationBorder: '#e2e8f0',
    notificationText: '#0f172a',
    
    // 工具提示
    tooltipBackground: '#0f172a',
    tooltipText: '#ffffff',
    
    // 分隔线
    divider: '#e2e8f0',
    
    // 阴影
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
  },
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Consolas", "Monaco", "Courier New", monospace',
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
};


