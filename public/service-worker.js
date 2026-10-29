/**
 * NexoCampo Auditoría 2026 — Service Worker PWA.
 * La sincronización solo se confirma cuando el backend responde success=true
 * y sincronizados coincide exactamente con el tamaño del lote.
 */

const CACHE_NAME_STATIC = 'nexocampo-static-v2';
const CACHE_NAME_DYNAMIC = 'nexocampo-dynamic-v2';

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
    caches.open(CACHE_NAME_STATIC)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn('[Service Worker] Precaché parcial:', error);
      }))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME_STATIC, CACHE_NAME_DYNAMIC];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) return caches.delete(cacheName);
          return undefined;
        })
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({
        success: false,
        error: 'API_UNAVAILABLE',
        message: 'No hay conexión con el servicio remoto. La cola local se conserva.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }))
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME_DYNAMIC).then((cache) => cache.put(request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request).then((cachedResponse) => cachedResponse || caches.match('/offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME_DYNAMIC).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      }).catch((error) => {
        console.warn('[Service Worker] Fallo de red:', error);
        return undefined;
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jornadas' || event.tag === 'sync-registros' || event.tag.startsWith('sync-')) {
    event.waitUntil(procesarColaSincronizacion());
  }
});

async function procesarColaSincronizacion() {
  const db = await abrirIndexedDB();
  const pendientes = await leerPendientesDesdeIDB(db);
  if (!pendientes || pendientes.length === 0) return;

  const respuesta = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-PWA-Sync-Origin': 'ServiceWorker-BackgroundSync'
    },
    body: JSON.stringify({ registros: pendientes })
  });

  if (!respuesta.ok) {
    throw new Error(`Sincronización no confirmada (HTTP ${respuesta.status}); la cola se conserva.`);
  }

  let confirmacion;
  try {
    confirmacion = await respuesta.json();
  } catch {
    throw new Error('El servidor no devolvió JSON válido; la cola se conserva.');
  }

  if (confirmacion?.success !== true || confirmacion?.sincronizados !== pendientes.length) {
    throw new Error('El servidor no confirmó el lote completo; la cola se conserva.');
  }

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
}

async function mostrarNotificacionSincronizacion(cantidad) {
  if (self.Notification && self.Notification.permission === 'granted') {
    return self.registration.showNotification('NexoCampo — Sincronización confirmada', {
      body: `El servidor confirmó la recepción de ${cantidad} registro(s).`,
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
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function leerPendientesDesdeIDB(db) {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains('registros_pendientes')) return resolve([]);
    const tx = db.transaction('registros_pendientes', 'readonly');
    const request = tx.objectStore('registros_pendientes').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

function fechaLocalHoy() {
  const hoy = new Date();
  const pad = (valor) => String(valor).padStart(2, '0');
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
}

function migrarPendientesAConfirmados(db, pendientes) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['registros_pendientes', 'jornadas'], 'readwrite');
    const pendStore = tx.objectStore('registros_pendientes');
    const jornStore = tx.objectStore('jornadas');
    const ahora = new Date().toISOString();

    pendientes.forEach((item) => {
      jornStore.put({
        id: item.payload?.id || `jornada_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        entidad: item.entidad,
        fecha: item.payload?.fecha || fechaLocalHoy(),
        datos: item.payload,
        sincronizadoEn: ahora,
        estado: 'sincronizado'
      });
    });

    pendStore.clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Transacción de sincronización cancelada'));
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
      return undefined;
    })
  );
});
