# MODELO DE DATOS Y PERSISTENCIA INDEXEDDB — NEXOCAMPO 2026
**Documento Técnico:** `03-modelo-datos.md`  
**Estado:** Especificación de Esquemas, Almacenes y Migraciones — Tarea 1 de 5  
**Proyecto:** NexoCampo 2026 (Versión Experimental e Independiente)  

---

## 1. Principios de Persistencia en IndexedDB

IndexedDB es un motor NoSQL transaccional local en el navegador del cliente. Bajo la filosofía Offline-First de NexoCampo:
1. **No Reinicialización Destructiva:** Nunca se invoca `indexedDB.deleteDatabase()` ni se borran stores en producción/demostración para resolver discrepancias de esquema.
2. **Versionado Incremental Monótono:** Cada evolución de esquema incrementa la versión entera (`version: 1, 2, 3...`) administrada mediante transacciones de actualización controladas en `onupgradeneeded`.
3. **Claves Primarias Deterministas o UUIDs v4:** Para soportar futuras sincronizaciones sin conflicto, los registros generados en campo emplean UUID v4 o claves compuestas jerárquicas (e.g. `JRN-YYYYMMDD`).
4. **Validación Previa al Guardado:** Ningún payload ingresa a un ObjectStore sin superar la validación de tipos y rangos de dominio.
5. **Aislamiento de Entorno:** Base de datos nombrada expresamente: `NexoCampo_Exp_2026_DB`.

---

## 2. Definición de ObjectStores (Almacenes de Objetos)

### 2.1. Store: `colaboradores`
Catálogo de trabajadores agrícolas supervisados por el líder.
- **KeyPath:** `id` (string UUID o código funcional sintético `COL-XXXX`).
- **Índices:**
  - `idx_codigo`: `{ unique: true, keyPath: "codigo" }`
  - `idx_estado`: `{ unique: false, keyPath: "activo" }`
  - `idx_cuadrilla`: `{ unique: false, keyPath: "cuadrillaId" }`
- **Estructura TypeScript (Ejemplo):**
```ts
interface ColaboradorEntity {
  id: string; // ej. "col_9f81a7d2"
  codigo: string; // ej. "COL-042" (sintético, no cédula real)
  alias: string; // ej. "J. Pérez" (minimización de datos)
  rolAgrario: 'operario_campo' | 'podador_experto' | 'tractorista' | 'encargado_malla';
  activo: boolean;
  cuadrillaId: string;
  createdAt: number; // timestamp UTC
  updatedAt: number;
}
```

### 2.2. Store: `jornadas_generales`
Registros diarios de la jornada laboral marco de la cuadrilla.
- **KeyPath:** `id` (string, ej. `JRN-20261019-LOTE1`).
- **Índices:**
  - `idx_fecha`: `{ unique: false, keyPath: "fecha" }`
  - `idx_estado`: `{ unique: false, keyPath: "estado" }`
- **Estructura:**
```ts
interface JornadaGeneralEntity {
  id: string;
  fecha: string; // "YYYY-MM-DD"
  tipoDia: 'semana_laboral' | 'sabado' | 'festivo_especial';
  horaApertura: string; // "06:30"
  horaCierreEsperada: string; // "15:30" o "13:00"
  horaCierreReal?: string;
  minutosTeoricosBrutos: number; // 540 (L-V) o 390 (Sáb)
  minutosPausasOficiales: number; // 60 (L-V) o 30 (Sáb)
  minutosEfectivosTeoricos: number; // 480 (o 475 con 5m adicional) o 360
  estado: 'programada' | 'en_progreso' | 'cerrada' | 'cancelada';
  supervisorResponsableId: string;
  observacionesGenerales?: string;
}
```

### 2.3. Store: `pausas_jornada`
Registro de interrupciones, desayuno, almuerzo o pausas climáticas/técnicas.
- **KeyPath:** `id` (UUID).
- **Índices:**
  - `idx_jornadaId`: `{ unique: false, keyPath: "jornadaId" }`
  - `idx_tipo`: `{ unique: false, keyPath: "tipo" }`
