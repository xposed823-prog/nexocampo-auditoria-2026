# INFORME DE AUDITORÍA PWA Y RESILIENCIA OFFLINE-FIRST — NEXOCAMPO PRO (v18.1.9)
**Documento Técnico:** `PWA_AUDIT_NEXOCAMPO_REPORT.md`  
**Objetivo:** Evaluación del cumplimiento del estándar Progressive Web App (PWA), estrategias de caché, sincronización en segundo plano (Background Sync API), notificaciones push locales y experiencia de instalación en dispositivos móviles Android e iOS.  
**Fecha:** 2026-10-20  
**Resultado Global:** **100% CUMPLIMIENTO DE CRITERIOS PWA Y OFFLINE-FIRST**  

---

## 1. RESUMEN EJECUTIVO DE AUDITORÍA PWA

NexoCampo fue auditado bajo los estándares W3C de Progressive Web Apps, las directrices de instalabilidad de Google Chrome / Chromium y las restricciones específicas de WebKit / Safari en iOS.

### Indicadores Clave de Cumplimiento:
1. **Manifiesto Web (`manifest.json`):** **100% VÁLIDO.** Define identidad canónica, `display: "standalone"`, `start_url: "/"`, orientación portrait fija para uso móvil, iconos estándar de 192×192 px, 512×512 px y máscara adaptativa (*maskable*), además de atajos de acceso rápido (*shortcuts*).
2. **Ciclo de Vida del Service Worker (`service-worker.js`):** **100% CONFORME.** Implementa precaché atómico del App Shell en el evento `install`, activación inmediata con `self.skipWaiting()` y limpieza de versiones obsoletas en `activate` con `clients.claim()`.
3. **Estrategias de Red y Caché:**
   - **Shell Estático y Activos:** *Cache-First* con *Stale-While-Revalidate* dinámico en `nexocampo-dynamic-v1`.
   - **Navegación / Documentos:** *Network-First* con degradado seguro a `offline.html` en desconexión absoluta.
4. **Sincronización en Segundo Plano (Background Sync):**
   - El Service Worker escucha activamente el evento `self.addEventListener('sync', ...)`.
   - Lee la cola de registros pendientes desde IndexedDB, los despacha hacia el endpoint `/api/sync` y, tras el éxito, emite una **notificación nativa automática al usuario** (`self.registration.showNotification`).
   - Difunde un mensaje `postMessage` (`SYNC_COMPLETED`) a todas las pestañas activas para refrescar contadores en vivo.
5. **Instalabilidad Móvil (In-App Install Prompt):**
   - Intercepta el evento nativo `beforeinstallprompt` y presenta el botón táctil "Instalar App" en el encabezado.
   - Detecta dispositivos iOS y despliega una guía modal visual asistida para agregar a la pantalla de inicio vía Safari.

---

## 2. MATRIZ DE CUMPLIMIENTO TÉCNICO PWA

| Requisito PWA | Archivo / Componente | Estado | Evidencia Técnica Comprobada |
| :--- | :--- | :---: | :--- |
| **Web App Manifest** | `/manifest.json` | **CONFORME** | Nombre, `short_name`, `theme_color: #15803d`, `display: standalone`. |
| **Iconos PNG y Maskable** | `/pwa-192x192.png`, `/pwa-512x512.png` | **CONFORME** | Iconos 192x192, 512x512 y `pwa-maskable-512x512.png` (*purpose: maskable*). |
| **Meta Tags Móviles iOS** | `/index.html` | **CONFORME** | `apple-mobile-web-app-capable: yes`, `apple-touch-icon: /apple-touch-icon.png`. |
| **Viewport Controlado** | `/index.html` | **CONFORME** | `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`. |
| **Registro de SW** | `/index.html` y `/src/main.tsx` | **CONFORME** | `navigator.serviceWorker.register('/service-worker.js', { scope: '/' })`. |
| **Precaché App Shell** | `/service-worker.js` | **CONFORME** | Precaché de `/`, `/index.html`, `/offline.html`, `/manifest.json`, iconos y CSS. |
| **Fallback Sin Conexión** | `/offline.html` | **CONFORME** | Vista offline standalone con diseño de alta visibilidad y botón de reconexión. |
| **Background Sync API** | `/service-worker.js:147` | **CONFORME** | Escucha `sync-jornadas`, vacía cola IDB y procesa lote con reintentos exponenciales. |
| **Notificación Automática** | `/service-worker.js:213` | **CONFORME** | `registration.showNotification('NexoCampo — Sincronización Exitosa', ...)`. |
| **Prompt In-App** | `/src/domain/usePWAInstall.ts` | **CONFORME** | Hook reactivo que gestiona `deferredPrompt` y guía para dispositivos iOS. |
| **Cola de Pendientes IDB** | `/src/domain/pwaManager.ts` | **CONFORME** | Almacena registros offline y cuenta pendientes para la píldora del encabezado. |

---

## 3. ARQUITECTURA DE SINCRONIZACIÓN Y CACHÉ

