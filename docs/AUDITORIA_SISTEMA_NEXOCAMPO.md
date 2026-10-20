# AUDITORÍA TÉCNICA Y DE SISTEMAS (/audit)
**NexoCampo PRO — Diagnóstico Exhaustivo de Código, Tipos, Arquitectura y Paridad**  
**Fecha de Ejecución:** 20 de Octubre de 2026  
**Entorno:** TypeScript 7.0.2 / React 19 / Vite 8.3 / Tailwind CSS v4  
**Referencia Canónica:** Repositorio Oficial `xposed823-prog/nexocampo-pwa-` (Rama `main`, versión v18.1.9)

---

## 1. CUADRO DE MANDO DE AUDITORÍA (SCORECARD)

| Dimensión Evaluada | Puntuación | Estado | Observación Principal |
| :--- | :---: | :---: | :--- |
| **Integridad de Tipos (TypeScript)** | **65 / 100** | ⚠️ **FALLIDO** | 2 errores de compilador TS2339 detectados en `LaboresModulo.tsx`. |
| **Paridad de Catálogos Semilla** | **100 / 100** | ✅ **APROBADO** | 36 colaboradores, 23 labores y 4 áreas territoriales exactas. |
| **Paridad Arquitectónica y UX** | **55 / 100** | ⚠️ **DEFICITARIO** | Layout de escritorio con 15 pestañas en vez del cascarón Android de 28rem con 6 vistas. |
| **Persistencia e IndexedDB** | **50 / 100** | 🚨 **CRÍTICO** | Estados volátiles en React (`useState`); desalineación con los 6 stores v4. |
| **Reglas de Negocio y Cómputo** | **70 / 100** | ⚠️ **PARCIAL** | Fórmulas implementadas pero no unificadas en el ciclo de vida de la jornada. |
| **Seguridad y Privacidad** | **90 / 100** | ✅ **APROBADO** | No se exponen credenciales ni diagnósticos médicos reservados (Ley 1581). |
| **Desempeño y Carga Offline** | **85 / 100** | ✅ **BUENO** | Service Worker y manifiesto PWA presentes; tiempos de respuesta instantáneos. |
| **ÍNDICE GLOBAL DE SALUD** | **73 / 100** | ⚠️ **CONDICIONADO** | Bloqueo en linter de tipos y desacoplamiento de persistencia. |

---

## 2. ANÁLISIS ESTÁTICO Y COMPILACIÓN (LINTER TS)

Durante la ejecución de `npm run lint` (`tsc --noEmit`), el compilador arrojó **2 errores activos de tipado estricto**:

```
src/components/labores/LaboresModulo.tsx(179,45): error TS2339: Property 'metaEstandar' does not exist on type 'LaborAgricola'.
src/components/labores/LaboresModulo.tsx(188,61): error TS2339: Property 'metaEstandar' does not exist on type 'LaborAgricola'.
```

### Causa Raíz
En `src/domain/catalogoAgronomico.ts`, la interfaz canónica define:
```typescript
export interface LaborAgricola {
  id: string;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  min: number | null; // <-- Tiempo estándar en minutos
  personalReferencia: number;
  categoria: 'Adecuaciones' | 'Maquinaria';
  modelo: ModeloLabor;
  esPlasticoPolisombra?: boolean;
}
```
En `LaboresModulo.tsx` se invocaba `l.metaEstandar`, propiedad inexistente en el catálogo agronómico oficial.  
*Corrección recomendada:* Reemplazar `encontrada.metaEstandar` por `encontrada.min ? Math.round(475 / encontrada.min) : 1` y la etiqueta por `{l.unidadMedida} - {l.min ? `${l.min}m` : 'tiempo'}`.

---

## 3. AUDITORÍA DE SEGURIDAD Y PRIVACIDAD DE DATOS

1. **Protección de Datos Médicos en Incidentes (SG-SST / Ley 1581):**
   - **Evaluación:** APROBADO.
   - El formulario de incidentes exige descripción objetiva de los hechos ("Describa el hecho de manera objetiva sin diagnósticos reservados"), evitando el registro de diagnósticos clínicos sensibles o historias clínicas en bases no hospitalarias.
2. **Gestión de Secretos y OAuth Google Drive:**
   - **Evaluación:** APROBADO.
   - No existen llaves de API hardcodeadas, tokens secretos de servidor ni credenciales privadas en el repositorio. La arquitectura se adhiere a Google Identity Services client-side con token efímero en memoria sin persistir refresh tokens en `localStorage`.
3. **Inyección de Scripts (XSS) y Sanitización:**
   - **Evaluación:** APROBADO.
   - Todo el renderizado se realiza mediante componentes seguros de React (JSX) con escape automático contra inyección de HTML en campos libres (observaciones, nombres de colaboradores y descripciones).

