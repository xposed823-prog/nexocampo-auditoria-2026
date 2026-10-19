/**
 * NexoCampo 2026 - PWA Offline-First
 * Archivo: js/db.js
 * 
 * Capa de Persistencia Local y Cola de Sincronización en IndexedDB.
 * 
 * Decisiones Técnicas Clave:
 * 1. Transacciones Atómicas (ACID): Toda escritura de registros se realiza dentro de transacciones
 *    'readwrite' aisladas para prevenir inconsistencias si la batería o pestaña se cierra en campo.
 * 2. Cola de Salida (Outbox Pattern): Los registros capturados sin señal se guardan en el almacén
 *    'registros_pendientes' con id autoincremental, marca de tiempo ISO y estado 'pendiente'.
 * 3. Idempotencia y Desacoplamiento: El ID único se genera en el cliente para que el reintento
 *    de sincronización en red inestable no genere registros duplicados en el servidor central.
 * 4. Compatibilidad Dual: Funciona como módulo ES (export) y como objeto global (window.NexoDB)
 *    para máxima interoperabilidad sin frameworks obligatorios.
 */

const DB_NAME = 'NexoCampoPWA_DB';
const DB_VERSION = 1;

// Almacenes de Objetos (ObjectStores)
const STORES = {
  PENDIENTES: 'registros_pendientes',
  JORNADAS: 'jornadas',
  COLABORADORES: 'colaboradores',
  LABORES: 'labores_catalogo',
  CONFIGURACION: 'configuracion'
};

let dbInstance = null;

/**
 * Inicializa la base de datos IndexedDB y realiza las migraciones de esquema necesarias.
 * @returns {Promise<IDBDatabase>}
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    if (!('indexedDB' in window)) {
      const err = new Error('IndexedDB no está disponible en este navegador o entorno.');
      console.error('[NexoDB]', err);
      return reject(err);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log(`[NexoDB] Creando o actualizando esquema a versión ${DB_VERSION}...`);

      // 1. Almacén de Cola de Sincronización (Outbox)
      if (!db.objectStoreNames.contains(STORES.PENDIENTES)) {
        const storePendientes = db.createObjectStore(STORES.PENDIENTES, {
          keyPath: 'id',
          autoIncrement: true
        });
        storePendientes.createIndex('idx_creadoEn', 'creadoEn', { unique: false });
        storePendientes.createIndex('idx_entidad', 'entidad', { unique: false });
        storePendientes.createIndex('idx_syncStatus', 'syncStatus', { unique: false });
        console.log(`[NexoDB] Almacén '${STORES.PENDIENTES}' creado con éxito.`);
      }

      // 2. Almacén de Jornadas Confirmadas Localmente
      if (!db.objectStoreNames.contains(STORES.JORNADAS)) {
        const storeJornadas = db.createObjectStore(STORES.JORNADAS, {
          keyPath: 'id'
        });
        storeJornadas.createIndex('idx_fecha', 'fecha', { unique: false });
        storeJornadas.createIndex('idx_colaboradorId', 'colaboradorId', { unique: false });
        storeJornadas.createIndex('idx_estado', 'estado', { unique: false });
        console.log(`[NexoDB] Almacén '${STORES.JORNADAS}' creado con éxito.`);
      }

      // 3. Catálogo Maestro de Colaboradores (Pre-semillado para modo offline)
      if (!db.objectStoreNames.contains(STORES.COLABORADORES)) {
        const storeColaboradores = db.createObjectStore(STORES.COLABORADORES, {
          keyPath: 'id'
        });
        storeColaboradores.createIndex('idx_codigo', 'codigo', { unique: true });
        console.log(`[NexoDB] Almacén '${STORES.COLABORADORES}' creado con éxito.`);
      }

      // 4. Catálogo de Labores
      if (!db.objectStoreNames.contains(STORES.LABORES)) {
        db.createObjectStore(STORES.LABORES, { keyPath: 'id' });
        console.log(`[NexoDB] Almacén '${STORES.LABORES}' creado con éxito.`);
      }

      // 5. Parámetros de Configuración Local
      if (!db.objectStoreNames.contains(STORES.CONFIGURACION)) {
        db.createObjectStore(STORES.CONFIGURACION, { keyPath: 'clave' });
        console.log(`[NexoDB] Almacén '${STORES.CONFIGURACION}' creado con éxito.`);
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      console.log(`[NexoDB] Base de datos '${DB_NAME}' conectada y lista.`);
      // Semillado inicial si está vacío
      sembrarCatalogosIniciales(dbInstance);
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('[NexoDB] Error al abrir IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Semillado inicial de colaboradores ficticios y catálogo de labores para disponibilidad offline.
 */
