<template>
  <div class="keybinding-settings">
    <!-- 搜索框 -->
    <div class="search-box">
      <svg class="search-icon" viewBox="0 0 20 20" fill="none">
        <path d="M8.5 15a6.5 6.5 0 100-13 6.5 6.5 0 000 13zm6-6.5l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索快捷键..."
        class="search-input"
      />
    </div>

    <!-- 快捷键列表 -->
    <div class="keybinding-list">
      <div class="list-header">
        <div class="header-cell command-cell">命令</div>
        <div class="header-cell category-cell">分类</div>
        <div class="header-cell keybinding-cell">快捷键</div>
        <div class="header-cell action-cell">操作</div>
      </div>

      <div
        v-for="binding in filteredKeybindings"
        :key="binding.command"
        class="keybinding-item"
      >
        <div class="command-cell">
          <div class="command-title">{{ getCommand(binding.command)?.title || binding.command }}</div>
          <div v-if="getCommand(binding.command)?.description" class="command-desc">
            {{ getCommand(binding.command)?.description }}
          </div>
        </div>
        <div class="category-cell">
          <span class="category-badge">{{ getCategoryName(getCommand(binding.command)?.category) }}</span>
        </div>
        <div class="keybinding-cell">
          <div
            v-if="!editingKey || editingKey !== binding.command"
            class="keybinding-display"
          >
            <kbd>{{ formatKeybinding(binding.key) }}</kbd>
          </div>
          <input
            v-else
            v-model="newKeybinding"
            type="text"
            class="keybinding-input"
            placeholder="按下快捷键..."
            @keydown="handleKeybindingInput"
            @blur="cancelEdit"
          />
        </div>
        <div class="action-cell">
          <button
            v-if="!editingKey || editingKey !== binding.command"
            class="action-btn edit-btn"
            @click="startEdit(binding.command, binding.key)"
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L6.41421 16.4142C6.21929 16.6091 5.99026 16.7673 5.7386 16.8799L2 18L3.12011 14.2614C3.23273 14.0097 3.39092 13.7807 3.58579 13.5858L13.5858 3.58579Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            编辑
          </button>
          <template v-else>
            <button
              class="action-btn save-btn"
              @click="saveEdit(binding.command)"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M16 5L7.5 13.5L4 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              保存
            </button>
            <button
              class="action-btn cancel-btn"
              @click="cancelEdit"
            >
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M14 6L6 14M6 6l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              取消
            </button>
          </template>
          <button
            v-if="binding.custom"
            class="action-btn delete-btn"
            @click="removeKeybinding(binding.command)"
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M6 4H14M4 6H16M15 6L14.5937 14.7188C14.5508 15.4754 13.9254 16 13.0668 16H6.93318C6.07459 16 5.44918 15.4754 5.40627 14.7188L5 6M8 9V13M12 9V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="filteredKeybindings.length === 0" class="empty-state">
        <svg viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2" opacity="0.3"/>
          <path d="M32 20v24M20 32h24" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
        </svg>
        <p>没有找到快捷键</p>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-actions">
      <div class="footer-info">
        <span>共 {{ allKeybindings.length }} 个快捷键</span>
        <span v-if="searchQuery">· 显示 {{ filteredKeybindings.length }} 个结果</span>
      </div>
      <button class="reset-btn" @click="resetToDefaults">
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M4 10a6 6 0 0112 0M16 10a6 6 0 01-12 0M10 4v2M10 14v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        重置为默认值
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getKeybindingService } from '@renderer/services/KeybindingService';
import { getCommandService } from '@renderer/services/CommandService';
import { Keybinding } from '@shared/types/command';

const keybindingService = getKeybindingService();
const commandService = getCommandService();

const searchQuery = ref('');
const editingKey = ref<string | null>(null);
const newKeybinding = ref('');
const originalKeybinding = ref('');

// 获取所有快捷键绑定
const allKeybindings = computed(() => keybindingService.getAllKeybindings());

// 过滤快捷键
const filteredKeybindings = computed(() => {
  if (!searchQuery.value) {
    return allKeybindings.value;
  }
  const query = searchQuery.value.toLowerCase();
  return allKeybindings.value.filter((binding) => {
    const command = getCommand(binding.command);
    return (
      binding.key.toLowerCase().includes(query) ||
      binding.command.toLowerCase().includes(query) ||
      command?.title.toLowerCase().includes(query)
    );
  });
});

/**
 * 获取命令
 */
function getCommand(commandId: string) {
  return commandService.getCommand(commandId);
}

/**
 * 获取分类名称
 */
function getCategoryName(category?: string): string {
  const categoryMap: Record<string, string> = {
    file: '文件',
    edit: '编辑',
    view: '视图',
    navigation: '导航',
    search: '搜索',
    review: '复习',
    plugin: '插件',
    system: '系统',
    custom: '自定义',
  };
  return category ? categoryMap[category] || category : '-';
}

/**
 * 格式化快捷键显示
 */
function formatKeybinding(keybinding: string): string {
  return keybinding.replace(/\+/g, ' + ');
}

/**
 * 开始编辑快捷键
 */
function startEdit(commandId: string, currentKey: string) {
  editingKey.value = commandId;
  originalKeybinding.value = currentKey;
  newKeybinding.value = '';
}

