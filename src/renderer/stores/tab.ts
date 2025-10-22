/**
 * 标签页状态管理
 */

import { defineStore } from 'pinia';
import { computed } from 'vue';
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
    const { useIPC } = await import('@renderer/composables/useIPC');
    const { IPCChannel } = await import('@shared/interfaces/ipc');
    const ipc = useIPC();
    
    try {
      // 序列化状态
      const serializedState = {
        groups: state.groups,
        layout: state.layout,
        activeGroupId: state.activeGroupId,
      };
      
      await ipc.invoke(IPCChannel.CONFIG_SET, 'tabSystemState' as any, serializedState);
      console.log('💾 Tab state saved', serializedState);
    } catch (error) {
      console.error('Failed to save tab state:', error);
    }
  }

  async function loadState() {
    const { useIPC } = await import('@renderer/composables/useIPC');
    const { IPCChannel } = await import('@shared/interfaces/ipc');
    const ipc = useIPC();
    
    try {
      const savedState = await ipc.invoke(IPCChannel.CONFIG_GET, 'tabSystemState' as any);
      
      if (savedState) {
        restoreState(savedState as TabSystemState);
        console.log('📂 Tab state loaded', savedState);
        return true;
      }
    } catch (error) {
      console.error('Failed to load tab state:', error);
    }
    
    return false;
  }

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
    createGroup,
    deleteGroup,
    moveTabToGroup,
    splitHorizontal,
    splitVertical,
    unsplit,
    findTabById,
    findTabByPath,
    findGroupByTabId,
    getState,
    restoreState,
    saveState,
    loadState,
  };
});

