/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Conector TypeScript para PWA, IndexedDB y Background Sync
 */

import {
  initDB,
  guardarRegistroPendiente,
  obtenerRegistrosPendientes,
  limpiarRegistrosPendientes,
  guardarJornadaConfirmada,
  obtenerTodasJornadas,
  contarPendientes,
  exportarBaseDatosJSON
} from '@/js/db.js';

export interface RegistroPendienteItem {
  id: number;
  entidad: string;
  payload: any;
  creadoEn: string;
  syncStatus: string;
  reintentos: number;
}

export interface JornadaConfirmadaItem {
  id: string;
  entidad: string;
  fecha: string;
  datos: any;
  sincronizadoEn: string;
  estado: string;
}

/**
 * Registra o despacha el evento Background Sync en el Service Worker
 */
export async function dispararBackgroundSync(): Promise<{ exito: boolean; metodo: 'background-sync' | 'direct-sync' | 'offline-queued' }> {
  // Si estamos sin conexión, intentar registrar la tarea sync si el navegador lo permite
  if (!navigator.onLine) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await (navigator.serviceWorker as any).ready;
        if (reg?.sync) {
          await reg.sync.register('sync-jornadas');
          return { exito: true, metodo: 'background-sync' };
        }
      } catch (e) {
        console.warn('Sync registration failed:', e);
      }
    }
    return { exito: true, metodo: 'offline-queued' };
  }

  // Si estamos en línea, intentar Background Sync primero
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await (navigator.serviceWorker as any).ready;
      if (reg?.sync) {
        await reg.sync.register('sync-jornadas');
        return { exito: true, metodo: 'background-sync' };
      }
    } catch (e) {
      console.warn('SyncManager no disponible, recurriendo a sincronización directa');
    }
  }

  // Fallback: sincronización directa
  const pendientes = await obtenerRegistrosPendientes();
  if (pendientes.length === 0) {
    return { exito: true, metodo: 'direct-sync' };
  }

  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registros: pendientes })
  });

  if (res.ok) {
    for (const item of pendientes) {
      await guardarJornadaConfirmada({
        id: item.payload?.id || `jornada_${Date.now()}`,
        entidad: item.entidad,
        fecha: item.payload?.fecha || new Date().toISOString().split('T')[0],
        datos: item.payload,
        sincronizadoEn: new Date().toISOString(),
        estado: 'sincronizado'
      });
    }
    await limpiarRegistrosPendientes();
    return { exito: true, metodo: 'direct-sync' };
  } else {
    throw new Error(`Error en servidor: HTTP ${res.status}`);
  }
}

export {
  initDB,
  guardarRegistroPendiente,
  obtenerRegistrosPendientes,
  limpiarRegistrosPendientes,
  guardarJornadaConfirmada,
  obtenerTodasJornadas,
  contarPendientes,
  exportarBaseDatosJSON
};
