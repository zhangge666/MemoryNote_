/**
 * 通知系统类型定义
 */

/**
 * 通知类型
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * 通知动作
 */
export interface NotificationAction {
  /** 动作标签 */
  label: string;
  /** 动作处理函数 */
  handler: () => void;
  /** 是否为主要动作 */
  primary?: boolean;
}

/**
 * 通知定义
 */
export interface Notification {
  /** 通知唯一标识符 */
  id: string;
  /** 通知类型 */
  type: NotificationType;
  /** 通知标题 */
  title?: string;
  /** 通知消息 */
  message: string;
  /** 显示时长（毫秒），0 表示不自动关闭 */
  duration?: number;
  /** 通知动作 */
  actions?: NotificationAction[];
  /** 是否可关闭 */
  closable?: boolean;
  /** 创建时间 */
  createdAt?: number;
}

/**
 * 通知配置选项
 */
export interface NotificationOptions {
  /** 通知标题 */
  title?: string;
  /** 显示时长（毫秒） */
  duration?: number;
  /** 通知动作 */
  actions?: NotificationAction[];
  /** 是否可关闭 */
  closable?: boolean;
}


