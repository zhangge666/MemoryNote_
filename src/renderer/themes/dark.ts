/**
 * 默认暗色主题
 * 阶段 8: 主题系统
 */

import type { Theme } from '@shared/types/theme';

export const darkTheme: Theme = {
  id: 'dark',
  name: '暗色主题',
  version: '1.0.0',
  author: 'MemoryNote',
  description: '优雅深沉的暗色主题',
  type: 'dark',
  colors: {
    // 基础颜色
    primary: '#60a5fa',
    primaryHover: '#3b82f6',
    secondary: '#94a3b8',
    accent: '#a78bfa',
    
    // 背景颜色
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',
    backgroundHover: '#1e293b',
    
    // 文本颜色
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    textInverse: '#0f172a',
    
    // 边框颜色
    border: '#334155',
    borderLight: '#1e293b',
    borderActive: '#60a5fa',
    
    // 状态颜色
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    
    // 侧边栏
    sidebarBackground: '#1e293b',
    sidebarText: '#cbd5e1',
    sidebarHover: '#334155',
    sidebarActive: '#1e40af',
    
    // 标题栏
    titlebarBackground: '#0f172a',
    titlebarText: '#f1f5f9',
    
    // 标签页
    tabBackground: '#1e293b',
    tabActive: '#0f172a',
    tabHover: '#334155',
    tabText: '#94a3b8',
    tabActiveText: '#f1f5f9',
    
    // 编辑器颜色
    editorBackground: '#0f172a',
    editorText: '#e2e8f0',
    editorSelection: '#1e3a8a',
    editorCursor: '#60a5fa',
    editorLineNumber: '#64748b',
    editorGutter: '#1e293b',
    
    // 语法高亮
    syntaxKeyword: '#c084fc',
    syntaxString: '#6ee7b7',
    syntaxComment: '#64748b',
    syntaxFunction: '#60a5fa',
    syntaxVariable: '#fca5a5',
    syntaxNumber: '#fbbf24',
    syntaxOperator: '#94a3b8',
    syntaxTag: '#f9a8d4',
    syntaxAttribute: '#60a5fa',
    
    // Markdown 高亮
    markdownHeading: '#f1f5f9',
    markdownBold: '#f1f5f9',
    markdownItalic: '#cbd5e1',
    markdownCode: '#fca5a5',
    markdownCodeBlock: '#1e293b',
    markdownLink: '#60a5fa',
    markdownQuote: '#94a3b8',
    
    // 滚动条
    scrollbarTrack: '#1e293b',
    scrollbarThumb: '#475569',
    scrollbarThumbHover: '#64748b',
    
    // 输入框
    inputBackground: '#1e293b',
    inputBorder: '#334155',
    inputFocus: '#60a5fa',
    inputText: '#f1f5f9',
    inputPlaceholder: '#64748b',
    
    // 按钮
    buttonBackground: '#3b82f6',
    buttonHover: '#60a5fa',
    buttonActive: '#93c5fd',
    buttonText: '#ffffff',
    buttonDisabled: '#334155',
    
    // 通知
    notificationBackground: '#1e293b',
    notificationBorder: '#334155',
    notificationText: '#f1f5f9',
    
    // 工具提示
    tooltipBackground: '#f1f5f9',
    tooltipText: '#0f172a',
    
    // 分隔线
    divider: '#334155',
    
    // 阴影
    shadow: 'rgba(0, 0, 0, 0.5)',
    shadowLight: 'rgba(0, 0, 0, 0.3)',
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