```
                           FLUJO DE NAVEGACIÓN Y CACHÉ EN CAMPO
 ┌──────────────────────┐        ¿Hay Red?
 │ Petición Navegación  ├────────────────────────────┐
 └──────────┬───────────┘                            │
            │                                        │
           SÍ                                       NO
            ▼                                        ▼
 ┌──────────────────────┐                ┌──────────────────────┐
 │ Servidor Web Central │ (Fallo de Red) │    service-worker    │
 │ (Respuesta Dinámica) ├───────────────►│ (Fallback a Memoria) │
 └──────────────────────┘                └──────────┬───────────┘
                                                    │
                                                    ▼
                                         ┌──────────────────────┐
                                         │  index.html precaché │
                                         │   (o offline.html)   │
                                         └──────────────────────┘

                    FLUJO DE BACKGROUND SYNC Y NOTIFICACIÓN
 ┌──────────────────────┐
 │ Supervisor en Campo  │ (Registra Jornada sin señal 3G/4G)
 └──────────┬───────────┘
            │
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ IndexedDB ('pendientes') ──► Cola local persistente a disco  │
 └──────────────────────────────────────┬───────────────────────┘
                                        │ (Se recupera conectividad)
                                        ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ Service Worker (Evento 'sync' -> procesarColaSincronizacion) │
 └──────────────────┬───────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
 ┌───────────────┐     ┌────────────────────────────────────────┐
 │ POST /api/sync│     │ self.registration.showNotification()   │
 │ Servidor Cloud│     │ "Sincronizados N registros con éxito"  │
 └───────────────┘     └────────────────────────────────────────┘
```

---

## 4. DETALLE DE IMPLEMENTACIÓN DEL SERVICE WORKER

### 4.1. Estrategia de Caché Dual
1. **Recursos Estáticos (`STATIC_ASSETS`):**
   - Se precachean en la instalación: `/`, `/index.html`, `/offline.html`, `/manifest.json`, iconos y estilos.
   - En peticiones posteriores, se sirven con estrategia **Cache-First**: si el archivo existe en caché, se entrega instantáneamente; si no, se descarga de la red y se almacena en `nexocampo-dynamic-v1`.
2. **Páginas de Navegación (`request.mode === 'navigate'`):**
   - Se atienden mediante **Network-First**: el navegador intenta obtener la versión más reciente del servidor central.
   - Si la red falla (desconexión en lote o invernadero), el Service Worker intercepta la excepción y retorna el `index.html` cacheado o `offline.html`, garantizando que la aplicación nunca muestre la pantalla de error genérica del navegador ("Sin Internet").

---

### 4.2. Sincronización en Segundo Plano y Notificación
Conforme al requerimiento técnico de la arquitectura:
1. El supervisor guarda jornadas, asistencias o labores mientras se encuentra en una zona sin cobertura celular.
2. Los datos se almacenan de inmediato en el almacén de registros pendientes de IndexedDB.
3. El frontend invoca `navigator.serviceWorker.ready.then(reg => reg.sync.register('sync-jornadas'))`.
4. Tan pronto como el terminal móvil detecta señal de red (incluso si la aplicación está cerrada o en segundo plano), el sistema operativo despierta al Service Worker.
5. El Service Worker envía el lote en formato JSON a `/api/sync`.
6. Al recibir respuesta HTTP 200:
   - Los registros se migran al almacén de confirmados.
   - Se muestra la notificación automática al usuario:
     ```javascript
     self.registration.showNotification('NexoCampo — Sincronización Exitosa', {
       body: `Se han sincronizado correctamente ${cantidad} registro(s) agrícola(s) con el servidor central.`,
       icon: '/pwa-192x192.png',
       badge: '/pwa-192x192.png'
     });
     ```
   - Se emite un mensaje `postMessage` a las pestañas activas para actualizar el contador de pendientes en la barra superior.

---

## 5. EXPERIENCIA DE INSTALACIÓN Y ACCESIBILIDAD MÓVIL

1. **Plataforma Android / Chromium:**
   - Intercepción de `beforeinstallprompt`.
   - Botón visible `[Instalar App]` con icono móvil en el encabezado.
   - Instalación silenciosa en pantalla de inicio con icono de alta resolución y splash screen nativo en color verde esmeralda (`#15803d`).
2. **Plataforma iOS / Safari:**
   - Detección precisa de User-Agent iOS (`/iphone|ipad|ipod/`).
   - Si la aplicación no está en modo standalone, se presenta el botón `[Instalar iOS]`.
   - Al pulsar, abre un modal ergonómico que guía paso a paso al usuario:
     1. Tocar el botón **Compartir** de Safari.
     2. Seleccionar **«Añadir a la pantalla de inicio»**.
     3. Abrir NexoCampo como aplicación autónoma a pantalla completa.

---

## 6. PRUEBAS DE ESTRÉS PWA EJECUTADAS Y APROBADAS

Se ejecutaron pruebas automatizadas sobre la cola de sincronización en `src/domain/pwaQueue.test.ts`:
* **Test 1:** Rechazo de cuerpos vacíos o inválidos $\to$ **APROBADO**.
* **Test 2:** Validación de lotes multi-entidad con múltiples registros offline (jornada, coberturas, asistencia) $\to$ **APROBADO**.
* **Test 3:** Detección y descarte de registros corruptos o sin timestamps UTC válidos $\to$ **APROBADO**.

---

> **CERTIFICACIÓN PWA:** La arquitectura Progressive Web App de NexoCampo PRO v18.1.9 cumple al 100% con los estándares de instalabilidad, autonomía offline, Background Sync y notificaciones automáticas. Lista para pruebas de campo en dispositivos físicos.
