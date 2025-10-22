/**
 * 标签页系统类型定义
 */

/**
 * 标签页类型
 */
export type TabType = 'editor' | 'plugin' | 'settings' | 'welcome';

/**
 * 标签页定义
 */
export interface Tab {
  /** 标签页唯一标识符 */
  id: string;
  /** 标签页标题 */
  title: string;
  /** 标签页类型 */
  type: TabType;
  /** 文件路径（用于编辑器类型） */
  filePath?: string;
  /** 图标 */
  icon?: string;
  /** 是否有未保存的修改 */
  isDirty: boolean;
  /** 是否固定 */
  isPinned: boolean;
  /** 扩展数据 */
  data?: any;
  /** 创建时间 */
  createdAt?: number;
}

/**
 * 标签页组
 */
export interface TabGroup {
  /** 标签组唯一标识符 */
  id: string;
  /** 标签页列表 */
  tabs: Tab[];
  /** 当前激活的标签页 ID */
  activeTabId: string | null;
}

/**
 * 分屏布局类型
 */
export type SplitType = 'single' | 'horizontal' | 'vertical';

/**
 * 分屏布局
 */
export interface SplitLayout {
  /** 布局类型 */
  type: SplitType;
  /** 标签组 ID（单一布局时使用） */
  groupId?: string;
  /** 子布局（嵌套分屏时使用） */
  children?: SplitLayout[];
  /** 分割比例（0-1） */
  ratio?: number;
}

/**
 * 标签页系统状态
 */
export interface TabSystemState {
  /** 所有标签组 */
  groups: Record<string, TabGroup>;
  /** 布局配置 */
  layout: SplitLayout;
  /** 当前激活的标签组 ID */
  activeGroupId: string | null;
}

/**
 * 标签页上下文菜单项
 */
export interface TabContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  separator?: boolean;
  disabled?: boolean;
}

/**
 * 分屏方向
 */
export type SplitDirection = 'horizontal' | 'vertical';