/**
 * 处理快捷键输入
 */
function handleKeybindingInput(event: KeyboardEvent) {
  event.preventDefault();

  // 忽略单独的修饰键
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
    return;
  }

  const parts: string[] = [];

  if (event.ctrlKey || event.metaKey) {
    parts.push('Ctrl');
  }
  if (event.altKey) {
    parts.push('Alt');
  }
  if (event.shiftKey) {
    parts.push('Shift');
  }

  // 添加主键
  let key = event.key;
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Escape: 'Esc',
  };

  key = keyMap[key] || key;
  parts.push(key.length === 1 ? key.toUpperCase() : key);

  newKeybinding.value = parts.join('+');
}

/**
 * 保存编辑
 */
function saveEdit(commandId: string) {
  if (!newKeybinding.value) {
    cancelEdit();
    return;
  }

  // 检查冲突
  if (keybindingService.hasConflict(newKeybinding.value)) {
    alert(`快捷键 ${newKeybinding.value} 已被其他命令使用`);
    return;
  }

  // 删除旧的绑定
  keybindingService.unregisterKeybinding(originalKeybinding.value);

  // 注册新的绑定
  const command = getCommand(commandId);
  keybindingService.registerKeybinding({
    key: newKeybinding.value,
    command: commandId,
    when: command?.when,
    custom: true,
  });

  editingKey.value = null;
  newKeybinding.value = '';
  originalKeybinding.value = '';
}

/**
 * 取消编辑
 */
function cancelEdit() {
  editingKey.value = null;
  newKeybinding.value = '';
  originalKeybinding.value = '';
}

/**
 * 删除快捷键
 */
function removeKeybinding(commandId: string) {
  const binding = allKeybindings.value.find((b) => b.command === commandId);
  if (binding) {
    keybindingService.unregisterKeybinding(binding.key);
  }
}

/**
 * 重置为默认值
 */
function resetToDefaults() {
  if (confirm('确定要重置所有快捷键为默认值吗？')) {
    // TODO: 实现重置功能
    console.log('Reset to defaults');
  }
}
</script>

<style scoped>
.keybinding-settings {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 搜索框 */
.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--theme-text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: var(--theme-background-secondary);
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  color: var(--theme-text);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--theme-text-muted);
}

.search-input:focus {
  outline: none;
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px var(--theme-primary)20;
}

/* 快捷键列表 */
.keybinding-list {
  background: var(--theme-background);
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--theme-background-secondary);
  border-bottom: 1px solid var(--theme-border);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--theme-text-secondary);
}

.keybinding-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--theme-border-light);
  transition: background 0.2s ease;
}

.keybinding-item:last-child {
  border-bottom: none;
}

.keybinding-item:hover {
  background: var(--theme-background-secondary);
}

/* 单元格 */
.header-cell,
.command-cell,
.category-cell,
.keybinding-cell,
.action-cell {
  display: flex;
  align-items: center;
}

.command-cell {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.command-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text);
}

.command-desc {
  font-size: 0.75rem;
  color: var(--theme-text-muted);
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  background: var(--theme-background-tertiary);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--theme-text-secondary);
  font-weight: 500;
}

/* 快捷键显示 */
.keybinding-display kbd {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: var(--theme-background-secondary);
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  font-family: var(--theme-font-mono);
  font-size: 0.8125rem;
  color: var(--theme-text);
  box-shadow: 0 1px 2px var(--theme-shadow-light);
  min-width: 80px;
  text-align: center;
}

.keybinding-input {
  width: 100%;
  padding: 0.375rem 0.75rem;
  background: var(--theme-input-background);
  border: 2px solid var(--theme-primary);
  border-radius: 6px;
  font-family: var(--theme-font-mono);
  font-size: 0.8125rem;
  color: var(--theme-text);
  box-shadow: 0 0 0 3px var(--theme-primary)20;
}

.keybinding-input:focus {
  outline: none;
}

.keybinding-input::placeholder {
  color: var(--theme-input-placeholder);
}

/* 操作按钮 */
.action-cell {
  gap: 0.5rem;
  justify-content: flex-start;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.edit-btn {
  background: var(--theme-primary);
  color: var(--theme-text-inverse);
}

.edit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.save-btn {
  background: var(--theme-success);
  color: white;
}

.save-btn:hover {
  opacity: 0.9;
}

.cancel-btn {
  background: var(--theme-background-tertiary);
  color: var(--theme-text);
}

.cancel-btn:hover {
  background: var(--theme-background-hover);
}

.delete-btn {
  background: transparent;
  color: var(--theme-error);
  padding: 0.375rem;
}

.delete-btn:hover {
  background: var(--theme-error)20;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--theme-text-muted);
}

.empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  color: var(--theme-border);
}

.empty-state p {
  font-size: 0.875rem;
}

/* 底部操作栏 */
.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--theme-border);
}

.footer-info {
  font-size: 0.8125rem;
  color: var(--theme-text-secondary);
}

.footer-info span + span {
  margin-left: 0.5rem;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--theme-background-secondary);
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  color: var(--theme-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn svg {
  width: 16px;
  height: 16px;
}

.reset-btn:hover {
  background: var(--theme-background-hover);
  border-color: var(--theme-border-active);
  transform: translateY(-1px);
}
</style>


