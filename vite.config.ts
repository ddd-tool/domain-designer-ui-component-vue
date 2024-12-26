import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`,
    }),
  ],
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
      external: ['vue', 'primevue', '@primevue/themes'],
      output: {
        globals: {
          vue: '__Vue',
          primevue: '__PrimeVue',
          '@primevue/themes': '__PrimeVueThemes',
        },
      },
    },
  },
})
