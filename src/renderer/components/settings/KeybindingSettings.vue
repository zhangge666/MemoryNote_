<template>
  <div class="keybinding-settings p-6">
    <h2 class="text-2xl font-bold mb-6">快捷键设置</h2>

    <!-- 搜索框 -->
    <div class="search-box mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索快捷键..."
        class="w-full px-4 py-2 bg-background-secondary border border-border rounded-lg focus:outline-none focus:border-primary"
      />
    </div>

    <!-- 快捷键列表 -->
    <div class="keybinding-list">
      <div class="list-header grid grid-cols-12 gap-4 mb-4 pb-2 border-b border-border font-semibold text-sm">
        <div class="col-span-5">命令</div>
        <div class="col-span-2">分类</div>
        <div class="col-span-3">快捷键</div>
        <div class="col-span-2">操作</div>
      </div>

      <div
        v-for="binding in filteredKeybindings"
        :key="binding.command"
        class="keybinding-item grid grid-cols-12 gap-4 py-3 border-b border-border hover:bg-background-secondary transition-colors"
      >
        <div class="col-span-5 flex flex-col">
          <span class="text-text">{{ getCommand(binding.command)?.title || binding.command }}</span>
          <span v-if="getCommand(binding.command)?.description" class="text-xs text-text-muted mt-1">
            {{ getCommand(binding.command)?.description }}
          </span>
        </div>
        <div class="col-span-2 text-sm text-text-secondary">
          {{ getCategoryName(getCommand(binding.command)?.category) }}
        </div>
        <div class="col-span-3">
          <span
            v-if="!editingKey || editingKey !== binding.command"
            class="keybinding-display px-3 py-1 bg-background-tertiary rounded border border-border text-sm font-mono"
          >
            {{ formatKeybinding(binding.key) }}
          </span>
          <input
            v-else
            v-model="newKeybinding"
            type="text"
            class="w-full px-3 py-1 bg-background-tertiary border border-primary rounded text-sm font-mono focus:outline-none"
            placeholder="按下快捷键..."
            @keydown="handleKeybindingInput"
            @blur="cancelEdit"
          />
        </div>
        <div class="col-span-2 flex gap-2">
          <button
            v-if="!editingKey || editingKey !== binding.command"
            class="px-3 py-1 bg-primary text-white rounded hover:bg-opacity-80 text-sm"
            @click="startEdit(binding.command, binding.key)"
          >
            编辑
          </button>
          <template v-else>
            <button
              class="px-3 py-1 bg-success text-white rounded hover:bg-opacity-80 text-sm"
              @click="saveEdit(binding.command)"
            >
              保存
            </button>
            <button
              class="px-3 py-1 bg-background-tertiary rounded hover:bg-background-secondary text-sm"
              @click="cancelEdit"
            >
              取消
            </button>
          </template>
          <button
            v-if="binding.custom"
            class="px-3 py-1 bg-error text-white rounded hover:bg-opacity-80 text-sm"
            @click="removeKeybinding(binding.command)"
          >
            删除
          </button>
        </div>
      </div>

      <div v-if="filteredKeybindings.length === 0" class="text-center py-12 text-text-secondary">
        没有找到快捷键
      </div>
    </div>

    <!-- 重置按钮 -->
    <div class="mt-6 flex justify-end">
      <button
        class="px-4 py-2 bg-background-tertiary rounded hover:bg-background-secondary transition-colors"
        @click="resetToDefaults"
      >
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
.keybinding-display {
  display: inline-block;
  min-width: 100px;
  text-align: center;
}
</style>


