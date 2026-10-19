/**
 * NexoCampo 2026 - PWA Offline-First
 * Archivo: service-worker.js
 * 
 * Service Worker de alto rendimiento para operaciones agrícolas en campo abierto.
 * 
 * Decisiones Técnicas Clave:
 * 1. Estrategia de Caché Dual:
 *    - Navegación / Documentos: Network-First con fallback a offline.html.
 *    - Shell Estático (CSS, JS, Iconos, Manifiesto): Cache-First con Stale-While-Revalidate.
 * 2. Background Sync (Evento 'sync'):
 *    - Permite al supervisor guardar planillas sin conectividad. Cuando el dispositivo
 *      recupera señal (3G/4G/Wi-Fi en campamento), el navegador despierta al Service Worker
 *      para vaciar la cola de IndexedDB sin requerir que la aplicación esté abierta.
 * 3. Notificación Automática al Usuario:
 *    - Conforme al requerimiento normativo, tras completar con éxito la sincronización
 *      en segundo plano, se invoca self.registration.showNotification(...) confirmando
 *      la cantidad de registros agrícolas subidos al servidor central.
 * 4. Difusión a Clientes Activos:
 *    - Envía mensajes postMessage a las ventanas abiertas para refrescar contadores en vivo.
 */

const CACHE_NAME_STATIC = 'nexocampo-static-v1';
const CACHE_NAME_DYNAMIC = 'nexocampo-dynamic-v1';

// Recursos críticos del App Shell para precaché
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/style.css',
  '/js/db.js',
  '/js/app.js',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

// Nombre de la base de datos IndexedDB compartida
const DB_NAME = 'NexoCampoPWA_DB';
const DB_VERSION = 1;

/**
 * Evento 'install': Precaché de activos esenciales del App Shell
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando versión v1 y precacheando shell estático...');
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Precaché parcial de recursos:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/**
 * Evento 'activate': Limpieza de cachés obsoletas y reclamo inmediato de clientes
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando y tomando control inmediato...');
  const currentCaches = [CACHE_NAME_STATIC, CACHE_NAME_DYNAMIC];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log(`[Service Worker] Eliminando caché obsoleta: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Evento 'fetch': Intercepción de peticiones HTTP con estrategias según recurso
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Peticiones de API: Network-only (la app gestiona fallback a IndexedDB si falla)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({
          error: 'Offline',
          message: 'Sin conexión de red en campo. Datos almacenados en cola local.'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 2. Solicitudes de navegación (páginas HTML): Network-First con fallback a offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME_DYNAMIC).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // 3. Activos Estáticos: Cache-First con recarga en segundo plano
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        // Solo cachear respuestas exitosas de origen propio
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME_DYNAMIC).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.warn(`[Service Worker] Fallo de red para recurso: ${request.url}`, err);
      });
    })
  );
});

/**
 * Evento 'sync': Sincronización en segundo plano (Background Sync API)
 */
self.addEventListener('sync', (event) => {
  console.log(`[Service Worker] Evento sync disparado con etiqueta: '${event.tag}'`);
  if (event.tag === 'sync-jornadas' || event.tag === 'sync-registros' || event.tag.startsWith('sync-')) {
    event.waitUntil(procesarColaSincronizacion());
  }
});

/**
 * Lee los registros de IndexedDB, los envía a /api/sync y emite notificación al usuario.
 */
async function procesarColaSincronizacion() {
  console.log('[Service Worker] Iniciando procesamiento de cola de sincronización en IndexedDB...');
  
  try {
    const db = await abrirIndexedDB();
    const pendientes = await leerPendientesDesdeIDB(db);

    if (!pendientes || pendientes.length === 0) {
      console.log('[Service Worker] No hay registros pendientes por sincronizar.');
      return;
    }

    console.log(`[Service Worker] Enviando ${pendientes.length} registros al servidor central...`);

    const respuesta = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PWA-Sync-Origin': 'ServiceWorker-BackgroundSync'
      },
      body: JSON.stringify({ registros: pendientes })
    });

    if (!respuesta.ok) {
      throw new Error(`El servidor respondió con código HTTP ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    console.log('[Service Worker] Respuesta exitosa del servidor:', resultado);

    // Mover registros a confirmados y limpiar cola de pendientes
    await migrarPendientesAConfirmados(db, pendientes);

    // Enviar notificación push local al usuario
    await mostrarNotificacionSincronizacion(pendientes.length);

    // Avisar a todas las pestañas abiertas para actualizar la UI en tiempo real
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        total: pendientes.length,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('[Service Worker] Error durante la sincronización en segundo plano:', error);
    // El navegador reintentará automáticamente el evento sync según su política de backoff exponencial
    throw error;
  }
}

/**
 * Muestra la notificación nativa al usuario informando la sincronización completada.
 */
async function mostrarNotificacionSincronizacion(cantidad) {
  if (self.Notification && self.Notification.permission === 'granted') {
    const titulo = 'NexoCampo — Sincronización Exitosa';
    const opciones = {
      body: `Se han sincronizado correctamente ${cantidad} registro(s) agrícola(s) con el servidor central.`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [150, 80, 150],
      tag: 'nexocampo-sync-notice',
      renotify: true,
      data: {
        url: '/',
        timestamp: Date.now()
      },
      actions: [
        { action: 'ver', title: 'Ver Registros' }
      ]
    };

    return self.registration.showNotification(titulo, opciones);
  }
}

/**
 * Abre conexión a IndexedDB dentro del Service Worker.
 */
function abrirIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Lee todos los registros de 'registros_pendientes' en IndexedDB.
 */
function leerPendientesDesdeIDB(db) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains('registros_pendientes')) {
      return resolve([]);
    }
    const tx = db.transaction('registros_pendientes', 'readonly');
    const store = tx.objectStore('registros_pendientes');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mueve los registros sincronizados a 'jornadas' y limpia 'registros_pendientes'.
 */
function migrarPendientesAConfirmados(db, pendientes) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['registros_pendientes', 'jornadas'], 'readwrite');
    const pendStore = tx.objectStore('registros_pendientes');
    const jornStore = tx.objectStore('jornadas');

    pendientes.forEach((item) => {
      const jornada = {
        id: item.payload?.id || `jornada_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        entidad: item.entidad,
        fecha: item.payload?.fecha || new Date().toISOString().split('T')[0],
        datos: item.payload,
        sincronizadoEn: new Date().toISOString(),
        estado: 'sincronizado'
      };
      jornStore.put(jornada);
    });

    pendStore.clear();

    tx.oncomplete = () => {
      console.log('[Service Worker] Registros migrados a confirmados y cola vaciada.');
      resolve(true);
    };

    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Evento 'notificationclick': Apertura de la aplicación al pulsar la notificación
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
