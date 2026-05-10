import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Same path as production: FastAPI serves /api/* and static SPA on /
      '/api': { target: 'http://localhost:8000' },
    },
  },
})
