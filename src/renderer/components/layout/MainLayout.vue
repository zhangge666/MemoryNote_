<template>
  <div class="main-layout flex flex-col h-screen w-screen overflow-hidden bg-background text-text">
    <!-- 标题栏 -->
    <Titlebar 
      @toggle-left-sidebar="sidebarStore.toggleLeft"
      @toggle-right-sidebar="sidebarStore.toggleRight"
    />

    <!-- 主内容区 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 导航栏 -->
      <Navbar />

      <!-- 左侧栏 -->
      <LeftSidebar />

      <!-- 工作区 -->
      <div class="workspace flex-1 flex flex-col overflow-hidden bg-background relative">
        <!-- 标签页系统 -->
        <SplitView
          :layout="tabStore.layout"
          :groups="tabStore.groups"
          @tab-click="handleTabClick"
          @tab-close="handleTabClose"
          @close-others="handleCloseOthers"
          @close-all="handleCloseAll"
          @toggle-pin="handleTogglePin"
          @tab-contextmenu="handleTabContextMenu"
          @split-horizontal="handleSplitHorizontal"
          @split-vertical="handleSplitVertical"
        >
          <template #default="{ tab }">
            <slot :tab="tab">
              <!-- 默认内容渲染 -->
              <component :is="getTabComponent(tab)" :tab="tab" />
            </slot>
          </template>
        </SplitView>
      </div>

      <!-- 右侧栏 -->
      <RightSidebar />
    </div>

    <!-- 状态栏 -->
    <div class="statusbar h-7 bg-background-secondary border-t border-border px-4 flex items-center justify-between text-xs shadow-sm">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-success"></span>
          {{ t('statusbar.connected') }}
        </span>
        <span>{{ t('statusbar.workspace') }}: workspace</span>
      </div>
      <div class="flex items-center gap-4">
        <span>{{ t('statusbar.noteCount', { count: 0 }) }}</span>
        <span>{{ t('statusbar.reviewCount', { count: 0 }) }}</span>
      </div>
    </div>

    <!-- 命令面板 -->
    <CommandPalette v-model:visible="commandStore.commandPaletteVisible" />

    <!-- 通知容器 -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, h } from 'vue';
import type { Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSidebarStore } from '@renderer/stores/sidebar';
import { useCommandStore } from '@renderer/stores/command';
import { useTabStore } from '@renderer/stores/tab';
import { getKeybindingService } from '@renderer/services/KeybindingService';
import { registerDefaultCommands } from '@renderer/services/DefaultCommands';
import Titlebar from './Titlebar.vue';
import Navbar from './Navbar.vue';
import LeftSidebar from './LeftSidebar.vue';
import RightSidebar from './RightSidebar.vue';
import SplitView from '@renderer/components/tab/SplitView.vue';
import CommandPalette from '@renderer/components/command/CommandPalette.vue';
import NotificationContainer from '@renderer/components/notification/NotificationContainer.vue';
import WelcomeView from '@renderer/views/WelcomeView.vue';
import EditorView from '@renderer/views/EditorView.vue';
import SettingsView from '@renderer/views/SettingsView.vue';
import DevTestView from '@renderer/views/DevTestView.vue';
import type { Tab } from '@shared/types/tab';

const { t } = useI18n();
const sidebarStore = useSidebarStore();
const commandStore = useCommandStore();
const tabStore = useTabStore();
const keybindingService = getKeybindingService();

// 标签页事件处理
function handleTabClick(tabId: string) {
  tabStore.activateTab(tabId);
}

async function handleTabClose(tabId: string) {
  await tabStore.closeTab(tabId);
}

async function handleCloseOthers(tabId: string) {
  await tabStore.closeOtherTabs(tabId);
}

async function handleCloseAll() {
  const activeGroupId = tabStore.activeGroupId;
  if (activeGroupId) {
    await tabStore.closeAllTabs(activeGroupId);
  }
}

function handleTogglePin(tabId: string) {
  tabStore.toggleTabPin(tabId);
}

function handleTabContextMenu(event: MouseEvent, tab: Tab) {
  console.log('Tab context menu:', tab);
}

function handleSplitHorizontal(groupId: string) {
  tabStore.splitHorizontal(groupId);
}

function handleSplitVertical(groupId: string) {
  tabStore.splitVertical(groupId);
}

// 获取标签页对应的组件
function getTabComponent(tab: Tab): Component | ReturnType<typeof h> {
  // 根据 tab.type 返回不同的组件
  switch (tab.type) {
    case 'welcome':
      return WelcomeView;
    case 'editor':
      return h(EditorView, { tab });
    case 'settings':
      return SettingsView;
    case 'plugin':
      // 根据不同的插件类型返回不同的视图
      if (tab.title.includes('测试') || tab.title.includes('Test') || tab.icon === '🧪') {
        return DevTestView;
      }
      // 默认插件视图
      return h('div', { class: 'flex items-center justify-center h-full p-8' }, [
        h('div', { class: 'text-center' }, [
          h('div', { class: 'text-6xl mb-4' }, tab.icon || '📦'),
          h('div', { class: 'text-2xl font-bold mb-2' }, tab.title),
          h('div', { class: 'text-sm text-text-secondary' }, `插件类型: ${tab.type}`),
        ]),
      ]);
    default:
      // 未知类型的占位符
      return h('div', {
        class: 'flex items-center justify-center h-full text-text-secondary',
      }, [
        h('div', { class: 'text-center' }, [
          h('div', { class: 'text-4xl mb-4' }, tab.icon || '📄'),
          h('div', { class: 'text-lg' }, tab.title),
          h('div', { class: 'text-sm mt-2 text-text-tertiary' }, `类型: ${tab.type}`),
          h('div', { class: 'text-sm text-text-tertiary' }, tab.filePath ? `路径: ${tab.filePath}` : ''),
        ]),
      ]);
  }
}

// 加载配置和初始化
onMounted(async () => {
  await sidebarStore.loadConfig();
  
  // 注册默认命令
  registerDefaultCommands();
  
  // 启动快捷键监听
  keybindingService.start();
  
  // 尝试加载上次的标签状态
  const loaded = await tabStore.loadState();
  
  // 如果没有加载到状态或没有标签，打开欢迎标签
  if (!loaded || tabStore.allTabs.length === 0) {
    tabStore.openTab({
      title: '欢迎',
      type: 'welcome',
      icon: '👋',
    });
  }
});

// 清理
onUnmounted(() => {
  keybindingService.stop();
  // 保存标签状态
  tabStore.saveState();
});
</script>

<style scoped>
/* 欢迎页面样式 */
.logo-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.welcome-title {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card {
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
}

.feature-card:nth-child(1) {
  animation-delay: 0.2s;
}

.feature-card:nth-child(2) {
  animation-delay: 0.3s;
}

.feature-card:nth-child(3) {
  animation-delay: 0.4s;
}

.feature-card:hover {
  transform: translateY(-4px);
}
</style>

