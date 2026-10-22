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
 * 
 * NOTA DE SEGURIDAD: Este módulo ahora soporta cifrado AES-GCM-256 para protección de datos sensibles
 */

import {
  COLABORADORES_CATALOGO,
  LABORES_AGRONOMICAS,
  AREAS_AGRONOMICAS,
  Colaborador,
  LaborAgricola,
  AreaAgricola
} from './catalogoAgronomico';
import { notificarMutacionDatos } from './eventBus';
import { encryptData, decryptData } from './cryptoUtils';

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
  tipo_registro?: 'oficio_vario';
  tareas_asignadas?: number;
  tareas_completadas?: number;
  cumplimiento_tareas_pct?: number;
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

export class IndexedDBError extends Error {
  public store: StoreName;
  public override cause?: unknown;

  constructor(store: StoreName, mensaje: string, cause?: unknown) {
    super(`[IndexedDB:${store}] ${mensaje}`);
    this.name = 'IndexedDBError';
    this.store = store;
    this.cause = cause;
  }
}

export async function dbGetAll<T>(store: StoreName, decrypt: boolean = false): Promise<T[]> {
  try {
    const res = await _dbRequest<T[]>(store, 'readonly', (os) => os.getAll());
    if (!res || res.length === 0) return [];
    
    if (decrypt) {
      return await Promise.all(res.map(async item => {
        if (item && typeof item === 'object' && item._encrypted) {
          return await decryptData(item);
        }
        return item;
      }));
    }
    return res;
  } catch (e: any) {
    console.error(`[NexoCampo IDB] Error en dbGetAll(${store}):`, e);
    throw new IndexedDBError(store, e?.message || 'Error al consultar almacén en IndexedDB', e);
  }
}

export async function dbGet<T>(store: StoreName, id: string, decrypt: boolean = false): Promise<T | null> {
  try {
    const res = await _dbRequest<T>(store, 'readonly', (os) => os.get(id));
    if (res === undefined) return null;
    
    if (decrypt && res && typeof res === 'object' && (res as any)._encrypted) {
      return await decryptData(res as any);
    }
    return res;
  } catch (e: any) {
    console.error(`[NexoCampo IDB] Error en dbGet(${store}, ${id}):`, e);
    throw new IndexedDBError(store, e?.message || `Error al obtener registro con ID ${id}`, e);
  }
}

export async function dbPut<T extends { id: string }>(store: StoreName, item: T, encrypt: boolean = false): Promise<T> {
  try {
    let itemToStore = item;
    if (encrypt) {
      const encrypted = await encryptData(item);
      itemToStore = { ...item, ...encrypted, _encrypted: true } as T;
    }
    await _dbRequest(store, 'readwrite', (os) => os.put(itemToStore));
    notificarMutacionDatos(store, 'put', item.id);
    return item;
  } catch (e: any) {
    console.error(`[NexoCampo IDB] Error en dbPut(${store}, ${item.id}):`, e);
    throw new IndexedDBError(store, e?.message || `Error al guardar registro ${item.id}`, e);
  }
}