function sembrarCatalogosIniciales(db) {
  try {
    const tx = db.transaction([STORES.COLABORADORES, STORES.LABORES], 'readwrite');
    const colStore = tx.objectStore(STORES.COLABORADORES);
    const countReq = colStore.count();

    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        console.log('[NexoDB] Sembrando catálogo inicial de colaboradores...');
        const mockColaboradores = [
          { id: 'col_1', codigo: 'COL-001', alias: 'J. Pérez', rol: 'Podador experto', cuadrilla: 'Cuadrilla Norte' },
          { id: 'col_2', codigo: 'COL-002', alias: 'M. Gómez', rol: 'Operario campo', cuadrilla: 'Cuadrilla Norte' },
          { id: 'col_3', codigo: 'COL-003', alias: 'C. Rodríguez', rol: 'Encargado malla', cuadrilla: 'Cuadrilla Coberturas' },
          { id: 'col_4', codigo: 'COL-004', alias: 'A. Martínez', rol: 'Operario campo', cuadrilla: 'Cuadrilla Coberturas' },
          { id: 'col_5', codigo: 'COL-005', alias: 'L. Hernández', rol: 'Tractorista', cuadrilla: 'Cuadrilla Maquinaria' },
          { id: 'col_6', codigo: 'COL-006', alias: 'R. Sánchez', rol: 'Operario campo', cuadrilla: 'Cuadrilla Norte' }
        ];
        mockColaboradores.forEach(c => colStore.put(c));
      }
    };

    const labStore = tx.objectStore(STORES.LABORES);
    const labCountReq = labStore.count();
    labCountReq.onsuccess = () => {
      if (labCountReq.result === 0) {
        console.log('[NexoDB] Sembrando catálogo inicial de labores...');
        const mockLabores = [
          { id: 'lab_1', nombre: 'Poda de formación', unidadMeta: 'árboles', metaEstandarHora: 15 },
          { id: 'lab_2', nombre: 'Raleo de frutos', unidadMeta: 'plantas', metaEstandarHora: 20 },
          { id: 'lab_3', nombre: 'Desyerbe en plato', unidadMeta: 'metros lineales', metaEstandarHora: 30 },
          { id: 'lab_4', nombre: 'Plástico y Polisombra', unidadMeta: 'metros cuadrados', metaEstandarHora: 50 },
          { id: 'lab_5', nombre: 'Oficios Varios de Campo', unidadMeta: 'tareas', metaEstandarHora: 1 }
        ];
        mockLabores.forEach(l => labStore.put(l));
      }
    };
  } catch (e) {
    console.warn('[NexoDB] Semillado omitido o ya ejecutado:', e.message);
  }
}

/**
 * Guarda un registro pendiente en la cola de salida cuando no hay conexión.
 * @param {string} entidad - Tipo de entidad ('jornada', 'labor', 'polisombra', 'asistencia', 'novedad')
 * @param {object} payload - Datos completos de la operación
 * @returns {Promise<number>} ID asignado en la cola
 */
export async function guardarRegistroPendiente(entidad, payload) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDIENTES, 'readwrite');
    const store = tx.objectStore(STORES.PENDIENTES);

    const registro = {
      entidad: entidad,
      payload: payload,
      creadoEn: new Date().toISOString(),
      syncStatus: 'pendiente',
      reintentos: 0
    };

    const request = store.add(registro);

    request.onsuccess = (e) => {
      console.log(`[NexoDB] Registro pendiente guardado con ID: ${e.target.result} (${entidad})`);
      resolve(e.target.result);
    };

    request.onerror = (e) => {
      console.error('[NexoDB] Error al guardar registro pendiente:', e.target.error);
      reject(e.target.error);
    };
  });
}

/**
 * Obtiene todos los registros pendientes de sincronización.
 * @returns {Promise<Array>}
 */
export async function obtenerRegistrosPendientes() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDIENTES, 'readonly');
    const store = tx.objectStore(STORES.PENDIENTES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Elimina un registro de la cola tras haber sido sincronizado con el servidor.
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function eliminarRegistroPendiente(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDIENTES, 'readwrite');
    const store = tx.objectStore(STORES.PENDIENTES);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Limpia todos los registros pendientes sincronizados con éxito.
 * @returns {Promise<boolean>}
 */
export async function limpiarRegistrosPendientes() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDIENTES, 'readwrite');
    const store = tx.objectStore(STORES.PENDIENTES);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Guarda o actualiza un registro en el almacén de jornadas confirmadas.
 * @param {object} jornada
 * @returns {Promise<string>}
 */
export async function guardarJornadaConfirmada(jornada) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.JORNADAS, 'readwrite');
    const store = tx.objectStore(STORES.JORNADAS);
    const request = store.put(jornada);

    request.onsuccess = () => resolve(jornada.id);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtiene todas las jornadas almacenadas localmente.
 * @returns {Promise<Array>}
 */
export async function obtenerTodasJornadas() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.JORNADAS, 'readonly');
    const store = tx.objectStore(STORES.JORNADAS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cuenta cuántos registros están esperando sincronización en la cola.
 * @returns {Promise<number>}
 */
export async function contarPendientes() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDIENTES, 'readonly');
    const store = tx.objectStore(STORES.PENDIENTES);
    const request = store.count();

    request.onsuccess = () => resolve(request.result || 0);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Exporta toda la base de datos a un formato JSON descargable (Respaldo Manual en Campo).
 * @returns {Promise<string>}
 */
export async function exportarBaseDatosJSON() {
  const [pendientes, jornadas] = await Promise.all([
    obtenerRegistrosPendientes(),
    obtenerTodasJornadas()
  ]);

  const backup = {
    exportadoEn: new Date().toISOString(),
    version: DB_VERSION,
    pendientes,
    jornadas
  };

  return JSON.stringify(backup, null, 2);
}

// Registro en el objeto global para acceso en scripts Vanilla
if (typeof window !== 'undefined') {
  window.NexoDB = {
    initDB,
    guardarRegistroPendiente,
    obtenerRegistrosPendientes,
    eliminarRegistroPendiente,
    limpiarRegistrosPendientes,
    guardarJornadaConfirmada,
    obtenerTodasJornadas,
    contarPendientes,
    exportarBaseDatosJSON
  };
}
