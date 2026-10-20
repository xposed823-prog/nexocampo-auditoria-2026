# INFORME DE AUDITORÍA DE INTEGRIDAD DE DATOS Y PERSISTENCIA — NEXOCAMPO PRO (v18.1.9)
**Documento Técnico:** `DATA_INTEGRITY_NEXOCAMPO_REPORT.md`  
**Objetivo:** Verificación de integridad referencial, consistencia transaccional, persistencia en IndexedDB, esquemas de catálogos y protocolos de respaldo.  
**Fecha:** 2026-10-20  
**Estado:** Auditado y Certificado para Fase 2  

---

## 1. RESUMEN EJECUTIVO DE INTEGRIDAD DE DATOS

La auditoría de integridad de datos analizó los 6 almacenes canónicos del motor de base de datos local `nexocampo` (versión 4), su compatibilidad con los catálogos oficiales de campo (36 colaboradores, 23 labores, 4 áreas territoriales) y su comportamiento ante ciclos de recarga de página, edición y respaldos.

### Hallazgos Principales:
1. **Consistencia Estructural de Catálogos (100% Integra):**
   - Los 36 colaboradores poseen claves primarias canónicas (`col_1` a `col_36`), códigos unívocos (`COL-001` a `COL-036`), cuadrillas asignadas y roles normativos sin datos ficticios ni duplicados.
   - Las 23 labores agrícolas definen con precisión su unidad física, categoría (*Adecuaciones* o *Maquinaria*), minutos estándar oficiales o `null` estricto para labores auxiliares.
   - Las 4 áreas (*Jamaica*, *Piloto*, *Púrpura*, *Naranja*) mapean de forma unívoca sus bloques y número real de túneles agrícolas.
2. **Claves Primarias y Claves Compuestas:**
   - En el almacén `asistencia`, la clave primaria se compone deterministicamente como `${colaborador_id}_${fecha}` (ej. `col_1_2026-10-20`), garantizando idempotencia matemática e impidiendo duplicidades de registro en un mismo día.
3. **Persistencia Reactiva en UI (Brecha Identificada para Fase 2):**
   - Aunque la base de datos `nexocampo` en IndexedDB cuenta con métodos transaccionales puros (`dbPut`, `dbGetAll`, `dbDelete`), algunos componentes de la interfaz React mantienen registros temporalmente en variables de estado (`useState`). Al recargar el navegador sin sincronizar, se pierden los datos en memoria si no se ejecutó previamente un guardado a disco local.
4. **Respaldo y Restauración Canónica:**
   - La exportación genera un archivo JSON estructurado con los 6 almacenes versionados (`version_db: 4`).
   - Se requiere un *snapshot* de seguridad antes de la restauración para mitigar el riesgo de borrado destructivo detectado en la auditoría de Red Team.

---

## 2. MAPA DE RELACIONES ENTIDAD-RELACIÓN Y ESQUEMAS

```
                                      DIAGRAMA DE ENTIDADES INDEXEDDB
                                     ┌────────────────────────────────┐
                                     │     ÁREAS AGRÍCOLAS (areas)    │
                                     │  id, codigo, nombre, bloques[] │
                                     └──────────────┬─────────────────┘
                                                    │ 1:N
                                                    ▼
┌───────────────────────────────┐            ┌────────────────────────────────┐
│   COLABORADORES (colaboradores)│            │      JORNADAS (jornadas)       │
│  id, codigo, nombre, cuadrilla │◄───N:M────►│  id, fecha, colaboradores_ids  │
└──────────────┬────────────────┘            │  tramos: [                     │
               │                             │    labor_id ──────────────┐    │
               │ 1:N                         │    area, bloque, tunel    │    │
               ▼                             │    hora_inicio, hora_fin  │    │
┌───────────────────────────────┐            │    unidades, meta, est.   │    │
│     ASISTENCIA (asistencia)   │            │  ]                             │
│  id: `${colaborador}_${fecha}`│            └────────────────────────────────┘
│  estado, hora_entrada         │                                        │
└───────────────────────────────┘                                        ▼
                                                     ┌────────────────────────┐
┌───────────────────────────────┐                    │    LABORES (labores)   │
│     AUSENCIAS (ausencias)     │                    │  id, codigo, nombre    │
│  id, colaborador_id, tipo (7) │                    │  unidad, min_estandar  │
│  fecha_inicio, fecha_fin      │                    │  categoria, modelo     │
└───────────────────────────────┘                    └────────────────────────┘
```

