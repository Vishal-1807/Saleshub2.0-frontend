import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/hlr': {
        target: 'https://interactive.leadbyte.co.uk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hlr/, '/restapi/v1.2/validate/mobile'),
        secure: true,
      }
    }
  }
});
