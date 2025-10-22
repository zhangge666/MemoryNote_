<template>
  <div class="tab-bar">
    <!-- 标签列表 -->
    <div class="tab-list" ref="tabListRef" @wheel="handleWheel">
      <TabItem
        v-for="tab in tabs"
        :key="tab.id"
        :tab="tab"
        :is-active="tab.id === activeTabId"
        @click="handleTabClick"
        @close="handleTabClose"
        @contextmenu="handleTabContextMenu"
      />
    </div>

    <!-- 标签栏操作按钮 -->
    <div class="tab-actions">
      <button class="tab-action-btn" title="水平分屏" @click="emit('split-horizontal')">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4m0-16v16m0-16h10a2 2 0 012 2v12a2 2 0 01-2 2H9"/>
        </svg>
      </button>
      <button class="tab-action-btn" title="垂直分屏" @click="emit('split-vertical')">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
        </svg>
      </button>
    </div>

    <!-- 右键菜单 -->
    <TabContextMenu
      v-model:visible="contextMenuVisible"
      :position="contextMenuPosition"
      :tab="contextMenuTab"
      :group-id="groupId"
      @close-tab="handleCloseContextTab"
      @close-others="handleCloseOthers"
      @close-all="handleCloseAll"
      @split-horizontal="handleContextSplitHorizontal"
      @split-vertical="handleContextSplitVertical"
      @toggle-pin="handleTogglePin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TabItem from './TabItem.vue';
import TabContextMenu from './TabContextMenu.vue';
import type { Tab } from '@shared/types/tab';

const props = defineProps<{
  tabs: Tab[];
  activeTabId: string | null;
  groupId: string;
}>();

const emit = defineEmits<{
  (e: 'tab-click', tabId: string): void;
  (e: 'tab-close', tabId: string): void;
  (e: 'close-others', tabId: string): void;
  (e: 'close-all'): void;
  (e: 'toggle-pin', tabId: string): void;
  (e: 'tab-contextmenu', event: MouseEvent, tab: Tab): void;
  (e: 'split-horizontal'): void;
  (e: 'split-vertical'): void;
}>();

const tabListRef = ref<HTMLElement>();
const contextMenuVisible = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const contextMenuTab = ref<Tab | null>(null);

function handleTabClick(tabId: string) {
  emit('tab-click', tabId);
}

function handleTabClose(tabId: string) {
  emit('tab-close', tabId);
}

function handleTabContextMenu(event: MouseEvent, tab: Tab) {
  event.preventDefault();
  event.stopPropagation();
  
  contextMenuTab.value = tab;
  contextMenuPosition.value = { x: event.clientX, y: event.clientY };
  contextMenuVisible.value = true;
  
  emit('tab-contextmenu', event, tab);
}

// 滚轮横向滚动
function handleWheel(event: WheelEvent) {
  if (!tabListRef.value) return;
  
  // 如果是横向滚动，直接允许
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    return;
  }
  
  // 如果是纵向滚动，转换为横向滚动
  event.preventDefault();
  tabListRef.value.scrollLeft += event.deltaY;
}

// 右键菜单操作
function handleCloseContextTab() {
  if (contextMenuTab.value) {
    emit('tab-close', contextMenuTab.value.id);
  }
}

function handleCloseOthers() {
  if (contextMenuTab.value) {
    emit('close-others', contextMenuTab.value.id);
  }
}

function handleCloseAll() {
  emit('close-all');
}

function handleContextSplitHorizontal() {
  emit('split-horizontal');
}

function handleContextSplitVertical() {
  emit('split-vertical');
}

function handleTogglePin() {
  if (contextMenuTab.value) {
    emit('toggle-pin', contextMenuTab.value.id);
  }
}
</script>

<style scoped>
.tab-bar {
  display: flex;
  align-items: center;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  height: 40px;
  flex-shrink: 0;
}

.tab-list {
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
}

.tab-list::-webkit-scrollbar {
  height: 4px;
}

.tab-list::-webkit-scrollbar-track {
  background: transparent;
}

.tab-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.tab-list::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

.tab-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border-left: 1px solid var(--color-border);
}

.tab-action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-action-btn:hover {
  background: var(--color-background-secondary);
  color: var(--color-text);
}
</style>

