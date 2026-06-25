import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tienda: resolve(__dirname, 'tienda.html'),
        nosotros: resolve(__dirname, 'nosotros.html'),
      },
    },
  },
});
