# MODELO DE DATOS DETALLADO Y ESPECIFICACIÓN INDEXEDDB — NEXOCAMPO 2026
**Documento Técnico:** `11-modelo-datos-detallado.md`  
**Estado:** Esquema Exhaustivo de Entidades, Relaciones y Validaciones  
**Fase:** Tarea 2 de 5 (Diseño UX/UI, Sistema Visual y Modelo de Datos)  
**Fecha:** 2026-10-18  

---

## 1. Principios de Persistencia y Gobernanza de Datos

1. **Aislamiento de la Base de Datos:** Base local IndexedDB con namespace estricto `NexoCampo_Exp_2026_DB` (versión actual: `2`).
2. **Propiedad por Módulo:** Cada entidad pertenece exclusivamente a un módulo propietario que gestiona sus mutaciones; los demás módulos consumen sus datos en modo solo lectura.
3. **Distinción entre Datos Crudos y Resultados Derivados:**
   - *Datos Crudos (Transaccionales):* Tiempos de inicio y fin, conteos reales en campo, selección de condiciones climáticas y justificaciones.
   - *Resultados Derivados (Calculados):* Minutos brutos, minutos efectivos netos, porcentajes de cumplimiento y rendimiento temporal. Se computan en tiempo real o se cachean con bandera de trazabilidad explícita (`esDerivado: true`).
4. **Herencia Horaria de Subtareas:** Las subtareas de una labor principal (ej. grapado en coberturas) **heredan el intervalo de tiempo** de su labor madre; jamás se persiste un segmento temporal independiente que duplique el horario.

---

## 2. Catálogo de Entidades del Sistema

### 2.1. Entidad: `ColaboradorFicticio`
- **Módulo Propietario:** `domain/colaboradores` (Almacén: `colaboradores`)
- **KeyPath:** `id` (string UUID v4)
- **Índices:** `idx_codigo` (unique), `idx_cuadrillaId`, `idx_activo`
- **Campos:**
  - `id`: string (UUID)
  - `codigo`: string (ej. `"COL-001"`, obligatorio, único, sintético)
  - `alias`: string (ej. `"J. Pérez"`, obligatorio, minimizado)
  - `rolAgrario`: enum (`'operario_campo' | 'podador_experto' | 'encargado_malla' | 'tractorista'`)
  - `cuadrillaId`: string (referencia a `Cuadrilla`)
  - `activo`: boolean (por defecto `true`)
  - `creadoUtc`: number (timestamp)
  - `actualizadoUtc`: number

### 2.2. Entidad: `Cuadrilla`
- **Módulo Propietario:** `domain/cuadrillas` (Almacén: `cuadrillas`)
- **KeyPath:** `id` (string, ej. `"CD-01"`)
- **Campos:**
  - `id`: string
  - `nombre`: string (ej. `"Cuadrilla Coberturas Norte"`)
  - `supervisorId`: string (identificador del líder de campo)
  - `capacidadMaxima`: number (por defecto `6` para cuadrillas de plástico/polisombra)
  - `activa`: boolean

### 2.3. Entidad: `Jornada`
- **Módulo Propietario:** `jornadas` (Almacén: `jornadas_generales`)
- **KeyPath:** `id` (string compuesto: `"JRN-YYYYMMDD-LOTE"`)
- **Índices:** `idx_fecha`, `idx_estado`
- **Campos:**
  - `id`: string
  - `fecha`: string (`"YYYY-MM-DD"`, obligatoria)
  - `tipoDia`: `'semana_laboral' | 'sabado' | 'festivo_especial'`
  - `horaApertura`: string (`"HH:mm"`, obligatoria, ej. `"06:30"`)
  - `horaCierreEsperada`: string (`"HH:mm"`, obligatoria, ej. `"15:30"` o `"13:00"`)
  - `horaCierreReal`: string | null
  - `minutosBrutosDerivados`: number (resultado derivado)
  - `minutosEfectivosNetosDerivados`: number (resultado derivado)
  - `estado`: `'programada' | 'en_progreso' | 'cerrada' | 'cancelada'`
  - `supervisorId`: string
  - `observaciones`: string | null

### 2.4. Entidad: `PausaInterrupcion`
- **Módulo Propietario:** `jornadas` (Almacén: `pausas_jornada`)
- **KeyPath:** `id` (UUID)
- **Índices:** `idx_jornadaId`, `idx_tipo`
- **Campos:**
  - `id`: string
  - `jornadaId`: string (referencia obligatoria a `Jornada`)
  - `tipo`: `'desayuno' | 'almuerzo' | 'pausa_5min' | 'climatica_lluvia' | 'traslado_lote' | 'interrupcion_insumos'`
  - `horaInicio`: string (`"HH:mm"`)
  - `horaFin`: string | null
  - `duracionMinutos`: number (obligatorio, >= 1)
  - `esDeduccionComputable`: boolean (true si resta tiempo de labor, false si es tiempo muerto pagado)
  - `motivo`: string | null

### 2.5. Entidad: `AsignacionLabor`
- **Módulo Propietario:** `labores` (Almacén: `asignaciones_labor`)
- **KeyPath:** `id` (UUID)
- **Índices:** `idx_jornadaId`, `idx_laborId`, `idx_lote`
- **Campos:**
  - `id`: string
  - `jornadaId`: string
  - `laborId`: string (referencia a `CatalogoLabor`)
  - `colaboradoresIds`: string[] (array de UUIDs de operarios asignados)
  - `lote`: string (ej. `"Lote 4"`)
  - `bloque`: string (ej. `"Bloque B"`)
  - `tunel`: string | null
  - `horaInicio`: string (`"HH:mm"`, obligatoria)
  - `horaFin`: string | null
  - `cantidadProgramada`: number
  - `cantidadCompletada`: number
  - `unidadMedida`: string (`"camas" | "arboles" | "metros_lineales" | "canastillas"`)
  - `esOficioVario`: boolean
  - `estado`: `'en_progreso' | 'terminada' | 'interrumpida'`

