<template>
  <div class="file-tree">
    <!-- 工具栏 -->
    <div class="tree-toolbar">
      <button class="toolbar-btn" @click="handleNewNote" title="新建笔记">
        <svg viewBox="0 0 16 16" width="16" height="16">
          <path fill="currentColor" d="M9.5 1.1l3.4 3.5.1.4v9l-.5.5h-11l-.5-.5v-12l.5-.5h7.5l.5.1zM9 2v3h3l-3-3zM3 13h10V6H8.5L8 5.5V2H3v11z"/>
          <path fill="currentColor" d="M6 7h4v1H6V7zm0 2h4v1H6V9z"/>
        </svg>
      </button>
      <button class="toolbar-btn" @click="handleNewFolder" title="新建文件夹">
        <svg viewBox="0 0 16 16" width="16" height="16">
          <path fill="currentColor" d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13h-12V7h4.49l.35-.15.86-.86H14v1.5l-.01 4zm0-6.49h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99z"/>
        </svg>
      </button>
      <div class="toolbar-spacer"></div>
      <button class="toolbar-btn" @click="handleRefresh" title="刷新">
        <svg viewBox="0 0 16 16" width="16" height="16">
          <path fill="currentColor" d="M13.451 5.609l-.579-.939-1.068.812-.076.094c-.335.415-.714.822-1.139 1.197a6.169 6.169 0 0 1-1.579 1.123 5.997 5.997 0 0 1-3.07.686 6.084 6.084 0 0 1-1.227-.183 6.008 6.008 0 0 1-1.168-.498 6.04 6.04 0 0 1-1.03-.739 6.01 6.01 0 0 1-.868-.989c-.253-.393-.46-.82-.617-1.27a6.044 6.044 0 0 1-.252-1.775c.05-.614.201-1.22.451-1.776a5.917 5.917 0 0 1 1.041-1.555 5.957 5.957 0 0 1 1.55-1.14c.585-.304 1.231-.504 1.905-.589.683-.086 1.372-.025 2.028.18.657.204 1.278.527 1.83.952.55.425 1.023.957 1.396 1.569l.828-1.062-1.124-.864-.577.931c-.423-.64-.964-1.217-1.596-1.697-.631-.478-1.352-.855-2.119-1.097a7.006 7.006 0 0 0-2.466-.22 7.032 7.032 0 0 0-2.314.717A7.05 7.05 0 0 0 2.74 2.883a7.042 7.042 0 0 0-1.263 1.888 7.015 7.015 0 0 0-.55 2.168c-.014.755.109 1.508.365 2.213.256.704.643 1.352 1.142 1.909.498.556 1.101 1.014 1.774 1.349a7.005 7.005 0 0 0 2.212.564c.782.026 1.563-.098 2.298-.363a7.001 7.001 0 0 0 1.952-1.11 6.97 6.97 0 0 0 1.44-1.512c.377-.569.674-1.198.879-1.854z"/>
        </svg>
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="tree-search">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索笔记..."
        class="search-input"
        @input="handleSearch"
      />
    </div>


    <!-- 文件树内容 -->
    <div class="tree-content" v-if="!isSearching" @click="handleContentClick">
      <div v-if="treeNodes.length === 0" class="tree-empty">
        <p>暂无笔记</p>
        <button @click="handleNewNote" class="create-first-btn">创建第一个笔记</button>
      </div>
      
      <div v-else class="tree-nodes">
        <TreeNode
          v-for="node in treeNodes"
          :key="node.id"
          :node="node"
          :level="0"
          :active-id="activeNodeId"
          :active-folder-id="activeFolderId"
          :editing-node-id="editingNodeId"
          @select="handleSelectNode"
          @activate="handleActivateFolder"
          @toggle="handleToggleExpand"
          @context-menu="handleContextMenu"
          @edit-confirm="handleEditConfirm"
          @edit-cancel="handleEditCancel"
        />
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="tree-search-results" v-else>
      <div v-if="searchResults.length === 0" class="search-empty">
        未找到匹配的笔记
      </div>
      <div
        v-for="note in searchResults"
        :key="note.id"
        class="search-result-item"
        @click="handleSelectNote(note)"
      >
        <div class="result-title">{{ note.title }}</div>
        <div class="result-excerpt">{{ note.excerpt }}</div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <ContextMenu
      v-model:visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { noteService } from '@renderer/services/NoteService';
