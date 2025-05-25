import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Adicione este fallback para rotas SPA
    historyApiFallback: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