### 2.6. Entidad: `SubtareaLabor` (Herencia Horaria)
- **Módulo Propietario:** `labores` (Almacén: `subtareas_labor`)
- **KeyPath:** `id` (UUID)
- **Índices:** `idx_laborPrincipalId`
- **Campos:**
  - `id`: string
  - `laborPrincipalId`: string (referencia obligatoria a `AsignacionLabor`)
  - `tipoSubtarea`: string (ej. `"Costura de polisombra"`, `"Tendido de guaya"`)
  - `cantidadProgramada`: number
  - `cantidadCompletada`: number
  - `unidadMedida`: string
  - `estado`: `'en_curso' | 'completa' | 'pendiente_saldo'`
  - *Nota Arquitectónica:* **No incluye `horaInicio` ni `horaFin`**, ya que hereda íntegramente el segmento horario de `laborPrincipalId`.

### 2.7. Entidad: `RegistroPlasticoPolisombra`
- **Módulo Propietario:** `plastico-polisombra` (Almacén: `registros_coberturas`)
- **KeyPath:** `id` (UUID)
- **Índices:** `idx_jornadaId`, `idx_fecha`
- **Campos:**
  - `id`: string
  - `jornadaId`: string
  - `fecha`: string
  - `integrantesCuadrillaIds`: string[] (hasta 6 colaboradores según especificación)
  - `horaInicio`: string
  - `horaFin`: string
  - `area`: string
  - `bloque`: string
  - `tunel`: string
  - `cantidadTotal`: number
  - `cantidadCompletada`: number
  - `condicionesAmbientales`: Array<'soleado' | 'llovizna_leve' | 'lluvia_moderada_intensa' | 'terreno_humedo' | 'terreno_lodoso' | 'vientos_fuertes'>
  - `justificacionPendienteId`: string | null (referencia a `JustificacionPendiente`)
  - `estado`: `'cumple' | 'no_cumple' | 'pendiente' | 'incompleto'`

### 2.8. Entidad: `JustificacionPendiente`
- **Módulo Propietario:** `domain/justificaciones` (Almacén: `justificaciones_pendientes`)
- **KeyPath:** `id` (UUID)
- **Campos:**
  - `id`: string
  - `referenciaRegistroId`: string (ID de la labor o cobertura afectada)
  - `motivosSeleccionados`: Array<'tiempo_insuficiente' | 'vientos_fuertes' | 'lluvia_intensa'>
  - `saldoUnidadesPendientes`: number
  - `notaExplicativaSupervisor`: string | null (máx. 120 chars)
  - `fechaRegistroUtc`: number

### 2.9. Entidad: `RegistroAsistencia`
- **Módulo Propietario:** `asistencia` (Almacén: `asistencia_diaria`)
- **KeyPath:** `id` (compuesto: `"AST-${fecha}-${colaboradorId}"`)
- **Índices:** `idx_fecha`, `idx_colaboradorId`, `idx_estado`
- **Campos:**
  - `id`: string
  - `fecha`: string (`"YYYY-MM-DD"`)
  - `colaboradorId`: string
  - `estado`: `'sin_registrar' | 'presente' | 'retardo' | 'ausencia_formal'`
  - `horaLlegadaEfectiva`: string | null (ej. `"06:45"` en caso de retardo)
  - `motivoAusenciaId`: string | null
  - `nota`: string | null

### 2.10. Entidad: `AusenciaFormal`
- **Módulo Propietario:** `ausencias` (Almacén: `ausencias_formales`)
- **KeyPath:** `id` (UUID)
- **Campos:**
  - `id`: string
  - `colaboradorId`: string
  - `fechaInicio`: string
  - `fechaFin`: string
  - `tipoAusencia`: `'incapacidad_eps' | 'permiso_remunerado' | 'permiso_no_remunerado' | 'calamidad_domestica'`
  - `documentoSoporteAdjunto`: boolean
  - *Regla de Privacidad:* **No almacena historial médico confidencial**, respetando la Ley 1581 de 2012.

### 2.11. Entidad: `IncidenteSeguridad`
- **Módulo Propietario:** `incidentes` (Almacén: `incidentes`)
- **KeyPath:** `id` (UUID)
- **Índices:** `idx_fecha`, `idx_severidad`
- **Campos:**
  - `id`: string
  - `fecha`: string
  - `horaEvento`: string (`"HH:mm"`, obligatoria)
  - `horaFinal`: null (**prohibido exigir hora final**)
  - `severidad`: `'leve' | 'moderado' | 'grave'`
  - `area`: string
  - `bloque`: string
  - `tunel`: string | null
  - `tipoEvento`: `'corte_herramienta' | 'golpe_calor' | 'caida' | 'contacto_quimico' | 'dano_estructura'`
  - `descripcion`: string
  - `fotografiaUrl`: string | null (**estrictamente opcional**)
  - `primerosAuxiliosAplicados`: boolean

### 2.12. Entidades de Auditoría: `HistorialCambios` y `VersionFormula`
- **Módulo Propietario:** `data/auditoria` (Almacén: `historial_auditoria`)
- **KeyPath:** `id` (UUID)
- Registra cada mutación local con `tablaAfectada`, `registroId`, `valorAnterior`, `valorNuevo`, `timestampUtc` y la versión de la fórmula matemática ejecutada (ej. `"FORMULA_RENDIMIENTO_V1_2026"`).
