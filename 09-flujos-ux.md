# FLUJOS DE EXPERIENCIA DE USUARIO (UX) Y NAVEGACIÓN — NEXOCAMPO 2026
**Documento Técnico:** `09-flujos-ux.md`  
**Estado:** Especificación de Recorridos Táctiles e Interacción de Campo  
**Fase:** Tarea 2 de 5 (Diseño UX/UI, Sistema Visual y Modelo de Datos)  
**Fecha:** 2026-10-18  

---

## 1. Mapeo de Recorridos Principales del Supervisor

La jornada del supervisor de cuadrilla sigue una secuencia cronológica natural en campo. Los flujos están diseñados para reducir el número de pulsaciones en pantallas táctiles y operar sin latencia en condiciones desconectadas:

---

## 2. Especificación Detallada de los 11 Flujos Operativos

### Flujo 1: Crear y Editar una Jornada
- **Punto de Entrada:** Módulo *Jornadas* $\rightarrow$ Botón *«Iniciar Jornada de Hoy»*.
- **Paso 1:** El sistema precarga la fecha actual en hora local (`YYYY-MM-DD`), el tipo de día (`Semana` o `Sábado`) y la hora de apertura por defecto (`06:30 a. m.`).
- **Paso 2:** El supervisor valida o ajusta la hora de inicio y selecciona la hora esperada de cierre (`15:30` o `13:00`).
- **Paso 3:** Se presentan las pausas oficiales preconfiguradas (Desayuno 30m, Almuerzo 30m, Pausa breve 5m). El supervisor puede agregar o quitar pausas con un solo toque.
- **Paso 4:** Confirmación: el sistema calcula los minutos brutos y el tiempo neto efectivo estimado en tiempo real.
- **Edición posterior:** Cualquier ajuste de hora de cierre o pausa recalcula de inmediato los segmentos efectivos sin sobreescribir las labores ya terminadas.

### Flujo 2: Registrar Múltiples Labores Consecutivas
- **Punto de Entrada:** Módulo *Labores* $\rightarrow$ *«Nueva Asignación de Labor»*.
- **Paso 1:** El supervisor selecciona la labor del catálogo (ej. `Poda de Mantenimiento`), el lote/bloque y los colaboradores asignados.
- **Paso 2:** Se define el intervalo de tiempo: `06:30 a. m. a 10:00 a. m.`.
- **Paso 3:** Al guardar, el supervisor pulsa *«Guardar y Continuar con Siguiente Labor»*.
- **Paso 4:** El formulario se actualiza sugiriendo como hora de inicio el fin de la labor anterior (`10:00 a. m.` o `10:15 a. m.` tras refrigerio) y conserva el grupo de colaboradores para agilizar la captura consecutiva.

### Flujo 3: Registrar Subtareas que Heredan Horario
- **Punto de Entrada:** Dentro del registro de una Labor Principal (e.g. `Instalación de Coberturas`).
- **Paso 1:** El supervisor añade una subtarea (ej. `Templado de Guayas`).
- **Regla Arquitectónica:** **La subtarea hereda automáticamente el intervalo horario (`horaInicio` y `horaFin`) de la labor principal.**
- **Paso 2:** El formulario bloquea deliberadamente los campos de hora para la subtarea, evitando crear segmentos temporales duplicados o contradictorios en la base de datos.
- **Paso 3:** El supervisor únicamente reporta las cantidades ejecutadas de la subtarea (ej. 12 naves).

### Flujo 4: Guardar y Reabrir un Registro
- **Paso 1:** Al completar un formulario o dejarlo en progreso, el supervisor presiona *«Guardar Localmente»*.
- **Paso 2:** El registro se guarda en IndexedDB con estado `borrador` o `en_progreso`.
- **Paso 3:** El registro queda listado en la pantalla de la jornada con una insignia de estado accesible: `Incompleto` o `Pendiente`.
- **Paso 4:** Al pulsar sobre la fila, el formulario se reabre con todos sus datos previos intactos para completar las cantidades o la hora de cierre definitiva.

### Flujo 5: Consultar Asistencia y Ausencias
- **Punto de Entrada:** Módulo *Asistencia*.
- **Paso 1:** Se muestra la matriz semanal con colaboradores en filas y días de lunes a sábado en columnas.
- **Paso 2:** Estado inicial por defecto de cada celda: `— (sin registrar)`. **La falta de registro jamás se etiqueta como ausencia.**
- **Paso 3:** Toque rápido en celda para rotar estado o abrir modal de novedad:
  - `Presente (P)`
  - `Retardo (R)` $\rightarrow$ permite registrar hora de llegada.
  - `Ausente Formal (A)` $\rightarrow$ despliega selector de justificación (Incapacidad EPS, Permiso autorizado).