---

## 3. ESPECIFICACIÓN DETALLADA DE LOS 6 OBJECTSTORES

### 3.1. Store: `colaboradores`
* **KeyPath:** `id` (`string`).
* **Invariante:** Los códigos `COL-001` a `COL-036` son inmutables y únicos.
* **Esquema:**
  ```typescript
  interface Colaborador {
    id: string;              // ej. "col_1"
    codigo: string;          // ej. "COL-001"
    nombreCompleto: string;  // Nombre y dos apellidos oficiales
    alias: string;           // Inicial de nombre y primer apellido
    rol: string;             // "Operario de Campo"
    cuadrilla: string;       // "Cuadrilla 1" | "Cuadrilla 2"
  }
  ```

---

### 3.2. Store: `labores`
* **KeyPath:** `id` (`string`).
* **Invariante:** Si `min` es `null`, el modelo debe ser `tiempo` o `oficios_varios`.
* **Esquema:**
  ```typescript
  interface LaborAgricola {
    id: string;                          // ej. "lab_1"
    codigo: string;                      // ej. "LAB-001"
    nombre: string;                      // ej. "Arreglo camas"
    unidadMedida: string;                // "Camas", "Metros", "Túneles", etc.
    min: number | null;                  // Minutos estándar unitarios
    personalReferencia: number;          // Dotación típica (1 a 4)
    categoria: 'Adecuaciones' | 'Maquinaria';
    modelo: 'individual' | 'grupal_tiempo' | 'grupal_meta' | 'tiempo';
    esPlasticoPolisombra?: boolean;
  }
  ```

---

### 3.3. Store: `areas`
* **KeyPath:** `id` (`string`).
* **Invariante:** Cada bloque contiene un arreglo cerrado de identificadores de túneles agrícolas.
* **Esquema:**
  ```typescript
  interface AreaAgricola {
    id: string;               // ej. "area_1"
    nombre: string;           // "Jamaica", "Piloto", "Púrpura", "Naranja"
    codigo: string;           // "ARE-001"
    bloques: Array<{
      id: string;
      nombre: string;
      totalTuneles: number;
      tuneles: string[];      // ["T-01", "T-02", ...]
    }>;
  }
  ```

---

### 3.4. Store: `jornadas`
* **KeyPath:** `id` (`string`).
* **Invariante:** Las labores consecutivas y subtareas de un día se anidan en el arreglo `tramos[]`. Prohibido crear múltiples documentos de jornada general para la misma cuadrilla en una misma fecha.
* **Esquema:**
  ```typescript
  interface JornadaRegistro {
    id: string;                        // ej. "jrn_20261020_001"
    fecha: string;                     // "YYYY-MM-DD"
    colaboradores_ids: string[];       // Operarios asignados
    tramos: TramoJornada[];            // Sublabores, pausas e incidentes
    creadoEn: string;                  // Timestamp ISO UTC
    actualizadoEn: string;
    sincronizado: boolean;
  }
  ```

---

### 3.5. Store: `asistencia`
* **KeyPath:** `id` (`string`, formato: `${colaborador_id}_${fecha}`).
* **Invariante:** Clave compuesta unívoca. La rotación de estados (`sin_registrar` $\to$ `presente` $\to$ `retardo` $\to$ `ausencia`) es idempotente y no crea duplicados.
* **Esquema:**
  ```typescript
  interface AsistenciaRegistro {
    id: string;                        // ej. "col_1_2026-10-20"
    colaborador_id: string;            // Llave foránea a 'colaboradores'
    fecha: string;                     // "YYYY-MM-DD"
    estado: 'sin_registrar' | 'presente' | 'retardo' | 'ausencia';
    hora_entrada?: string;             // "06:28"
  }
  ```

