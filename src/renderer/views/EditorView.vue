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
import { ref, watch } from 'vue';
import { useTabStore } from '@renderer/stores/tab';
import MarkdownEditor from '@renderer/components/editor/MarkdownEditor.vue';
import type { Tab } from '@shared/types/tab';

const props = defineProps<{
  tab: Tab;
}>();

const tabStore = useTabStore();
const content = ref(props.tab.data?.content || '');
const mode = ref<'instant' | 'readonly' | 'wysiwyg'>('wysiwyg');

// 监听标签数据变化
watch(() => props.tab.data?.content, (newContent) => {
  if (newContent !== undefined && newContent !== content.value) {
    content.value = newContent;
  }
});

// 监听内容变化
watch(content, (newContent, oldContent) => {
  if (newContent !== oldContent) {
    // 标记为已修改
    tabStore.setTabDirty(props.tab.id, true);
  }
});

function handleChange(newContent: string) {
  content.value = newContent;
  
  // 自动保存逻辑
  // TODO: 实现自动保存到文件系统
  console.log('Content changed, auto-save...');
}

function handleSave() {
  console.log('Save:', content.value);
  // TODO: 保存到文件系统
  tabStore.setTabDirty(props.tab.id, false);
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

