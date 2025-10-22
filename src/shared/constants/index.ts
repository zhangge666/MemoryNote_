/**
 * 应用常量定义
 * 阶段 0: 项目初始化
 */

// ==================== 应用信息 ====================
export const APP_NAME = 'MemoryNote';
export const APP_VERSION = '1.0.0';
export const APP_AUTHOR = 'zhangge666';

// ==================== 默认配置 ====================

/**
 * 默认工作目录（相对于安装目录）
 */
export const DEFAULT_WORKSPACE = 'workspace';

/**
 * 插件目录名称
 */
export const PLUGINS_DIR_NAME = '.plugins';

/**
 * 默认语言
 */
export const DEFAULT_LANGUAGE = 'zh-CN';

/**
 * 默认主题
 */
export const DEFAULT_THEME = 'light';

/**
 * 默认窗口配置
 */
export const DEFAULT_WINDOW_CONFIG = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  maximized: false,
};

/**
 * 默认编辑器配置
 */
export const DEFAULT_EDITOR_CONFIG = {
  fontSize: 14,
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  lineHeight: 1.6,
  tabSize: 2,
  theme: 'default',
  mode: 'instant' as const,
  enableCodeHighlight: true,
  enableMath: true,
  enableMermaid: true,
};

/**
 * 默认复习配置
 */
export const DEFAULT_REVIEW_CONFIG = {
  algorithm: 'sm2',
  granularity: 'paragraph' as const,
  syncToCloud: false,
};

// ==================== 文件路径 ====================

/**
 * 配置文件名
 */
export const CONFIG_FILE_NAME = 'config.json';

/**
 * 数据库文件名
 */
export const DATABASE_FILE_NAME = 'memorynote.db';

/**
 * 日志目录名
 */
export const LOG_DIR_NAME = 'logs';

/**
 * 主题目录名
 */
export const THEMES_DIR_NAME = 'themes';

// ==================== 数据库常量 ====================

/**
 * 数据库版本
 */
export const DATABASE_VERSION = 1;

/**
 * 数据库最大连接数
 */
export const DATABASE_MAX_CONNECTIONS = 10;

// ==================== 复习算法常量 ====================

/**
 * SM-2 算法默认参数
 */
export const SM2_DEFAULTS = {
  MIN_EASE_FACTOR: 1.3,
  INITIAL_EASE_FACTOR: 2.5,
  INITIAL_INTERVAL: 1,
  EASY_BONUS: 1.3,
  HARD_PENALTY: 0.8,
};

/**
 * 复习质量等级
 */
export const REVIEW_QUALITY = {
  BLACKOUT: 0, // 完全不记得
  INCORRECT_EASY: 1, // 错误但容易想起
  INCORRECT_HARD: 2, // 错误且难以想起
  CORRECT_HARD: 3, // 正确但困难
  CORRECT_EASY: 4, // 正确且容易
  PERFECT: 5, // 完美记忆
} as const;

// ==================== 编辑器常量 ====================

/**
 * 支持的文件扩展名
 */
export const SUPPORTED_FILE_EXTENSIONS = ['.md', '.markdown', '.txt'];

/**
 * 最大文件大小（字节）
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 自动保存延迟（毫秒）
 */
export const AUTO_SAVE_DELAY = 1000;

// ==================== 通知常量 ====================

/**
 * 通知默认持续时间（毫秒）
 */
export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERMANENT: 0,
};

/**
 * 最大通知数量
 */
export const MAX_NOTIFICATIONS = 5;

// ==================== 搜索常量 ====================

/**
 * 搜索结果默认限制
 */
export const DEFAULT_SEARCH_LIMIT = 50;

/**
 * 搜索历史最大数量
 */
export const MAX_SEARCH_HISTORY = 20;

/**
 * 向量搜索默认相似度阈值
 */
export const VECTOR_SEARCH_SIMILARITY_THRESHOLD = 0.7;

// ==================== 插件常量 ====================

/**
 * 插件清单文件名
 */
export const PLUGIN_MANIFEST_FILE = 'plugin.json';

/**
 * 插件最小兼容版本
 */
export const MIN_PLUGIN_ENGINE_VERSION = '1.0.0';

// ==================== UI 常量 ====================

/**
 * 标题栏高度
 */
export const TITLEBAR_HEIGHT = 32;

/**
 * 状态栏高度
 */
export const STATUSBAR_HEIGHT = 24;

/**
 * 侧边栏默认宽度
 */
export const SIDEBAR_DEFAULT_WIDTH = 250;

/**
 * 侧边栏最小宽度
 */
export const SIDEBAR_MIN_WIDTH = 150;

/**
 * 侧边栏最大宽度
 */
export const SIDEBAR_MAX_WIDTH = 500;

/**
 * 标签页高度
 */
export const TAB_HEIGHT = 36;

