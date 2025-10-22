<template>
  <div 
    class="resize-handle"
    :class="[position === 'left' ? 'resize-handle-left' : 'resize-handle-right']"
    @mousedown="handleMouseDown"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  position: 'left' | 'right';
  currentWidth: number;
  minWidth?: number;
  maxWidth?: number;
}>();

const emit = defineEmits<{
  (e: 'resize-start'): void;
  (e: 'resize', width: number): void;
  (e: 'resize-end'): void;
}>();

let isResizing = false;
let startX = 0;
let startWidth = 0;

const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault();
  isResizing = true;
  startX = e.clientX;
  startWidth = props.currentWidth;
  
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  
  emit('resize-start');
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isResizing) return;
  
  // position="right" 表示拖拽条在右边缘（左侧栏），向右拖增加宽度
  // position="left" 表示拖拽条在左边缘（右侧栏），向左拖增加宽度
  const delta = props.position === 'right' 
    ? e.clientX - startX 
    : startX - e.clientX;
  
  const newWidth = startWidth + delta;
  const minWidth = props.minWidth ?? 200;
  const maxWidth = props.maxWidth ?? 600;
  const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
  
  emit('resize', clampedWidth);
};

const handleMouseUp = () => {
  if (!isResizing) return;
  
  isResizing = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  
  emit('resize-end');
};

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped>
.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 999;
  background-color: rgba(102, 126, 234, 0.05);
  transition: all 0.2s ease;
}

.resize-handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1.5px;
  height: 50px;
  background-color: var(--color-border);
  border-radius: 1px;
  opacity: 0.4;
  transition: all 0.2s ease;
}

.resize-handle:hover {
  background-color: rgba(102, 126, 234, 0.15);
}

.resize-handle:hover::before {
  opacity: 1;
  background-color: var(--color-primary);
  height: 70px;
  width: 2px;
}

.resize-handle:active {
  background-color: rgba(102, 126, 234, 0.25);
}

.resize-handle:active::before {
  opacity: 1;
  background-color: var(--color-primary);
  width: 2.5px;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
}

.resize-handle-right {
  right: 0;
}

.resize-handle-left {
  left: 0;
}
</style>

