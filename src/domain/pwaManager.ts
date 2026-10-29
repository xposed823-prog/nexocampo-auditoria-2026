/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NexoCampo Auditoría 2026 — cola local y contrato de sincronización.
 * La cola solo se limpia cuando un backend confirma explícitamente el lote completo.
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

function fechaLocalHoy(): string {
  const hoy = new Date();
  const pad = (valor: number) => String(valor).padStart(2, '0');
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
}

/**
 * Solicita sincronización. Registrar Background Sync solo significa que la tarea
 * quedó programada; no significa que los datos ya hayan llegado a un servidor.
 */
export async function dispararBackgroundSync(): Promise<{ exito: boolean; metodo: 'background-sync' | 'direct-sync' | 'offline-queued' | 'nothing-to-sync' }> {
  if (!navigator.onLine) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await (navigator.serviceWorker as any).ready;
        if (reg?.sync) {
          await reg.sync.register('sync-jornadas');
          return { exito: true, metodo: 'background-sync' };
        }
      } catch (error) {
        console.warn('No se pudo programar Background Sync; la cola local se conserva:', error);
      }
    }
    return { exito: true, metodo: 'offline-queued' };
  }

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await (navigator.serviceWorker as any).ready;
      if (reg?.sync) {
        await reg.sync.register('sync-jornadas');
        return { exito: true, metodo: 'background-sync' };
      }
    } catch (error) {
      console.warn('Background Sync no disponible; se intentará la vía directa:', error);
    }
  }

  const pendientes = await obtenerRegistrosPendientes();
  if (pendientes.length === 0) return { exito: true, metodo: 'nothing-to-sync' };

  const respuesta = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ registros: pendientes })
  });

  if (!respuesta.ok) {
    throw new Error(`Sincronización no confirmada (HTTP ${respuesta.status}). Los registros siguen en la cola local.`);
  }

  let confirmacion: { success?: boolean; sincronizados?: number };
  try {
    confirmacion = await respuesta.json();
  } catch {
    throw new Error('El servidor no devolvió una confirmación JSON válida. La cola local se conserva.');
  }

  if (confirmacion.success !== true || confirmacion.sincronizados !== pendientes.length) {
    throw new Error('El servidor no confirmó la recepción de todo el lote. La cola local se conserva.');
  }

  for (const item of pendientes) {
    await guardarJornadaConfirmada({
      id: item.payload?.id || `jornada_${Date.now()}`,
      entidad: item.entidad,
      fecha: item.payload?.fecha || fechaLocalHoy(),
      datos: item.payload,
      sincronizadoEn: new Date().toISOString(),
      estado: 'sincronizado'
    });
  }
  await limpiarRegistrosPendientes();
  return { exito: true, metodo: 'direct-sync' };
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
