import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
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
  build: {
    rollupOptions: {
      external: ['better-sqlite3', 'chokidar'],
    },
  },
});
