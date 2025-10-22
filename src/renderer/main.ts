/**
 * 渲染进程入口文件
 * 阶段 0: 项目初始化
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import i18n from './plugins/i18n';

// 导入样式
import '../index.css';

// 创建 Vue 应用
const app = createApp(App);

// 使用 Pinia 状态管理
const pinia = createPinia();
app.use(pinia);

// 使用 i18n 国际化
app.use(i18n);

// 挂载应用
app.mount('#app');

// 开发环境日志
if (import.meta.env.DEV) {
  console.log('👋 MemoryNote - Renderer Process Started');
  console.log('Vue version:', app.version);
}