---

## 4. AUDITORÍA DE PERSISTENCIA Y ARQUITECTURA OFFLINE

| Criterio | NexoCampo v18.1.9 Original | Aplicativo Alterno Actual | Brecha Técnica |
| :--- | :--- | :--- | :--- |
| **Base IndexedDB** | `nexocampo` (Versión 4) | `nexocampo_db` (Versión 2 / parcial) | Incompatibilidad de versión y nombre de BD. |
| **Object Stores** | 6 almacenes obligatorios: `colaboradores`, `labores`, `areas`, `ausencias`, `jornadas`, `asistencia`. | Almacén único genérico o estado volátil `useState`. | Si el operario reinicia la aplicación, los estados en memoria se pierden. |
| **Estructura de la Jornada** | Objeto contenedor raíz con matriz de `tramos[]` heterogéneos. | Entidades separadas e independientes en formularios aislados. | Imposibilidad de exportar jornadas compuestas con labores y eventos. |
| **Sincronización PWA** | Evento `sync-jornadas` con Background Sync API y cola de pendientes. | Simulación visual de pendientes con notificación toast. | No garantiza reintento automático silencioso al recuperar señal 4G en campo. |

---

## 5. AUDITORÍA MATEMÁTICA Y REGLAS DE NEGOCIO

1. **Jornada Canónica y Horas Netas:**
   - Lunes a Viernes: Apertura `06:30`, Cierre `15:30` (540 min brutos - 65 min descansos = **475 min netos**). Coincidencia exacta.
   - Sábados: Apertura `06:30`, Cierre `13:00` (390 min brutos - 30 min descansos = **360 min netos**). Coincidencia exacta.
2. **Exclusión Absoluta de Oficios Varios:**
   - Regla verificada en Changelog (2026-10-07): Oficios Varios se mide por tareas asignadas vs. completadas. **NUNCA** aporta minutos estándar a la bolsa de rendimiento técnico cronometrado.
   - *Riesgo en código alterno:* En componentes de consulta y reportes existía riesgo de promediar tareas de oficios varios con el índice de rendimiento porcentual de labores.
3. **Cierre de Estados de Labor (Changelog 2026-10-05):**
   - Estados `planificada` y `pendiente`: 0 minutos ganados, rendimiento `null` (labor abierta).
   - Estados `no_cumple` y `rechazado_calidad`: 0 minutos ganados, rendimiento técnico `0%` (labor cerrada con rechazo de calidad, producción aceptada nula).
   - Estados `cumple` y `validado`: Cómputo pleno de `unidades × min_estándar`.

---

## 6. AUDITORÍA DE EXPERIENCIA DE USUARIO Y ERGONOMÍA (ANDROID MOBILE)

1. **Restricción de Ancho de Pantalla:**
   - NexoCampo original utiliza `.app-shell` con `max-width: 28rem` (448 px) centrado con sombra suave para emular un dispositivo móvil incluso cuando se ejecuta en navegadores de escritorio.
   - El aplicativo alterno utiliza `max-w-7xl` (1280 px), obligando al supervisor a realizar paneo horizontal o movimientos de pulgar forzados en pantallas táctiles de campo.
2. **Área Táctil Mínima (Touch Target):**
   - Los botones de rotación de asistencia y de registro de jornada cumplen con el estándar WCAG 2.2 de 44×44 px (`min-h-[44px]`).
3. **Navegación:**
   - El original dispone de un menú inferior (`.bottom-nav`) fijo con 6 iconos y textos claros accesibles con el pulgar. El alterno presenta 15 pestañas superiores con scroll horizontal.

---

## 7. PLAN DE REMEDIACIÓN ORDENADO POR DEPENDENCIAS

```
1. CORRECCIÓN DE TIPOS (INMEDIATO)
   └─ Subsanar error TS2339 en LaboresModulo.tsx (propiedad 'min' vs 'metaEstandar').

2. ESTANDARIZACIÓN DE PERSISTENCIA (FASE 2.1)
   └─ Migrar a IndexedDB 'nexocampo' v4 con los 6 almacenes canónicos.

3. UNIFICACIÓN DE JORNADAS Y TRAMOS (FASE 2.2)
   └─ Estructurar el formulario de Registro como contenedor secuencial de tramos.

4. ALINEACIÓN VISUAL Y ERGONÓMICA (FASE 2.3)
   └─ Adoptar contenedor móvil de 28rem, tema claro dominante y bottom-nav de 6 vistas.

5. VERIFICACIÓN Y VALIDACIÓN OFFLINE (FASE 2.4)
   └─ Pruebas de aceptación con desconexión total y respaldo JSON bidireccional.
```

---
*Fin del informe de auditoría técnica del sistema (/audit).*
