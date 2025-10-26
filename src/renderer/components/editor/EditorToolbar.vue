<template>
  <div class="editor-toolbar">
    <!-- 撤销/重做 -->
    <div class="toolbar-group">
      <button class="toolbar-btn" @click="emit('command', 'undo')" :disabled="!canUndo" :title="t('editor.undo')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
        </svg>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'redo')" :disabled="!canRedo" :title="t('editor.redo')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 7v6h-6"></path>
          <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path>
        </svg>
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <!-- 文本样式 -->
    <div class="toolbar-group">
      <button class="toolbar-btn" @click="emit('command', 'bold')" :title="t('editor.bold')">
        <strong>B</strong>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'italic')" :title="t('editor.italic')">
        <em>I</em>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'strikethrough')" :title="t('editor.strikethrough')">
        <s>S</s>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'code')" :title="t('editor.code')">
        <code>&lt;/&gt;</code>
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" @click="emit('command', 'heading-1')" :title="t('editor.heading1')">
        H1
      </button>
      <button class="toolbar-btn" @click="emit('command', 'heading-2')" :title="t('editor.heading2')">
        H2
      </button>
      <button class="toolbar-btn" @click="emit('command', 'heading-3')" :title="t('editor.heading3')">
        H3
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" @click="emit('command', 'unordered-list')" :title="t('editor.bulletList')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'ordered-list')" :title="t('editor.numberedList')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="10" y1="6" x2="21" y2="6"></line>
          <line x1="10" y1="12" x2="21" y2="12"></line>
          <line x1="10" y1="18" x2="21" y2="18"></line>
          <path d="M4 6h1v4"></path>
          <path d="M4 10h2"></path>
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
        </svg>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'quote')" :title="t('editor.blockquote')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
        </svg>
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" @click="emit('command', 'link')" :title="t('editor.link')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'image')" :title="t('editor.image')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'code-block')" :title="t('editor.codeBlock')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'table')" :title="t('editor.table')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>
        </svg>
      </button>
      <button class="toolbar-btn" @click="emit('command', 'hr')" :title="t('editor.hr')">
        <svg class="toolbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="3" y1="12" x2="21" y2="12"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  canUndo: boolean;
  canRedo: boolean;
}>();

const emit = defineEmits<{
  (e: 'command', command: string): void;
}>();

const { t } = useI18n();
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text);
  transition: all 0.2s;
  font-size: 14px;
}

.toolbar-btn:hover {
  background: var(--color-hover);
  border-color: var(--color-border);
}

.toolbar-btn:active {
  background: var(--color-active);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
}
</style>


