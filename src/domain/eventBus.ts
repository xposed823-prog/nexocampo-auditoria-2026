/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Bus de Eventos Reactivo para Mutaciones de Datos (Fase 3)
 * Centraliza la emisión y suscripción de invalidación de caché e hidratación viva.
 * 
 * Regla de oro: Se emite ÚNICAMENTE tras la confirmación formal (oncomplete)
 * de la transacción de escritura en IndexedDB.
 */

export const EVENTO_MUTACION_DATOS = 'nexocampo:db-mutated';

export type StoreNameEvent = 'colaboradores' | 'labores' | 'areas' | 'ausencias' | 'jornadas' | 'asistencia';

export interface MutacionDatosEvento {
  almacen: StoreNameEvent;
  operacion: 'put' | 'delete' | 'batch';
  id?: string;
  timestamp: number;
}

const _oyentesLocales = new Set<(evento: MutacionDatosEvento) => void>();

/**
 * Notificador central de mutaciones en IndexedDB.
 * Solo debe llamarse tras la finalización exitosa de transacciones 'readwrite'.
 */
export function notificarMutacionDatos(
  almacen: StoreNameEvent,
  operacion: 'put' | 'delete' | 'batch',
  id?: string
): void {
  const detalle: MutacionDatosEvento = {
    almacen,
    operacion,
    id,
    timestamp: Date.now()
  };

  // 1. Notificar oyentes registrados en memoria (compatible con Node.js y React)
  _oyentesLocales.forEach((cb) => {
    try {
      cb(detalle);
    } catch (err) {
      console.warn('[NexoCampo Bus] Error en oyente de mutación:', err);
    }
  });

  // 2. Despachar CustomEvent si estamos en entorno de navegador
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(EVENTO_MUTACION_DATOS, { detail: detalle }));
    } catch (e) {
      console.warn('[NexoCampo Bus] Error al despachar CustomEvent de mutación:', e);
    }
  }
}

/**
 * Suscribe un callback a las mutaciones confirmadas de datos vivos.
 * Retorna la función de limpieza para el ciclo de vida del componente.
 */
export function suscribirMutacionDatos(
  callback: (evento: MutacionDatosEvento) => void
): () => void {
  _oyentesLocales.add(callback);

  let handlerBrowser: ((event: Event) => void) | null = null;
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    handlerBrowser = (event: Event) => {
      // Evitar duplicar la invocación si el callback ya fue ejecutado por _oyentesLocales
      // Los componentes montados en diferentes ventanas o iframes se benefician de CustomEvent
    };
    window.addEventListener(EVENTO_MUTACION_DATOS, handlerBrowser);
  }

  return () => {
    _oyentesLocales.delete(callback);
    if (handlerBrowser && typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener(EVENTO_MUTACION_DATOS, handlerBrowser);
    }
  };
}