import TreeNode from './TreeNode.vue';
import ContextMenu from '@renderer/components/common/ContextMenu.vue';
import type { ContextMenuItem } from '@renderer/components/common/ContextMenu.vue';
import type { FileTreeNode as IFileTreeNode, Note } from '@shared/types/note';

const emit = defineEmits<{
  (e: 'select-note', note: Note): void;
}>();

const treeNodes = ref<IFileTreeNode[]>([]);
const searchQuery = ref('');
const searchResults = ref<Note[]>([]);
const isSearching = computed(() => searchQuery.value.trim().length > 0);

// 当前选中的节点
const activeNodeId = ref<string | null>(null);

// 当前活动的文件夹（用于新建操作）
const activeFolderId = ref<string | null>(null);

// 右键菜单
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextMenuItems = ref<ContextMenuItem[]>([]);
const currentContextNode = ref<IFileTreeNode | null>(null);

// 编辑状态
const editingNodeId = ref<string | null>(null);
const creatingNodeType = ref<'note' | 'folder' | null>(null);

// 保存展开状态（内存）
function saveExpandedState(): Set<string> {
  const expandedIds = new Set<string>();
  
  const collectExpanded = (nodes: IFileTreeNode[]) => {
    for (const node of nodes) {
      if (node.isExpanded) {
        expandedIds.add(node.id);
      }
      if (node.children) {
        collectExpanded(node.children);
      }
    }
  };
  
  collectExpanded(treeNodes.value);
  return expandedIds;
}

// 持久化展开状态到配置
async function persistExpandedState() {
  const expandedIds = saveExpandedState();
  const expandedArray = Array.from(expandedIds);
  
  try {
    await window.electronAPI.invoke('config:set', 'fileTree.expandedFolders', expandedArray);
    console.log('💾 已保存文件夹展开状态:', expandedArray);
  } catch (error) {
    console.error('保存展开状态失败:', error);
  }
}

// 从配置中加载展开状态
async function loadExpandedState(): Promise<Set<string>> {
  try {
    const expandedArray = await window.electronAPI.invoke('config:get', 'fileTree.expandedFolders') || [];
    console.log('📂 已加载文件夹展开状态:', expandedArray);
    return new Set(expandedArray);
  } catch (error) {
    console.error('加载展开状态失败:', error);
    return new Set();
  }
}

// 恢复展开状态
function restoreExpandedState(nodes: IFileTreeNode[], expandedIds: Set<string>) {
  for (const node of nodes) {
    if (expandedIds.has(node.id)) {
      node.isExpanded = true;
    }
    if (node.children) {
      restoreExpandedState(node.children, expandedIds);
    }
  }
}

// 加载文件树
async function loadFileTree(preserveState = true) {
  try {
    let expandedIds: Set<string>;
    
    if (preserveState) {
      // 如果已经有树节点，保存当前展开状态
      if (treeNodes.value.length > 0) {
        expandedIds = saveExpandedState();
      } else {
        // 首次加载，从配置中读取
        expandedIds = await loadExpandedState();
      }
    } else {
      expandedIds = new Set<string>();
    }
    
    const [folders, notes] = await Promise.all([
      noteService.getFolderTree(),
      noteService.getNotes(),
    ]);

    const tree = noteService.buildFileTree(folders, notes);
    
    // 恢复展开状态
    if (preserveState) {
      restoreExpandedState(tree, expandedIds);
    }
    
    treeNodes.value = tree;
  } catch (error) {
    console.error('加载文件树失败:', error);
  }
}

// 选择节点
function handleSelectNode(node: IFileTreeNode) {
  activeNodeId.value = node.id;
  
  if (node.type === 'note') {
    // 找到该笔记所在的文件夹并设为活动文件夹
    const findParentFolder = (nodes: IFileTreeNode[], targetId: string, parentId: string | null = null): string | null => {
      for (const n of nodes) {
        if (n.id === targetId) {
          return parentId;
        }
        if (n.children) {
          const found = findParentFolder(n.children, targetId, n.id);
          if (found !== undefined) return found;
        }
      }
      return undefined;
    };
    
    const parentFolderId = findParentFolder(treeNodes.value, node.id);
    if (parentFolderId !== undefined) {
      activeFolderId.value = parentFolderId;
    }
    
    loadAndSelectNote(node.id);
  }
}