---

### 3.6. Store: `ausencias`
* **KeyPath:** `id` (`string`).
* **Invariante:** El campo `tipo` debe ser estrictamente uno de los 7 códigos normativos oficiales: `I`, `JV`, `LP`, `P`, `V`, `SP`, `C`.
* **Esquema:**
  ```typescript
  interface AusenciaRegistro {
    id: string;
    colaborador_id: string;
    tipo: 'I' | 'JV' | 'LP' | 'P' | 'V' | 'SP' | 'C';
    fecha_inicio: string;
    fecha_fin: string;
    motivo: string;
    observacion?: string;
  }
  ```

---

## 4. ANÁLISIS DE RIESGOS DE PÉRDIDA, DUPLICACIÓN Y CORRUPCIÓN

| Riesgo de Integridad | Causa Raíz Detectada | Severidad | Protocolo de Mitigación (Fase 2) |
| :--- | :--- | :---: | :--- |
| **Volatilidad por recarga de pantalla (F5)** | La vista de asistencia mantiene `matrizAsistencia` en `useState` sin disparar `dbPut` en cada clic. | **ALTA** | Incorporar `useEffect` con hidratación directa desde `dbGetAll('asistencia')` y escritura atómica en cada rotación. |
| **Pérdida por respaldo JSON malformado** | La rutina `restaurarBackupCanónicoJSON` ejecuta `os.clear()` al abrir la transacción sin validar el archivo completo. | **ALTA** | Crear un snapshot de seguridad temporal en IndexedDB antes de vaciar los almacenes; abortar con rollback si falla. |
| **Duplicación de jornadas generales** | Registro de labores independientes como si fueran jornadas distintas. | **MEDIA** | Forzar la asignación jerárquica: toda labor pertenece a un único documento de jornada por fecha. |
| **Colisión horaria de colaborador** | Asignación accidental de dos labores en el mismo intervalo. | **MEDIA** | Validación obligatoria en UI con `detectarSolapamientoTemporal()`. |
| **Contaminación de datos de prueba (Mocks)** | Mezcla de datos sintéticos viejos con los 36 colaboradores oficiales. | **BAJA** | Catálogo unificado y sellado en `catalogoAgronomico.ts`. |

---

## 5. PROTOCOLO DE EXPORTACIÓN Y RESTAURACIÓN CANÓNICA

El formato de intercambio de datos está diseñado para ser portable, auditable y compatible con inspecciones externas sin dependencias propietarias:

```json
{
  "formato": "nexocampo_backup",
  "version_db": 4,
  "fecha_exportacion": "2026-10-20T15:54:00.000Z",
  "stores": {
    "colaboradores": [ /* 36 registros */ ],
    "labores": [ /* 23 registros */ ],
    "areas": [ /* 4 registros con bloques y túneles */ ],
    "ausencias": [ /* Novedades normativas */ ],
    "jornadas": [ /* Jornadas y tramos */ ],
    "asistencia": [ /* Pases de lista */ ]
  }
}
```

### Reglas de Integridad en Restauración:
1. **Validación de Cabecera:** Verificar que `formato === "nexocampo_backup"` y `version_db === 4`.
2. **Validación de Almacenes Obligatorios:** Comprobar que los 6 arreglos existan y sean de tipo Array.
3. **Atomicidad:** Utilizar una transacción única de lectura y escritura (`readwrite`) sobre los 6 almacenes en simultáneo (`db.transaction(STORES, 'readwrite')`), garantizando que si un almacén falla, toda la base mantenga su estado previo.

---

> **CERTIFICACIÓN DE INTEGRIDAD:** El modelo de datos, la estructura relacional, los 6 almacenes canónicos y los mecanismos de respaldo están completamente definidos, libres de datos ficticios y listos para ser conectados de forma reactiva en la **Fase 2**.