- **Paso 4:** Las ausencias formalmente registradas se consolidan en el almacén de novedades sin aplicar sanciones o descuentos automáticos en el dispositivo.

### Flujo 6: Registrar Plástico y Subtareas de Polisombra
- **Punto de Entrada:** Módulo *Plástico y Polisombra*.
- **Paso 1:** Ingreso de fecha, selección de hasta seis integrantes de la cuadrilla especializada, intervalo de inicio y fin, lote, bloque y túnel.
- **Paso 2:** Registro de cantidades: `Cantidad Total Programada` vs `Cantidad Completada Real`.
- **Paso 3:** Selector múltiple de condiciones de labor en terreno (Soleado, Lluvia intensa, Vientos fuertes, Terreno gredoso/lodoso).
- **Paso 4:** Registro de subtareas de polisombra vinculadas (costura, colocación de grapas, templado de mallas) que heredan el horario principal.

### Flujo 7: Justificar Cantidades Pendientes
- **Activación Automática:** Se activa cuando en el módulo de *Plástico y Polisombra* (o en cualquier labor con meta) la `Cantidad Completada` es menor a la `Cantidad Total Programada`.
- **Paso 1:** La interfaz muestra un indicador visible y accesible: `⚠️ Cantidad Pendiente: X unidades`.
- **Paso 2:** Al presionar el botón *«Justificar Pendiente»*, se abre un modal con casillas de selección múltiple restringidas a factores operacionales aprobados:
  - `[ ] Tiempo insuficiente en la jornada`
  - `[ ] Vientos fuertes`
  - `[ ] Lluvia intensa`
- **Regla Estricta:** No se mezclan en este selector incidentes de herramientas rotas ni reasignaciones de personal (esos eventos se tramitan por el módulo de incidentes o pausas).

### Flujo 8: Registrar Oficios Varios
- **Punto de Entrada:** Módulo *Oficios Varios*.
- **Paso 1:** Selección de colaboradores, descripción de la labor (ej. limpieza de zanjas, movimiento manual de abono, desyerbe de bordes de camino) y tiempo dedicado.
- **Regla Estricta:** La pantalla muestra claramente el tiempo efectivo invertido y la cantidad aproximada pero **bloquea la generación de rendimientos técnicos porcentuales ficticios**, mostrando la etiqueta `Labor sin estándar cronometrado`.

### Flujo 9: Asociar Incidentes a Jornadas o Labores
- **Punto de Entrada:** Módulo *Incidentes* $\rightarrow$ *«Reportar Evento»* (o acceso directo desde el formulario de jornada activa).
- **Paso 1:** Se captura la fecha, hora exacta del evento, severidad (`Leve`, `Moderado`, `Grave`), área/bloque/túnel, tipo de evento y descripción objetiva.
- **Paso 2:** Se permite vincular opcionalmente la labor o jornada en curso.
- **Paso 3:** La captura de fotografía es estrictamente **opcional** (nunca obligatoria).
- **Paso 4:** Se prohíbe exigir hora final del incidente (los incidentes no son intervalos laborales).

### Flujo 10: Consultar Reportes
- **Punto de Entrada:** Módulo *Reportes*.
- **Paso 1:** El supervisor selecciona el rango de fechas (Día actual, Semana, Mes).
- **Paso 2:** La vista presenta resúmenes consolidados de asistencia, horas efectivas y producción por labor.
- **Paso 3:** Cada dato se acompaña de su estado de trazabilidad: `Dato Observado`, `Estimado`, `Incompleto` o `Pendiente de Validación`.
- **Paso 4:** Botón de impresión limpia apto para exportar a PDF en navegador Android.

### Flujo 11: Exportar y Restaurar Respaldos
- **Punto de Entrada:** Módulo *Respaldos*.
- **Exportación:** Un solo toque genera el archivo JSON estructurado con todos los ObjectStores de IndexedDB, incorporando la firma hash `SHA-256`. Se descarga al almacenamiento local del teléfono.
- **Restauración:**
  - El supervisor carga el archivo `.json`.
  - El sistema recalcula el checksum SHA-256 y valida la compatibilidad de versiones de esquema.
  - Se exige confirmación manual explícita antes de fusionar o restaurar registros para evitar sobreescritura accidental.
