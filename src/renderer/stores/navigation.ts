/**
 * 导航状态管理
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export type NavigationView = 'notes' | 'journal' | 'review' | 'search' | 'profile' | 'messages' | 'test' | 'settings';

export const useNavigationStore = defineStore('navigation', () => {
  const activeView = ref<NavigationView>('notes');

  function setActiveView(view: NavigationView) {
    activeView.value = view;
  }

  return {
    activeView,
    setActiveView,
  };
});


