import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Two entries: the main site at / and the isolated demo at /demo/.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        demo: fileURLToPath(new URL('./demo/index.html', import.meta.url)),
      },
    },
  },
})
