<template>
  <div class="editor-view">
    <MarkdownEditor
      v-model="content"
      :mode="mode"
      :show-toolbar="true"
      @change="handleChange"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useTabStore } from '@renderer/stores/tab';
import { noteService } from '@renderer/services/NoteService';
import MarkdownEditor from '@renderer/components/editor/MarkdownEditor.vue';
import type { Tab } from '@shared/types/tab';

const props = defineProps<{
  tab: Tab;
}>();

const tabStore = useTabStore();
const content = ref(props.tab.data?.content || '');
const originalContent = ref(props.tab.data?.content || ''); // 保存原始内容用于比较
const mode = ref<'instant' | 'readonly' | 'wysiwyg'>('wysiwyg');

// 使用计算属性获取实时的tab数据
const currentTab = computed(() => tabStore.findTabById(props.tab.id));

// 监听标签数据变化（深度监听）
watch(() => currentTab.value?.data?.content, (newContent) => {
  if (newContent !== undefined && newContent !== content.value) {
    console.log('📝 Content synced from other tab:', newContent.substring(0, 50));
    content.value = newContent;
  }
}, { deep: true });

// 监听内容变化，检查是否与原始内容相同
watch(content, (newContent) => {
  const isDirty = newContent !== originalContent.value;
  tabStore.setTabDirty(props.tab.id, isDirty);
  
  if (isDirty) {
    console.log('📝 Content is dirty');
  } else {
    console.log('✅ Content restored to original state');
  }
});

function handleChange(newContent: string) {
  content.value = newContent;
  
  // 使用TabStore的updateTabContent方法同步到所有相同笔记的标签
  // 这会触发响应式更新
  tabStore.updateTabContent(props.tab.id, newContent);
  
  // 自动保存逻辑
  // TODO: 实现自动保存到文件系统（可以加个防抖）
  console.log('Content changed, will sync to other tabs...');
}

async function handleSave() {
  if (!props.tab.data?.noteId) {
    console.warn('No noteId found, cannot save');
    return;
  }

  try {
    console.log('💾 Saving note:', props.tab.data.noteId);
    
    // 保存到文件系统和数据库
    await noteService.updateNote({
      id: props.tab.data.noteId,
      content: content.value,
    });
    
    // 更新原始内容为当前内容
    originalContent.value = content.value;
    
    // 清除修改标记
    tabStore.setTabDirty(props.tab.id, false);
    
    console.log('✅ Note saved successfully');
  } catch (error) {
    console.error('❌ Failed to save note:', error);
    // TODO: 显示错误通知
  }
}
</script>

<style scoped>
.editor-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

