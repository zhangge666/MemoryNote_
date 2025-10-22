<template>
  <div class="tree-node">
    <div
      class="node-content"
      :class="{ 'is-selected': isSelected, 'is-folder': node.type === 'folder' }"
      :style="{ paddingLeft: `${level * 1.25 + 0.5}rem` }"
      @click="handleClick"
      @contextmenu.prevent="handleContextMenu"
    >
      <!-- 展开/折叠图标 -->
      <span
        v-if="node.type === 'folder'"
        class="expand-icon"
        :class="{ 'is-expanded': isExpanded }"
        @click.stop="toggleExpand"
      >
        ▶
      </span>
      <span v-else class="expand-placeholder"></span>

      <!-- 节点图标 -->
      <span class="node-icon" :style="{ color: node.color }">
        {{ getIcon() }}
      </span>

      <!-- 节点名称 -->
      <span class="node-name">{{ node.name }}</span>

      <!-- 操作按钮 -->
      <div class="node-actions" @click.stop>
        <button
          v-if="node.type === 'folder'"
          class="action-btn"
          @click="handleAddNote"
          title="新建笔记"
        >
          +
        </button>
      </div>
    </div>

    <!-- 子节点 -->
    <div v-if="node.type === 'folder' && isExpanded && node.children" class="node-children">
      <FileTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        @select="$emit('select', $event)"
        @context-menu="$emit('context-menu', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FileTreeNode as IFileTreeNode } from '@shared/types/note';

const props = defineProps<{
  node: IFileTreeNode;
  level: number;
}>();

const emit = defineEmits<{
  (e: 'select', node: IFileTreeNode): void;
  (e: 'context-menu', node: IFileTreeNode): void;
}>();

const isExpanded = ref(props.node.isExpanded || false);
const isSelected = ref(false);

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function handleClick() {
  if (props.node.type === 'folder') {
    toggleExpand();
  }
  emit('select', props.node);
}

function handleContextMenu() {
  emit('context-menu', props.node);
}

function handleAddNote() {
  // TODO: 在该文件夹下创建笔记
  console.log('Add note to folder:', props.node.id);
}

function getIcon(): string {
  if (props.node.icon) {
    return props.node.icon;
  }
  
  if (props.node.type === 'folder') {
    return isExpanded.value ? '📂' : '📁';
  }
  
  return '📄';
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.node-content:hover {
  background: var(--color-hover);
}

.node-content.is-selected {
  background: var(--color-primary-light);
}

.expand-icon {
  flex-shrink: 0;
  width: 1rem;
  font-size: 10px;
  color: var(--color-text-secondary);
  transition: transform 0.2s;
  display: inline-block;
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
}

.expand-placeholder {
  flex-shrink: 0;
  width: 1rem;
}

.node-icon {
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
}

.node-name {
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-actions {
  display: none;
  align-items: center;
  gap: 0.25rem;
}

.node-content:hover .node-actions {
  display: flex;
}

.action-btn {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: var(--color-border);
}

.node-children {
  /* 子节点容器 */
}
</style>


