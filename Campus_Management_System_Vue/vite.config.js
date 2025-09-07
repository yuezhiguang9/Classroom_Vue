
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
  // server: {
  //   proxy: {
  //     '/user': {
  //       target: 'http://localhost:8080', // 修改为后端实际运行的地址，确保端口正确
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/user/, '/user')
  //     }
  //   }
  // }
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})