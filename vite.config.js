import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000, // Mantém a porta 8000, igual ao python -m http.server
    open: true // Abre o navegador automaticamente
  },
  root: '.', // Diretório raiz do projeto
  build: {
    outDir: 'dist' // Diretório de saída para a build
  }
});