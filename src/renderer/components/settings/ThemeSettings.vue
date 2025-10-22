<template>
  <div class="theme-settings">
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.theme.title') }}</h3>
      <p class="section-description">{{ t('settings.theme.description') }}</p>
      
      <div class="theme-grid">
        <div
          v-for="theme in availableThemes"
          :key="theme.id"
          class="theme-card"
          :class="{ active: theme.id === currentThemeId }"
          @click="handleThemeSelect(theme.id)"
        >
          <div class="theme-preview" :data-theme-type="theme.type">
            <div class="preview-header">
              <div class="preview-dot"></div>
              <div class="preview-dot"></div>
              <div class="preview-dot"></div>
            </div>
            <div class="preview-body">
              <div class="preview-sidebar"></div>
              <div class="preview-content">
                <div class="preview-line"></div>
                <div class="preview-line"></div>
                <div class="preview-line short"></div>
              </div>
            </div>
          </div>
          
          <div class="theme-info">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-meta">
              <span class="theme-type">{{ theme.type === 'light' ? '亮色' : '暗色' }}</span>
              <span class="theme-author">{{ theme.author }}</span>
            </div>
          </div>
          
          <div v-if="theme.id === currentThemeId" class="theme-check">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 10L9 12L13 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.theme.options') }}</h3>
      
      <div class="setting-item">
        <div class="setting-label">
          <span>{{ t('settings.theme.followSystem') }}</span>
          <span class="setting-description">{{ t('settings.theme.followSystemDesc') }}</span>
        </div>
        <button
          class="toggle-button"
          :class="{ active: followingSystem }"
          @click="toggleFollowSystem"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '@renderer/stores/theme';

const { t } = useI18n();
const themeStore = useThemeStore();

// 状态
const followingSystem = ref(false);
let unwatchSystem: (() => void) | null = null;

// 计算属性
const currentThemeId = computed(() => themeStore.themeId);
const availableThemes = computed(() => themeStore.availableThemes);

// 方法
const handleThemeSelect = async (themeId: string) => {
  // 如果当前跟随系统，取消跟随
  if (followingSystem.value) {
    followingSystem.value = false;
    if (unwatchSystem) {
      unwatchSystem();
      unwatchSystem = null;
    }
  }
  
  await themeStore.switchTheme(themeId);
};

const toggleFollowSystem = () => {
  followingSystem.value = !followingSystem.value;
  
  if (followingSystem.value) {
    // 开始跟随系统
    unwatchSystem = themeStore.followSystemTheme();
  } else {
    // 停止跟随系统
    if (unwatchSystem) {
      unwatchSystem();
      unwatchSystem = null;
    }
  }
};

onMounted(() => {
  // 检查是否有保存的跟随系统设置
  // 这里可以从配置中读取
});

onUnmounted(() => {
  if (unwatchSystem) {
    unwatchSystem();
  }
});
</script>

<style scoped>
.theme-settings {
  padding: 1.5rem;
}

.settings-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text);
  margin: 0 0 0.5rem 0;
}

.section-description {
  font-size: 0.875rem;
  color: var(--theme-text-secondary);
  margin: 0 0 1.5rem 0;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.theme-card {
  position: relative;
  border: 2px solid var(--theme-border);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--theme-background);
}

.theme-card:hover {
  border-color: var(--theme-primary);
  box-shadow: 0 4px 12px var(--theme-shadow);
}

.theme-card.active {
  border-color: var(--theme-primary);
  background: var(--theme-background-secondary);
}

.theme-preview {
  width: 100%;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  border: 1px solid var(--theme-border-light);
}

.theme-preview[data-theme-type="light"] {
  background: #ffffff;
}

.theme-preview[data-theme-type="dark"] {
  background: #0f172a;
}

.preview-header {
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  gap: 0.25rem;
}

.theme-preview[data-theme-type="light"] .preview-header {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.theme-preview[data-theme-type="dark"] .preview-header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.preview-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.theme-preview[data-theme-type="light"] .preview-dot {
  background: #cbd5e1;
}

.theme-preview[data-theme-type="dark"] .preview-dot {
  background: #475569;
}

.preview-body {
  display: flex;
  height: calc(100% - 24px);
}

.preview-sidebar {
  width: 40px;
  border-right: 1px solid;
}

.theme-preview[data-theme-type="light"] .preview-sidebar {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.theme-preview[data-theme-type="dark"] .preview-sidebar {
  background: #1e293b;
  border-color: #334155;
}

.preview-content {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.preview-line {
  height: 4px;
  border-radius: 2px;
}

.theme-preview[data-theme-type="light"] .preview-line {
  background: #e2e8f0;
}

.theme-preview[data-theme-type="dark"] .preview-line {
  background: #334155;
}

.preview-line.short {
  width: 60%;
}

.theme-info {
  margin-bottom: 0.5rem;
}

.theme-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text);
  margin-bottom: 0.25rem;
}

.theme-meta {
  font-size: 0.75rem;
  color: var(--theme-text-secondary);
  display: flex;
  gap: 0.5rem;
}

.theme-check {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: var(--theme-primary);
  background: var(--theme-background);
  border-radius: 50%;
  padding: 0.25rem;
  box-shadow: 0 2px 8px var(--theme-shadow);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: var(--theme-background-secondary);
  border: 1px solid var(--theme-border);
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.setting-label > span:first-child {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text);
}

.setting-description {
  font-size: 0.75rem;
  color: var(--theme-text-secondary);
}

.toggle-button {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--theme-border);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.toggle-button:hover {
  background: var(--theme-border-active);
}

.toggle-button.active {
  background: var(--theme-primary);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s ease;
}

.toggle-button.active .toggle-slider {
  transform: translateX(20px);
}
</style>


