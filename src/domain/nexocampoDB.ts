/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo v18.1.9 - Motor Canónico IndexedDB
 * Base de datos: 'nexocampo' | Versión: 4
 * Stores oficiales:
 *  - colaboradores (36 registros oficiales)
 *  - labores (23 labores agrícolas con unidades y tiempos estándar)
 *  - areas (Jamaica, Piloto, Púrpura, Naranja con bloques y túneles)
 *  - ausencias (Incapacidades, permisos y faltas con 7 códigos normativos)
 *  - jornadas (Jornadas integradas con tramos heterogéneos)
 *  - asistencia (Registros semanales con clave compuesta colaborador_id + fecha)
 */

import {
  COLABORADORES_CATALOGO,
  LABORES_AGRONOMICAS,
  AREAS_AGRONOMICAS,
  Colaborador,
  LaborAgricola,
  AreaAgricola
} from './catalogoAgronomico';

export const DB_NAME = 'nexocampo';
export const DB_VERSION = 4;
export const STORES = ['colaboradores', 'labores', 'areas', 'ausencias', 'jornadas', 'asistencia'] as const;
export type StoreName = typeof STORES[number];

export interface TramoJornada {
  id: string;
  tipo: 'labor' | 'auxiliar' | 'interrupcion' | 'incidente';
  titulo: string;
  labor_id?: string;
  labor_nombre?: string;
  unidad?: string;
  estandar_min?: number | null;
  personal_requerido_tabla?: number;
  personas_reales?: number;
  modelo?: 'individual' | 'grupal_tiempo' | 'grupal_meta' | 'tiempo' | 'oficios_varios';
  hora_inicio: string;
  hora_fin: string;
  area?: string;
  bloque?: string;
  tunel?: string;
  unidades?: number;
  meta?: number;
  completados?: number;
  estado?: 'planificada' | 'pendiente' | 'cumple' | 'validado' | 'rechazado_calidad' | 'no_cumple';
  motivo_pendiente?: string;
  observaciones?: string;
  severidad?: 'leve' | 'moderado' | 'grave';
  primeros_auxilios?: boolean;
}

export interface JornadaRegistro {
  id: string;
  fecha: string;
  colaboradores_ids: string[];
  tramos: TramoJornada[];
  creadoEn: string;
  actualizadoEn: string;
  sincronizado: boolean;
}

export interface AsistenciaRegistro {
  id: string; // `${colaborador_id}_${fecha}`
  colaborador_id: string;
  fecha: string;
  estado: 'sin_registrar' | 'presente' | 'retardo' | 'ausencia';
  hora_entrada?: string;
}

export interface AusenciaRegistro {
  id: string;
  colaborador_id: string;
  tipo: 'I' | 'JV' | 'LP' | 'P' | 'V' | 'SP' | 'C'; // 7 códigos oficiales
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  observacion?: string;
}

let _dbPromise: Promise<IDBDatabase> | null = null;

export function abrirDB(): Promise<IDBDatabase> {
  if (!_dbPromise) {
    _dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        _dbPromise = null;
        reject(new Error('IndexedDB no está disponible en este entorno.'));
        return;
      }

      let req: IDBOpenDBRequest;
      try {
        req = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (e) {
        _dbPromise = null;
        reject(new Error('No se pudo inicializar IndexedDB.'));
        return;
      }

      req.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        STORES.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      };

      req.onsuccess = async () => {
        const db = req.result;
        db.onclose = () => { _dbPromise = null; };
        db.onversionchange = () => {
          try { db.close(); } catch (_) { /* ignore */ }
          _dbPromise = null;
        };

        // Semillado inicial garantizado
        try {
          await semillarDatosInicialesSiVacio(db);
        } catch (e) {
          console.warn('[NexoCampo] Advertencia al semillar catálogos iniciales:', e);
        }

        resolve(db);
      };

      req.onerror = () => {
        _dbPromise = null;
        reject(req.error || new Error('Error al abrir la base de datos nexocampo.'));
      };

      req.onblocked = () => {
        _dbPromise = null;
        reject(new Error('Base de datos bloqueada por otra pestaña. Cierre pestañas duplicadas.'));
      };
    });
  }
  return _dbPromise;
}

async function _dbRequest<T>(
  store: StoreName,
  mode: IDBTransactionMode,
  operation: (os: IDBObjectStore) => IDBRequest
): Promise<T> {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    let tx: IDBTransaction;
    let request: IDBRequest;
    try {
      tx = db.transaction(store, mode);
      request = operation(tx.objectStore(store));
    } catch (e) {
      reject(e);
      return;
    }

    let settled = false;
    const fail = () => {
      if (!settled) {
        settled = true;
        reject(tx.error || request.error || new Error('Error en transacción IndexedDB'));
      }
    };

    request.onerror = fail;
    tx.onerror = fail;

    if (mode === 'readonly') {
      request.onsuccess = () => {
        if (!settled) {
          settled = true;
          resolve(request.result as T);
        }
      };
    } else {
      tx.oncomplete = () => {
        if (!settled) {
          settled = true;
          resolve(request.result as T);
        }
      };
    }
  });
}

