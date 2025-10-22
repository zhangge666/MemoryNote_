/**
 * 主题系统类型定义
 * 阶段 8: 主题系统
 */

/**
 * 主题配置
 */
export interface Theme {
  id: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  type: 'light' | 'dark';
  colors: ThemeColors;
  fonts?: ThemeFonts;
  custom?: Record<string, any>;
}

/**
 * 主题颜色配置
 */
export interface ThemeColors {
  // 基础颜色
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  
  // 背景颜色
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundHover: string;
  
  // 文本颜色
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // 边框颜色
  border: string;
  borderLight: string;
  borderActive: string;
  
  // 状态颜色
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // 侧边栏
  sidebarBackground: string;
  sidebarText: string;
  sidebarHover: string;
  sidebarActive: string;
  
  // 标题栏
  titlebarBackground: string;
  titlebarText: string;
  
  // 标签页
  tabBackground: string;
  tabActive: string;
  tabHover: string;
  tabText: string;
  tabActiveText: string;
  
  // 编辑器颜色
  editorBackground: string;
  editorText: string;
  editorSelection: string;
  editorCursor: string;
  editorLineNumber: string;
  editorGutter: string;
  
  // 语法高亮
  syntaxKeyword: string;
  syntaxString: string;
  syntaxComment: string;
  syntaxFunction: string;
  syntaxVariable: string;
  syntaxNumber: string;
  syntaxOperator: string;
  syntaxTag: string;
  syntaxAttribute: string;
  
  // Markdown 高亮
  markdownHeading: string;
  markdownBold: string;
  markdownItalic: string;
  markdownCode: string;
  markdownCodeBlock: string;
  markdownLink: string;
  markdownQuote: string;
  
  // 滚动条
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
  
  // 输入框
  inputBackground: string;
  inputBorder: string;
  inputFocus: string;
  inputText: string;
  inputPlaceholder: string;
  
  // 按钮
  buttonBackground: string;
  buttonHover: string;
  buttonActive: string;
  buttonText: string;
  buttonDisabled: string;
  
  // 通知
  notificationBackground: string;
  notificationBorder: string;
  notificationText: string;
  
  // 工具提示
  tooltipBackground: string;
  tooltipText: string;
  
  // 分隔线
  divider: string;
  
  // 阴影
  shadow: string;
  shadowLight: string;
  
  // 自定义颜色
  [key: string]: string;
}

/**
 * 主题字体配置
 */
export interface ThemeFonts {
  body: string;
  heading: string;
  mono: string;
  size: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

/**
 * 主题元数据
 */
export interface ThemeMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  type: 'light' | 'dark';
  isBuiltin: boolean;
  path?: string;
}

/**
 * 主题配置选项
 */
export interface ThemeOptions {
  theme: string;
  customColors?: Partial<ThemeColors>;
  customFonts?: Partial<ThemeFonts>;
}


