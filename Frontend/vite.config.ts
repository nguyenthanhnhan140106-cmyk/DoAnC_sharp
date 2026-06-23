import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    modules: {
      // Scoped class names: Component__class___hash
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  server: {
    host: true,
    allowedHosts: true, // <-- Mình đã thêm dòng này để cho phép ngrok truy cập
    proxy: {
      '/api': {
        target: 'http://tunevault-backend.somee.com', // Docker local — đổi sang http://tunevault-backend.somee.com khi deploy
        changeOrigin: true,
      },
      '/hubs': {
        target: 'http://tunevault-backend.somee.com', // Docker local
        ws: true,
        changeOrigin: true
      }
    },
  },
});