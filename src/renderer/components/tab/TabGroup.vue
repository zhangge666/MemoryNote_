<template>
  <div 
    class="tab-group" 
    :class="{ 'is-active': isActive }"
    @click="handleGroupClick"
  >
    <!-- 活动分区指示器 -->
    <div v-if="isActive" class="active-indicator"></div>
    
    <!-- 标签栏 -->
    <TabBar
      :tabs="group.tabs"
      :active-tab-id="group.activeTabId"
      :group-id="group.id"
      @tab-click="handleTabClick"
      @tab-close="handleTabClose"
      @close-others="handleCloseOthers"
      @close-all="handleCloseAll"
      @toggle-pin="handleTogglePin"
      @tab-contextmenu="handleTabContextMenu"
      @split-horizontal="handleSplitHorizontal"
      @split-vertical="handleSplitVertical"
    />

    <!-- 内容区 -->
    <div class="tab-content">
      <div v-if="activeTab" class="tab-content-wrapper">
        <slot :tab="activeTab" name="content">
          <!-- 默认内容 -->
          <div class="flex items-center justify-center h-full text-text-secondary">
            <div class="text-center">
              <div class="text-4xl mb-4">📄</div>
              <div class="text-lg">{{ activeTab.title }}</div>
              <div class="text-sm mt-2">{{ activeTab.type }}</div>
            </div>
          </div>
        </slot>
      </div>
      <div v-else class="tab-empty-state flex items-center justify-center h-full">
        <div class="text-center text-text-muted">
          <div class="text-4xl mb-4">📝</div>
          <div class="text-lg mb-2">没有打开的标签页</div>
          <div class="text-sm">按 Ctrl+N 新建笔记</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TabBar from './TabBar.vue';
import type { TabGroup as ITabGroup, Tab } from '@shared/types/tab';

const props = defineProps<{
  group: ITabGroup;
  isActive?: boolean;  // 是否是活动分区
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
  (e: 'group-activate', groupId: string): void;  // 新增：激活分组事件
}>();

// 处理分组点击，激活当前分组
const handleGroupClick = () => {
  if (!props.isActive) {
    emit('group-activate', props.group.id);
  }
};

const activeTab = computed(() => {
  if (!props.group.activeTabId) return null;
  return props.group.tabs.find((tab) => tab.id === props.group.activeTabId) || null;
});

function handleTabClick(tabId: string) {
  emit('tab-click', tabId);
}

function handleTabClose(tabId: string) {
  emit('tab-close', tabId);
}

function handleCloseOthers(tabId: string) {
  emit('close-others', tabId);
}

function handleCloseAll() {
  emit('close-all');
}

function handleTogglePin(tabId: string) {
  emit('toggle-pin', tabId);
}

function handleTabContextMenu(event: MouseEvent, tab: Tab) {
  emit('tab-contextmenu', event, tab);
}

function handleSplitHorizontal() {
  emit('split-horizontal');
}

function handleSplitVertical() {
  emit('split-vertical');
}
</script>

<style scoped>
.tab-group {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background);
  position: relative; /* 必须设置，让 active-indicator 正确定位 */
  transition: all 0.2s ease;
}

/* 活动分区样式由指示器线提供 */

.tab-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.tab-content-wrapper,
.tab-empty-state {
  width: 100%;
  height: 100%;
}

/* 活动分区指示器 */
.active-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--theme-primary);
  z-index: 10;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.5);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>

