import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
      'monaco-editor/esm/vs/editor/editor.worker',
    ],
    exclude: [],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/components/soc-query-editor/index.ts'),
      name: 'SOCQueryEditor',
      formats: ['es', 'cjs'],
      fileName: (format) => `soc-query-editor.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'monaco-editor',
        'antd',
        'styled-components',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'monaco-editor': 'monaco',
          antd: 'antd',
          'styled-components': 'styled',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
  worker: {
    format: 'es',
  },
});
