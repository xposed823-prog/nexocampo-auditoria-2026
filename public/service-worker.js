/**
 * NexoCampo 2026 - PWA Offline-First
 * Archivo: public/service-worker.js
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

const DB_NAME = 'NexoCampoPWA_DB';
const DB_VERSION = 1;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Precaché parcial:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME_STATIC, CACHE_NAME_DYNAMIC];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

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

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME_DYNAMIC).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[Service Worker] Fallo de red:', err);
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  console.log(`[Service Worker] Evento sync: ${event.tag}`);
  if (event.tag === 'sync-jornadas' || event.tag === 'sync-registros' || event.tag.startsWith('sync-')) {
    event.waitUntil(procesarColaSincronizacion());
  }
});

async function procesarColaSincronizacion() {
  try {
    const db = await abrirIndexedDB();
    const pendientes = await leerPendientesDesdeIDB(db);

    if (!pendientes || pendientes.length === 0) return;

    const respuesta = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PWA-Sync-Origin': 'ServiceWorker-BackgroundSync'
      },
      body: JSON.stringify({ registros: pendientes })
    });

    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    await migrarPendientesAConfirmados(db, pendientes);
    await mostrarNotificacionSincronizacion(pendientes.length);

    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        total: pendientes.length,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[Service Worker] Error sync:', error);
    throw error;
  }
}

async function mostrarNotificacionSincronizacion(cantidad) {
  if (self.Notification && self.Notification.permission === 'granted') {
    return self.registration.showNotification('NexoCampo — Sincronización Exitosa', {
      body: `Se han sincronizado correctamente ${cantidad} registro(s) agrícola(s) con el servidor central.`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [150, 80, 150],
      tag: 'nexocampo-sync-notice',
      data: { url: '/', timestamp: Date.now() }
    });
  }
}

function abrirIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function leerPendientesDesdeIDB(db) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains('registros_pendientes')) return resolve([]);
    const tx = db.transaction('registros_pendientes', 'readonly');
    const store = tx.objectStore('registros_pendientes');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function migrarPendientesAConfirmados(db, pendientes) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['registros_pendientes', 'jornadas'], 'readwrite');
    const pendStore = tx.objectStore('registros_pendientes');
    const jornStore = tx.objectStore('jornadas');

    pendientes.forEach((item) => {
      jornStore.put({
        id: item.payload?.id || `jornada_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        entidad: item.entidad,
        fecha: item.payload?.fecha || new Date().toISOString().split('T')[0],
        datos: item.payload,
        sincronizadoEn: new Date().toISOString(),
        estado: 'sincronizado'
      });
    });

    pendStore.clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
