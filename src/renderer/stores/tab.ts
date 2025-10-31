/**
 * 标签页状态管理
 */

import { defineStore } from 'pinia';
import { computed, watch } from 'vue';
import { getTabService } from '@renderer/services/TabService';
import { useDialogStore } from './dialog';
import { noteService } from '@renderer/services/NoteService';
import type { Tab, TabSystemState } from '@shared/types/tab';

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

  async function closeTab(tabId: string): Promise<boolean> {
    const tab = tabService.findTabById(tabId);
    if (!tab) return false;

    // 如果标签有未保存的修改
    if (tab.isDirty && tab.data?.noteId) {
      // 检查是否还有其他标签页打开相同的笔记
      const sameNoteTabs = allTabs.value.filter(
        t => t.data?.noteId === tab.data?.noteId
      );
      
      // 如果还有其他标签页打开相同的笔记，直接关闭，不询问
      if (sameNoteTabs.length > 1) {
        console.log(`📌 还有 ${sameNoteTabs.length - 1} 个标签页打开相同笔记，直接关闭`);
        return await tabService.closeTab(tabId);
      }
      
      // 这是最后一个打开此笔记的标签页，显示确认对话框
      const dialogStore = useDialogStore();
      const result = await dialogStore.showConfirm({
        title: '未保存的更改',
        message: `"${tab.title}" 有未保存的更改。你想保存这些更改吗？`,
        confirmText: '保存',
        denyText: '不保存',
        cancelText: '取消',
        showDeny: true,
        showCancel: true,
      });

      if (result === 'cancel') {
        return false;
      }

      if (result === 'confirm') {
        try {
          const content = tab.data.content || '';
          await noteService.updateNote({
            id: tab.data.noteId,
            content: content,
          });
          // 清除所有相同笔记的脏标记
          tabService.setTabDirty(tabId, false);
          console.log('✅ Note saved before closing');
        } catch (error) {
          console.error('❌ Failed to save note:', error);
          return false;
        }
      } else if (result === 'deny') {
        // 用户选择不保存，需要恢复所有相同笔记标签页的内容
        try {
          // 从文件系统重新读取原始内容
          const note = await noteService.getNote(tab.data.noteId);
          if (note) {
            // 更新所有相同笔记的标签页内容为原始内容
            for (const group of Object.values(state.groups)) {
              for (const t of group.tabs) {
                if (t.data?.noteId === tab.data.noteId) {
                  t.data = { ...t.data, content: note.content };
                }
              }
            }
            console.log('🔄 已恢复所有标签页到原始内容');
          }
        } catch (error) {
          console.error('❌ Failed to restore original content:', error);
        }
        // 清除所有相同笔记的脏标记
        tabService.setTabDirty(tabId, false);
      }
    }

    return await tabService.closeTab(tabId);
  }

  async function closeAllTabs(groupId?: string) {
    const targetGroupId = groupId || state.activeGroupId;
    if (!targetGroupId) return;

    const group = state.groups[targetGroupId];
    if (!group) return;

    const dirtyTabs = group.tabs.filter((t) => t.isDirty);
    if (dirtyTabs.length > 0) {
      const dialogStore = useDialogStore();
      const tabNames = dirtyTabs.map(t => `"${t.title}"`).join(', ');
      const result = await dialogStore.showConfirm({
        title: '未保存的更改',
        message: `以下标签有未保存的更改：${tabNames}。你想保存这些更改吗？`,
        confirmText: '全部保存',
        denyText: '全部不保存',
        cancelText: '取消',
        showDeny: true,
        showCancel: true,
      });

      if (result === 'cancel') return;

      if (result === 'confirm') {
        for (const tab of dirtyTabs) {
          try {
            if (tab.data?.noteId) {
              const content = tab.data.content || '';
              await noteService.updateNote({
                id: tab.data.noteId,
                content: content,
              });
            }
          } catch (error) {
            console.error('❌ Failed to save note:', error);
          }
        }
      }
    }

    await tabService.closeAllTabs(targetGroupId);
  }

  async function closeOtherTabs(tabId: string) {
    const group = tabService.findGroupByTabId(tabId);
    if (!group) return;

    const otherTabs = group.tabs.filter((t) => t.id !== tabId);
    const dirtyTabs = otherTabs.filter((t) => t.isDirty);

    if (dirtyTabs.length > 0) {
      const dialogStore = useDialogStore();
      const tabNames = dirtyTabs.map(t => `"${t.title}"`).join(', ');
      const result = await dialogStore.showConfirm({
        title: '未保存的更改',
        message: `以下标签有未保存的更改：${tabNames}。你想保存这些更改吗？`,
        confirmText: '全部保存',
        denyText: '全部不保存',
        cancelText: '取消',
        showDeny: true,
        showCancel: true,
      });

      if (result === 'cancel') return;

      if (result === 'confirm') {
        for (const tab of dirtyTabs) {
          try {
            if (tab.data?.noteId) {
              const content = tab.data.content || '';
              await noteService.updateNote({
                id: tab.data.noteId,
                content: content,
              });
            }
          } catch (error) {
            console.error('❌ Failed to save note:', error);
          }
        }
      }
    }

    await tabService.closeOtherTabs(tabId);
  }

  async function closeTabsToRight(tabId: string) {
    const group = tabService.findGroupByTabId(tabId);
    if (!group) return;

    const tabIndex = group.tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    const tabsToClose = group.tabs.slice(tabIndex + 1);
    const dirtyTabs = tabsToClose.filter((t) => t.isDirty);

    if (dirtyTabs.length > 0) {
      const dialogStore = useDialogStore();
      const tabNames = dirtyTabs.map(t => `"${t.title}"`).join(', ');
      const result = await dialogStore.showConfirm({
        title: '未保存的更改',
        message: `以下标签有未保存的更改：${tabNames}。你想保存这些更改吗？`,
        confirmText: '全部保存',
        denyText: '全部不保存',
        cancelText: '取消',
        showDeny: true,
        showCancel: true,
      });

      if (result === 'cancel') return;

      if (result === 'confirm') {
        for (const tab of dirtyTabs) {
          try {
            if (tab.data?.noteId) {
              const content = tab.data.content || '';
              await noteService.updateNote({
                id: tab.data.noteId,
                content: content,
              });
            }
          } catch (error) {
            console.error('❌ Failed to save note:', error);
          }
        }
      }
    }

    await tabService.closeTabsToRight(tabId);
  }

  function setTabDirty(tabId: string, isDirty: boolean) {
    tabService.setTabDirty(tabId, isDirty);
  }

  /**
   * 更新标签页内容（并同步到所有相同noteId的标签）
   */
  function updateTabContent(tabId: string, content: string) {
    tabService.updateTabContent(tabId, content);
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
        const response = await window.electronAPI.invoke('config:get', 'tabSystemState');
        console.log('📦 Loaded tab state:', response);
        
        // 处理IPC响应格式
        const savedState = response?.data || response;
        
        if (savedState && typeof savedState === 'object' && 'groups' in savedState) {
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
    (_newVal, oldVal) => {
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
    updateTabContent,
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

