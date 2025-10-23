<template>
  <div class="tree-node">
    <div
      class="node-content"
      :class="{
        'is-selected': selectedIds.has(node.id),
        'is-folder-active': activeFolderId === node.id,
        'is-folder': node.type === 'folder'
      }"
      :style="{ paddingLeft: `${level * 12 + 8}px` }"
      @click="handleClick"
      @contextmenu.prevent="handleContextMenu"
    >
      <!-- 展开箭头 -->
      <div class="node-chevron" @click.stop="handleToggle" v-if="node.type === 'folder'">
        <svg 
          viewBox="0 0 16 16" 
          width="16" 
          height="16"
          :class="{ 'is-expanded': node.isExpanded }"
        >
          <path fill="currentColor" d="M6 4l4 4-4 4V4z"/>
        </svg>
      </div>
      <div class="node-chevron-placeholder" v-else></div>

      <!-- 图标 -->
      <div class="node-icon">
        <span v-if="node.type === 'folder'">
          {{ node.isExpanded ? '📂' : '📁' }}
        </span>
        <span v-else>📄</span>
      </div>

      <!-- 名称 -->
      <input
        v-if="isEditing"
        ref="inputRef"
        v-model="editingName"
        class="node-name-input"
        @click.stop
        @blur="handleEditBlur"
        @keydown.enter.prevent="handleEditConfirm"
        @keydown.esc.prevent="handleEditCancel"
      />
      <div v-else class="node-name">{{ node.name }}</div>
    </div>

    <!-- 子节点 -->
    <div v-if="node.type === 'folder' && node.isExpanded && node.children" class="node-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-ids="selectedIds"
        :active-folder-id="activeFolderId"
        :editing-node-id="editingNodeId"
        @select="(...args) => $emit('select', ...args)"
        @activate="(...args) => $emit('activate', ...args)"
        @toggle="$emit('toggle', $event)"
        @context-menu="(...args) => $emit('context-menu', ...args)"
        @edit-confirm="(...args) => $emit('edit-confirm', ...args)"
        @edit-cancel="(...args) => $emit('edit-cancel', ...args)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { FileTreeNode as IFileTreeNode } from '@shared/types/note';

const props = defineProps<{
  node: IFileTreeNode;
  level: number;
  selectedIds: Set<string>;
  activeFolderId: string | null;
  editingNodeId: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', node: IFileTreeNode, event: MouseEvent): void;
  (e: 'activate', folderId: string, event: MouseEvent): void;
  (e: 'toggle', nodeId: string): void;
  (e: 'context-menu', node: IFileTreeNode, event: MouseEvent): void;
  (e: 'edit-confirm', nodeId: string, newName: string): void;
  (e: 'edit-cancel', nodeId: string): void;
}>();

const inputRef = ref<HTMLInputElement>();
const editingName = ref('');

const isEditing = computed(() => props.editingNodeId === props.node.id);

// 监听编辑状态，自动聚焦
watch(isEditing, async (editing) => {
  if (editing) {
    editingName.value = props.node.name;
    await nextTick();
    if (inputRef.value) {
      inputRef.value.focus();
      inputRef.value.select();
    }
  }
});

function handleClick(event: MouseEvent) {
  if (props.node.type === 'folder') {
    emit('activate', props.node.id, event);
    emit('toggle', props.node.id);
  } else {
    emit('select', props.node, event);
  }
}

function handleToggle() {
  emit('toggle', props.node.id);
}

function handleContextMenu(event: MouseEvent) {
  event.stopPropagation();
  emit('context-menu', props.node, event);
}

function handleEditConfirm() {
  const trimmedName = editingName.value.trim();
  if (trimmedName) {
    emit('edit-confirm', props.node.id, trimmedName);
  } else {
    emit('edit-cancel', props.node.id);
  }
}

function handleEditCancel() {
  emit('edit-cancel', props.node.id);
}

function handleEditBlur() {
  // 延迟处理，避免与confirm事件冲突
  setTimeout(() => {
    if (isEditing.value) {
      handleEditConfirm();
    }
  }, 100);
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  height: 24px;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
  transition: background 0.1s;
}

.node-content:hover {
  background: var(--color-hover);
}

.node-content.is-selected {
  background: var(--color-hover);
}

.node-content.is-folder-active {
  /* 活动文件夹不显示背景，只是用于内部逻辑 */
}

.node-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform 0.1s;
}

.node-chevron svg {
  transition: transform 0.15s ease;
  transform-origin: center;
  transform: rotate(0deg);
}

.node-chevron svg.is-expanded {
  transform: rotate(90deg);
}

.node-chevron-placeholder {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
  margin: 0 4px;
}

.node-name {
  flex: 1;
  font-size: 13px;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-name-input {
  flex: 1;
  background: var(--color-background);
  border: 1px solid var(--color-primary);
  border-radius: 2px;
  padding: 0 4px;
  font-size: 13px;
  outline: none;
  color: var(--color-text);
}

.node-children {
  /* 子节点容器 */
}
</style>

