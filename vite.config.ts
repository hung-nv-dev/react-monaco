import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {},
  },
  optimizeDeps: {
    include: [
      'monaco-editor',
    ],
    exclude: [],
  },
  build: {
    rollupOptions: {
      output: {},
    },
  },
  worker: {
    format: 'es',
  },
})
