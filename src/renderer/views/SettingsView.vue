<template>
  <div class="settings-view">
    <div class="settings-sidebar">
      <div class="settings-nav">
        <button
          v-for="category in categories"
          :key="category.id"
          class="settings-nav-item"
          :class="{ active: activeCategory === category.id }"
          @click="activeCategory = category.id"
        >
          <span class="settings-nav-icon">{{ category.icon }}</span>
          <span class="settings-nav-text">{{ t(category.label) }}</span>
        </button>
      </div>
    </div>
    <div class="settings-content">
      <div class="settings-header">
        <h1>{{ t(currentCategory?.label || '') }}</h1>
      </div>
      <div class="settings-body">
        <!-- 通用设置 -->
        <div v-if="activeCategory === 'general'" class="settings-section">
          <div class="setting-item">
            <label class="setting-label">{{ t('settings.language') }}</label>
            <select class="setting-select">
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">{{ t('settings.theme') }}</label>
            <select class="setting-select">
              <option value="light">{{ t('settings.themeLight') }}</option>
              <option value="dark">{{ t('settings.themeDark') }}</option>
              <option value="auto">{{ t('settings.themeAuto') }}</option>
            </select>
          </div>
        </div>

        <!-- 编辑器设置 -->
        <div v-else-if="activeCategory === 'editor'" class="settings-section">
          <div class="setting-item">
            <label class="setting-label">{{ t('settings.fontSize') }}</label>
            <input type="number" class="setting-input" value="14" min="10" max="24" />
          </div>
          <div class="setting-item">
            <label class="setting-label">{{ t('settings.lineHeight') }}</label>
            <input type="number" class="setting-input" value="1.6" min="1" max="3" step="0.1" />
          </div>
          <div class="setting-item">
            <label class="setting-label">{{ t('settings.autoSave') }}</label>
            <input type="checkbox" class="setting-checkbox" checked />
          </div>
        </div>

        <!-- 快捷键设置 -->
        <div v-else-if="activeCategory === 'keybindings'" class="settings-section">
          <KeybindingSettings />
        </div>

        <!-- 关于 -->
        <div v-else-if="activeCategory === 'about'" class="settings-section">
          <div class="about-info">
            <div class="about-logo">📝</div>
            <h2>{{ t('app.name') }}</h2>
            <p class="about-version">Version 0.1.0</p>
            <p class="about-desc">{{ t('app.description') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import KeybindingSettings from '@renderer/components/settings/KeybindingSettings.vue';

const { t } = useI18n();
const activeCategory = ref('general');

const categories = [
  { id: 'general', icon: '🌐', label: 'settings.general' },
  { id: 'editor', icon: '✏️', label: 'settings.editor' },
  { id: 'keybindings', icon: '⌨️', label: 'settings.keybindings' },
  { id: 'about', icon: 'ℹ️', label: 'settings.about' },
];

const currentCategory = computed(() => {
  return categories.find(c => c.id === activeCategory.value);
});
</script>

<style scoped>
.settings-view {
  width: 100%;
  height: 100%;
  display: flex;
  background: var(--color-background);
}

.settings-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.settings-nav {
  padding: 1rem 0.5rem;
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text);
  text-align: left;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
}

.settings-nav-item:hover {
  background: var(--color-hover);
}

.settings-nav-item.active {
  background: var(--color-primary);
  color: white;
}

.settings-nav-icon {
  font-size: 1.25rem;
}

.settings-nav-text {
  font-size: 0.875rem;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.settings-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.settings-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.settings-body {
  flex: 1;
  padding: 2rem;
}

.settings-section {
  max-width: 600px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 0.9375rem;
  color: var(--color-text);
}

.setting-select,
.setting-input {
  padding: 0.5rem 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 0.875rem;
  min-width: 200px;
}

.setting-select:focus,
.setting-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.setting-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.about-info {
  text-align: center;
  padding: 2rem;
}

.about-logo {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.about-info h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.about-version {
  color: var(--color-text-secondary);
  margin: 0 0 1rem;
}

.about-desc {
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>