export async function dbDelete(store: StoreName, id: string): Promise<boolean> {
  try {
    await _dbRequest(store, 'readwrite', (os) => os.delete(id));
    return true;
  } catch (e: any) {
    console.error(`[NexoCampo IDB] Error en dbDelete(${store}, ${id}):`, e);
    throw new IndexedDBError(store, e?.message || `Error al eliminar registro ${id}`, e);
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

export interface DatabaseSnapshot {
  colaboradores: Colaborador[];
  labores: LaborAgricola[];
  areas: AreaAgricola[];
  ausencias: AusenciaRegistro[];
  jornadas: JornadaRegistro[];
  asistencia: AsistenciaRegistro[];
}

/**
 * Captura un snapshot completo en memoria de los 6 almacenes
 */
export async function capturarSnapshotMemoria(): Promise<DatabaseSnapshot> {
  const [colaboradores, labores, areas, ausencias, jornadas, asistencia] = await Promise.all([
    dbGetAll<Colaborador>('colaboradores'),
    dbGetAll<LaborAgricola>('labores'),
    dbGetAll<AreaAgricola>('areas'),
    dbGetAll<AusenciaRegistro>('ausencias'),
    dbGetAll<JornadaRegistro>('jornadas'),
    dbGetAll<AsistenciaRegistro>('asistencia')
  ]);
  return { colaboradores, labores, areas, ausencias, jornadas, asistencia };
}

/**
 * Valida minuciosamente la estructura del JSON antes de alterar la base de datos
 */
export function validarEstructuraBackupJSON(data: any): { valido: boolean; error?: string } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valido: false, error: 'El archivo de respaldo no contiene un objeto JSON válido.' };
  }

  // Compatibilidad explícita con el formato actual del destino y el formato PWA original.
  const formatoDestino = data.formato === 'nexocampo_backup' && data.version_db === DB_VERSION;
  const formatoPwaOriginal = data.version === 'nexocampo-backup-v1';
  if (!formatoDestino && !formatoPwaOriginal) {
    return {
      valido: false,
      error: 'Formato o versión de respaldo no compatible. No se modificó la base de datos.'
    };
  }

  if (!data.stores || typeof data.stores !== 'object' || Array.isArray(data.stores)) {
    return { valido: false, error: 'La propiedad "stores" no existe o no tiene un formato válido.' };
  }

  const requeridos = ['colaboradores', 'labores', 'areas', 'ausencias', 'jornadas', 'asistencia'] as const;
  for (const nombre of requeridos) {
    const lista = data.stores[nombre];
    if (!Array.isArray(lista)) {
      return {
        valido: false,
        error: `El almacén "${nombre}" falta o no es un arreglo. No se modificó la base de datos.`
      };
    }

    const ids = new Set<string>();
    for (let i = 0; i < lista.length; i++) {
      const item = lista[i];
      if (!item || typeof item !== 'object' || Array.isArray(item) ||
          (typeof item.id !== 'string' && typeof item.id !== 'number') ||
          String(item.id).trim() === '') {
        return {
          valido: false,
          error: `Elemento inválido en "${nombre}", posición ${i}: falta un identificador válido.`
        };
      }
      const id = String(item.id);
      if (ids.has(id)) {
        return {
          valido: false,
          error: `Identificador duplicado "${id}" en el almacén "${nombre}". No se modificó la base de datos.`
        };
      }
      ids.add(id);
    }
  }

  return { valido: true };
}

/**
 * Restaura los seis almacenes en una sola transacción atómica.
 * El formato se valida por completo antes de abrir la transacción de escritura.
 */
export async function restaurarBackupCanónicoJSON(jsonString: string): Promise<{ exito: boolean; mensaje: string }> {
  let txError = '';

  try {
    let data: any;
    try {
      data = JSON.parse(jsonString);
    } catch {
      return { exito: false, mensaje: 'El archivo no contiene JSON válido. No se modificó la base de datos.' };
    }

    const validacion = validarEstructuraBackupJSON(data);
    if (!validacion.valido) {
      return { exito: false, mensaje: validacion.error || 'Estructura de respaldo inválida.' };
    }

    const db = await abrirDB();

    // Una única transacción readwrite sobre los seis almacenes es atómica:
    // si una operación falla y la transacción se aborta, IndexedDB conserva
    // el estado previo. No se lanza un segundo "rollback" concurrente.
    return await new Promise((resolve) => {
      let finalizado = false;
      const finalizar = (resultado: { exito: boolean; mensaje: string }) => {
        if (finalizado) return;
        finalizado = true;
        resolve(resultado);
      };

      let tx: IDBTransaction;
      try {
        tx = db.transaction([...STORES], 'readwrite');
      } catch (error: any) {
        finalizar({
          exito: false,
          mensaje: `No se pudo iniciar la restauración: ${error?.message || 'error de IndexedDB'}. No se modificó la base de datos.`
        });
        return;
      }

      tx.oncomplete = () => {
        STORES.forEach((store) => notificarMutacionDatos(store, 'batch'));
        finalizar({ exito: true, mensaje: 'Respaldo validado y restaurado en los 6 almacenes.' });
      };

      tx.onerror = () => {
        txError = tx.error?.message || 'Error de transacción IndexedDB';
      };

      tx.onabort = () => {
        finalizar({
          exito: false,
          mensaje: `La restauración fue abortada (${txError || tx.error?.message || 'error de escritura'}). IndexedDB conservó los datos anteriores; no se aplicó una restauración parcial.`
        });
      };

      try {
        for (const store of STORES) {
          const objectStore = tx.objectStore(store);
          objectStore.clear();
          for (const item of data.stores[store]) {
            objectStore.put(item);
          }
        }
      } catch (error: any) {
        txError = error?.message || 'Error al preparar los registros';
        try { tx.abort(); } catch { /* La transacción pudo haber terminado. */ }
      }
    });
  } catch (error: any) {
    return {
      exito: false,
      mensaje: `No se pudo restaurar el respaldo: ${error?.message || 'error desconocido'}. No se confirmó ningún cambio.`
    };
  }
}


