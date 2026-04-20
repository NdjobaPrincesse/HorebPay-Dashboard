import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Local dev proxy to the Spring Boot backend documented in README.
      '/api/auth/login': {
        target: 'http://158.220.104.62:8089/horeb/api/users/login',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => '', 
      },
      // Data routes
      '/api': {
        target: 'http://158.220.104.62:8089/horeb/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