// 激活文件夹（单击文件夹）
function handleActivateFolder(folderId: string) {
  activeFolderId.value = folderId;
  activeNodeId.value = folderId; // 设置选中状态
}

// 展开/折叠
function handleToggleExpand(nodeId: string) {
  const toggleNode = (nodes: IFileTreeNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        node.isExpanded = !node.isExpanded;
        return true;
      }
      if (node.children && toggleNode(node.children)) {
        return true;
      }
    }
    return false;
  };
  
  const toggled = toggleNode(treeNodes.value);
  
  // 持久化展开状态
  if (toggled) {
    persistExpandedState();
  }
}

// 生成唯一名称（只在当前活动文件夹下检查）
function generateUniqueName(baseName: string, type: 'note' | 'folder'): string {
  const existingNames = new Set<string>();
  
  // 查找活动文件夹
  let targetNodes: IFileTreeNode[] = treeNodes.value;
  
  if (activeFolderId.value) {
    const findFolder = (nodes: IFileTreeNode[]): IFileTreeNode | null => {
      for (const node of nodes) {
        if (node.id === activeFolderId.value) return node;
        if (node.children) {
          const found = findFolder(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const activeFolder = findFolder(treeNodes.value);
    if (activeFolder && activeFolder.children) {
      targetNodes = activeFolder.children;
    }
  }
  
  // 收集当前目录下的同类型名称
  const collectNames = (nodes: IFileTreeNode[]) => {
    for (const node of nodes) {
      if (node.type === type) {
        existingNames.add(node.name);
      }
    }
  };
  
  collectNames(targetNodes);
  
  if (!existingNames.has(baseName)) {
    return baseName;
  }
  
  let counter = 1;
  let newName = `${baseName}_${counter}`;
  
  while (existingNames.has(newName)) {
    counter++;
    newName = `${baseName}_${counter}`;
  }
  
  return newName;
}

// 新建笔记
async function handleNewNote() {
  try {
    // 如果活动文件夹未展开，先展开它
    if (activeFolderId.value) {
      const toggleNode = (nodes: IFileTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === activeFolderId.value && !node.isExpanded) {
            node.isExpanded = true;
            return true;
          }
          if (node.children && toggleNode(node.children)) {
            return true;
          }
        }
        return false;
      };
      const expanded = toggleNode(treeNodes.value);
      // 持久化展开状态
      if (expanded) {
        persistExpandedState();
      }
    }
    
    const defaultTitle = generateUniqueName('未命名笔记', 'note');
    
    // 创建临时节点用于编辑
    const tempNode: IFileTreeNode = {
      id: `temp-${Date.now()}`,
      name: defaultTitle,
      type: 'note',
      path: '',
      isExpanded: false,
    };
    
    // 将临时节点插入到树中
    if (activeFolderId.value) {
      const insertNode = (nodes: IFileTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === activeFolderId.value) {
            if (!node.children) node.children = [];
            node.children.unshift(tempNode);
            return true;
          }
          if (node.children && insertNode(node.children)) {
            return true;
          }
        }
        return false;
      };
      insertNode(treeNodes.value);
    } else {
      treeNodes.value = [tempNode, ...treeNodes.value];
    }
    
    // 进入编辑模式
    await nextTick();
    creatingNodeType.value = 'note';
    editingNodeId.value = tempNode.id;
  } catch (error) {
    console.error('创建笔记失败:', error);
  }
}

// 点击树内容区域
function handleContentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  // 如果点击的是 tree-content 或 tree-nodes，重置活动文件夹和选中状态
  if (target.classList.contains('tree-content') || target.classList.contains('tree-nodes')) {
    activeFolderId.value = null;
    activeNodeId.value = null; // 取消选中效果
    console.log('🖱️ 点击空白区域，已清空选中状态');
  }
}

