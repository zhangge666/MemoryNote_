/**
 * 基础类型定义
 * 阶段 0: 项目初始化
 */

// ==================== 应用配置 ====================

/**
 * 应用配置
 */
export interface AppConfig {
  workspace: string;
  language: string;
  theme: string;
  pluginDir: string;
}

/**
 * 窗口配置
 */
export interface WindowConfig {
  width: number;
  height: number;
  x?: number;
  y?: number;
  maximized: boolean;
}

/**
 * 编辑器配置
 */
export interface EditorConfig {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  theme: string;
  mode: 'instant' | 'readonly';
  enableCodeHighlight: boolean;
  enableMath: boolean;
  enableMermaid: boolean;
}

/**
 * 复习配置
 */
export interface ReviewConfig {
  algorithm: string;
  granularity: 'paragraph' | 'sentence' | 'word';
  syncToCloud: boolean;
}

/**
 * 用户配置（总配置）
 */
export interface UserConfig {
  app: AppConfig;
  window: WindowConfig;
  editor: EditorConfig;
  review: ReviewConfig;
}

// ==================== 笔记相关 ====================

/**
 * 笔记元数据
 */
export interface NoteMetadata {
  tags: string[];
  wordCount: number;
  readingTime: number; // 分钟
  [key: string]: unknown;
}

/**
 * 笔记
 */
export interface Note {
  id: number;
  title: string;
  path: string;
  content?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  metadata: NoteMetadata;
}

/**
 * 笔记查询参数
 */
export interface NoteQuery {
  keyword?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'title' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}

// ==================== 复习系统 ====================

/**
 * 复习卡片
 */
export interface ReviewCard {
  id: number;
  noteId: number;
  content: string;
  type: 'added' | 'modified' | 'deleted';
  difficulty: number; // 难度系数
  interval: number; // 复习间隔（天）
  nextReview: number; // 下次复习时间戳
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

/**
 * 复习结果
 */
export interface ReviewResult {
  quality: number; // 0-5，5 表示完全记住
  timeSpent: number; // 毫秒
}

/**
 * 复习统计
 */
export interface ReviewStats {
  totalCards: number;
  dueCards: number;
  learnedCards: number;
  reviewedToday: number;
  averageQuality: number;
}

/**
 * Diff 变更
 */
export interface DiffChange {
  type: 'add' | 'modify' | 'delete';
  content: string;
  lineStart: number;
  lineEnd: number;
}

// ==================== 标签页系统 ====================

/**
 * 标签页
 */
export interface Tab {
  id: string;
  title: string;
  type: 'editor' | 'plugin' | 'settings';
  filePath?: string;
  icon?: string;
  isDirty: boolean; // 是否有未保存的修改
  isPinned: boolean;
  data?: unknown; // 扩展数据
}

/**
 * 标签页组
 */
export interface TabGroup {
  id: string;
  tabs: Tab[];
  activeTabId: string | null;
}

/**
 * 分屏布局
 */
export interface SplitLayout {
  type: 'single' | 'horizontal' | 'vertical';
  groups?: string[]; // TabGroup IDs
  children?: SplitLayout[]; // 嵌套布局
  ratio?: number; // 分割比例
}

/**
 * 标签页系统状态
 */
export interface TabSystemState {
  groups: Map<string, TabGroup>;
  layout: SplitLayout;
  activeGroupId: string | null;
}

// ==================== 命令系统 ====================

/**
 * 命令
 */
export interface Command {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  keybinding?: string;
  when?: string; // 上下文条件
  handler: (...args: unknown[]) => void | Promise<void>;
}

/**
 * 命令执行上下文
 */
export interface CommandContext {
  activeEditor?: unknown;
  activeNote?: Note;
  selectedText?: string;
  [key: string]: unknown;
}

/**
 * 快捷键绑定
 */
export interface Keybinding {
  key: string; // e.g., "Ctrl+S", "Cmd+Shift+P"
  command: string;
  when?: string;
}

// ==================== 通知系统 ====================

/**
 * 通知操作
 */
export interface NotificationAction {
  label: string;
  handler: () => void;
}

/**
 * 通知
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number; // 毫秒，0 表示不自动关闭
  actions?: NotificationAction[];
}

// ==================== 主题系统 ====================

/**
 * 主题颜色
 */
export interface ThemeColors {
  // 基础颜色
  primary: string;
  secondary: string;
  accent: string;