// ==================== 快捷键常量 ====================

/**
 * 平台修饰键
 */
export const PLATFORM_MOD_KEY = (() => {
  // 渲染进程中使用 navigator
  if (typeof window !== 'undefined') {
    return navigator.platform.toLowerCase().includes('mac') ? 'Cmd' : 'Ctrl';
  }
  // 主进程中使用 process
  return typeof process !== 'undefined' && process.platform === 'darwin' ? 'Cmd' : 'Ctrl';
})();

/**
 * 默认快捷键
 */
export const DEFAULT_KEYBINDINGS = {
  // 文件操作
  NEW_NOTE: `${PLATFORM_MOD_KEY}+N`,
  SAVE: `${PLATFORM_MOD_KEY}+S`,
  OPEN: `${PLATFORM_MOD_KEY}+O`,
  CLOSE_TAB: `${PLATFORM_MOD_KEY}+W`,

  // 编辑操作
  UNDO: `${PLATFORM_MOD_KEY}+Z`,
  REDO: `${PLATFORM_MOD_KEY}+Shift+Z`,
  CUT: `${PLATFORM_MOD_KEY}+X`,
  COPY: `${PLATFORM_MOD_KEY}+C`,
  PASTE: `${PLATFORM_MOD_KEY}+V`,
  SELECT_ALL: `${PLATFORM_MOD_KEY}+A`,

  // 查找替换
  FIND: `${PLATFORM_MOD_KEY}+F`,
  REPLACE: `${PLATFORM_MOD_KEY}+H`,
  FIND_IN_FILES: `${PLATFORM_MOD_KEY}+Shift+F`,

  // 视图切换
  TOGGLE_SIDEBAR_LEFT: `${PLATFORM_MOD_KEY}+B`,
  TOGGLE_SIDEBAR_RIGHT: `${PLATFORM_MOD_KEY}+Alt+B`,
  TOGGLE_FULLSCREEN: 'F11',

  // 命令面板
  COMMAND_PALETTE: `${PLATFORM_MOD_KEY}+Shift+P`,

  // 标签页导航
  NEXT_TAB: `${PLATFORM_MOD_KEY}+Tab`,
  PREV_TAB: `${PLATFORM_MOD_KEY}+Shift+Tab`,

  // 分屏
  SPLIT_HORIZONTAL: `${PLATFORM_MOD_KEY}+\\`,
  SPLIT_VERTICAL: `${PLATFORM_MOD_KEY}+Shift+\\`,
};

// ==================== 时间常量 ====================

/**
 * 一天的毫秒数
 */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 一小时的毫秒数
 */
export const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * 一分钟的毫秒数
 */
export const ONE_MINUTE_MS = 60 * 1000;

// ==================== 正则表达式 ====================

/**
 * Markdown 标题正则
 */
export const MARKDOWN_HEADING_REGEX = /^(#{1,6})\s+(.+)$/gm;

/**
 * Markdown 代码块正则
 */
export const MARKDOWN_CODE_BLOCK_REGEX = /```[\s\S]*?```/g;

/**
 * Markdown 链接正则
 */
export const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Markdown 图片正则
 */
export const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;

// ==================== 导出所有常量 ====================
export default {
  APP_NAME,
  APP_VERSION,
  APP_AUTHOR,
  DEFAULT_WORKSPACE,
  PLUGINS_DIR_NAME,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  DEFAULT_WINDOW_CONFIG,
  DEFAULT_EDITOR_CONFIG,
  DEFAULT_REVIEW_CONFIG,
  CONFIG_FILE_NAME,
  DATABASE_FILE_NAME,
  LOG_DIR_NAME,
  THEMES_DIR_NAME,
  DATABASE_VERSION,
  DATABASE_MAX_CONNECTIONS,
  SM2_DEFAULTS,
  REVIEW_QUALITY,
  SUPPORTED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  AUTO_SAVE_DELAY,
  NOTIFICATION_DURATION,
  MAX_NOTIFICATIONS,
  DEFAULT_SEARCH_LIMIT,
  MAX_SEARCH_HISTORY,
  VECTOR_SEARCH_SIMILARITY_THRESHOLD,
  PLUGIN_MANIFEST_FILE,
  MIN_PLUGIN_ENGINE_VERSION,
  TITLEBAR_HEIGHT,
  STATUSBAR_HEIGHT,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_MAX_WIDTH,
  TAB_HEIGHT,
  PLATFORM_MOD_KEY,
  DEFAULT_KEYBINDINGS,
  ONE_DAY_MS,
  ONE_HOUR_MS,
  ONE_MINUTE_MS,
  MARKDOWN_HEADING_REGEX,
  MARKDOWN_CODE_BLOCK_REGEX,
  MARKDOWN_LINK_REGEX,
  MARKDOWN_IMAGE_REGEX,
};

