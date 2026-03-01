import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. Login Route (Mapped to the new IP)
      '/api/auth/login': {
        target: 'http://158.220.104.62:8089/horeb/api/users/login',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => '', 
      },
      // 2. Data Routes (Transactions, Clients, Enterprise)
      '/api': {
        target: 'http://158.220.104.62:8089/horeb/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
