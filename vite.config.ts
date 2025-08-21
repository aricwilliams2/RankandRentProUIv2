import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 5173, // your current dev port
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/videos': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
        },
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  };
});
