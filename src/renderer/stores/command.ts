/**
 * 命令面板状态管理
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCommandStore = defineStore('command', () => {
  // 命令面板可见性
  const commandPaletteVisible = ref(false);

  /**
   * 显示命令面板
   */
  function showCommandPalette() {
    commandPaletteVisible.value = true;
  }

  /**
   * 隐藏命令面板
   */
  function hideCommandPalette() {
    commandPaletteVisible.value = false;
  }

  /**
   * 切换命令面板
   */
  function toggleCommandPalette() {
    commandPaletteVisible.value = !commandPaletteVisible.value;
  }

  return {
    commandPaletteVisible,
    showCommandPalette,
    hideCommandPalette,
    toggleCommandPalette,
  };
});


