import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/ lkn
export default defineConfig({
  server: {
    host: true
  },
  base: "/",
  plugins: [react()],
})
