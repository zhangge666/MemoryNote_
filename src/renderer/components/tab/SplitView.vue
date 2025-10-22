<template>
  <div class="split-view">
    <!-- 单一布局 -->
    <div v-if="layout.type === 'single' && layout.groupId" class="split-single">
      <TabGroup
        v-if="groups[layout.groupId]"
        :group="groups[layout.groupId]"
        :is-active="layout.groupId === activeGroupId"
        @tab-click="handleTabClick"
        @tab-close="handleTabClose"
        @close-others="handleCloseOthers"
        @close-all="handleCloseAll"
        @toggle-pin="handleTogglePin"
        @tab-contextmenu="handleTabContextMenu"
        @split-horizontal="handleSplitHorizontal(layout.groupId)"
        @split-vertical="handleSplitVertical(layout.groupId)"
        @group-activate="handleGroupActivate"
      >
        <template #content="{ tab }">
          <slot :tab="tab" />
        </template>
      </TabGroup>
    </div>

    <!-- 水平分屏 -->
    <div v-else-if="layout.type === 'horizontal'" class="split-horizontal">
      <template v-for="(child, index) in layout.children" :key="index">
        <div
          class="split-pane"
          :style="{ flex: getSplitFlex(index) }"
        >
          <SplitView
            :layout="child"
            :groups="groups"
            :active-group-id="activeGroupId"
            @tab-click="handleTabClick"
            @tab-close="handleTabClose"
            @close-others="handleCloseOthers"
            @close-all="handleCloseAll"
            @toggle-pin="handleTogglePin"
            @tab-contextmenu="handleTabContextMenu"
            @split-horizontal="handleSplitHorizontal"
            @split-vertical="handleSplitVertical"
            @group-activate="handleGroupActivate"
          >
            <template #default="{ tab }">
              <slot :tab="tab" />
            </template>
          </SplitView>
        </div>
        <SplitResizeHandle
          v-if="index < layout.children.length - 1"
          direction="horizontal"
          @resize="(delta) => handleResize(index, delta)"
        />
      </template>
    </div>

    <!-- 垂直分屏 -->
    <div v-else-if="layout.type === 'vertical'" class="split-vertical">
      <template v-for="(child, index) in layout.children" :key="index">
        <div
          class="split-pane"
          :style="{ flex: getSplitFlex(index) }"
        >
          <SplitView
            :layout="child"
            :groups="groups"
            :active-group-id="activeGroupId"
            @tab-click="handleTabClick"
            @tab-close="handleTabClose"
            @close-others="handleCloseOthers"
            @close-all="handleCloseAll"
            @toggle-pin="handleTogglePin"
            @tab-contextmenu="handleTabContextMenu"
            @split-horizontal="handleSplitHorizontal"
            @split-vertical="handleSplitVertical"
            @group-activate="handleGroupActivate"
          >
            <template #default="{ tab }">
              <slot :tab="tab" />
            </template>
          </SplitView>
        </div>
        <SplitResizeHandle
          v-if="index < layout.children.length - 1"
          direction="vertical"
          @resize="(delta) => handleResize(index, delta)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TabGroup from './TabGroup.vue';
import SplitResizeHandle from './SplitResizeHandle.vue';
import type { SplitLayout, TabGroup as ITabGroup, Tab } from '@shared/types/tab';

const props = defineProps<{
  layout: SplitLayout;
  groups: Record<string, ITabGroup>;
  activeGroupId?: string | null;  // 添加活动分组ID
}>();

const emit = defineEmits<{
  (e: 'tab-click', tabId: string): void;
  (e: 'tab-close', tabId: string): void;
  (e: 'close-others', tabId: string): void;
  (e: 'close-all'): void;
  (e: 'toggle-pin', tabId: string): void;
  (e: 'tab-contextmenu', event: MouseEvent, tab: Tab): void;
  (e: 'split-horizontal', groupId: string): void;
  (e: 'split-vertical', groupId: string): void;
  (e: 'resize', layoutPath: number[], ratio: number): void;
  (e: 'group-activate', groupId: string): void;  // 新增：激活分组事件
}>();

const paneRatios = ref<number[]>([]);

// 初始化分屏比例
function initRatios() {
  if (!props.layout.children || props.layout.children.length === 0) return;
  
  const count = props.layout.children.length;
  if (paneRatios.value.length === 0) {
    paneRatios.value = Array(count).fill(1 / count);
  }
}

initRatios();

function getSplitFlex(index: number): number {
  if (!props.layout.children || props.layout.children.length === 0) return 1;
  
  if (paneRatios.value.length > 0 && paneRatios.value[index] !== undefined) {
    return paneRatios.value[index];
  }
  
  return props.layout.ratio || 1 / props.layout.children.length;
}

function handleResize(index: number, delta: number) {
  if (!props.layout.children || props.layout.children.length < 2) return;
  
  // 初始化比例
  if (paneRatios.value.length === 0) {
    initRatios();
  }
  
  // 计算新的比例
  const totalFlex = paneRatios.value.reduce((sum, ratio) => sum + ratio, 0);
  const deltaRatio = delta / 500; // 调整敏感度
  
  // 更新相邻两个面板的比例
  const newRatios = [...paneRatios.value];
  newRatios[index] = Math.max(0.1, Math.min(0.9, newRatios[index] + deltaRatio / totalFlex));
  newRatios[index + 1] = Math.max(0.1, Math.min(0.9, newRatios[index + 1] - deltaRatio / totalFlex));
  
  paneRatios.value = newRatios;
}

function handleTabClick(tabId: string) {
  emit('tab-click', tabId);
}

function handleTabClose(tabId: string) {
  emit('tab-close', tabId);
}

function handleCloseOthers(tabId: string) {
  emit('close-others', tabId);
}

function handleCloseAll() {
  emit('close-all');
}

function handleTogglePin(tabId: string) {
  emit('toggle-pin', tabId);
}

function handleTabContextMenu(event: MouseEvent, tab: Tab) {
  emit('tab-contextmenu', event, tab);
}

function handleSplitHorizontal(groupId: string) {
  emit('split-horizontal', groupId);
}

function handleSplitVertical(groupId: string) {
  emit('split-vertical', groupId);
}

function handleGroupActivate(groupId: string) {
  emit('group-activate', groupId);
}
</script>

<style scoped>
.split-view {
  width: 100%;
  height: 100%;
  display: flex;
}

.split-single {
  width: 100%;
  height: 100%;
}

.split-horizontal {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background: var(--color-border);
}

.split-vertical {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--color-border);
}

.split-pane {
  min-width: 200px;
  min-height: 200px;
  background: var(--color-background);
}
</style>

