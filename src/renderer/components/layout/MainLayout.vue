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
      <LeftSidebar>
        <!-- 根据导航状态渲染不同内容 -->
        <FileTree
          v-if="navigationStore.activeView === 'notes'"
          @select-note="handleSelectNote"
          @create-note="handleCreateNote"
          @create-folder="handleCreateFolder"
        />
        <div v-else class="sidebar-placeholder">
          <h3 class="text-sm font-semibold mb-4">{{ t(`navbar.${navigationStore.activeView}`) }}</h3>
          <p class="text-sm text-text-muted">此功能正在开发中...</p>
        </div>
      </LeftSidebar>

      <!-- 工作区 -->
      <div class="workspace flex-1 flex flex-col overflow-hidden bg-background relative">
        <!-- 空状态 - 当没有标签页时显示 -->
        <EmptyState v-if="tabStore.allTabs.length === 0" />
        
        <!-- 标签页系统 -->
          <SplitView
            v-else
            :layout="tabStore.layout"
            :groups="tabStore.groups"
            :active-group-id="tabStore.activeGroupId"
            @tab-click="handleTabClick"
            @tab-close="handleTabClose"
            @close-others="handleCloseOthers"
            @close-all="handleCloseAll"
            @toggle-pin="handleTogglePin"
            @tab-contextmenu="handleTabContextMenu"
            @split-horizontal="handleSplitHorizontal"
            @split-vertical="handleSplitVertical"
            @group-activate="handleGroupActivate"
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
    <div class="statusbar">
      <div class="statusbar-section">
        <span class="statusbar-item">
          <svg class="statusbar-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="currentColor"/>
          </svg>
          {{ t('statusbar.connected') }}
        </span>
        <span class="statusbar-divider"></span>
        <span class="statusbar-item">
          <svg class="statusbar-icon" viewBox="0 0 16 16" fill="none">
            <path d="M2 3h12v10H2z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5 1v4M11 1v4" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          {{ t('statusbar.workspace') }}: workspace
        </span>
      </div>
      <div class="statusbar-section">
        <span class="statusbar-item">
          <svg class="statusbar-icon" viewBox="0 0 16 16" fill="none">
            <path d="M3 2h10l-2 12H5L3 2z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          {{ t('statusbar.noteCount', { count: 0 }) }}
        </span>
        <span class="statusbar-divider"></span>
        <span class="statusbar-item">
          <svg class="statusbar-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 5v3l2 2" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          {{ t('statusbar.reviewCount', { count: 0 }) }}
        </span>
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
import { useNavigationStore } from '@renderer/stores/navigation';
import { useThemeStore } from '@renderer/stores/theme';
import { getKeybindingService } from '@renderer/services/KeybindingService';
import { registerDefaultCommands } from '@renderer/services/DefaultCommands';
import { noteService } from '@renderer/services/NoteService';
import Titlebar from './Titlebar.vue';
import Navbar from './Navbar.vue';
import LeftSidebar from './LeftSidebar.vue';
import RightSidebar from './RightSidebar.vue';
import SplitView from '@renderer/components/tab/SplitView.vue';
import CommandPalette from '@renderer/components/command/CommandPalette.vue';
import NotificationContainer from '@renderer/components/notification/NotificationContainer.vue';
import FileTree from '@renderer/components/note/FileTree.vue';
import EmptyState from '@renderer/components/workspace/EmptyState.vue';
import WelcomeView from '@renderer/views/WelcomeView.vue';
import EditorView from '@renderer/views/EditorView.vue';
import SettingsView from '@renderer/views/SettingsView.vue';
import DevTestView from '@renderer/views/DevTestView.vue';
import type { Tab } from '@shared/types/tab';
import type { Note } from '@shared/types/note';

const { t } = useI18n();
const sidebarStore = useSidebarStore();
const commandStore = useCommandStore();
const tabStore = useTabStore();
const navigationStore = useNavigationStore();
const themeStore = useThemeStore();
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
  // 初始化主题系统
  await themeStore.initialize();
  
  // 加载侧边栏配置
  await sidebarStore.loadConfig();
  
  // 注册默认命令
  registerDefaultCommands();
  
  // 启动快捷键监听
  keybindingService.start();
  
  // 尝试加载上次的标签状态
  await tabStore.loadState();
  
  // 不再自动打开欢迎页面，让用户看到空状态
});

onUnmounted(() => {
  // 停止快捷键监听
  keybindingService.stop();
});

// 笔记相关处理
async function handleSelectNote(note: Note) {
  // 只在当前激活分区中检查是否已经打开该笔记
  const activeGroup = tabStore.activeGroup;
  
  if (activeGroup) {
    // 在当前激活分区中查找
    const existingTab = activeGroup.tabs.find(tab => 
      tab.type === 'editor' && tab.data?.noteId === note.id
    );
    
    if (existingTab) {
      // 在当前分区中已打开，激活它
      tabStore.activateTab(existingTab.id);
    } else {
      // 在当前激活分区中打开新标签
      tabStore.openTab({
        title: note.title,
        type: 'editor',
        icon: '📝',
        filePath: note.filePath,
        data: {
          noteId: note.id,
          content: note.content || '',
          filePath: note.filePath,
        },
      }, tabStore.activeGroupId!);  // 明确指定在当前激活分区中打开
    }
  } else {
    // 如果没有激活分区，在默认分区打开
    tabStore.openTab({
      title: note.title,
      type: 'editor',
      icon: '📝',
      filePath: note.filePath,
      data: {
        noteId: note.id,
        content: note.content || '',
        filePath: note.filePath,
      },
    });
  }
}

async function handleCreateNote() {
  try {
    const note = await noteService.createNote({
      title: '未命名笔记',
      content: '',
    });
    
    // 打开新笔记
    handleSelectNote(note);
  } catch (error) {
    console.error('创建笔记失败:', error);
  }
}

async function handleCreateFolder() {
  try {
    await noteService.createFolder({
      name: '新文件夹',
    });
    
    // TODO: 刷新文件树
  } catch (error) {
    console.error('创建文件夹失败:', error);
  }
}

// 激活分组（当点击分区时）
function handleGroupActivate(groupId: string) {
  // 直接激活分组，不通过 tab（避免在同一个 tab 存在于多个分区时出现激活错误）
  tabStore.activateGroup(groupId);
}

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

