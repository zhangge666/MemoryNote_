<template>
  <div
    :class="['tab-item', { active: isActive, pinned: tab.isPinned, dirty: tab.isDirty }]"
    @click="handleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <!-- 图标 -->
    <div v-if="tab.icon" class="tab-icon">{{ tab.icon }}</div>

    <!-- 标题 -->
    <div class="tab-title">
      {{ tab.title }}
    </div>

    <!-- 固定图标 -->
    <div v-if="tab.isPinned && !tab.isDirty" class="tab-pin-icon">
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
        <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z"/>
      </svg>
    </div>

    <!-- 关闭按钮/脏标记容器 -->
    <div v-if="!tab.isPinned" class="tab-action">
      <!-- 脏标记 -->
      <div v-if="tab.isDirty" class="tab-dirty-indicator">
        <div class="dot"></div>
      </div>
      <!-- 关闭按钮 -->
      <button class="tab-close" @click.stop="handleClose">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Tab } from '@shared/types/tab';

const props = defineProps<{
  tab: Tab;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (e: 'click', tabId: string): void;
  (e: 'close', tabId: string): void;
  (e: 'contextmenu', event: MouseEvent, tab: Tab): void;
}>();

function handleClick() {
  emit('click', props.tab.id);
}

function handleClose() {
  emit('close', props.tab.id);
}

function handleContextMenu(event: MouseEvent) {
  emit('contextmenu', event, props.tab);
}
</script>

<style scoped>
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  min-width: 120px;
  max-width: 200px;
  background: transparent;
  border-right: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
  position: relative;
}

.tab-item:hover {
  background: var(--color-background-tertiary);
}

.tab-item.active {
  background: var(--color-background-secondary);
  border-bottom: 2px solid var(--color-primary);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
}

.tab-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.tab-title {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-item.active .tab-title {
  color: var(--color-text);
  font-weight: 500;
}

.tab-action {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-dirty-indicator {
  position: absolute;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.15s;
}

.tab-dirty-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
}

/* 当hover时隐藏脏标记 */
.tab-item:hover .tab-dirty-indicator {
  opacity: 0;
}

.tab-pin-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.tab-close {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  opacity: 0;
  transition: all 0.15s;
  border: none;
  background: transparent;
  cursor: pointer;
}

.tab-item:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: var(--color-background-tertiary);
  color: var(--color-text);
}

.tab-item.pinned {
  background: var(--color-background-tertiary);
}
</style>


