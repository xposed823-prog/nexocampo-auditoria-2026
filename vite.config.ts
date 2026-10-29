import { fileURLToPath } from 'node:url';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'pwa-sync-api-handler',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/health' && req.method === 'GET') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({
              status: 'DEV_ONLY',
              message: 'Servidor de desarrollo activo; no implica conexión con un backend persistente.',
              timestamp: new Date().toISOString()
            }));
            return;
          }

          // No fingir una sincronización. Sin backend real, la cola local debe conservarse.
          if (req.url === '/api/sync' && req.method === 'POST') {
            res.statusCode = 501;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({
              success: false,
              code: 'SYNC_BACKEND_NOT_CONFIGURED',
              message: 'La sincronización remota no está configurada. Los registros deben permanecer en la cola local.'
            }));
            return;
          }

          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