- **Estructura:**
```ts
interface PausaJornadaEntity {
  id: string;
  jornadaId: string;
  tipo: 'desayuno' | 'almuerzo' | 'pausa_activa_5min' | 'lluvia_torrencial' | 'traslado_lote';
  horaInicio: string; // "HH:mm"
  horaFin?: string; // "HH:mm"
  duracionMinutos: number;
  esDeduccionOficial: boolean; // true para descanso legal, false si es tiempo muerto pagado
  alcance: 'toda_la_cuadrilla' | 'colaborador_especifico';
  colaboradorId?: string;
}
```

### 2.4. Store: `asistencia_diaria`
Pase de lista matutino de la cuadrilla.
- **KeyPath:** `id` (string compuesto: `AST-${fecha}-${colaboradorId}`).
- **Índices:**
  - `idx_fecha`: `{ unique: false, keyPath: "fecha" }`
  - `idx_colaborador`: `{ unique: false, keyPath: "colaboradorId" }`
  - `idx_estado`: `{ unique: false, keyPath: "estado" }`
- **Estructura:**
```ts
interface AsistenciaDiariaEntity {
  id: string;
  fecha: string;
  colaboradorId: string;
  estado: 'presente' | 'retardo' | 'ausente_justificado' | 'ausente_injustificado' | 'permiso_medico';
  horaLlegada?: string; // "06:35" si hubo retardo
  motivoAusenciaId?: string;
  registradoPor: string;
  timestamp: number;
}
```

### 2.5. Store: `asignaciones_labor`
Subdivisiones de tareas y registros de tiempo por cuadrilla o individuo.
- **KeyPath:** `id` (UUID).
- **Índices:**
  - `idx_jornada`: `{ unique: false, keyPath: "jornadaId" }`
  - `idx_colaborador`: `{ unique: false, keyPath: "colaboradorId" }`
  - `idx_labor`: `{ unique: false, keyPath: "laborId" }`
- **Estructura:**
```ts
interface AsignacionLaborEntity {
  id: string;
  jornadaId: string;
  colaboradorId: string;
  laborId: string;
  subtareaId?: string;
  lote: string; // ej. "Bloque 4 Norte"
  horaInicio: string;
  horaFin?: string;
  minutosEfectivosLabor: number;
  unidadesRealizadas: number; // ej. 140 camas podadas
  unidadMedida: string; // "camas", "metros_lineales", "arboles"
  calidadMuestra?: 'optima' | 'regular' | 'rechazada_retrabajo';
  esOficioVario: boolean;
  estado: 'en_curso' | 'terminada' | 'interrumpida';
}
```

### 2.6. Store: `catalogo_labores`
Definición de labores estándar y reglas de cálculo.
- **KeyPath:** `id` (string código, ej. `LBR-PODA-01`).
- **Índices:**
  - `idx_categoria`: `{ unique: false, keyPath: "categoria" }`
- **Estructura:**
```ts
interface CatalogoLaborEntity {
  id: string;
  nombre: string;
  categoria: 'produccion' | 'mantenimiento' | 'cubiertas' | 'oficios_varios';
  unidadMedida: string;
  tieneEstandarAprobado: boolean;
  minutosEstandarPorUnidad?: number; // solo si está formalmente validado
  metaPorJornadaCompleta?: number; // ej. 180 camas/día
}
```

### 2.7. Store: `rendimiento_consolidado`
Resultados analíticos auditados por corte o jornada.
- **KeyPath:** `id` (string: `RND-${jornadaId}-${colaboradorId}-${laborId}`).
- **Índices:**
  - `idx_jornada`: `{ unique: false, keyPath: "jornadaId" }`
  - `idx_colaborador`: `{ unique: false, keyPath: "colaboradorId" }`
- **Estructura:**
```ts
interface RendimientoConsolidadoEntity {
  id: string;
  jornadaId: string;
  colaboradorId: string;
  laborId: string;
  tiempoEfectivoMinutos: number;
  cantidadCompletada: number;
  estandarMinutosPorUnidad: number | null;
  rendimientoTemporalPct: number | null; // (T.Estandar / T.Efectivo) * 100
  cumplimientoMetaPct: number | null; // (Cant / Objetivo) * 100
  clasificacionDato: 'observado' | 'incompleto' | 'estimado' | 'calculado_aprobado' | 'pendiente_validacion';
  notaAuditoria?: string;
}
```

