<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="handleCancel">
      <div class="dialog-container">
        <div class="dialog-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="dialog-body">
          <input
            ref="inputRef"
            v-model="inputValue"
            type="text"
            class="dialog-input"
            :placeholder="placeholder"
            @keyup.enter="handleConfirm"
            @keyup.esc="handleCancel"
          />
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn dialog-btn-cancel" @click="handleCancel">
            取消
          </button>
          <button class="dialog-btn dialog-btn-confirm" @click="handleConfirm">
            确定
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps<{
  visible: boolean;
  title?: string;
  placeholder?: string;
  defaultValue?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm', value: string): void;
  (e: 'cancel'): void;
}>();

const inputRef = ref<HTMLInputElement>();
const inputValue = ref(props.defaultValue || '');

watch(() => props.visible, (newVal) => {
  if (newVal) {
    inputValue.value = props.defaultValue || '';
    nextTick(() => {
      inputRef.value?.focus();
      inputRef.value?.select();
    });
  }
});

function handleConfirm() {
  emit('confirm', inputValue.value);
}

function handleCancel() {
  emit('cancel');
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
  max-width: 400px;
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

.dialog-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-background-secondary);
  color: var(--color-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dialog-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
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


