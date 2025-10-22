<template>
  <div
    class="split-resize-handle"
    :class="{
      'split-resize-handle-horizontal': direction === 'horizontal',
      'split-resize-handle-vertical': direction === 'vertical',
      'is-resizing': isResizing,
    }"
    @mousedown="startResize"
  >
    <div class="split-resize-handle-line"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  direction: 'horizontal' | 'vertical';
}>();

const emit = defineEmits<{
  (e: 'resize', delta: number): void;
}>();

const isResizing = ref(false);
let startPosition = 0;

function startResize(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  
  isResizing.value = true;
  startPosition = props.direction === 'horizontal' ? e.clientX : e.clientY;
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = props.direction === 'horizontal' ? 'col-resize' : 'row-resize';
  document.body.style.userSelect = 'none';
}

function handleMouseMove(e: MouseEvent) {
  if (!isResizing.value) return;
  
  const currentPosition = props.direction === 'horizontal' ? e.clientX : e.clientY;
  const delta = currentPosition - startPosition;
  
  emit('resize', delta);
  startPosition = currentPosition;
}

function stopResize() {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
}
</script>

<style scoped>
.split-resize-handle {
  position: relative;
  flex-shrink: 0;
  background: var(--color-border);
  transition: background-color 0.2s;
  z-index: 10;
}

.split-resize-handle-horizontal {
  width: 4px;
  cursor: col-resize;
}

.split-resize-handle-vertical {
  height: 4px;
  cursor: row-resize;
}

.split-resize-handle:hover,
.split-resize-handle.is-resizing {
  background: var(--color-primary);
}

.split-resize-handle-line {
  position: absolute;
  background: var(--color-border);
  transition: all 0.2s;
  opacity: 0.4;
}

.split-resize-handle-horizontal .split-resize-handle-line {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1.5px;
  height: 50px;
}

.split-resize-handle-vertical .split-resize-handle-line {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 1.5px;
}

.split-resize-handle:hover .split-resize-handle-line,
.split-resize-handle.is-resizing .split-resize-handle-line {
  opacity: 1;
  background: var(--color-primary);
}

.split-resize-handle-horizontal:hover .split-resize-handle-line,
.split-resize-handle-horizontal.is-resizing .split-resize-handle-line {
  width: 2px;
  height: 70px;
}

.split-resize-handle-vertical:hover .split-resize-handle-line,
.split-resize-handle-vertical.is-resizing .split-resize-handle-line {
  width: 70px;
  height: 2px;
}
</style>


