import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  esbuild: {
    drop: ['console', 'debugger'], // 移除 console 和 debugger 语句
  },
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
    cssCodeSplit: true,
    lib: {
      entry: fileURLToPath(new URL('./lib/index.ts', import.meta.url)),
      name: 'domain-design-ui-component',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue', 'primevue', '@primeuix/themes'],
      output: {
        globals: {
          vue: '__Vue',
          primevue: '__PrimeVue',
          '@primeuix/themes': '__PrimeVueThemes',
        },
      },
    },
  },
})
