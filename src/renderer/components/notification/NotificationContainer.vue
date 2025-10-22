<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification-list">
        <NotificationItem
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @close="handleClose(notification.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '@renderer/stores/notification';
import NotificationItem from './NotificationItem.vue';

const notificationStore = useNotificationStore();

const notifications = computed(() => notificationStore.notifications);

function handleClose(id: string) {
  notificationStore.close(id);
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 60px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
}

/* 列表过渡动画 */
.notification-list-move {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>


