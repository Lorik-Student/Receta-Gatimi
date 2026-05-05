import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    strictPort: true, // Fail if port 5173 is taken, preventing Vite from jumping to 5174
    port: 5173,
    hmr: {
      clientPort: 5173, // Forces the HMR websocket to use the same port
    }
  }
})