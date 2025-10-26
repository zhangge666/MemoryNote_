<template>
  <div 
    class="right-sidebar bg-background flex-shrink-0 relative"
    :class="{ 'no-transition': sidebarStore.isResizing && sidebarStore.resizingSide === 'right' }"
    :style="{ width: `${currentWidth}px`, minWidth: `${currentWidth}px` }"
  >
    <!-- 内容区域 -->
    <div 
      class="h-full p-4 overflow-hidden" 
      :style="{ width: `${sidebarStore.rightWidth}px`, opacity: sidebarStore.rightVisible ? 1 : 0 }"
    >
      <slot>
        <!-- 默认内容 -->
        <h3 class="text-sm font-semibold mb-4">右侧面板UI插槽</h3>
        <p class="text-sm text-text-muted">AI助手及插件注册页面可以在此处展示</p>
      </slot>
    </div>

    <!-- 拖拽调整宽度的分隔条 (在左边缘) -->
    <ResizeHandle
      v-show="sidebarStore.rightVisible"
      position="left"
      :current-width="currentWidth"
      @resize-start="handleResizeStart"
      @resize="handleResize"
      @resize-end="handleResizeEnd"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSidebarStore } from '@renderer/stores/sidebar';
import ResizeHandle from './ResizeHandle.vue';

const sidebarStore = useSidebarStore();

// 当前显示的宽度（用于动画）
const currentWidth = ref(sidebarStore.rightVisible ? sidebarStore.rightWidth : 0);

// 监听显示状态变化，触发动画
watch(() => sidebarStore.rightVisible, (newVal) => {
  if (newVal) {
    // 展开：先确保宽度为 0，然后在短暂延迟后过渡到目标宽度
    currentWidth.value = 0;
    setTimeout(() => {
      currentWidth.value = sidebarStore.rightWidth;
    }, 10);
  } else {
    // 收起：直接过渡到 0
    currentWidth.value = 0;
  }
});

// 拖拽调整宽度
const handleResizeStart = () => {
  sidebarStore.startResize('right');
};

const handleResize = (width: number) => {
  sidebarStore.setRightWidth(width);
  currentWidth.value = width;
};

const handleResizeEnd = () => {
  sidebarStore.stopResize();
};
</script>

<style scoped>
.right-sidebar {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-md);
  will-change: width;
}

.right-sidebar > div {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 拖动时禁用过渡动画 */
.no-transition,
.no-transition > div {
  transition: none !important;
}
</style>

