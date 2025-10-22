<template>
  <div class="navbar flex flex-col h-full flex-shrink-0">
    <!-- 顶部导航 -->
    <div class="flex-1 flex flex-col items-center py-3 gap-2">
      <NavButton
        v-for="item in topItems"
        :key="item.id"
        :icon="item.icon"
        :title="t(`navbar.${item.id}`)"
        :active="activeView === item.id"
        @click="selectView(item.id)"
      />
    </div>

    <!-- 底部导航 -->
    <div class="flex flex-col items-center py-3 gap-2 navbar-divider">
      <NavButton
        v-for="item in bottomItems"
        :key="item.id"
        :icon="item.icon"
        :title="t(`navbar.${item.id}`)"
        :active="activeView === item.id"
        @click="selectView(item.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTabStore } from '@renderer/stores/tab';
import NavButton from './NavButton.vue';

const { t } = useI18n();
const activeView = ref('notes');
const tabStore = useTabStore();

const topItems = [
  { id: 'notes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'journal', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'review', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
];

const bottomItems = [
  { id: 'profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'test', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const selectView = (viewId: string) => {
  activeView.value = viewId;
  
  // 根据导航项打开对应的标签页
  const tabConfig: Record<string, { title: string; type: 'editor' | 'plugin' | 'settings' | 'welcome'; icon?: string }> = {
    notes: { title: t('navbar.notes'), type: 'editor', icon: '📝' },
    journal: { title: t('navbar.journal'), type: 'editor', icon: '📔' },
    review: { title: t('navbar.review'), type: 'plugin', icon: '🔄' },
    search: { title: t('navbar.search'), type: 'plugin', icon: '🔍' },
    profile: { title: t('navbar.profile'), type: 'settings', icon: '👤' },
    messages: { title: t('navbar.messages'), type: 'plugin', icon: '💬' },
    test: { title: t('navbar.test'), type: 'plugin', icon: '🧪' },
    settings: { title: t('navbar.settings'), type: 'settings', icon: '⚙️' },
  };

  const config = tabConfig[viewId];
  if (config) {
    // 检查是否已经存在该标签
    const existingTab = tabStore.allTabs.find(tab => tab.title === config.title && tab.type === config.type);
    if (existingTab) {
      tabStore.activateTab(existingTab.id);
    } else {
      tabStore.openTab(config);
    }
  }
};
</script>

