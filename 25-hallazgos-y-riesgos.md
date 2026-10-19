# 25 — Matriz de Hallazgos, Riesgos y Limitaciones
## NexoCampo 2026 — Supervisión Agrícola Offline-First

**Clasificación Tripartita:**
1. **Defectos Comprobados y Corregidos:** Problemas reales detectados durante la ejecución de pruebas y solventados en el código.
2. **Riesgos Potenciales Identificados:** Vulnerabilidades o comportamientos de borde que requieren atención en fases posteriores o condiciones operativas particulares.
3. **Limitaciones No Verificables en el Entorno:** Restricciones técnicas derivadas del entorno de desarrollo que no pueden ser ejecutadas directamente en AI Studio.

---

### 1. Defectos Comprobados y Corregidos (Resueltos)

| ID Defecto | Descripción Técnica | Módulo Afectado | Impacto | Corrección Aplicada | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | Truncamiento no intencionado de sobrecumplimiento en rendimiento | `rendimientoCalculator.ts` | Medio | Se garantizó que valores como 240 unidades de meta 200 entreguen 120% exacto y estado `SOBREPASO_META` sin truncar a 100%. | **RESUELTO** |
| **DEF-02** | Confusión entre cumplimiento de tareas y rendimiento técnico en Oficios Varios | `businessRulesEngine.ts` | Alto | Se forzó que `calcularOficiosVarios` solo retorne avance de tareas (ej. 60%), asignando explícitamente `rendimientoTemporal: null`. | **RESUELTO** |
| **DEF-03** | Falsa alarma de solapamiento en labores contiguas | `businessRulesEngine.ts` | Alto | Se ajustó la condición de solapamiento a intervalos abiertos en los extremos (`Inicio_B < Fin_A && Fin_B > Inicio_A`), permitiendo que el fin de una coincida con el inicio de la siguiente. | **RESUELTO** |
| **DEF-04** | Importación relativa rota en CSS servido desde `/public/` | `public/css/style.css` | Bajo | Se suministró la hoja de estilos completa de forma autónoma en la raíz pública. | **RESUELTO** |

---

### 2. Riesgos Potenciales Identificados

#### R-01: Almacenamiento no Cifrado en IndexedDB
- **Descripción:** IndexedDB almacena los registros de jornadas, labores y asistencia en texto claro en el perfil del navegador del dispositivo móvil del supervisor.
- **Probabilidad:** Alta.
- **Impacto:** Medio (compromiso de datos operativos si el dispositivo es extraviado o sustraído sin bloqueo de pantalla).
- **Medida de Mitigación Recomendada:** 
  - Exigir bloqueo de pantalla con PIN/biometría en los dispositivos corporativos asignados a supervisores.
  - No almacenar datos sensibles (como números de cédula completos, cuentas bancarias o diagnósticos médicos) en el almacenamiento local.
  - Implementar en la Fase 2 una capa de derivación de claves Web Crypto API (AES-GCM-256) antes de la persistencia local.

#### R-02: Retraso Indefinido en la Activación del Background Sync
- **Descripción:** La especificación de Background Sync de la W3C delega en el sistema operativo del dispositivo móvil la decisión de cuándo despertar al Service Worker. En condiciones de ahorro extremo de batería, Android puede posponer la sincronización hasta que el dispositivo se conecte a la corriente.
- **Probabilidad:** Media.
- **Impacto:** Bajo-Medio.
- **Medida de Mitigación Implementada:**
  - NexoCampo implementa **degradación elegante (Graceful Degradation)**: además de registrar la tarea en el `SyncManager`, el cliente escucha el evento nativo `window.addEventListener('online', ...)` y ofrece un botón manual visible en la cabecera ("Sincronizar Lote Local Ahora") para que el supervisor fuerce la subida al llegar a la oficina del campamento.

#### R-03: Desalineación Horaria por Reloj Local Desincronizado
- **Descripción:** Si el teléfono móvil tiene la fecha/hora manipulada o descalibrada, los timestamps ISO locales podrían alterar el ordenamiento cronológico en el servidor central.
- **Probabilidad:** Baja.
- **Impacto:** Medio.
- **Medida de Mitigación Recomendada:**
  - El servidor central en `/api/sync` estampa un campo de auditoría `recibidoEnServidorISO` independiente del timestamp de captura local `creadoEn`.

#### R-04: Cuota de Almacenamiento del Navegador Móvil
- **Descripción:** Aunque IndexedDB permite decenas de megabytes, navegadores en teléfonos de gama baja con almacenamiento saturado pueden disparar excepciones `QuotaExceededError`.
- **Probabilidad:** Baja.
- **Impacto:** Medio.
- **Medida de Mitigación Implementada:**
  - Los registros confirmados y sincronizados se purgan de la cola de salida `registros_pendientes`, manteniendo la cola local en un tamaño mínimo (típicamente menor a 150 KB por jornada).

---

### 3. Limitaciones No Verificables en el Entorno Actual

1. **Notificaciones Push Remotas desde Servidor Externo (FCM/WebPush):**
   - *Razón:* El entorno experimental de desarrollo no cuenta con suscripción a un servidor de mensajería en la nube (VAPID keys).
   - *Comportamiento Verificado:* Se probaron con éxito las **Notificaciones Nativas Locales** disparadas por el Service Worker (`self.registration.showNotification`) y la API Notification del cliente.

2. **Instalación Real PWA en Hardware Android Físico:**
   - *Razón:* Las pruebas se ejecutaron mediante emulación headless en contenedor Linux con Chromium.
   - *Comportamiento Verificado:* Se validó exhaustivamente el archivo `manifest.json`, los iconos PNG/SVG con tamaños 192x192 y 512x512, las metaetiquetas móviles (`mobile-web-app-capable`), el registro del Service Worker y el evento `beforeinstallprompt`.

3. **Cámara de Alta Resolución para Captura de Incidentes SST:**
   - *Razón:* Ausencia de dispositivo de video óptico físico en el servidor de desarrollo.
   - *Comportamiento Verificado:* El formulario de incidentes soporta la selección de archivos de imagen mediante `<input type="file" accept="image/*">`, procesando el archivo y almacenándolo en Base64/Blob local.
