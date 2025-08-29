// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'projects.html'),
        research: resolve(__dirname, 'research.html'),
        cv: resolve(__dirname, 'cv.html'),
        viewer: resolve(__dirname, 'viewer.html'),
        contact: resolve(__dirname, 'contact.html'),
        
      },
    },
  },
});
