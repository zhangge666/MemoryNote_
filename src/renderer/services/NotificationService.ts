/**
 * 通知服务
 * 负责通知的创建、管理和显示
 */

import { reactive, readonly } from 'vue';
import type { Notification, NotificationType, NotificationOptions } from '@shared/types/notification';

export interface INotificationService {
  /** 显示通知 */
  show(notification: Omit<Notification, 'id'>): string;

  /** 显示信息通知 */
  info(message: string, options?: NotificationOptions): string;

  /** 显示成功通知 */
  success(message: string, options?: NotificationOptions): string;

  /** 显示警告通知 */
  warning(message: string, options?: NotificationOptions): string;

  /** 显示错误通知 */
  error(message: string, options?: NotificationOptions): string;

  /** 关闭通知 */
  close(id: string): void;

  /** 关闭所有通知 */
  closeAll(): void;

  /** 获取所有通知 */
  getNotifications(): Readonly<Notification[]>;
}

export class NotificationService implements INotificationService {
  private notifications = reactive<Notification[]>([]);
  private nextId = 0;
  private readonly defaultDuration = 4000; // 默认 4 秒
  private readonly maxNotifications = 5; // 最多显示 5 个通知

  /**
   * 显示通知
   */
  show(notification: Omit<Notification, 'id'>): string {
    const id = `notification-${++this.nextId}`;
    const newNotification: Notification = {
      id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      duration: notification.duration ?? this.defaultDuration,
      actions: notification.actions,
      closable: notification.closable ?? true,
      createdAt: Date.now(),
    };

    // 添加通知到队列
    this.notifications.unshift(newNotification);

    // 限制通知数量
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.splice(this.maxNotifications);
    }

    // 自动关闭通知
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.close(id);
      }, newNotification.duration);
    }

    console.log(`📢 Notification [${notification.type}]: ${notification.message}`);
    return id;
  }

  /**
   * 显示信息通知
   */
  info(message: string, options?: NotificationOptions): string {
    return this.show({
      type: 'info',
      message,
      ...options,
    });
  }

  /**
   * 显示成功通知
   */
  success(message: string, options?: NotificationOptions): string {
    return this.show({
      type: 'success',
      message,
      ...options,
    });
  }

  /**
   * 显示警告通知
   */
  warning(message: string, options?: NotificationOptions): string {
    return this.show({
      type: 'warning',
      message,
      ...options,
    });
  }

  /**
   * 显示错误通知
   */
  error(message: string, options?: NotificationOptions): string {
    return this.show({
      type: 'error',
      message,
      ...options,
      duration: options?.duration ?? 6000, // 错误通知显示更长时间
    });
  }

  /**
   * 关闭通知
   */
  close(id: string): void {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  /**
   * 关闭所有通知
   */
  closeAll(): void {
    this.notifications.splice(0);
  }

  /**
   * 获取所有通知
   */
  getNotifications(): Readonly<Notification[]> {
    return readonly(this.notifications) as Readonly<Notification[]>;
  }
}

// 单例实例
let instance: NotificationService | null = null;

export const getNotificationService = (): NotificationService => {
  if (!instance) {
    instance = new NotificationService();
  }
  return instance;
};


