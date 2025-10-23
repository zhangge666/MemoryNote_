/**
 * 工作区管理 Composable
 */
import { onMounted, onUnmounted } from 'vue';
import { useTabStore } from '../stores/tab';
import { useNavigationStore } from '../stores/navigation';
import { useNotificationStore } from '../stores/notification';

/**
 * 工作区热切换 composable
 */
export function useWorkspace() {
  const tabStore = useTabStore();
  const navigationStore = useNavigationStore();
  const notificationStore = useNotificationStore();

  /**
   * 清理所有应用状态
   */
  const resetAppState = () => {
    console.log('🧹 Resetting application state...');
    
    // 关闭所有标签页
    tabStore.closeAllTabs();
    
    // 重置导航状态
    navigationStore.setActiveView('notes');
    
    console.log('✅ Application state reset');
  };

  /**
   * 重新加载工作区数据
   */
  const reloadWorkspaceData = async () => {
    console.log('🔄 Reloading workspace data...');
    
    try {
      // 触发笔记列表刷新（通过切换视图）
      // 这会触发 FileTree 组件重新加载笔记列表
      navigationStore.setActiveView('notes');
      
      // 显示成功通知
      notificationStore.success('新的工作区数据已加载', {
        title: '工作区已切换',
      });
      
      console.log('✅ Workspace data reloaded');
    } catch (error) {
      console.error('Failed to reload workspace data:', error);
      
      // 显示错误通知
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      notificationStore.error(errorMsg, {
        title: '加载工作区失败',
      });
    }
  };

  /**
   * 处理工作区切换事件
   */
  const handleWorkspaceChanged = async (...args: unknown[]) => {
    const newWorkspacePath = args[0] as string;
    console.log('📂 Workspace changed to:', newWorkspacePath);
    
    // 清理状态
    resetAppState();
    
    // 等待一小段时间确保状态清理完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 重新加载数据
    await reloadWorkspaceData();
  };

  // 监听工作区切换事件
  onMounted(() => {
    if (window.electronAPI) {
      window.electronAPI.on('workspace:changed', handleWorkspaceChanged);
      console.log('✅ Workspace change listener registered');
    }
  });

  // 清理监听器
  onUnmounted(() => {
    if (window.electronAPI) {
      window.electronAPI.off('workspace:changed', handleWorkspaceChanged);
      console.log('🔇 Workspace change listener removed');
    }
  });

  return {
    resetAppState,
    reloadWorkspaceData,
  };
}

