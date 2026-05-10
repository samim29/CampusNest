import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import path             from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      /* Force single React instance — fixes "Invalid hook call" */
      'react':     path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },

  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target:       'http://localhost:8000',
        changeOrigin: true,
        secure:       false,
        rewrite:      (p) => p.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    outDir:   'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  envPrefix: 'VITE_',
});