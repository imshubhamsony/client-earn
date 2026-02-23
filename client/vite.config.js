import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build always outputs to dist/ (Render static site: publish dist; combined deploy: server copies dist → server/public)
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
