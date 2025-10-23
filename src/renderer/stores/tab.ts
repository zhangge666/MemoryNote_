/**
 * 标签页状态管理
 */

import { defineStore } from 'pinia';
import { computed, watch } from 'vue';
import { getTabService } from '@renderer/services/TabService';
import type { Tab, TabGroup, TabSystemState } from '@shared/types/tab';

export const useTabStore = defineStore('tab', () => {
  const tabService = getTabService();
  const state = tabService.getReactiveState();

  // ========== Computed ==========
  const groups = computed(() => state.groups);
  const layout = computed(() => state.layout);
  const activeGroupId = computed(() => state.activeGroupId);

  const activeGroup = computed(() => {
    return activeGroupId.value ? state.groups[activeGroupId.value] : null;
  });

  const activeTab = computed(() => {
    return tabService.getActiveTab();
  });

  const allTabs = computed(() => {
    const tabs: Tab[] = [];
    Object.values(state.groups).forEach((group) => {
      tabs.push(...group.tabs);
    });
    return tabs;
  });

  // ========== Actions - 标签页操作 ==========
  function openTab(tab: Omit<Tab, 'id' | 'isDirty' | 'isPinned'>, groupId?: string) {
    return tabService.openTab(tab, groupId);
  }

  async function closeTab(tabId: string) {
    return await tabService.closeTab(tabId);
  }

  async function closeAllTabs(groupId?: string) {
    await tabService.closeAllTabs(groupId);
  }

  async function closeOtherTabs(tabId: string) {
    await tabService.closeOtherTabs(tabId);
  }

  async function closeTabsToRight(tabId: string) {
    await tabService.closeTabsToRight(tabId);
  }

  function setTabDirty(tabId: string, isDirty: boolean) {
    tabService.setTabDirty(tabId, isDirty);
  }

  function toggleTabPin(tabId: string) {
    tabService.toggleTabPin(tabId);
  }

  function activateTab(tabId: string) {
    tabService.activateTab(tabId);
  }

  function activateGroup(groupId: string) {
    tabService.activateGroup(groupId);
  }

  // ========== Actions - 标签组操作 ==========
  function createGroup() {
    return tabService.createGroup();
  }

  function deleteGroup(groupId: string) {
    tabService.deleteGroup(groupId);
  }

  function moveTabToGroup(tabId: string, targetGroupId: string) {
    tabService.moveTabToGroup(tabId, targetGroupId);
  }

  // ========== Actions - 分屏操作 ==========
  function splitHorizontal(groupId?: string) {
    tabService.splitHorizontal(groupId);
  }

  function splitVertical(groupId?: string) {
    tabService.splitVertical(groupId);
  }

  function unsplit(groupId: string) {
    tabService.unsplit(groupId);
  }

  // ========== Actions - 查找 ==========
  function findTabById(tabId: string) {
    return tabService.findTabById(tabId);
  }

  function findTabByPath(filePath: string) {
    return tabService.findTabByPath(filePath);
  }

  function findGroupByTabId(tabId: string) {
    return tabService.findGroupByTabId(tabId);
  }

  async function closeTabByNoteId(noteId: string) {
    return await tabService.closeTabByNoteId(noteId);
  }

  function updateTabTitleByNoteId(noteId: string, newTitle: string) {
    return tabService.updateTabTitleByNoteId(noteId, newTitle);
  }

  function updateTabFilePathByPrefix(oldPrefix: string, newPrefix: string) {
    return tabService.updateTabFilePathByPrefix(oldPrefix, newPrefix);
  }

  // ========== Actions - 状态管理 ==========
  function getState() {
    return tabService.getState();
  }

  function restoreState(state: TabSystemState) {
    tabService.restoreState(state);
  }

  // ========== Actions - 持久化 ==========
  async function saveState() {
    const state = getState();
    
    try {
      // 将响应式对象转换为普通对象（移除 Vue 的 Proxy）
      const serializedState = JSON.parse(JSON.stringify({
        groups: state.groups,
        layout: state.layout,
        activeGroupId: state.activeGroupId,
      }));
      
      console.log('🔄 Saving tab state:', serializedState);
      
      // 直接使用 window.electronAPI
      if (window.electronAPI) {
        const result = await window.electronAPI.invoke('config:set', 'tabSystemState', serializedState);
        console.log('✅ Tab state saved, result:', result);
      } else {
        console.error('❌ electronAPI not available');
      }
    } catch (error) {
      console.error('❌ Failed to save tab state:', error);
    }
  }

  async function loadState() {
    try {
      console.log('🔄 Loading tab state...');
      
      // 直接使用 window.electronAPI
      if (window.electronAPI) {
        const savedState = await window.electronAPI.invoke('config:get', 'tabSystemState');
        console.log('📦 Loaded tab state:', savedState);
        
        if (savedState) {
          restoreState(savedState as TabSystemState);
          console.log('✅ Tab state restored successfully');
          return true;
        } else {
          console.log('ℹ️ No saved tab state found');
        }
      } else {
        console.error('❌ electronAPI not available');
      }
    } catch (error) {
      console.error('❌ Failed to load tab state:', error);
    }
    
    return false;
  }

  // 监听状态变化，立即保存（无防抖）
  watch(
    () => JSON.stringify({ groups: state.groups, layout: state.layout, activeGroupId: state.activeGroupId }),
    (newVal, oldVal) => {
      // 跳过初始加载
      if (oldVal === undefined) return;
      
      console.log('🔔 Tab state changed, saving immediately...');
      saveState();
    }
  );

  return {
    // State
    groups,
    layout,
    activeGroupId,
    activeGroup,
    activeTab,
    allTabs,

    // Actions
    openTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    closeTabsToRight,
    setTabDirty,
    toggleTabPin,
    activateTab,
    activateGroup,
    createGroup,
    deleteGroup,
    moveTabToGroup,
    splitHorizontal,
    splitVertical,
    unsplit,
    findTabById,
    findTabByPath,
    findGroupByTabId,
    closeTabByNoteId,
    updateTabTitleByNoteId,
    updateTabFilePathByPrefix,
    getState,
    restoreState,
    saveState,
    loadState,
  };
});

