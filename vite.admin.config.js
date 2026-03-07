// vite.admin.config.js
// Vite config exclusively for the admin dashboard.
// Run with: npm run dev:admin  →  http://localhost:5174
//
// This file sits next to your existing vite.config.js — do NOT replace it.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Point Vite at the admin HTML entry point instead of index.html
  root: '.',
  build: {
    rollupOptions: {
      input: './admin.html',       // admin.html lives at project root
    },
    outDir: 'dist-admin',          // separate output folder, won't clash with public build
  },

  server: {
    port: 5174,                    // admin runs here; public site stays on 5173
    strictPort: true,              // fail loudly if port is taken
    open: '/admin.html',           // auto-open admin in browser on start
  },

  // Share the same env variables as the main app
  envDir: '.',
});