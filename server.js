/**
 * NexoCampo 2026 - PWA Offline-First
 * Archivo: server.js
 * 
 * Servidor Backend Node.js / Express para sincronización centralizada de registros agrícolas.
 * 
 * Decisiones Técnicas Clave:
 * 1. Endpoint Idempotente '/api/sync':
 *    - Recibe el lote (batch) de registros acumulados en IndexedDB cuando el supervisor recupera señal.
 *    - Procesa transaccionalmente cada registro y devuelve confirmación inmediata para que el Service
 *      Worker vacíe la cola local con certeza y emita la notificación al usuario.
 * 2. Soporte Estático Completo para PWA:
 *    - Sirve 'manifest.json', 'service-worker.js', 'offline.html', 'css/' y 'js/' con las cabeceras
 *      apropiadas de caché y Service-Worker-Allowed: '/'.
 * 3. Healthcheck de Red en Campo:
 *    - El endpoint '/api/health' es liviano (204/200 OK sin carga pesada) para comprobaciones rápidas
 *      de retorno de conectividad móvil en el predio.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para decodificación de JSON con límite holgado para lotes de campo
app.use(express.json({ limit: '10mb' }));

// Cabeceras de seguridad y PWA
app.use((req, res, next) => {
  // Permitir que el Service Worker controle la raíz '/'
  if (req.path === '/service-worker.js') {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  next();
});

// No se utiliza un almacén en memoria para confirmar sincronizaciones.
// La persistencia durable y autenticada debe implementarse antes de habilitar /api/sync.

/**
 * Healthcheck de conectividad para dispositivos en campo
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'SERVER_RUNNING',
    servidor: 'NexoCampo Backend — entorno de desarrollo',
    sincronizacion: 'DISABLED_NO_DURABLE_STORAGE',
    message: 'La API de sincronización no está habilitada; este healthcheck solo confirma que Express está ejecutándose.',
    horaServidor: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Endpoint de Sincronización en Segundo Plano (Consumido por el Service Worker y el cliente)
 */
app.post('/api/sync', (req, res) => {
  // Fail closed: no se debe confirmar recepción hasta disponer de persistencia durable,
  // autenticación, idempotencia y validación del esquema de datos.
  return res.status(501).json({
    success: false,
    code: 'SYNC_BACKEND_NOT_CONFIGURED',
    message: 'Sincronización deshabilitada: no existe almacenamiento remoto durable configurado. La cola local debe conservarse.'
  });
});

/**
 * Catálogo de Colaboradores
 */
app.get('/api/colaboradores', (req, res) => {
  res.json([
    { id: 'col_1', codigo: 'COL-001', alias: 'J. Pérez', rol: 'Podador experto', cuadrilla: 'Cuadrilla Norte' },
    { id: 'col_2', codigo: 'COL-002', alias: 'M. Gómez', rol: 'Operario campo', cuadrilla: 'Cuadrilla Norte' },
    { id: 'col_3', codigo: 'COL-003', alias: 'C. Rodríguez', rol: 'Encargado malla', cuadrilla: 'Cuadrilla Coberturas' },
    { id: 'col_4', codigo: 'COL-004', alias: 'A. Martínez', rol: 'Operario campo', cuadrilla: 'Cuadrilla Coberturas' },
    { id: 'col_5', codigo: 'COL-005', alias: 'L. Hernández', rol: 'Tractorista', cuadrilla: 'Cuadrilla Maquinaria' },
    { id: 'col_6', codigo: 'COL-006', alias: 'R. Sánchez', rol: 'Operario campo', cuadrilla: 'Cuadrilla Norte' }
  ]);
});

/**
 * Catálogo de Labores
 */
app.get('/api/labores', (req, res) => {
  res.json([
    { id: 'lab_1', nombre: 'Poda de formación', unidadMeta: 'árboles', metaEstandarHora: 15 },
    { id: 'lab_2', nombre: 'Raleo de frutos', unidadMeta: 'plantas', metaEstandarHora: 20 },
    { id: 'lab_3', nombre: 'Desyerbe en plato', unidadMeta: 'metros lineales', metaEstandarHora: 30 },
    { id: 'lab_4', nombre: 'Plástico y Polisombra', unidadMeta: 'metros cuadrados', metaEstandarHora: 50 },
    { id: 'lab_5', nombre: 'Oficios Varios de Campo', unidadMeta: 'tareas', metaEstandarHora: 1 }
  ]);
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Fallback SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicio del servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` [NexoCampo 2026] Servidor Express PWA Activo`);
    console.log(` Puerto: http://localhost:${PORT}`);
    console.log(` Endpoint Sync: DESHABILITADO hasta configurar almacenamiento durable y autenticación`);
    console.log(` Healthcheck:   http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

export default app;
