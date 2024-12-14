import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#lib': fileURLToPath(new URL('./lib', import.meta.url)),
      '#domain': fileURLToPath(new URL('./lib/domain', import.meta.url)),
    },
  },
  build: {
    minify: 'esbuild',
    outDir: 'dist',
    target: 'esnext',
    lib: {
      entry: fileURLToPath(new URL('./lib/index.ts', import.meta.url)),
      name: 'domain-design-ui-component',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: '__Vue',
        },
      },
    },
  },
})