### 2.8. Store: `incidentes`
Bitácora de seguridad y salud en el trabajo (SG-SST).
- **KeyPath:** `id` (UUID).
- **Índices:**
  - `idx_fecha`: `{ unique: false, keyPath: "fecha" }`
  - `idx_gravedad`: `{ unique: false, keyPath: "gravedad" }`
- **Estructura:**
```ts
interface IncidenteEntity {
  id: string;
  fecha: string;
  hora: string;
  lote: string;
  tipo: 'corte_herramienta' | 'golpe_calor' | 'caida' | 'contacto_quimico' | 'dano_malla';
  gravedad: 'leve' | 'moderado' | 'grave';
  descripcionHecho: string;
  primerosAuxiliosAplicados: boolean;
  afectadoColaboradorId?: string;
  supervisorRegistroId: string;
}
```

### 2.9. Store: `respaldos_historial`
Trazabilidad de copias locales generadas y hashes de integridad.
- **KeyPath:** `id` (UUID).
- **Estructura:**
```ts
interface RespaldoHistorialEntity {
  id: string;
  timestamp: number;
  hashSha256: string;
  totalRegistros: number;
  versionEsquema: number;
  tamanoBytes: number;
  metodoExportacion: 'descarga_json_local' | 'sincronizacion_gdrive';
  exitoso: boolean;
}
```

---

## 3. Plan de Migraciones Idempotentes

```ts
export const DB_CONFIG = {
  name: 'NexoCampo_Exp_2026_DB',
  version: 1, // Se incrementa monótonamente en cada evolución
};

export function handleUpgrade(db: IDBDatabase, oldVersion: number, newVersion: number) {
  if (oldVersion < 1) {
    // Inicialización v1 de todos los almacenes e índices
    crearStoreSiNoExiste(db, 'colaboradores', 'id', [
      { name: 'idx_codigo', keyPath: 'codigo', unique: true },
      { name: 'idx_estado', keyPath: 'activo', unique: false },
    ]);
    crearStoreSiNoExiste(db, 'jornadas_generales', 'id', [
      { name: 'idx_fecha', keyPath: 'fecha', unique: false },
      { name: 'idx_estado', keyPath: 'estado', unique: false },
    ]);
    crearStoreSiNoExiste(db, 'pausas_jornada', 'id', [
      { name: 'idx_jornadaId', keyPath: 'jornadaId', unique: false },
    ]);
    crearStoreSiNoExiste(db, 'asistencia_diaria', 'id', [
      { name: 'idx_fecha', keyPath: 'fecha', unique: false },
      { name: 'idx_colaborador', keyPath: 'colaboradorId', unique: false },
    ]);
    crearStoreSiNoExiste(db, 'asignaciones_labor', 'id', [
      { name: 'idx_jornada', keyPath: 'jornadaId', unique: false },
      { name: 'idx_colaborador', keyPath: 'colaboradorId', unique: false },
      { name: 'idx_labor', keyPath: 'laborId', unique: false },
    ]);
    crearStoreSiNoExiste(db, 'catalogo_labores', 'id', [
      { name: 'idx_categoria', keyPath: 'categoria', unique: false },
    ]);
    crearStoreSiNoExiste(db, 'rendimiento_consolidado', 'id', [
      { name: 'idx_jornada', keyPath: 'jornadaId', unique: false },
      { name: 'idx_colaborador', keyPath: 'colaboradorId', unique: false },
    ]);
    crearStoreSiNoExiste(db, 'incidentes', 'id', [
      { name: 'idx_fecha', keyPath: 'fecha', unique: false },
    ]);
    crearStoreSiNoExiste(db, 'respaldos_historial', 'id');
  }
}
```
No se admitirá ninguna instrucción que elimine o modifique un ObjectStore ya poblado sin una rutina de lectura de datos previa para preservar la información existente.
