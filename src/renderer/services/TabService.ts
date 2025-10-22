/**
 * 标签页服务
 * 负责标签页的创建、管理、切换和布局
 */

import { reactive } from 'vue';
import type { Tab, TabGroup, SplitLayout, TabSystemState } from '@shared/types/tab';

export interface ITabService {
  /** 打开标签页 */
  openTab(tab: Omit<Tab, 'id' | 'isDirty' | 'isPinned'>, groupId?: string): string;

  /** 关闭标签页 */
  closeTab(tabId: string): Promise<boolean>;

  /** 关闭所有标签页 */
  closeAllTabs(groupId?: string): Promise<void>;

  /** 关闭其他标签页 */
  closeOtherTabs(tabId: string): Promise<void>;

  /** 关闭右侧标签页 */
  closeTabsToRight(tabId: string): Promise<void>;

  /** 设置标签页脏状态 */
  setTabDirty(tabId: string, isDirty: boolean): void;

  /** 切换标签页固定状态 */
  toggleTabPin(tabId: string): void;

  /** 激活标签页 */
  activateTab(tabId: string): void;

  /** 获取激活的标签页 */
  getActiveTab(groupId?: string): Tab | null;

  /** 创建标签组 */
  createGroup(): string;

  /** 删除标签组 */
  deleteGroup(groupId: string): void;

  /** 移动标签到另一个组 */
  moveTabToGroup(tabId: string, targetGroupId: string): void;

  /** 水平分屏 */
  splitHorizontal(groupId?: string): void;

  /** 垂直分屏 */
  splitVertical(groupId?: string): void;

  /** 取消分屏 */
  unsplit(groupId: string): void;

  /** 获取状态 */
  getState(): TabSystemState;

  /** 恢复状态 */
  restoreState(state: TabSystemState): void;

  /** 根据 ID 查找标签 */
  findTabById(tabId: string): Tab | null;

  /** 根据路径查找标签 */
  findTabByPath(filePath: string): Tab | null;

  /** 获取标签所在的组 */
  findGroupByTabId(tabId: string): TabGroup | null;
}

export class TabService implements ITabService {
  private state = reactive<TabSystemState>({
    groups: {},
    layout: { type: 'single', groupId: '' },
    activeGroupId: null,
  });

  private nextId = 0;

  constructor() {
    // 初始化默认标签组
    const defaultGroupId = this.createGroup();
    this.state.layout = { type: 'single', groupId: defaultGroupId };
    this.state.activeGroupId = defaultGroupId;
  }

  /**
   * 打开标签页
   */
  openTab(tab: Omit<Tab, 'id' | 'isDirty' | 'isPinned'>, groupId?: string): string {
    const targetGroupId = groupId || this.state.activeGroupId;
    if (!targetGroupId) {
      throw new Error('No active group');
    }

    const group = this.state.groups[targetGroupId];
    if (!group) {
      throw new Error(`Group ${targetGroupId} not found`);
    }

    // 如果已存在相同路径的标签，激活它
    if (tab.filePath) {
      const existingTab = this.findTabByPath(tab.filePath);
      if (existingTab) {
        this.activateTab(existingTab.id);
        return existingTab.id;
      }
    }

    const newTab: Tab = {
      id: `tab-${++this.nextId}`,
      title: tab.title,
      type: tab.type,
      filePath: tab.filePath,
      icon: tab.icon,
      isDirty: false,
      isPinned: false,
      data: tab.data,
      createdAt: Date.now(),
    };

    group.tabs.push(newTab);
    group.activeTabId = newTab.id;

    console.log(`📄 Tab opened: ${newTab.title} (${newTab.id})`);
    return newTab.id;
  }

  /**
   * 关闭标签页
   */
  async closeTab(tabId: string): Promise<boolean> {
    const tab = this.findTabById(tabId);
    if (!tab) return false;

    // 如果有未保存的修改，需要确认
    if (tab.isDirty) {
      // TODO: 显示确认对话框
      console.warn(`Tab ${tabId} has unsaved changes`);
    }

    const group = this.findGroupByTabId(tabId);
    if (!group) return false;

    const tabIndex = group.tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return false;

    const groupId = group.id;

    // 移除标签
    group.tabs.splice(tabIndex, 1);

    // 如果关闭的是激活的标签，激活相邻的标签
    if (group.activeTabId === tabId) {
      if (group.tabs.length > 0) {
        const newActiveIndex = Math.min(tabIndex, group.tabs.length - 1);
        group.activeTabId = group.tabs[newActiveIndex].id;
      } else {
        group.activeTabId = null;
      }
    }

    // 如果组变为空，删除该组并调整布局
    if (group.tabs.length === 0) {
      this.removeEmptyGroup(groupId);
    }

    console.log(`🗑️ Tab closed: ${tabId}`);
    return true;
  }

