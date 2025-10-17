import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/football-data': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/football-data/, '')
      }
    }
  },
  preview: {
    proxy: {
      '/football-data': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/football-data/, '')
      }
    }
  }
})
