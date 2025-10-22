<template>
  <div class="dev-test-view p-8 overflow-auto">
    <h1 class="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
      开发测试面板
    </h1>

    <!-- 通知系统测试 -->
    <div class="test-section mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-text">通知系统测试</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button class="test-btn btn-info" @click="testInfoNotification">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          信息通知
        </button>

        <button class="test-btn btn-success" @click="testSuccessNotification">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          成功通知
        </button>

        <button class="test-btn btn-warning" @click="testWarningNotification">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          警告通知
        </button>

        <button class="test-btn btn-error" @click="testErrorNotification">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          错误通知
        </button>

        <button class="test-btn btn-primary" @click="testNotificationWithActions">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          带动作的通知
        </button>

        <button class="test-btn btn-secondary" @click="testPersistentNotification">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          持久化通知
        </button>

        <button class="test-btn btn-accent" @click="testMultipleNotifications">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          批量通知
        </button>

        <button class="test-btn btn-danger" @click="testClearAllNotifications">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          清除所有通知
        </button>
      </div>
    </div>

    <!-- 命令系统测试 -->
    <div class="test-section mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-text">命令系统测试</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button class="test-btn btn-primary" @click="testOpenCommandPalette">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          打开命令面板
        </button>

        <button class="test-btn btn-secondary" @click="testToggleLeftSidebar">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          切换左侧栏
        </button>

        <button class="test-btn btn-accent" @click="testToggleRightSidebar">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          切换右侧栏
        </button>
      </div>
    </div>

    <!-- 标签页系统测试 -->
    <div class="test-section mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-text">标签页系统测试</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button class="test-btn btn-primary" @click="testOpenTab">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          打开新标签
        </button>

        <button class="test-btn btn-info" @click="testOpenMultipleTabs">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          打开多个标签
        </button>

        <button class="test-btn btn-warning" @click="testSetTabDirty">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          标记未保存
        </button>

        <button class="test-btn btn-secondary" @click="testSplitHorizontal">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4m0-16v16m0-16h10a2 2 0 012 2v12a2 2 0 01-2 2H9"
            />
          </svg>
          水平分屏
        </button>

        <button class="test-btn btn-accent" @click="testSplitVertical">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
          垂直分屏
        </button>

        <button class="test-btn btn-success" @click="testNestedSplit">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
          嵌套分屏
        </button>

        <button class="test-btn btn-info" @click="testSaveAndRestoreState">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          保存/恢复状态
        </button>

        <button class="test-btn btn-danger" @click="testCloseAllTabs">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          关闭所有标签
        </button>
      </div>
    </div>

    <!-- 数据库测试 -->
    <div class="test-section mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-text">数据库测试</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button class="test-btn btn-info" @click="testDatabaseQuery">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
          </svg>
          查询测试
        </button>

        <button class="test-btn btn-success" @click="testDatabaseInsert">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          插入测试
        </button>
      </div>
    </div>

    <!-- 测试日志 -->
    <div class="test-section">
      <h2 class="text-2xl font-semibold mb-4 text-text">测试日志</h2>
      <div class="log-container bg-background-secondary rounded-lg p-4 font-mono text-sm overflow-auto max-h-60">
        <div v-if="logs.length === 0" class="text-text-muted">暂无日志...</div>
        <div v-for="(log, index) in logs" :key="index" :class="['log-item', `log-${log.type}`]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <button class="mt-4 test-btn btn-secondary" @click="clearLogs">
        清除日志
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useNotificationStore } from '@renderer/stores/notification';
import { useCommandStore } from '@renderer/stores/command';
import { useSidebarStore } from '@renderer/stores/sidebar';
import { useTabStore } from '@renderer/stores/tab';
import { getCommandService } from '@renderer/services/CommandService';
import { useIPC } from '@renderer/composables/useIPC';
import { IPCChannel } from '@shared/interfaces/ipc';

const notificationStore = useNotificationStore();
const commandStore = useCommandStore();
const sidebarStore = useSidebarStore();
const tabStore = useTabStore();
const commandService = getCommandService();
const ipc = useIPC();

interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const logs = ref<LogEntry[]>([]);

function addLog(type: LogEntry['type'], message: string) {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  logs.value.unshift({ time, type, message });
  if (logs.value.length > 50) {
    logs.value.pop();
  }
}

function clearLogs() {
  logs.value = [];
}

// ========== 通知系统测试 ==========
function testInfoNotification() {
  notificationStore.info('这是一条普通的信息通知，用于展示一般性的提示信息', {
    title: '信息提示',
  });
  addLog('info', '触发信息通知');
}

function testSuccessNotification() {
  notificationStore.success('操作已成功完成！所有数据已保存', {
    title: '操作成功',
  });
  addLog('success', '触发成功通知');
}

function testWarningNotification() {
  notificationStore.warning('请注意，您的磁盘空间即将不足，请及时清理', {
    title: '警告',
  });
  addLog('warning', '触发警告通知');
}

function testErrorNotification() {
  notificationStore.error('发生了一个错误！无法连接到服务器，请检查网络连接', {
    title: '错误',
  });
  addLog('error', '触发错误通知');
}

function testNotificationWithActions() {
  notificationStore.info('你有新的消息需要处理，请选择操作', {
    title: '新消息',
    duration: 0,
    actions: [
      {
        label: '查看',
        primary: true,
        handler: () => {
          addLog('info', '点击了"查看"按钮');
          notificationStore.success('消息已打开');
        },
      },
      {
        label: '稍后',
        handler: () => {
          addLog('info', '点击了"稍后"按钮');
        },
      },
      {
        label: '忽略',
        handler: () => {
          addLog('info', '点击了"忽略"按钮');
        },
      },
    ],
  });
  addLog('info', '触发带动作的通知');
}

function testPersistentNotification() {
  notificationStore.warning('这是一条持久化通知，不会自动关闭', {
    title: '持久化通知',
    duration: 0,
  });
  addLog('warning', '触发持久化通知（不会自动关闭）');
}

function testMultipleNotifications() {
  const types: Array<'info' | 'success' | 'warning' | 'error'> = ['info', 'success', 'warning', 'error'];
  types.forEach((type, index) => {
    setTimeout(() => {
      notificationStore[type](`这是第 ${index + 1} 条通知`, {
        title: `通知 ${index + 1}`,
      });
    }, index * 500);
  });
  addLog('info', '触发批量通知（4条）');
}

function testClearAllNotifications() {
  notificationStore.closeAll();
  addLog('info', '清除所有通知');
}

// ========== 命令系统测试 ==========
function testOpenCommandPalette() {
  commandStore.showCommandPalette();
  addLog('info', '打开命令面板');
}

function testToggleLeftSidebar() {
  sidebarStore.toggleLeft();
  addLog('info', '切换左侧栏');
}

function testToggleRightSidebar() {
  sidebarStore.toggleRight();
  addLog('info', '切换右侧栏');
}

// ========== 标签页系统测试 ==========
function testOpenTab() {
  const tabId = tabStore.openTab({
    title: `测试标签 ${Date.now()}`,
    type: 'editor',
  });
  addLog('success', `打开标签: ${tabId}`);
  notificationStore.success('标签已打开');
}

function testOpenMultipleTabs() {
  const types: Array<'editor' | 'settings' | 'welcome'> = ['editor', 'editor', 'settings'];
  types.forEach((type, index) => {
    setTimeout(() => {
      tabStore.openTab({
        title: `标签 ${index + 1}`,
        type,
      });
      addLog('info', `打开标签 ${index + 1}`);
    }, index * 200);
  });
  notificationStore.info('批量打开标签');
}

function testSetTabDirty() {
  const activeTab = tabStore.activeTab;
  if (activeTab) {
    tabStore.setTabDirty(activeTab.id, !activeTab.isDirty);
    addLog('success', `标签 ${activeTab.id} 脏状态: ${!activeTab.isDirty}`);
    notificationStore.success('标签状态已更新');
  } else {
    notificationStore.warning('没有激活的标签');
  }
}

