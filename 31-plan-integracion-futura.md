# 31 — Plan de Integración Futura y Hoja de Ruta Tecnológica
## NexoCampo 2026 — Supervisión Agrícola Offline-First

---

### 1. Visión Estratégica de Integración

NexoCampo 2026 fue desarrollado de forma deliberadamente aislada como prototipo experimental de alta fidelidad. Para su transición hacia una plataforma empresarial a gran escala, se define una hoja de ruta dividida en tres fases incrementales sin alterar la pureza del modelo de datos ni la autonomía offline en campo.

---

### 2. Hoja de Ruta de Integraciones (Fases 2, 3 y 4)

```text
+-----------------------------------------------------------------------------------+
| FASE 1 (Actual - Tareas 1 a 5): Prototipo PWA Offline-First Autónomo             |
| - Persistencia IndexedDB con Patrón Outbox                                       |
| - Fórmulas matemáticas puras desacopladas en TypeScript                           |
| - Interfaz móvil ergonómica con "Modo Sol" para Android                          |
| - 46 pruebas automatizadas aprobadas                                             |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
| FASE 2: Backend Cloud y Sincronización Delta Bidireccional                      |
| - Persistencia centralizada en Cloud SQL (PostgreSQL) o Firestore               |
| - Autenticación RBAC por roles (Supervisores de Campo, Agrónomos, Nómina)        |
| - Sincronización Delta con Vector Clocks / Marcas de Tiempo de Modificación       |
| - Respaldo en la nube automatizado al ingresar a zona con Wi-Fi                  |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
| FASE 3: Captura Rápida de Campo y Dispositivos Periféricos                        |
| - Escaneo de códigos QR / Códigos de Barras en carnés de operarios               |
| - Geocercas (Geofencing) automáticas para validación de presencia en bloque      |
| - Soporte de básculas Bluetooth (BLE) para pesaje directo en cosecha             |
| - Cifrado local a nivel de registro con Web Crypto API (AES-GCM-256)             |
+-----------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
| FASE 4: Integración ERP Empresarial y Liquidación de Nómina                       |
| - Conectores bidireccionales con SAP, Siigo, Novasoft o Helisa                   |
| - Exportación de novedades de nómina (horas extras, recargos, ausencias)          |
| - Módulo de Analítica y Modelos Predictivos de Rendimiento por Clima             |
+-----------------------------------------------------------------------------------+
```

---

### 3. Detalle de Arquitectura para la Fase 2 (Backend Cloud)

#### 3.1. Modelo Relacional en Cloud SQL (PostgreSQL)
Para soportar millones de registros históricos de cosecha y cuadrillas, se recomienda la migración hacia PostgreSQL mediante Drizzle ORM:
- **Tabla `jornadas`:** `id (UUID)`, `supervisor_id`, `fecha (DATE)`, `hora_apertura (TIME)`, `hora_cierre (TIME)`, `minutos_efectivos (INT)`.
- **Tabla `labores_detalle`:** `id`, `jornada_id`, `colaborador_id`, `labor_id`, `hora_inicio`, `hora_fin`, `cantidad_completada (NUMERIC)`.
- **Tabla `sincronizacion_logs`:** `id`, `dispositivo_id`, `lote_hash`, `registros_recibidos`, `timestamp_recepcion`.

#### 3.2. Sincronización Delta y Resolución de Conflictos
- **Mecanismo:** En lugar de transferir el historial completo, el cliente enviará únicamente los registros modificados después de su última sincronización exitosa (`last_sync_timestamp`).
- **Resolución de Conflictos:** Estrategia **"Last-Write-Wins" por campo** con prioridad al registro capturado en campo por el supervisor presente en el bloque sobre ediciones remotas en oficina.

---

### 4. Protocolo de Captura Rápida con Código QR (Fase 3)

- **Objetivo:** Reducir el tiempo de pase de lista matutino de 5 minutos a menos de 45 segundos por cuadrilla de 15 personas.
- **Implementación Técnica:** Uso de la API nativa de la cámara web (`Barcode Detection API` o biblioteca ligera `html5-qrcode`) integrada en el componente de Asistencia.
- **Funcionamiento Offline:** Los carnés de los colaboradores portan un código QR con su código interno cifrado (`COL-001`). La cámara lee el código, busca al trabajador en el ObjectStore local `colaboradores` y registra su presencia inmediatamente sin necesidad de conexión.

---

### 5. Integración con ERP y Nómina Agropecuaria (Fase 4)

- **Intercambio de Datos:** Generación de archivos planos estandarizados (CSV / JSON) o Webhooks seguros hacia el software contable de la empresa.
- **Validación Previa:** Las horas efectivas y las ausencias deben pasar por la **Consulta Cruzada de NexoCampo** y obtener el visto bueno del Administrador de Finca antes de generar las novedades de liquidación salarial.