  /**
   * 移除空的标签组并调整布局
   */
  private removeEmptyGroup(groupId: string): void {
    // 删除组
    delete this.state.groups[groupId];

    // 调整布局
    this.removeGroupFromLayout(this.state.layout, groupId);

    console.log(`🗑️ Empty group removed: ${groupId}`);
  }

  /**
   * 从布局中移除指定的组
   */
  private removeGroupFromLayout(layout: SplitLayout, groupId: string): boolean {
    // 如果是单一布局
    if (layout.type === 'single' && layout.groupId === groupId) {
      // 如果这是唯一的组，保留布局但清空 groupId
      if (Object.keys(this.state.groups).length === 0) {
        layout.groupId = undefined;
        return true;
      }
      // 如果还有其他组，将布局指向第一个可用组
      const firstGroupId = Object.keys(this.state.groups)[0];
      if (firstGroupId) {
        layout.groupId = firstGroupId;
        this.state.activeGroupId = firstGroupId;
      }
      return true;
    }

    // 如果是分屏布局
    if (layout.children && layout.children.length > 0) {
      // 查找包含目标组的子布局
      const indexToRemove = layout.children.findIndex(child => {
        if (child.type === 'single' && child.groupId === groupId) {
          return true;
        }
        return false;
      });

      if (indexToRemove !== -1) {
        // 移除子布局
        layout.children.splice(indexToRemove, 1);

        // 如果只剩一个子布局，将其提升
        if (layout.children.length === 1) {
          const remainingChild = layout.children[0];
          layout.type = remainingChild.type;
          layout.groupId = remainingChild.groupId;
          layout.children = remainingChild.children;
          layout.ratio = remainingChild.ratio;
        }

        return true;
      }

      // 递归查找
      for (const child of layout.children) {
        if (this.removeGroupFromLayout(child, groupId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 关闭所有标签页
   */
  async closeAllTabs(groupId?: string): Promise<void> {
    const targetGroupId = groupId || this.state.activeGroupId;
    if (!targetGroupId) return;

    const group = this.state.groups[targetGroupId];
    if (!group) return;

    // 检查是否有未保存的标签
    const dirtyTabs = group.tabs.filter((t) => t.isDirty);
    if (dirtyTabs.length > 0) {
      // TODO: 显示批量确认对话框
      console.warn(`${dirtyTabs.length} tabs have unsaved changes`);
    }

    group.tabs = [];
    group.activeTabId = null;
    console.log(`🗑️ All tabs closed in group: ${targetGroupId}`);
  }

  /**
   * 关闭其他标签页
   */
  async closeOtherTabs(tabId: string): Promise<void> {
    const group = this.findGroupByTabId(tabId);
    if (!group) return;

    const targetTab = group.tabs.find((t) => t.id === tabId);
    if (!targetTab) return;

    // 检查其他标签是否有未保存的修改
    const dirtyTabs = group.tabs.filter((t) => t.id !== tabId && t.isDirty);
    if (dirtyTabs.length > 0) {
      // TODO: 显示批量确认对话框
      console.warn(`${dirtyTabs.length} tabs have unsaved changes`);
    }

    group.tabs = [targetTab];
    group.activeTabId = tabId;
    console.log(`🗑️ Other tabs closed except: ${tabId}`);
  }

  /**
   * 关闭右侧标签页
   */
  async closeTabsToRight(tabId: string): Promise<void> {
    const group = this.findGroupByTabId(tabId);
    if (!group) return;

    const tabIndex = group.tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    const tabsToClose = group.tabs.slice(tabIndex + 1);
    const dirtyTabs = tabsToClose.filter((t) => t.isDirty);

    if (dirtyTabs.length > 0) {
      // TODO: 显示批量确认对话框
      console.warn(`${dirtyTabs.length} tabs have unsaved changes`);
    }

    group.tabs = group.tabs.slice(0, tabIndex + 1);
    console.log(`🗑️ Tabs to the right closed: ${tabId}`);
  }

  /**
   * 设置标签页脏状态
   */
  setTabDirty(tabId: string, isDirty: boolean): void {
    const tab = this.findTabById(tabId);
    if (tab) {
      tab.isDirty = isDirty;
    }
  }

  /**
   * 切换标签页固定状态
   */
  toggleTabPin(tabId: string): void {
    const tab = this.findTabById(tabId);
    if (tab) {
      tab.isPinned = !tab.isPinned;
      console.log(`📌 Tab ${tabId} pinned: ${tab.isPinned}`);
    }
  }

  /**
   * 激活标签页
   */
  activateTab(tabId: string): void {
    const group = this.findGroupByTabId(tabId);
    if (group) {
      group.activeTabId = tabId;
      this.state.activeGroupId = group.id;
      console.log(`✨ Tab activated: ${tabId}`);
    }
  }

  /**
   * 获取激活的标签页
   */
  getActiveTab(groupId?: string): Tab | null {
    const targetGroupId = groupId || this.state.activeGroupId;
    if (!targetGroupId) return null;

    const group = this.state.groups[targetGroupId];
    if (!group || !group.activeTabId) return null;

    return group.tabs.find((t) => t.id === group.activeTabId) || null;
  }

  /**
   * 创建标签组
   */
  createGroup(): string {
    const groupId = `group-${++this.nextId}`;
    this.state.groups[groupId] = {
      id: groupId,
      tabs: [],
      activeTabId: null,
    };
    console.log(`➕ Group created: ${groupId}`);
    return groupId;
  }

  /**
   * 删除标签组
   */
  deleteGroup(groupId: string): void {
    if (this.state.groups[groupId]) {
      delete this.state.groups[groupId];
      console.log(`🗑️ Group deleted: ${groupId}`);
    }
  }

  /**
   * 移动标签到另一个组
   */
  moveTabToGroup(tabId: string, targetGroupId: string): void {
    const sourceGroup = this.findGroupByTabId(tabId);
    const targetGroup = this.state.groups[targetGroupId];

    if (!sourceGroup || !targetGroup) return;

    const tabIndex = sourceGroup.tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    const [tab] = sourceGroup.tabs.splice(tabIndex, 1);
    targetGroup.tabs.push(tab);
    targetGroup.activeTabId = tab.id;

    // 如果源组为空，激活其他标签
    if (sourceGroup.tabs.length > 0 && sourceGroup.activeTabId === tabId) {
      sourceGroup.activeTabId = sourceGroup.tabs[0].id;
    }

    console.log(`🔄 Tab moved: ${tabId} -> ${targetGroupId}`);
  }

  /**
   * 水平分屏
   */
  splitHorizontal(groupId?: string): void {
    const targetGroupId = groupId || this.state.activeGroupId;
    if (!targetGroupId) return;

    const targetGroup = this.state.groups[targetGroupId];
    if (!targetGroup) return;

    const newGroupId = this.createGroup();
    const newGroup = this.state.groups[newGroupId];

    // 根据目标组的标签数量决定分配策略
    if (targetGroup.tabs.length === 1) {
      // 只有一个标签，两个分区都显示同一个标签
      const tab = targetGroup.tabs[0];
      newGroup.tabs = [{ ...tab }]; // 复制标签
      newGroup.activeTabId = tab.id;
    } else if (targetGroup.tabs.length > 1) {
      // 多个标签，将当前活动标签移到新分区
      const activeTabId = targetGroup.activeTabId;
      const activeTabIndex = targetGroup.tabs.findIndex(t => t.id === activeTabId);
      
      if (activeTabIndex !== -1) {
        const [activeTab] = targetGroup.tabs.splice(activeTabIndex, 1);
        newGroup.tabs = [activeTab];
        newGroup.activeTabId = activeTab.id;
        
        // 更新原分区的活动标签
        if (targetGroup.tabs.length > 0) {
          targetGroup.activeTabId = targetGroup.tabs[0].id;
        }
      }
    }
    
    // 如果当前是单一布局，直接创建水平分屏
    if (this.state.layout.type === 'single' && this.state.layout.groupId === targetGroupId) {
      this.state.layout = {
        type: 'horizontal',
        children: [
          { type: 'single', groupId: targetGroupId },
          { type: 'single', groupId: newGroupId },
        ],
        ratio: 0.5,
      };
    } else {
      // 嵌套分屏：在现有布局中找到目标组并分割
      this.splitLayoutRecursive(this.state.layout, targetGroupId, 'horizontal', newGroupId);
    }
    
    this.state.activeGroupId = newGroupId;
    console.log(`↔️ Horizontal split created`);
  }

  /**
   * 垂直分屏
   */
  splitVertical(groupId?: string): void {
    const targetGroupId = groupId || this.state.activeGroupId;
    if (!targetGroupId) return;

    const targetGroup = this.state.groups[targetGroupId];
    if (!targetGroup) return;

    const newGroupId = this.createGroup();
    const newGroup = this.state.groups[newGroupId];

    // 根据目标组的标签数量决定分配策略
    if (targetGroup.tabs.length === 1) {
      // 只有一个标签，两个分区都显示同一个标签
      const tab = targetGroup.tabs[0];
      newGroup.tabs = [{ ...tab }]; // 复制标签
      newGroup.activeTabId = tab.id;
    } else if (targetGroup.tabs.length > 1) {
      // 多个标签，将当前活动标签移到新分区
      const activeTabId = targetGroup.activeTabId;
      const activeTabIndex = targetGroup.tabs.findIndex(t => t.id === activeTabId);
      
      if (activeTabIndex !== -1) {
        const [activeTab] = targetGroup.tabs.splice(activeTabIndex, 1);
        newGroup.tabs = [activeTab];
        newGroup.activeTabId = activeTab.id;
        
        // 更新原分区的活动标签
        if (targetGroup.tabs.length > 0) {
          targetGroup.activeTabId = targetGroup.tabs[0].id;
        }
      }
    }
    
    // 如果当前是单一布局，直接创建垂直分屏
    if (this.state.layout.type === 'single' && this.state.layout.groupId === targetGroupId) {
      this.state.layout = {
        type: 'vertical',
        children: [
          { type: 'single', groupId: targetGroupId },
          { type: 'single', groupId: newGroupId },
        ],
        ratio: 0.5,
      };
    } else {
      // 嵌套分屏：在现有布局中找到目标组并分割
      this.splitLayoutRecursive(this.state.layout, targetGroupId, 'vertical', newGroupId);
    }
    
    this.state.activeGroupId = newGroupId;
    console.log(`↕️ Vertical split created`);
  }

  /**
   * 递归分割布局（支持嵌套）
   */
  private splitLayoutRecursive(
    layout: SplitLayout,
    targetGroupId: string,
    direction: 'horizontal' | 'vertical',
    newGroupId: string,
  ): boolean {
    // 如果是单一布局且匹配目标组
    if (layout.type === 'single' && layout.groupId === targetGroupId) {
      // 将当前布局转换为分屏布局
      const oldGroupId = layout.groupId;
      layout.type = direction;
      layout.groupId = undefined;
      layout.children = [
        { type: 'single', groupId: oldGroupId },
        { type: 'single', groupId: newGroupId },
      ];
      layout.ratio = 0.5;
      return true;
    }

    // 如果有子布局，递归查找
    if (layout.children) {
      for (const child of layout.children) {
        if (this.splitLayoutRecursive(child, targetGroupId, direction, newGroupId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 取消分屏
   */
  unsplit(groupId: string): void {
    // 简化实现：重置为单一布局
    this.state.layout = { type: 'single', groupId };
    console.log(`🔲 Split cancelled, back to single layout`);
  }

  /**
   * 获取状态
   */
  getState(): TabSystemState {
    return {
      groups: { ...this.state.groups },
      layout: { ...this.state.layout },
      activeGroupId: this.state.activeGroupId,
    };
  }

  /**
   * 恢复状态
   */
  restoreState(state: TabSystemState): void {
    this.state.groups = { ...state.groups };
    this.state.layout = { ...state.layout };
    this.state.activeGroupId = state.activeGroupId;
    console.log('🔄 Tab system state restored');
  }

  /**
   * 根据 ID 查找标签
   */
  findTabById(tabId: string): Tab | null {
    for (const group of Object.values(this.state.groups)) {
      const tab = group.tabs.find((t) => t.id === tabId);
      if (tab) return tab;
    }
    return null;
  }

  /**
   * 根据路径查找标签
   */
  findTabByPath(filePath: string): Tab | null {
    for (const group of Object.values(this.state.groups)) {
      const tab = group.tabs.find((t) => t.filePath === filePath);
      if (tab) return tab;
    }
    return null;
  }

  /**
   * 获取标签所在的组
   */
  findGroupByTabId(tabId: string): TabGroup | null {
    for (const group of Object.values(this.state.groups)) {
      if (group.tabs.some((t) => t.id === tabId)) {
        return group;
      }
    }
    return null;
  }

  /**
   * 获取响应式状态（用于 Vue 组件）
   */
  getReactiveState() {
    return this.state;
  }
}

// 单例实例
let instance: TabService | null = null;

export const getTabService = (): TabService => {
  if (!instance) {
    instance = new TabService();
  }
  return instance;
};