export async function dbGetAll<T>(store: StoreName): Promise<T[]> {
  try {
    const res = await _dbRequest<T[]>(store, 'readonly', (os) => os.getAll());
    return res || [];
  } catch (e) {
    console.error(`[NexoCampo IDB] Error en dbGetAll(${store}):`, e);
    return [];
  }
}

export async function dbGet<T>(store: StoreName, id: string): Promise<T | null> {
  try {
    const res = await _dbRequest<T>(store, 'readonly', (os) => os.get(id));
    return res || null;
  } catch (e) {
    console.error(`[NexoCampo IDB] Error en dbGet(${store}, ${id}):`, e);
    return null;
  }
}

export async function dbPut<T extends { id: string }>(store: StoreName, item: T): Promise<T> {
  await _dbRequest(store, 'readwrite', (os) => os.put(item));
  return item;
}

export async function dbDelete(store: StoreName, id: string): Promise<boolean> {
  try {
    await _dbRequest(store, 'readwrite', (os) => os.delete(id));
    return true;
  } catch (e) {
    console.error(`[NexoCampo IDB] Error en dbDelete(${store}, ${id}):`, e);
    return false;
  }
}

/**
 * Semilla los 36 colaboradores, 23 labores y 4 áreas si la base está recién creada
 */
export async function semillarDatosInicialesSiVacio(db: IDBDatabase): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction(['colaboradores', 'labores', 'areas'], 'readwrite');
    const colStore = tx.objectStore('colaboradores');
    const countReq = colStore.count();

    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        // Cargar 36 colaboradores oficiales
        COLABORADORES_CATALOGO.forEach((c) => colStore.put(c));

        // Cargar 23 labores oficiales
        const labStore = tx.objectStore('labores');
        LABORES_AGRONOMICAS.forEach((l) => labStore.put(l));

        // Cargar 4 áreas oficiales
        const areaStore = tx.objectStore('areas');
        AREAS_AGRONOMICAS.forEach((a) => areaStore.put(a));
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve(); // No bloquear si falla el semillado
  });
}

/**
 * Exporta los 6 almacenes canónicos en un solo archivo JSON idéntico a NexoCampo original
 */
export async function exportarBackupCanónicoJSON(): Promise<string> {
  const [colaboradores, labores, areas, ausencias, jornadas, asistencia] = await Promise.all([
    dbGetAll<Colaborador>('colaboradores'),
    dbGetAll<LaborAgricola>('labores'),
    dbGetAll<AreaAgricola>('areas'),
    dbGetAll<AusenciaRegistro>('ausencias'),
    dbGetAll<JornadaRegistro>('jornadas'),
    dbGetAll<AsistenciaRegistro>('asistencia')
  ]);

  const payload = {
    formato: 'nexocampo_backup',
    version_db: DB_VERSION,
    fecha_exportacion: new Date().toISOString(),
    stores: {
      colaboradores,
      labores,
      areas,
      ausencias,
      jornadas,
      asistencia
    }
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Restaura los 6 almacenes canónicos desde un archivo de respaldo JSON
 */
export async function restaurarBackupCanónicoJSON(jsonString: string): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.stores || typeof data.stores !== 'object') {
      return { exito: false, mensaje: 'El archivo no contiene la estructura canónica de almacenes de NexoCampo.' };
    }

    const { colaboradores, labores, areas, ausencias, jornadas, asistencia } = data.stores;
    const db = await abrirDB();
    const tx = db.transaction(STORES as any, 'readwrite');

    const restaurarColeccion = (nombre: StoreName, items?: any[]) => {
      if (!Array.isArray(items)) return;
      const os = tx.objectStore(nombre);
      os.clear();
      items.forEach((it) => {
        if (it && it.id) os.put(it);
      });
    };

    restaurarColeccion('colaboradores', colaboradores);
    restaurarColeccion('labores', labores);
    restaurarColeccion('areas', areas);
    restaurarColeccion('ausencias', ausencias);
    restaurarColeccion('jornadas', jornadas);
    restaurarColeccion('asistencia', asistencia);

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve({ exito: true, mensaje: 'Respaldo restaurado con éxito en los 6 almacenes.' });
      tx.onerror = () => resolve({ exito: false, mensaje: 'Error al escribir los registros en IndexedDB.' });
    });
  } catch (e: any) {
    return { exito: false, mensaje: `Archivo JSON no válido: ${e?.message || 'Error de parseo'}` };
  }
}