// 新建文件夹
async function handleNewFolder() {
  try {
    // 如果活动文件夹未展开，先展开它
    if (activeFolderId.value) {
      const toggleNode = (nodes: IFileTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === activeFolderId.value && !node.isExpanded) {
            node.isExpanded = true;
            return true;
          }
          if (node.children && toggleNode(node.children)) {
            return true;
          }
        }
        return false;
      };
      const expanded = toggleNode(treeNodes.value);
      // 持久化展开状态
      if (expanded) {
        persistExpandedState();
      }
    }
    
    const defaultName = generateUniqueName('新增文件夹', 'folder');
    
    // 创建临时节点用于编辑
    const tempNode: IFileTreeNode = {
      id: `temp-${Date.now()}`,
      name: defaultName,
      type: 'folder',
      path: '',
      isExpanded: false,
      children: [],
    };
    
    // 将临时节点插入到树中
    if (activeFolderId.value) {
      const insertNode = (nodes: IFileTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === activeFolderId.value) {
            if (!node.children) node.children = [];
            node.children.unshift(tempNode);
            return true;
          }
          if (node.children && insertNode(node.children)) {
            return true;
          }
        }
        return false;
      };
      insertNode(treeNodes.value);
    } else {
      treeNodes.value = [tempNode, ...treeNodes.value];
    }
    
    // 进入编辑模式
    await nextTick();
    creatingNodeType.value = 'folder';
    editingNodeId.value = tempNode.id;
  } catch (error) {
    console.error('创建文件夹失败:', error);
  }
}

// 刷新
function handleRefresh() {
  loadFileTree(false);
}

// 搜索
let searchTimer: number | null = null;
async function handleSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  if (searchTimer) clearTimeout(searchTimer);

  searchTimer = window.setTimeout(async () => {
    try {
      searchResults.value = await noteService.searchNotes(searchQuery.value);
    } catch (error) {
      console.error('搜索失败:', error);
    }
  }, 300);
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

// 选择笔记（搜索结果）
function handleSelectNote(note: Note) {
  emit('select-note', note);
}

// 右键菜单
function handleContextMenu(node: IFileTreeNode, event: MouseEvent) {
  currentContextNode.value = node;
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  
  const items: ContextMenuItem[] = [];
  
  if (node.type === 'note') {
    items.push(
      { label: '打开', icon: '📂', action: () => handleSelectNode(node) },
      { divider: true },
      { label: '重命名', icon: '✏️', action: () => handleRename(node) },
      { label: '删除', icon: '🗑️', action: () => handleDelete(node) },
      { divider: true },
      { label: '在文件管理器中显示', icon: '📁', action: () => handleShowInExplorer(node) }
    );
  } else {
    items.push(
      { label: '新建笔记', icon: '📝', action: () => { activeFolderId.value = node.id; handleNewNote(); } },
      { label: '新建文件夹', icon: '📁', action: () => { activeFolderId.value = node.id; handleNewFolder(); } },
      { divider: true },
      { label: '设为活动文件夹', icon: '📌', action: () => activeFolderId.value = node.id },
      { divider: true },
      { label: '重命名', icon: '✏️', action: () => handleRename(node) },
      { label: '删除', icon: '🗑️', action: () => handleDelete(node) },
      { divider: true },
      { label: '在文件管理器中显示', icon: '📁', action: () => handleShowInExplorer(node) }
    );
  }
  
  contextMenuItems.value = items;
  contextMenuVisible.value = true;
}

// 删除
async function handleDelete(node: IFileTreeNode) {
  try {
    const config = await window.electronAPI.invoke('config:get', 'ui');
    const skipConfirm = config?.skipDeleteConfirm || false;
    
    let shouldDelete = false;
    
    if (!skipConfirm) {
      const result = await window.electronAPI.dialog.showMessage({
        type: 'warning',
        title: '确认删除',
        message: `确定要删除${node.type === 'note' ? '笔记' : '文件夹'}"${node.name}"吗？${node.type === 'folder' ? '此操作将删除文件夹内的所有内容。' : ''}`,
        buttons: ['取消', '删除'],
        defaultId: 0,
        cancelId: 0,
        checkboxLabel: '不再提示',
        checkboxChecked: false,
      });
      
      shouldDelete = result.response === 1;
      
      if (result.checkboxChecked && shouldDelete) {
        const uiConfig = config || {};
        uiConfig.skipDeleteConfirm = true;
        await window.electronAPI.invoke('config:set', 'ui', uiConfig);
      }
    } else {
      shouldDelete = true;
    }
    
    if (shouldDelete) {
      if (node.type === 'note') {
        await noteService.deleteNote(node.id);
      } else {
        await noteService.deleteFolder(node.id);
      }
      await loadFileTree();
    }
  } catch (error) {
    console.error('删除失败:', error);
  }
}

// 重命名
function handleRename(node: IFileTreeNode) {
  currentContextNode.value = node;
  editingNodeId.value = node.id;
}

