<template>
  <button
    class="nav-button inline-flex items-center justify-center transition-all flex-shrink-0"
    :class="[active ? 'active' : '', active ? '' : 'text-text-secondary hover:text-text']"
    :title="title"
    @click="$emit('click')"
  >
    <svg 
      class="icon-svg" 
      fill="none" 
      :stroke="active ? '#667eea' : 'currentColor'"
      stroke-width="2"
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  active?: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

