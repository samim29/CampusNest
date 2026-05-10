/* ============================================================
   CAMPUSNEST — Vite Configuration
   ============================================================ */

import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import path             from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      /* Allows: import X from '@/components/...' */
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    open: true,
    /* Proxy API calls in development to avoid CORS */
    proxy: {
      '/api': {
        target:      process.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
        changeOrigin: true,
        secure:       false,
        rewrite:      (p) => p.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    outDir:       'dist',
    sourcemap:    false,
    /* Split vendor chunks for better caching */
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    /* Warn if any chunk exceeds 600KB */
    chunkSizeWarningLimit: 600,
  },

  /* Allow env variables prefixed VITE_ */
  envPrefix: 'VITE_',
});