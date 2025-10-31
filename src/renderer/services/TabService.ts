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

  /** 激活分组（直接激活分组，不通过 tab） */
  activateGroup(groupId: string): void;

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

  /** 根据笔记ID关闭标签 */
  closeTabByNoteId(noteId: string): Promise<boolean>;

  /** 根据笔记ID更新标签标题 */
  updateTabTitleByNoteId(noteId: string, newTitle: string): boolean;

  /** 更新标签的文件路径（用于文件夹重命名） */
  updateTabFilePathByPrefix(oldPrefix: string, newPrefix: string): number;
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
    let targetGroupId = groupId || this.state.activeGroupId;
    
    // 如果没有活动组，创建一个默认组
    if (!targetGroupId || !this.state.groups[targetGroupId]) {
      targetGroupId = this.createGroup();
      this.state.layout = { type: 'single', groupId: targetGroupId };
      this.state.activeGroupId = targetGroupId;
    }

    const group = this.state.groups[targetGroupId];
    if (!group) {
      throw new Error(`Group ${targetGroupId} not found`);
    }

    // 只在当前分区中检查是否已存在相同路径的标签
    if (tab.filePath) {
      const existingTab = group.tabs.find(t => t.filePath === tab.filePath);
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
    
    // 使用 activateTab 来正确设置激活状态（包括全局的 activeGroupId）
    this.activateTab(newTab.id);

    return newTab.id;
  }

  /**
   * 关闭标签页
   * 注意：此方法不处理未保存确认，确认逻辑应在调用层（如TabStore）处理
   */
  async closeTab(tabId: string): Promise<boolean> {
    const tab = this.findTabById(tabId);
    if (!tab) return false;

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
  }

  /**
   * 在布局中查找第一个可用的分组ID
   */
  private findFirstGroupInLayout(layout: SplitLayout): string | null {
    if (layout.type === 'single' && layout.groupId) {
      return layout.groupId;
    }
    
    if (layout.children && layout.children.length > 0) {
      for (const child of layout.children) {
        const groupId = this.findFirstGroupInLayout(child);
        if (groupId) return groupId;
      }
    }
    
    return null;
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
          
          // 激活剩余的分区
          if (remainingChild.groupId) {
            this.state.activeGroupId = remainingChild.groupId;
          }
        } else if (layout.children.length > 0) {
          // 如果还有多个子布局，激活第一个可用的分区
          const firstAvailableGroup = this.findFirstGroupInLayout(layout);
          if (firstAvailableGroup) {
            this.state.activeGroupId = firstAvailableGroup;
          }
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
    }

    group.tabs = [];
    group.activeTabId = null;
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
    }

    group.tabs = [targetTab];
    group.activeTabId = tabId;
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
    }

    group.tabs = group.tabs.slice(0, tabIndex + 1);
  }

  /**
   * 设置标签页脏状态
   */
  setTabDirty(tabId: string, isDirty: boolean): void {
    const tab = this.findTabById(tabId);
    if (tab) {
      tab.isDirty = isDirty;
      
      // 如果是编辑器标签且有笔记ID，同步更新所有相同笔记的标签
      if (tab.data && typeof tab.data === 'object' && 'noteId' in tab.data) {
        this.setTabDirtyByNoteId(tab.data.noteId as string, isDirty);
      } else if (tab.filePath) {
        // 如果有文件路径，同步更新所有相同文件路径的标签
        this.setTabDirtyByFilePath(tab.filePath, isDirty);
      }
    }
  }

  /**
   * 更新标签页内容（并同步到所有相同noteId的标签）
   */
  updateTabContent(tabId: string, content: string): void {
    const tab = this.findTabById(tabId);
    if (!tab || !tab.data) return;

    const noteId = tab.data.noteId;
    if (!noteId) return;

    // 更新所有相同noteId的标签内容
    for (const group of Object.values(this.state.groups)) {
      for (const t of group.tabs) {
        if (t.data?.noteId === noteId) {
          // 强制触发响应式更新：重新创建data对象
          t.data = { ...t.data, content };
        }
      }
    }
  }

  /**
   * 根据笔记ID设置所有相关标签的脏状态
   */
  private setTabDirtyByNoteId(noteId: string, isDirty: boolean): void {
    for (const group of Object.values(this.state.groups)) {
      for (const tab of group.tabs) {
        if (tab.data && typeof tab.data === 'object' && 'noteId' in tab.data && tab.data.noteId === noteId) {
          tab.isDirty = isDirty;
        }
      }
    }
  }

  /**
   * 根据文件路径设置所有相关标签的脏状态
   */
  private setTabDirtyByFilePath(filePath: string, isDirty: boolean): void {
    for (const group of Object.values(this.state.groups)) {
      for (const tab of group.tabs) {
        if (tab.filePath === filePath) {
          tab.isDirty = isDirty;
        }
      }
    }
  }

  /**
   * 切换标签页固定状态
   */
  toggleTabPin(tabId: string): void {
    const tab = this.findTabById(tabId);
    if (tab) {
      tab.isPinned = !tab.isPinned;
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
    }
  }

  /**
   * 激活分组（直接激活分组，不通过 tab）
   * 这个方法用于处理点击分区时的激活，避免在同一个 tab 存在于多个分区时出现激活错误
   */
  activateGroup(groupId: string): void {
    const group = this.state.groups[groupId];
    if (group) {
      this.state.activeGroupId = groupId;
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
    return groupId;
  }

  /**
   * 删除标签组
   */
  deleteGroup(groupId: string): void {
    if (this.state.groups[groupId]) {
      delete this.state.groups[groupId];
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
    
    // 确保至少有一个组
    if (Object.keys(this.state.groups).length === 0) {
      const defaultGroupId = this.createGroup();
      this.state.layout = { type: 'single', groupId: defaultGroupId };
      this.state.activeGroupId = defaultGroupId;
    } else if (!this.state.activeGroupId || !this.state.groups[this.state.activeGroupId]) {
      // 如果没有有效的活动组，使用第一个组
      const firstGroupId = Object.keys(this.state.groups)[0];
      this.state.activeGroupId = firstGroupId;
    }
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
   * 根据笔记ID关闭标签
   */
  async closeTabByNoteId(noteId: string): Promise<boolean> {
    // 查找所有包含该笔记的标签
    const tabsToClose: string[] = [];
    
    for (const group of Object.values(this.state.groups)) {
      for (const tab of group.tabs) {
        // 检查标签的 data 中是否包含该笔记ID（使用 noteId 字段）
        if (tab.data && typeof tab.data === 'object' && 'noteId' in tab.data && tab.data.noteId === noteId) {
          tabsToClose.push(tab.id);
        }
      }
    }
    
    console.log('🗑️ 关闭标签（笔记ID:', noteId, '）:', tabsToClose.length, '个标签');
    
    // 关闭所有相关标签
    for (const tabId of tabsToClose) {
      await this.closeTab(tabId);
    }
    
    return tabsToClose.length > 0;
  }

  /**
   * 根据笔记ID更新标签标题
   */
  updateTabTitleByNoteId(noteId: string, newTitle: string): boolean {
    let updated = false;
    
    for (const group of Object.values(this.state.groups)) {
      for (const tab of group.tabs) {
        // 检查标签的 data 中是否包含该笔记ID（使用 noteId 字段）
        if (tab.data && typeof tab.data === 'object' && 'noteId' in tab.data && tab.data.noteId === noteId) {
          console.log('✏️ 更新标签标题:', tab.title, '->', newTitle);
          tab.title = newTitle;
          updated = true;
        }
      }
    }
    
    return updated;
  }

  /**
   * 更新标签的文件路径（用于文件夹重命名）
   */
  updateTabFilePathByPrefix(oldPrefix: string, newPrefix: string): number {
    let updateCount = 0;
    
    // 规范化路径分隔符
    const normalizedOldPrefix = oldPrefix.replace(/\\/g, '/');
    const normalizedNewPrefix = newPrefix.replace(/\\/g, '/');
    
    for (const group of Object.values(this.state.groups)) {
      for (const tab of group.tabs) {
        if (tab.filePath) {
          const normalizedFilePath = tab.filePath.replace(/\\/g, '/');
          
          // 检查文件路径是否以旧前缀开头
          if (normalizedFilePath.startsWith(normalizedOldPrefix + '/')) {
            const relativePath = normalizedFilePath.substring(normalizedOldPrefix.length + 1);
            const newFilePath = normalizedNewPrefix + '/' + relativePath;
            
            console.log('📁 更新标签文件路径:', tab.title);
            console.log('   旧路径:', tab.filePath);
            console.log('   新路径:', newFilePath);
            
            tab.filePath = newFilePath;
            
            // 同时更新 data 中的 filePath
            if (tab.data && typeof tab.data === 'object' && 'filePath' in tab.data) {
              tab.data.filePath = newFilePath;
            }
            
            updateCount++;
          }
        }
      }
    }
    
    console.log(`✅ 已更新 ${updateCount} 个标签的文件路径`);
    return updateCount;
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

