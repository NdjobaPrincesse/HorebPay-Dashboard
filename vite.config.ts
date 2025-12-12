import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This intercepts any request starting with /api
      '/api': {
        target: 'https://prod.horebpay.com/horeb/api', // The real Server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix when sending to target
        secure: false, // Accept self-signed certs if necessary
      },
    },
  },
})