// 查找节点
function findNodeById(nodes: IFileTreeNode[], id: string): IFileTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 处理编辑确认
async function handleEditConfirm(nodeId: string, newName: string) {
  console.log('✏️ 确认编辑:', { nodeId, newName, creatingNodeType: creatingNodeType.value, activeFolderId: activeFolderId.value });
  
  try {
    if (creatingNodeType.value) {
      // 新建节点
      if (creatingNodeType.value === 'note') {
        console.log('📝 创建新笔记...');
        const note = await noteService.createNote({
          title: newName,
          content: '',
          folderId: activeFolderId.value || undefined,
        });
        console.log('✅ 笔记创建成功:', note);
        
        await loadFileTree();
        emit('select-note', note);
        activeNodeId.value = note.id;
      } else {
        console.log('📁 创建新文件夹...', { name: newName, parentId: activeFolderId.value });
        const result = await noteService.createFolder({
          name: newName,
          parentId: activeFolderId.value || undefined,
        });
        console.log('✅ 文件夹创建成功:', result);
        
        await loadFileTree();
      }
      
      creatingNodeType.value = null;
    } else {
      // 重命名现有节点
      const node = findNodeById(treeNodes.value, nodeId);
      if (!node) {
        console.error('❌ 未找到节点:', nodeId);
        return;
      }
      
      console.log('✏️ 重命名节点:', { type: node.type, id: node.id, oldName: node.name, newName });
      
      if (node.type === 'note') {
        await noteService.updateNote({ id: node.id, title: newName });
        console.log('✅ 笔记重命名成功');
      } else {
        await noteService.updateFolder(node.id, { name: newName });
        console.log('✅ 文件夹重命名成功');
      }
      
      await loadFileTree(true);
    }
    
    // 只在成功时清空编辑状态
    editingNodeId.value = null;
    currentContextNode.value = null;
    console.log('✅ 编辑操作完成');
  } catch (error) {
    console.error('❌ 操作失败:', error);
    // 出错时不清空编辑状态，让用户可以继续编辑
  }
}

// 处理编辑取消
function handleEditCancel(nodeId: string) {
  editingNodeId.value = null;
  creatingNodeType.value = null;
  
  // 移除临时节点
  if (nodeId.startsWith('temp-')) {
    const removeNode = (nodes: IFileTreeNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children && removeNode(nodes[i].children!)) {
          return true;
        }
      }
      return false;
    };
    removeNode(treeNodes.value);
  }
}

// 在文件管理器中显示
async function handleShowInExplorer(node: IFileTreeNode) {
  try {
    const config = await window.electronAPI.invoke('config:get', 'app');
    const workspace = config?.workspace || '';
    const fullPath = `${workspace}/notes/${node.path}`;
    
    await window.electronAPI.invoke('app:show-in-folder', fullPath);
  } catch (error) {
    console.error('打开文件管理器失败:', error);
  }
}

// 监听工作区切换
const handleWorkspaceChanged = () => {
  searchQuery.value = '';
  searchResults.value = [];
  activeFolderId.value = null;
  activeNodeId.value = null;
  loadFileTree(false);
};

onMounted(() => {
  // 首次加载时恢复展开状态
  loadFileTree(true);
  
  if (window.electronAPI) {
    window.electronAPI.on('workspace:changed', handleWorkspaceChanged);
  }
});

onUnmounted(() => {
  // 卸载前保存展开状态
  persistExpandedState();
  
  if (window.electronAPI) {
    window.electronAPI.off('workspace:changed', handleWorkspaceChanged);
  }
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

/* 工具栏 */
.tree-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.toolbar-btn:hover {
  background: var(--color-hover);
  color: var(--color-text);
}

.toolbar-spacer {
  flex: 1;
}

/* 搜索框 */
.tree-search {
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  width: 100%;
  padding: 6px 8px;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 13px;
  outline: none;
}

.search-input:focus {
  border-color: var(--color-primary);
}

/* 树内容 */
.tree-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.tree-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted);
}

.create-first-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.create-first-btn:hover {
  background: var(--color-primary-hover);
}

.tree-nodes {
  padding: 4px 0;
}

/* 搜索结果 */
.tree-search-results {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.search-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

.search-result-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: var(--color-hover);
}

.result-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 4px;
}

.result-excerpt {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

