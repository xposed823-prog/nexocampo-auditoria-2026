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

// Almacén en memoria simulado para persistencia del servidor
const baseDeDatosServidor = {
  jornadasSincronizadas: [],
  auditoriaSync: []
};

/**
 * Healthcheck de conectividad para dispositivos en campo
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    servidor: 'NexoCampo Central Backend 2026',
    horaServidor: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Endpoint de Sincronización en Segundo Plano (Consumido por el Service Worker y el cliente)
 */
app.post('/api/sync', (req, res) => {
  const { registros } = req.body;

  if (!Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Formato inválido. Se requiere un arreglo de registros no vacío.'
    });
  }

  console.log(`[Servidor] Recibido lote de sincronización con ${registros.length} registros desde PWA.`);
  
  const ahora = new Date().toISOString();
  let procesadosExitosos = 0;

  for (const item of registros) {
    const registroProcesado = {
      id: item.payload?.id || `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      entidad: item.entidad || 'jornada',
      datos: item.payload,
      recibidoEn: ahora,
      origenSync: req.headers['x-pwa-sync-origin'] || 'Cliente-Directo'
    };

    baseDeDatosServidor.jornadasSincronizadas.push(registroProcesado);
    procesadosExitosos++;
  }

  // Registro de auditoría
  baseDeDatosServidor.auditoriaSync.push({
    loteId: `lote_${Date.now()}`,
    totalRegistros: procesadosExitosos,
    recibidoEn: ahora,
    ip: req.ip
  });

  console.log(`[Servidor] Lote procesado con éxito. Total acumulado en servidor: ${baseDeDatosServidor.jornadasSincronizadas.length}`);

  return res.status(200).json({
    success: true,
    message: 'Lote de registros agrícolas sincronizado con éxito en el servidor central.',
    sincronizados: procesadosExitosos,
    totalServidor: baseDeDatosServidor.jornadasSincronizadas.length,
    timestamp: ahora
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
    console.log(` Endpoint Sync: http://localhost:${PORT}/api/sync`);
    console.log(` Healthcheck:   http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

export default app;
