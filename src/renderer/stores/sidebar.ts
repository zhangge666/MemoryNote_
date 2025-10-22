import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useIPC } from '@renderer/composables/useIPC';
import { IPCChannel } from '@shared/interfaces/ipc';

/**
 * 侧边栏单个侧的状态
 */
interface SidebarSideState {
  visible: boolean;
  width: number;
  activeView: string | null;
  pinnedViews: string[];
}

/**
 * 侧边栏持久化配置
 */
interface SidebarConfig {
  left: SidebarSideState;
  right: SidebarSideState;
}

const DEFAULT_CONFIG: SidebarConfig = {
  left: {
    visible: true,
    width: 256,
    activeView: 'notes',
    pinnedViews: [],
  },
  right: {
    visible: false,
    width: 256,
    activeView: 'properties',
    pinnedViews: [],
  },
};

export const useSidebarStore = defineStore('sidebar', () => {
  const ipc = useIPC();

  // 左侧栏状态
  const leftVisible = ref(DEFAULT_CONFIG.left.visible);
  const leftWidth = ref(DEFAULT_CONFIG.left.width);
  const leftActiveView = ref(DEFAULT_CONFIG.left.activeView);
  const leftPinnedViews = ref<string[]>(DEFAULT_CONFIG.left.pinnedViews);

  // 右侧栏状态
  const rightVisible = ref(DEFAULT_CONFIG.right.visible);
  const rightWidth = ref(DEFAULT_CONFIG.right.width);
  const rightActiveView = ref(DEFAULT_CONFIG.right.activeView);
  const rightPinnedViews = ref<string[]>(DEFAULT_CONFIG.right.pinnedViews);

  // 是否正在调整大小
  const isResizing = ref(false);
  const resizingSide = ref<'left' | 'right' | null>(null);

  /**
   * 切换左侧栏显示
   */
  const toggleLeft = () => {
    leftVisible.value = !leftVisible.value;
    // 延迟保存，等待动画完成
    setTimeout(() => saveConfig(), 350);
  };

  /**
   * 切换右侧栏显示
   */
  const toggleRight = () => {
    rightVisible.value = !rightVisible.value;
    // 延迟保存，等待动画完成
    setTimeout(() => saveConfig(), 350);
  };

  /**
   * 设置左侧栏宽度（拖拽时调用，不立即保存）
   */
  const setLeftWidth = (width: number) => {
    leftWidth.value = Math.max(200, Math.min(600, width));
  };

  /**
   * 设置右侧栏宽度（拖拽时调用，不立即保存）
   */
  const setRightWidth = (width: number) => {
    rightWidth.value = Math.max(200, Math.min(600, width));
  };

  /**
   * 设置左侧栏激活视图
   */
  const setLeftActiveView = (view: string) => {
    leftActiveView.value = view;
    setTimeout(() => saveConfig(), 100);
  };

  /**
   * 设置右侧栏激活视图
   */
  const setRightActiveView = (view: string) => {
    rightActiveView.value = view;
    setTimeout(() => saveConfig(), 100);
  };

  /**
   * 开始调整大小
   */
  const startResize = (side: 'left' | 'right') => {
    isResizing.value = true;
    resizingSide.value = side;
  };

  /**
   * 结束调整大小（拖拽结束后保存）
   */
  const stopResize = () => {
    isResizing.value = false;
    resizingSide.value = null;
    // 拖拽结束后立即保存
    saveConfig();
  };

  /**
   * 获取当前配置（转换为纯对象）
   */
  const getConfig = (): SidebarConfig => {
    return JSON.parse(JSON.stringify({
      left: {
        visible: leftVisible.value,
        width: leftWidth.value,
        activeView: leftActiveView.value,
        pinnedViews: leftPinnedViews.value,
      },
      right: {
        visible: rightVisible.value,
        width: rightWidth.value,
        activeView: rightActiveView.value,
        pinnedViews: rightPinnedViews.value,
      },
    }));
  };

  /**
   * 应用配置
   */
  const applyConfig = (config: Partial<SidebarConfig>) => {
    if (config.left) {
      if (config.left.visible !== undefined) leftVisible.value = config.left.visible;
      if (config.left.width !== undefined) leftWidth.value = config.left.width;
      if (config.left.activeView !== undefined) leftActiveView.value = config.left.activeView;
      if (config.left.pinnedViews !== undefined) leftPinnedViews.value = config.left.pinnedViews;
    }
    if (config.right) {
      if (config.right.visible !== undefined) rightVisible.value = config.right.visible;
      if (config.right.width !== undefined) rightWidth.value = config.right.width;
      if (config.right.activeView !== undefined) rightActiveView.value = config.right.activeView;
      if (config.right.pinnedViews !== undefined) rightPinnedViews.value = config.right.pinnedViews;
    }
  };

  /**
   * 从配置服务加载状态
   */
  const loadConfig = async () => {
    try {
      const config = await ipc.invoke<SidebarConfig>(IPCChannel.CONFIG_GET, 'sidebar');
      if (config) {
        applyConfig(config);
        console.log('📂 Sidebar config loaded:', config);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load sidebar config, using defaults:', error);
    }
  };

  /**
   * 保存状态到配置服务（防抖）
   */
  let saveTimer: NodeJS.Timeout | null = null;
  const saveConfig = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        const config = getConfig();
        await ipc.invoke(IPCChannel.CONFIG_SET, 'sidebar', config);
        console.log('💾 Sidebar config saved:', config);
      } catch (error) {
        console.error('❌ Failed to save sidebar config:', error);
      }
    }, 100); // 100ms 防抖
  };

  /**
   * 重置为默认配置
   */
  const resetConfig = async () => {
    applyConfig(DEFAULT_CONFIG);
    await saveConfig();
  };

  return {
    // 左侧栏状态
    leftVisible,
    leftWidth,
    leftActiveView,
    leftPinnedViews,

    // 右侧栏状态
    rightVisible,
    rightWidth,
    rightActiveView,
    rightPinnedViews,

    // 调整大小状态
    isResizing,
    resizingSide,

    // 方法
    toggleLeft,
    toggleRight,
    setLeftWidth,
    setRightWidth,
    setLeftActiveView,
    setRightActiveView,
    startResize,
    stopResize,
    loadConfig,
    saveConfig,
    resetConfig,
    getConfig,
    applyConfig,
  };
});

