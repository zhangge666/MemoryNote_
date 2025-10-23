<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="context-menu"
      :style="menuStyle"
      @click.stop
      @contextmenu.prevent
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="menu-item"
        :class="{ 'is-divider': item.divider, 'is-disabled': item.disabled }"
        @click="handleItemClick(item)"
      >
        <template v-if="!item.divider">
          <span class="menu-item-icon" v-if="item.icon">{{ item.icon }}</span>
          <span class="menu-item-label">{{ item.label }}</span>
          <span class="menu-item-shortcut" v-if="item.shortcut">{{ item.shortcut }}</span>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

export interface ContextMenuItem {
  label?: string;
  icon?: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

const menuRef = ref<HTMLDivElement>();

const menuStyle = computed(() => {
  return {
    left: `${props.x}px`,
    top: `${props.y}px`,
  };
});

function handleItemClick(item: ContextMenuItem) {
  if (item.disabled || item.divider) return;
  
  if (item.action) {
    item.action();
  }
  
  close();
}

function close() {
  emit('update:visible', false);
  emit('close');
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    close();
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      // 确保菜单不超出屏幕
      if (menuRef.value) {
        const rect = menuRef.value.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (rect.right > windowWidth) {
          menuRef.value.style.left = `${windowWidth - rect.width - 10}px`;
        }
        
        if (rect.bottom > windowHeight) {
          menuRef.value.style.top = `${windowHeight - rect.height - 10}px`;
        }
      }
    });
    
    // 延迟注册事件监听器，避免与触发右键菜单的事件冲突
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);
  } else {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('contextmenu', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('contextmenu', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 10000;
  background: var(--color-background-secondary, #2a2a2a);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  padding: 4px;
  min-width: 180px;
  max-width: 300px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  border-radius: 4px;
  user-select: none;
}

.menu-item:not(.is-divider):not(.is-disabled):hover {
  background: var(--color-hover);
}

.menu-item.is-disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.5;
}

.menu-item.is-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
  padding: 0;
  cursor: default;
}

.menu-item-icon {
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
}

.menu-item-label {
  flex: 1;
}

.menu-item-shortcut {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--color-text-muted);
  opacity: 0.7;
}
</style>

