import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth/login': {
        // Pointing to the URL that gave us a response in your curl test
        target: 'https://prod.horebpay.com/horeb/api/users/login',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => '', 
      },
      '/api': {
        target: 'https://prod.horebpay.com/horeb/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
