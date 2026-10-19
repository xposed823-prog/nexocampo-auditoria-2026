# 30 — Guía de Mantenimiento Técnico y Soporte de Operaciones
## NexoCampo 2026 — Supervisión Agrícola Offline-First

---

### 1. Arquitectura de Mantenimiento Preventivo

NexoCampo 2026 fue concebido bajo el principio de **cero dependencias externas pesadas en el cliente**, facilitando un ciclo de mantenimiento ágil y predecible:

1. **Capa Visual:** React 19 + Tailwind CSS en `src/App.tsx`.
2. **Capa de Dominio Puro:** Módulos TypeScript sin dependencias en `src/domain/`.
3. **Capa de Persistencia Offline:** Vanilla JavaScript en `js/db.js` y `public/js/db.js`.
4. **Capa de Ciclo de Vida PWA:** Service Worker estándar en `service-worker.js` y `public/service-worker.js`.

---

### 2. Gestión y Migración de Esquemas en IndexedDB

Cuando sea necesario añadir un nuevo almacén de objetos (ObjectStore) o nuevos índices en la base de datos local `NexoCampoPWA_DB`:

1. **Incrementar la versión de la base de datos:**
   En `js/db.js` y `public/js/db.js`:
   ```javascript
   const DB_NAME = 'NexoCampoPWA_DB';
   const DB_VERSION = 2; // Incrementar de 1 a 2
   ```
2. **Actualizar el controlador `onupgradeneeded`:**
   Verificar siempre la existencia previa del almacén antes de crearlo para no borrar datos históricos del supervisor:
   ```javascript
   request.onupgradeneeded = (event) => {
     const db = event.target.result;
     // Almacenes versión 1...
     if (!db.objectStoreNames.contains('nuevas_evaluaciones_calidad')) {
       const store = db.createObjectStore('nuevas_evaluaciones_calidad', { keyPath: 'id' });
       store.createIndex('idx_fecha', 'fecha', { unique: false });
     }
   };
   ```
3. **Regla de Oro:** **Nunca invocar `db.deleteObjectStore()`** en producción sin un proceso previo de migración y confirmación de respaldo JSON.

---

### 3. Depuración y Ciclo de Vida del Service Worker

#### 3.1. Invalidación y Actualización de Caché
Para forzar la actualización del Service Worker en los teléfonos móviles de los supervisores cuando se despliega una nueva versión de la interfaz o estilos:

1. Modificar la constante de versión de caché en `service-worker.js`:
   ```javascript
   const CACHE_NAME_STATIC = 'nexocampo-static-v2'; // Cambiar v1 -> v2
   const CACHE_NAME_DYNAMIC = 'nexocampo-dynamic-v2';
   ```
2. El evento `activate` del Service Worker automáticamente eliminará las cachés obsoletas:
   ```javascript
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       caches.keys().then((keys) => {
         return Promise.all(
           keys.map((k) => {
             if (k !== CACHE_NAME_STATIC && k !== CACHE_NAME_DYNAMIC) {
               return caches.delete(k);
             }
           })
         );
       })
     );
   });
   ```

#### 3.2. Diagnóstico de Bloqueos en Background Sync
Si los registros permanecen en la cola de salida y no se sincronizan:
1. Abrir DevTools en Chrome (`chrome://inspect/#devices` para dispositivos Android conectados por USB).
2. Ir a **Application > Service Workers** y verificar si hay errores en rojo en la consola del worker.
3. Hacer clic en **Sync** y enviar manualmente el tag `sync-jornadas` para forzar la ejecución del evento `sync`.
4. Comprobar la respuesta HTTP del endpoint `/api/sync` en la pestaña **Network**.

---

### 4. Política de Actualización de Dependencias

- **Chequeo periódico de vulnerabilidades:**
  ```bash
  npm audit
  ```
- **Actualización controlada de parches (Minor / Patch):**
  ```bash
  npm update
  ```
- **Regla de Integridad:** Tras cualquier actualización de paquetes npm, ejecutar obligatoriamente la suite de 46 pruebas automatizadas:
  ```bash
  node --test src/domain/*.test.ts
  ```
  Si alguna prueba de cálculo o solapamiento falla, revertir el paquete inmediatamente.

---

### 5. Procedimiento de Soporte Técnico ante Pérdida de Datos en Campo

Si un supervisor experimenta problemas en su dispositivo móvil:
1. **Paso 1: Exportar Respaldo de Emergencia:**
   - Si la interfaz aún abre, ir a la pestaña **11. Respaldos** y presionar **"Descargar Respaldo JSON Local"**.
   - Esto guarda de forma inmediata todos los ObjectStores de IndexedDB en el almacenamiento de descargas del teléfono.
2. **Paso 2: Limpieza de Caché de Aplicación (Clear Cache):**
   - En Chrome para Android: Configuración > Privacidad y seguridad > Borrar datos de navegación > Seleccionar únicamente "Archivos e imágenes en caché" (NO borrar cookies ni datos de sitios para preservar IndexedDB).
3. **Paso 3: Restauración Asistida:**
   - En un nuevo dispositivo o tras reinstalar el navegador, acceder a NexoCampo y utilizar el botón **"Restaurar desde Respaldo JSON"**, validando el esquema antes de sobrescribir.
