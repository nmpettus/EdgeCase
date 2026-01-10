
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import envCompatible from 'vite-plugin-env-compatible';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    envCompatible({ prefix: 'VITE', mountedPath: 'process.env' })
  ],
  base: '/EdgeLab/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
