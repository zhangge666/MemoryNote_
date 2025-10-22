/**
 * 命令系统类型定义
 */

/**
 * 命令定义
 */
export interface Command {
  /** 命令唯一标识符 */
  id: string;
  /** 命令标题 */
  title: string;
  /** 命令分类 */
  category?: string;
  /** 命令图标 */
  icon?: string;
  /** 默认快捷键 */
  keybinding?: string;
  /** 上下文条件表达式 */
  when?: string;
  /** 命令处理函数 */
  handler: (...args: any[]) => void | Promise<void>;
  /** 命令描述 */
  description?: string;
}

/**
 * 命令执行上下文
 */
export interface CommandContext {
  /** 当前激活的编辑器 */
  activeEditor?: any;
  /** 当前激活的笔记 */
  activeNote?: any;
  /** 选中的文本 */
  selectedText?: string;
  /** 焦点元素 */
  focusedElement?: string;
  /** 自定义上下文数据 */
  [key: string]: any;
}

/**
 * 命令分类
 */
export enum CommandCategory {
  FILE = 'file',
  EDIT = 'edit',
  VIEW = 'view',
  NAVIGATION = 'navigation',
  SEARCH = 'search',
  REVIEW = 'review',
  PLUGIN = 'plugin',
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

/**
 * 快捷键绑定定义
 */
export interface Keybinding {
  /** 快捷键组合，如 "Ctrl+S", "Cmd+Shift+P" */
  key: string;
  /** 关联的命令 ID */
  command: string;
  /** 上下文条件表达式 */
  when?: string;
  /** 是否为用户自定义 */
  custom?: boolean;
}

/**
 * 按键事件信息
 */
export interface KeyEvent {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}


