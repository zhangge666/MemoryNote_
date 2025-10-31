/**
 * 对话框状态管理
 */

import { defineStore } from 'pinia';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  denyText?: string;
  showCancel?: boolean;
  showDeny?: boolean;
}

interface DialogState {
  confirmDialog: {
    visible: boolean;
    options: ConfirmDialogOptions;
    resolve?: (result: 'confirm' | 'cancel' | 'deny') => void;
  };
}

export const useDialogStore = defineStore('dialog', {
  state: (): DialogState => ({
    confirmDialog: {
      visible: false,
      options: {},
    },
  }),

  actions: {
    /**
     * 显示确认对话框
     */
    showConfirm(options: ConfirmDialogOptions): Promise<'confirm' | 'cancel' | 'deny'> {
      return new Promise((resolve) => {
        this.confirmDialog.visible = true;
        this.confirmDialog.options = options;
        this.confirmDialog.resolve = resolve;
      });
    },

    /**
     * 确认
     */
    confirm() {
      if (this.confirmDialog.resolve) {
        this.confirmDialog.resolve('confirm');
      }
      this.hideConfirm();
    },

    /**
     * 取消
     */
    cancel() {
      if (this.confirmDialog.resolve) {
        this.confirmDialog.resolve('cancel');
      }
      this.hideConfirm();
    },

    /**
     * 拒绝（不保存）
     */
    deny() {
      if (this.confirmDialog.resolve) {
        this.confirmDialog.resolve('deny');
      }
      this.hideConfirm();
    },

    /**
     * 隐藏确认对话框
     */
    hideConfirm() {
      this.confirmDialog.visible = false;
      this.confirmDialog.options = {};
      this.confirmDialog.resolve = undefined;
    },
  },
});


