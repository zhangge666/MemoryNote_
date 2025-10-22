/**
 * 通知状态管理
 */

import { defineStore } from 'pinia';
import { computed } from 'vue';
import { getNotificationService } from '@renderer/services/NotificationService';
import type { NotificationOptions } from '@shared/types/notification';

export const useNotificationStore = defineStore('notification', () => {
  const notificationService = getNotificationService();

  // 获取所有通知
  const notifications = computed(() => notificationService.getNotifications());

  /**
   * 显示信息通知
   */
  function info(message: string, options?: NotificationOptions) {
    return notificationService.info(message, options);
  }

  /**
   * 显示成功通知
   */
  function success(message: string, options?: NotificationOptions) {
    return notificationService.success(message, options);
  }

  /**
   * 显示警告通知
   */
  function warning(message: string, options?: NotificationOptions) {
    return notificationService.warning(message, options);
  }

  /**
   * 显示错误通知
   */
  function error(message: string, options?: NotificationOptions) {
    return notificationService.error(message, options);
  }

  /**
   * 关闭通知
   */
  function close(id: string) {
    notificationService.close(id);
  }

  /**
   * 关闭所有通知
   */
  function closeAll() {
    notificationService.closeAll();
  }

  return {
    notifications,
    info,
    success,
    warning,
    error,
    close,
    closeAll,
  };
});


