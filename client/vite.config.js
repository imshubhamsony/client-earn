import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For separate deploy (static site): set VITE_BUILD_STANDALONE=1 so output goes to dist/
const outDir = process.env.VITE_BUILD_STANDALONE ? 'dist' : '../server/public';
export default defineConfig({
  plugins: [react()],
  build: {
    outDir,
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
