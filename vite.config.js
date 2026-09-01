import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')

  return {
    base: process.env.VITE_BASE_URL || environment.VITE_BASE_URL || '/',
    plugins: [vue()],
    test: {
      exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
      setupFiles: ['./vitest.setup.js']
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      cssCodeSplit: true,
      minify: 'terser',
      sourcemap: false,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (/node_modules\/(?:@vue|vue|vue-router|pinia)/.test(id)) return 'vendors'
            return undefined
          }
        }
      }
    },
    server: {
      port: 8889,
      open: true
    }
  }
})