/**
 * Persistencia atómica de asistencia individual
 */
export async function guardarAsistenciaAtomica(
  colaborador_id: string,
  fecha: string,
  estado: 'sin_registrar' | 'presente' | 'retardo' | 'ausencia',
  hora_entrada?: string
): Promise<AsistenciaRegistro> {
  const id = `${colaborador_id}_${fecha}`;
  const registro: AsistenciaRegistro = {
    id,
    colaborador_id,
    fecha,
    estado,
    ...(hora_entrada ? { hora_entrada } : {})
  };
  await dbPut('asistencia', registro);
  notificarMutacionDatos('asistencia', 'put', id);
  return registro;
}

/**
 * Persistencia atómica de lote de asistencia (ej. pase de lista matutino)
 */
export async function guardarLoteAsistencia(
  registros: Array<{
    colaborador_id: string;
    fecha: string;
    estado: 'sin_registrar' | 'presente' | 'retardo' | 'ausencia';
    hora_entrada?: string;
  }>
): Promise<void> {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('asistencia', 'readwrite');
    const os = tx.objectStore('asistencia');
    registros.forEach((r) => {
      os.put({
        id: `${r.colaborador_id}_${r.fecha}`,
        colaborador_id: r.colaborador_id,
        fecha: r.fecha,
        estado: r.estado,
        ...(r.hora_entrada ? { hora_entrada: r.hora_entrada } : {})
      });
    });
    tx.oncomplete = () => {
      notificarMutacionDatos('asistencia', 'batch');
      resolve();
    };
    tx.onerror = () => reject(tx.error || new Error('Error al guardar lote de asistencia'));
  });
}

/**
 * Hidratación de la matriz semanal de asistencia desde IndexedDB
 */
export async function cargarMatrizAsistenciaSemana(
  fechaInicioLunes: string = '2026-10-19'
): Promise<Record<string, 'sin_registrar' | 'presente' | 'retardo' | 'ausencia'>> {
  const registros = await dbGetAll<AsistenciaRegistro>('asistencia');
  const matriz: Record<string, 'sin_registrar' | 'presente' | 'retardo' | 'ausencia'> = {};

  const fechasSemana: string[] = [];
  const baseDate = new Date(`${fechaInicioLunes}T12:00:00Z`);
  for (let i = 0; i < 6; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    fechasSemana.push(d.toISOString().split('T')[0]);
  }

  registros.forEach((reg) => {
    // Si la clave tiene formato directo col_X-idx
    if (reg.id && reg.id.includes('-') && !reg.id.includes('_')) {
      matriz[reg.id] = reg.estado;
    }
    // Si la clave tiene formato normativo col_X_YYYY-MM-DD
    const diaIdx = fechasSemana.indexOf(reg.fecha);
    if (diaIdx !== -1) {
      matriz[`${reg.colaborador_id}-${diaIdx}`] = reg.estado;
    }
  });

  return matriz;
}

/**
 * Guarda o actualiza un registro completo de jornada en IndexedDB
 */
export async function guardarJornadaRegistro(jornada: JornadaRegistro): Promise<JornadaRegistro> {
  const item = await dbPut<JornadaRegistro>('jornadas', jornada);
  notificarMutacionDatos('jornadas', 'put', jornada.id);
  return item;
}

/**
 * Guarda o actualiza un registro formal de ausencia en IndexedDB
 */
export async function guardarAusenciaRegistro(ausencia: AusenciaRegistro): Promise<AusenciaRegistro> {
  const item = await dbPut<AusenciaRegistro>('ausencias', ausencia);
  notificarMutacionDatos('ausencias', 'put', ausencia.id);
  return item;
}

/**
 * Obtiene todas las jornadas registradas para una fecha dada
 */
export async function obtenerJornadasPorFecha(fecha: string): Promise<JornadaRegistro[]> {
  const todas = await dbGetAll<JornadaRegistro>('jornadas');
  return todas.filter(j => j.fecha === fecha);
}


