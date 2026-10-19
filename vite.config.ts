import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'pwa-sync-api-handler',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // Healthcheck liviano de conectividad
            if (req.url === '/api/health' && req.method === 'GET') {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 'ONLINE',
                servidor: 'NexoCampo Vite Middleware',
                timestamp: new Date().toISOString()
              }));
              return;
            }

            // Endpoint de Sincronización en Segundo Plano
            if (req.url === '/api/sync' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                let total = 0;
                try {
                  const parsed = JSON.parse(body);
                  total = Array.isArray(parsed.registros) ? parsed.registros.length : 1;
                } catch (e) {
                  total = 1;
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  message: 'Lote de registros sincronizado exitosamente.',
                  sincronizados: total,
                  timestamp: new Date().toISOString()
                }));
              });
              return;
            }

            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
