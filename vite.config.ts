import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy configuration for API requests (apenas para desenvolvimento local)
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // backend local (ajuste a porta se necessário)
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
