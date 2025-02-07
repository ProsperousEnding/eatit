import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: '/eatit/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'assets/images/[name].[hash][extname]'
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        },
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus']
        }
      }
    },
    minify: 'esbuild',
    cssCodeSplit: true,
    cssTarget: true
  },
  server: {
    port: 8889,
    open: true
  }
}) 