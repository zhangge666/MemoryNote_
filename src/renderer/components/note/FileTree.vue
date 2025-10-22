<template>
  <div class="file-tree">
    <!-- 工具栏 -->
    <div class="tree-toolbar">
      <button class="toolbar-btn" @click="handleCreateNote" :title="t('note.newNote')">
        <i class="icon">📝</i>
      </button>
      <button class="toolbar-btn" @click="handleCreateFolder" :title="t('note.newFolder')">
        <i class="icon">📁</i>
      </button>
      <button class="toolbar-btn" @click="handleRefresh" :title="t('note.refresh')">
        <i class="icon">🔄</i>
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="tree-search">
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="t('note.searchPlaceholder')"
        class="search-input"
        @input="handleSearch"
      />
    </div>

    <!-- 树形列表 -->
    <div class="tree-content" v-if="!isSearching">
      <div v-if="treeNodes.length === 0" class="tree-empty">
        <p>{{ t('note.emptyTree') }}</p>
        <button @click="handleCreateNote" class="create-first-note">
          {{ t('note.createFirstNote') }}
        </button>
      </div>
      <FileTreeNode
        v-for="node in treeNodes"
        :key="node.id"
        :node="node"
        :level="0"
        @select="handleSelectNode"
        @context-menu="handleContextMenu"
      />
    </div>

    <!-- 搜索结果 -->
    <div class="tree-search-results" v-else>
      <div v-if="searchResults.length === 0" class="search-empty">
        {{ t('note.noSearchResults') }}
      </div>
      <div
        v-for="note in searchResults"
        :key="note.id"
        class="search-result-item"
        @click="handleSelectNote(note)"
      >
        <div class="result-title">{{ note.title }}</div>
        <div class="result-excerpt">{{ note.excerpt }}</div>
        <div class="result-meta">
          <span class="result-date">{{ formatDate(note.updatedAt) }}</span>
          <span class="result-words">{{ note.wordCount }} {{ t('note.words') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { noteService } from '@renderer/services/NoteService';
import FileTreeNode from './FileTreeNode.vue';
import type { FileTreeNode as IFileTreeNode, Note } from '@shared/types/note';

const emit = defineEmits<{
  (e: 'select-note', note: Note): void;
  (e: 'create-note'): void;
  (e: 'create-folder'): void;
}>();

const { t } = useI18n();

const treeNodes = ref<IFileTreeNode[]>([]);
const searchQuery = ref('');
const searchResults = ref<Note[]>([]);
const isSearching = computed(() => searchQuery.value.trim().length > 0);

// 加载文件树
async function loadFileTree() {
  try {
    const [folders, notes] = await Promise.all([
      noteService.getFolderTree(),
      noteService.getNotes(),
    ]);

    treeNodes.value = noteService.buildFileTree(folders, notes);
  } catch (error) {
    console.error('加载文件树失败:', error);
  }
}

// 搜索笔记
let searchTimer: number | null = null;
async function handleSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  // 防抖
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  searchTimer = window.setTimeout(async () => {
    try {
      searchResults.value = await noteService.searchNotes(searchQuery.value);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  }, 300);
}

// 选择节点
function handleSelectNode(node: IFileTreeNode) {
  if (node.type === 'note') {
    loadAndSelectNote(node.id);
  }
}

// 选择笔记
function handleSelectNote(note: Note) {
  emit('select-note', note);
}

// 加载并选择笔记
async function loadAndSelectNote(noteId: string) {
  try {
    const note = await noteService.getNote(noteId);
    if (note) {
      emit('select-note', note);
    }
  } catch (error) {
    console.error('加载笔记失败:', error);
  }
}

// 创建笔记
function handleCreateNote() {
  emit('create-note');
}

// 创建文件夹
function handleCreateFolder() {
  emit('create-folder');
}

// 刷新
function handleRefresh() {
  loadFileTree();
}

// 右键菜单
function handleContextMenu(node: IFileTreeNode) {
  // TODO: 实现右键菜单
  console.log('Context menu:', node);
}

// 格式化日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return t('note.justNow');
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)} ${t('note.minutesAgo')}`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)} ${t('note.hoursAgo')}`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)} ${t('note.daysAgo')}`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}

// 初始化
onMounted(() => {
  loadFileTree();
});

// 暴露方法供外部调用
defineExpose({
  refresh: loadFileTree,
});
</script>

<style scoped>
.file-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background);
}

.tree-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toolbar-btn:hover {
  background: var(--color-hover);
}

.toolbar-btn .icon {
  font-size: 16px;
  font-style: normal;
}

.tree-search {
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.tree-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.tree-empty p {
  margin-bottom: 1rem;
}

.create-first-note {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: var(--color-primary);
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
}

.create-first-note:hover {
  opacity: 0.9;
}

.tree-search-results {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.search-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.search-result-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background: var(--color-hover);
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.result-excerpt {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 11px;
  color: var(--color-text-tertiary);
}

/* 滚动条样式 */
.tree-content::-webkit-scrollbar,
.tree-search-results::-webkit-scrollbar {
  width: 6px;
}

.tree-content::-webkit-scrollbar-thumb,
.tree-search-results::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.tree-content::-webkit-scrollbar-thumb:hover,
.tree-search-results::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}
</style>


