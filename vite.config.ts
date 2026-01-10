
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  // Using relative base path makes deployment to shared hosting like Hostinger much easier
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Ensure clean builds
    emptyOutDir: true
  }
});
