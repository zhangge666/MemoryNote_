<template>
  <div class="welcome-view">
    <div class="welcome-container">
      <div class="logo-section">
        <div class="logo-circle">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="app-title">{{ t('app.name') }}</h1>
        <p class="app-subtitle">{{ t('welcome.subtitle') }}</p>
      </div>

      <div class="quick-actions">
        <h2>{{ t('welcome.quickStart') }}</h2>
        <div class="action-grid">
          <button class="action-card" @click="createNewNote">
            <div class="action-icon">📝</div>
            <div class="action-title">{{ t('welcome.newNote') }}</div>
            <div class="action-desc">{{ t('welcome.newNoteDesc') }}</div>
          </button>
          
          <button class="action-card" @click="openJournal">
            <div class="action-icon">📔</div>
            <div class="action-title">{{ t('welcome.openJournal') }}</div>
            <div class="action-desc">{{ t('welcome.openJournalDesc') }}</div>
          </button>
          
          <button class="action-card" @click="openSettings">
            <div class="action-icon">⚙️</div>
            <div class="action-title">{{ t('welcome.settings') }}</div>
            <div class="action-desc">{{ t('welcome.settingsDesc') }}</div>
          </button>
          
          <button class="action-card" @click="showHelp">
            <div class="action-icon">❓</div>
            <div class="action-title">{{ t('welcome.help') }}</div>
            <div class="action-desc">{{ t('welcome.helpDesc') }}</div>
          </button>
        </div>
      </div>

      <div class="keyboard-shortcuts">
        <h2>{{ t('welcome.keyboardShortcuts') }}</h2>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd> + <kbd>P</kbd>
            </span>
            <span class="shortcut-desc">{{ t('welcome.openCommandPalette') }}</span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd> + <kbd>N</kbd>
            </span>
            <span class="shortcut-desc">{{ t('welcome.newNote') }}</span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd> + <kbd>S</kbd>
            </span>
            <span class="shortcut-desc">{{ t('welcome.saveNote') }}</span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-keys">
              <kbd>Ctrl</kbd> + <kbd>F</kbd>
            </span>
            <span class="shortcut-desc">{{ t('welcome.find') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTabStore } from '@renderer/stores/tab';

const { t } = useI18n();
const tabStore = useTabStore();

function createNewNote() {
  tabStore.openTab({
    title: t('navbar.notes'),
    type: 'editor',
    icon: '📝',
  });
}

function openJournal() {
  tabStore.openTab({
    title: t('navbar.journal'),
    type: 'editor',
    icon: '📔',
  });
}

function openSettings() {
  tabStore.openTab({
    title: t('navbar.settings'),
    type: 'settings',
    icon: '⚙️',
  });
}

function showHelp() {
  // TODO: 实现帮助功能
  console.log('Show help');
}
</script>

<style scoped>
.welcome-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.welcome-container {
  max-width: 800px;
  width: 100%;
}

.logo-section {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.logo-icon {
  width: 50px;
  height: 50px;
  color: white;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.quick-actions,
.keyboard-shortcuts {
  margin-bottom: 3rem;
}

.quick-actions h2,
.keyboard-shortcuts h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: var(--color-text);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.action-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.shortcut-keys {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

kbd {
  padding: 0.25rem 0.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: monospace;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.shortcut-desc {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>


