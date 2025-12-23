import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. Special Rule for Login (Matches Vercel)
      '/api/auth/login': {
        target: 'https://prod.horebpay.com/horeb/users/login',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => '', // Removes the path, sends payload to target root
      },
      // 2. General Rule for Data (Transactions/Clients)
      '/api': {
        target: 'https://prod.horebpay.com/horeb/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
