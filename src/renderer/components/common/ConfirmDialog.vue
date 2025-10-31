<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="handleCancel">
      <div class="dialog-container">
        <div class="dialog-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="dialog-body">
          <p class="dialog-message">{{ message }}</p>
        </div>
        <div class="dialog-footer">
          <button 
            v-if="showCancel" 
            class="dialog-btn dialog-btn-cancel" 
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button 
            v-if="showDeny" 
            class="dialog-btn dialog-btn-deny" 
            @click="handleDeny"
          >
            {{ denyText }}
          </button>
          <button 
            class="dialog-btn dialog-btn-confirm" 
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  denyText?: string;
  showCancel?: boolean;
  showDeny?: boolean;
}>(), {
  title: '确认',
  message: '你确定要执行此操作吗？',
  confirmText: '确定',
  cancelText: '取消',
  denyText: '不保存',
  showCancel: true,
  showDeny: false,
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'deny'): void;
}>();

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
}

function handleDeny() {
  emit('deny');
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.dialog-container {
  background: var(--color-background);
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
}

.dialog-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.dialog-body {
  padding: 24px;
}

.dialog-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.dialog-footer {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--color-border);
}

.dialog-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.dialog-btn-cancel {
  background: var(--color-background-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.dialog-btn-cancel:hover {
  background: var(--color-background-tertiary);
}

.dialog-btn-deny {
  background: var(--color-background-secondary);
  color: var(--color-error);
  border: 1px solid var(--color-border);
}

.dialog-btn-deny:hover {
  background: var(--color-error);
  color: white;
}

.dialog-btn-confirm {
  background: var(--color-primary);
  color: white;
}

.dialog-btn-confirm:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.dialog-btn-confirm:active {
  transform: translateY(0);
}
</style>