  // 背景颜色
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // 文本颜色
  text: string;
  textSecondary: string;
  textMuted: string;

  // 边框颜色
  border: string;
  borderActive: string;

  // 状态颜色
  success: string;
  warning: string;
  error: string;
  info: string;

  // 编辑器颜色
  editorBackground: string;
  editorText: string;
  editorSelection: string;
  editorCursor: string;

  // 语法高亮
  syntaxKeyword: string;
  syntaxString: string;
  syntaxComment: string;
  syntaxFunction: string;
  syntaxVariable: string;

  [key: string]: string;
}

/**
 * 主题字体
 */
export interface ThemeFonts {
  body: string;
  heading: string;
  mono: string;
}

/**
 * 主题
 */
export interface Theme {
  id: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  colors: ThemeColors;
  fonts?: ThemeFonts;
  custom?: Record<string, unknown>;
}

// ==================== 编辑器 ====================

/**
 * 编辑器选项
 */
export interface EditorOptions {
  mode: 'instant' | 'readonly';
  theme: string;
  fontSize: number;
  lineHeight: number;
  tabSize: number;
  enableCodeHighlight: boolean;
  enableMath: boolean;
  enableMermaid: boolean;
}

/**
 * 编辑器状态
 */
export interface EditorState {
  content: string;
  selection: { from: number; to: number };
  scrollTop: number;
}

/**
 * 编辑器插件
 */
export interface EditorPlugin {
  name: string;
  setup: (editor: unknown) => void;
  destroy?: () => void;
}

// ==================== 搜索系统 ====================

/**
 * 搜索选项
 */
export interface SearchOptions {
  keyword: string;
  caseSensitive?: boolean;
  regex?: boolean;
  tags?: string[];
  dateRange?: { from: number; to: number };
  limit?: number;
}

/**
 * 搜索匹配
 */
export interface SearchMatch {
  content: string;
  lineNumber: number;
  columnStart: number;
  columnEnd: number;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  note: Note;
  matches: SearchMatch[];
  score: number;
}

// ==================== 插件系统 ====================

/**
 * 插件贡献点
 */
export interface PluginContributes {
  commands?: Command[];
  keybindings?: Keybinding[];
  views?: PluginView[];
  themes?: string[];
}

/**
 * 插件视图
 */
export interface PluginView {
  id: string;
  title: string;
  icon?: string;
  location: 'sidebar-left' | 'sidebar-right' | 'statusbar' | 'navbar';
  component: unknown;
}

/**
 * 插件清单
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  main: string; // 入口文件
  icon?: string;
  engines: {
    memorynote: string; // 兼容的应用版本
  };
  activationEvents?: string[]; // 激活时机
  contributes?: PluginContributes;
}

/**
 * 插件存储接口
 */
export interface IPluginStorage {
  get<T>(key: string): T | undefined;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * 插件上下文
 */
export interface PluginContext {
  extensionPath: string;
  globalState: IPluginStorage;
  workspaceState: IPluginStorage;
}

// ==================== AI 系统 ====================

/**
 * 向量搜索结果
 */
export interface VectorSearchResult {
  note: Note;
  similarity: number;
  excerpt: string;
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/**
 * LLM 配置
 */
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

// ==================== 用户系统 ====================

/**
 * 用户
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: number;
}

/**
 * 认证令牌
 */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ==================== 文件系统 ====================

/**
 * 文件信息
 */
export interface FileStats {
  size: number;
  mtime: Date;
  isFile: boolean;
  isDirectory: boolean;
}

/**
 * 文件变更事件
 */
export type FileChangeEvent = 'add' | 'change' | 'unlink';


