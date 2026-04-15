import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // base: '/',
  plugins: [vue()],
  server: {
    port: 5174,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        error: resolve(__dirname, 'public/error.html')
      }
    }
  }
})