function testSplitHorizontal() {
  tabStore.splitHorizontal();
  addLog('success', '水平分屏');
  notificationStore.success('已创建水平分屏');
}

function testSplitVertical() {
  tabStore.splitVertical();
  addLog('success', '垂直分屏');
  notificationStore.success('已创建垂直分屏');
}

async function testCloseAllTabs() {
  await tabStore.closeAllTabs();
  addLog('success', '关闭所有标签');
  notificationStore.success('所有标签已关闭');
}

function testNestedSplit() {
  // 先打开几个标签
  testOpenMultipleTabs();
  
  // 等待一下让标签打开
  setTimeout(() => {
    // 水平分屏
    const firstGroup = tabStore.activeGroupId;
    if (firstGroup) {
      tabStore.splitHorizontal(firstGroup);
      addLog('info', '创建水平分屏');
      
      // 在新组中垂直分屏
      setTimeout(() => {
        const secondGroup = tabStore.activeGroupId;
        if (secondGroup) {
          tabStore.splitVertical(secondGroup);
          addLog('success', '创建嵌套分屏');
          notificationStore.success('创建了嵌套分屏布局');
        }
      }, 300);
    }
  }, 800);
}

async function testSaveAndRestoreState() {
  try {
    // 保存当前状态
    await tabStore.saveState();
    addLog('success', '标签页状态已保存');
    notificationStore.success('状态已保存');
    
    // 等待一下然后恢复
    setTimeout(async () => {
      const loaded = await tabStore.loadState();
      if (loaded) {
        addLog('success', '标签页状态已恢复');
        notificationStore.success('状态已恢复');
      } else {
        addLog('warning', '没有找到保存的状态');
        notificationStore.warning('没有找到保存的状态');
      }
    }, 1000);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog('error', `状态操作失败: ${errorMessage}`);
    notificationStore.error('状态操作失败', errorMessage);
  }
}

// ========== 数据库测试 ==========
async function testDatabaseQuery() {
  try {
    const result = await ipc.invoke(IPCChannel.DB_QUERY, 'SELECT * FROM _migrations');
    addLog('success', `数据库查询成功: ${JSON.stringify(result)}`);
    notificationStore.success('数据库查询成功');
  } catch (error) {
    addLog('error', `数据库查询失败: ${error}`);
    notificationStore.error('数据库查询失败');
  }
}

async function testDatabaseInsert() {
  try {
    const noteId = `test-${Date.now()}`;
    await ipc.invoke(IPCChannel.DB_EXECUTE, 'INSERT INTO notes (id, title, content, path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [
      noteId,
      '测试笔记',
      '这是一个测试笔记',
      `/test/${noteId}.md`,
      Date.now(),
      Date.now(),
    ]);
    addLog('success', `插入笔记成功: ${noteId}`);
    notificationStore.success('插入笔记成功');
  } catch (error) {
    addLog('error', `插入笔记失败: ${error}`);
    notificationStore.error('插入笔记失败');
  }
}
</script>

<style scoped>
.test-section {
  background: var(--color-background-secondary);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--color-border);
}

.test-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.test-btn:active {
  transform: translateY(0);
}

.btn-info {
  background: #3b82f6;
  color: white;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-error {
  background: #ef4444;
  color: white;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-secondary {
  background: var(--color-background-tertiary);
  color: var(--color-text);
  border-color: var(--color-border);
}

.btn-accent {
  background: var(--color-accent);
  color: white;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.log-container {
  border: 1px solid var(--color-border);
}

.log-item {
  padding: 4px 0;
  display: flex;
  gap: 12px;
}

.log-time {
  color: var(--color-text-muted);
  min-width: 70px;
}

.log-message {
  flex: 1;
}

.log-info .log-message {
  color: #3b82f6;
}

.log-success .log-message {
  color: #10b981;
}

.log-warning .log-message {
  color: #f59e0b;
}

.log-error .log-message {
  color: #ef4444;
}
</style>

