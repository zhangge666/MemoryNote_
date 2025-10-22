<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="tab-context-menu"
      :style="{ left: `${position.x}px`, top: `${position.y}px` }"
      @click.stop
    >
      <div class="context-menu-item" @click="handleClose">
        <span class="context-menu-icon">✖️</span>
        <span>{{ t('tabs.closeTab') }}</span>
      </div>
      <div class="context-menu-item" @click="handleCloseOthers">
        <span class="context-menu-icon">📑</span>
        <span>{{ t('tabs.closeOthers') }}</span>
      </div>
      <div class="context-menu-item" @click="handleCloseAll">
        <span class="context-menu-icon">🗑️</span>
        <span>{{ t('tabs.closeAll') }}</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="handleSplitHorizontal">
        <span class="context-menu-icon">↔️</span>
        <span>{{ t('tabs.splitRight') }}</span>
      </div>
      <div class="context-menu-item" @click="handleSplitVertical">
        <span class="context-menu-icon">↕️</span>
        <span>{{ t('tabs.splitDown') }}</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="handleTogglePin">
        <span class="context-menu-icon">{{ tab?.isPinned ? '📌' : '📍' }}</span>
        <span>{{ tab?.isPinned ? t('tabs.unpin') : t('tabs.pin') }}</span>
      </div>
      <div class="context-menu-item" @click="handleCopyPath" v-if="tab?.filePath">
        <span class="context-menu-icon">📋</span>
        <span>{{ t('tabs.copyPath') }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Tab } from '@shared/types/tab';

const props = defineProps<{
  visible: boolean;
  position: { x: number; y: number };
  tab: Tab | null;
  groupId: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close-tab'): void;
  (e: 'close-others'): void;
  (e: 'close-all'): void;
  (e: 'split-horizontal'): void;
  (e: 'split-vertical'): void;
  (e: 'toggle-pin'): void;
}>();

const { t } = useI18n();

function handleClose() {
  emit('close-tab');
  emit('update:visible', false);
}

function handleCloseOthers() {
  emit('close-others');
  emit('update:visible', false);
}

function handleCloseAll() {
  emit('close-all');
  emit('update:visible', false);
}

function handleSplitHorizontal() {
  emit('split-horizontal');
  emit('update:visible', false);
}

function handleSplitVertical() {
  emit('split-vertical');
  emit('update:visible', false);
}

function handleTogglePin() {
  emit('toggle-pin');
  emit('update:visible', false);
}

function handleCopyPath() {
  if (props.tab?.filePath) {
    navigator.clipboard.writeText(props.tab.filePath);
  }
  emit('update:visible', false);
}

function handleClickOutside(e: MouseEvent) {
  if (props.visible) {
    emit('update:visible', false);
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.tab-context-menu {
  position: fixed;
  z-index: 10000;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 180px;
  animation: menuFadeIn 0.15s ease-out;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text);
  transition: background-color 0.2s;
  user-select: none;
}

.context-menu-item:hover {
  background: var(--color-hover);
}

.context-menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.context-menu-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}
</style>


