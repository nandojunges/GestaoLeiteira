// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['.ngrok-free.app'],
    fs: {
      strict: false,
    },
  },
  // ✅ ESSA OPÇÃO FAZ O REACT ROUTER FUNCIONAR CORRETAMENTE COM REFRESH E NAVIGATE
  build: {
    outDir: 'dist',
  },
  preview: {
    // Permite que o preview do build funcione com SPA
    // (caso use `vite preview` depois do build)
    port: 4173,
  },
});
