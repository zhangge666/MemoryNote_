<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="command-palette-overlay" @click="handleOverlayClick">
        <div class="command-palette" @click.stop>
          <!-- 搜索框 -->
          <div class="command-palette-search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="search-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              :placeholder="$t('command.searchPlaceholder')"
              class="search-input"
              @keydown="handleKeydown"
            />
            <span v-if="searchQuery" class="clear-button" @click="clearSearch">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          </div>

          <!-- 命令列表 -->
          <div class="command-list">
            <div v-if="filteredCommands.length === 0" class="no-results">
              {{ $t('command.noResults') }}
            </div>
            <div
              v-for="(command, index) in filteredCommands"
              :key="command.id"
              :class="['command-item', { active: index === selectedIndex }]"
              @click="executeCommand(command)"
              @mouseenter="selectedIndex = index"
            >
              <div class="command-info">
                <div class="command-title">{{ command.title }}</div>
                <div v-if="command.category" class="command-category">
                  {{ command.category }}
                </div>
              </div>
              <div v-if="command.keybinding" class="command-keybinding">
                {{ formatKeybinding(command.keybinding) }}
              </div>
            </div>
          </div>

          <!-- 底部提示 -->
          <div class="command-palette-footer">
            <span class="footer-hint">
              <kbd>↑↓</kbd> {{ $t('command.navigate') }}
              <kbd>Enter</kbd> {{ $t('command.execute') }}
              <kbd>Esc</kbd> {{ $t('command.close') }}
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { Command } from '@shared/types/command';
import { getCommandService } from '@renderer/services/CommandService';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const commandService = getCommandService();
const searchInput = ref<HTMLInputElement | null>(null);
const searchQuery = ref('');
const selectedIndex = ref(0);

// 获取所有命令
const allCommands = computed(() => commandService.getAllCommands());

// 过滤命令
const filteredCommands = computed(() => {
  if (!searchQuery.value) {
    return allCommands.value;
  }
  return commandService.searchCommands(searchQuery.value);
});

// 监听可见性变化，自动聚焦输入框
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      nextTick(() => {
        searchInput.value?.focus();
        selectedIndex.value = 0;
      });
    } else {
      searchQuery.value = '';
      selectedIndex.value = 0;
    }
  },
);

// 监听搜索查询变化，重置选中索引
watch(searchQuery, () => {
  selectedIndex.value = 0;
});

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredCommands.value.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      break;
    case 'Enter':
      event.preventDefault();
      if (filteredCommands.value[selectedIndex.value]) {
        executeCommand(filteredCommands.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      event.preventDefault();
      close();
      break;
  }
}

/**
 * 执行命令
 */
async function executeCommand(command: Command) {
  try {
    await commandService.executeCommand(command.id);
    close();
  } catch (error) {
    console.error('Failed to execute command:', error);
  }
}

/**
 * 关闭面板
 */
function close() {
  emit('update:visible', false);
}

/**
 * 处理覆盖层点击
 */
function handleOverlayClick() {
  close();
}

/**
 * 清除搜索
 */
function clearSearch() {
  searchQuery.value = '';
  searchInput.value?.focus();
}

/**
 * 格式化快捷键显示
 */
function formatKeybinding(keybinding: string): string {
  return keybinding.replace(/\+/g, ' + ');
}
</script>

<style scoped>
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 9999;
}

.command-palette {
  width: 90%;
  max-width: 600px;
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.command-palette-search {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-secondary);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: var(--color-text);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.clear-button {
  width: 20px;
  height: 20px;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.clear-button:hover {
  color: var(--color-text);
}

.clear-button svg {
  width: 16px;
  height: 16px;
}

.command-list {
  max-height: 400px;
  overflow-y: auto;
}

.no-results {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-secondary);
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--color-border);
}

.command-item:last-child {
  border-bottom: none;
}

.command-item:hover,
.command-item.active {
  background: var(--color-background-secondary);
}

.command-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.command-title {
  color: var(--color-text);
  font-size: 14px;
}

.command-category {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 2px 8px;
  background: var(--color-background-tertiary);
  border-radius: 4px;
}

.command-keybinding {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: monospace;
}

.command-palette-footer {
  padding: 12px 16px;
  background: var(--color-background-secondary);
  border-top: 1px solid var(--color-border);
}

.footer-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 12px;
}

kbd {
  background: var(--color-background-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .command-palette,
.modal-leave-active .command-palette {
  transition: transform 0.2s, opacity 0.2s;
}

.modal-enter-from .command-palette,
.modal-leave-to .command-palette {
  transform: translateY(-20px);
  opacity: 0;
}
</style>


