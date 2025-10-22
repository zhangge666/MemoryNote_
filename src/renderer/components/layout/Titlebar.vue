<template>
  <div class="titlebar titlebar-drag flex items-center justify-between px-4 flex-shrink-0">
    <!-- 左侧：Logo + 应用名 + 侧边栏控制 -->
    <div class="flex items-center gap-3 titlebar-no-drag ml-2">
      <!-- App Icon -->
      <div class="app-icon flex items-center justify-center flex-shrink-0">
        <img src="/icon.svg" alt="Memory Note" class="app-icon-img" />
      </div>
      <span class="app-name text-sm font-semibold whitespace-nowrap text-text mr-2 ml-4">{{ t('app.name') }}</span>
      
      <button 
        @click="toggleLeftSidebar"
        class="p-1.5 flex-shrink-0 inline-flex items-center justify-center transition-colors hover:opacity-70"
        :title="t('navbar.toggleSidebar')"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- 右侧：右侧栏控制 + 窗口控制按钮 -->
    <div class="flex items-center gap-1 titlebar-no-drag">
      <button 
        @click="toggleRightSidebar"
        class="p-1.5 flex-shrink-0 inline-flex items-center justify-center transition-colors hover:opacity-70"
        :title="t('navbar.toggleRightSidebar')"
      >
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </button>

      <!-- 窗口控制按钮 -->
      <div class="flex items-center gap-1">
        <button 
          @click="minimizeWindow"
          class="window-btn p-1.5 flex-shrink-0 inline-flex items-center justify-center transition-all hover:opacity-70"
          :title="t('window.minimize')"
        >
          <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <rect x="4" y="7" width="8" height="2" rx="1"/>
          </svg>
        </button>

        <button 
          @click="toggleMaximize"
          class="window-btn p-1.5 flex-shrink-0 inline-flex items-center justify-center transition-all hover:opacity-70"
          :title="isMaximized ? t('window.restore') : t('window.maximize')"
        >
          <svg v-if="!isMaximized" class="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="3" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <svg v-else class="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 5V3.5C5 2.67 5.67 2 6.5 2H13.5C14.33 2 15 2.67 15 3.5V10.5C15 11.33 14.33 12 13.5 12H12" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <rect x="2" y="5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>

        <button 
          @click="closeWindow"
          class="close-btn p-1.5 flex-shrink-0 transition-all group inline-flex items-center justify-center hover:bg-error rounded-md"
          :title="t('window.close')"
        >
          <svg class="w-4 h-4 flex-shrink-0 group-hover:text-white transition-colors" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.757 3.757a1 1 0 011.415 0L8 6.586l2.828-2.829a1 1 0 111.415 1.415L9.414 8l2.829 2.828a1 1 0 01-1.415 1.415L8 9.414l-2.828 2.829a1 1 0 01-1.415-1.415L6.586 8 3.757 5.172a1 1 0 010-1.415z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useIPC } from '@renderer/composables/useIPC';
import { IPCChannel } from '@shared/interfaces/ipc';

const { t } = useI18n();
const ipc = useIPC();
const isMaximized = ref(false);

const emit = defineEmits<{
  (e: 'toggle-left-sidebar'): void;
  (e: 'toggle-right-sidebar'): void;
}>();

const minimizeWindow = async () => {
  await ipc.invoke(IPCChannel.WINDOW_MINIMIZE);
};

const toggleMaximize = async () => {
  await ipc.invoke(IPCChannel.WINDOW_MAXIMIZE);
};

const closeWindow = async () => {
  await ipc.invoke(IPCChannel.WINDOW_CLOSE);
};

const toggleLeftSidebar = () => {
  emit('toggle-left-sidebar');
};

const toggleRightSidebar = () => {
  emit('toggle-right-sidebar');
};

// 监听窗口状态变化
const handleMaximizeChange = (maximized: boolean) => {
  isMaximized.value = maximized;
};

onMounted(() => {
  ipc.on('window:maximized', () => handleMaximizeChange(true));
  ipc.on('window:unmaximized', () => handleMaximizeChange(false));
});

onUnmounted(() => {
  // 清理监听器
});
</script>

<style>

/* Window buttons */
.window-btn {
  color: var(--color-text-secondary);
}

.close-btn {
  color: var(--color-text-secondary);
}

/* 确保标题栏按钮显示正常 */
.titlebar button {
  min-width: 32px !important;
  min-height: 32px !important;
  width: 32px !important;
  height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
}

.titlebar button svg {
  flex-shrink: 0 !important;
  display: block !important;
}

/* 应用图标样式 */
.app-icon {
  width: 24px;
  height: 24px;
  margin-left: 12px;
  transition: all 0.2s ease;
}

.app-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* 根据主题调整图标显示效果 */
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15)) brightness(0.95);
  opacity: 0.9;
  transition: all 0.2s ease;
}

/* 深色主题下增强图标亮度和对比度 */
:root[data-theme="dark"] .app-icon-img {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)) brightness(1.15) contrast(1.1);
  opacity: 0.95;
}

.app-icon:hover .app-icon-img {
  opacity: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) brightness(1.05);
}

:root[data-theme="dark"] .app-icon:hover .app-icon-img {
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5)) brightness(1.25) contrast(1.15);
}

/* 应用名称样式 */
.app-name {
  user-select: none;
  -webkit-user-select: none;
  margin-left: 8px !important;
}
</style>

