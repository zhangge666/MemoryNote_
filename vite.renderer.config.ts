import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [vue()],
  publicDir: 'public', // 指定 public 目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@main': path.resolve(__dirname, './src/main'),
      '@renderer': path.resolve(__dirname, './src/renderer'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@preload': path.resolve(__dirname, './src/preload'),
      '@plugins-api': path.resolve(__dirname, './src/plugins-api'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});
