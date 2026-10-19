# CATÁLOGO DE COMPONENTES DE INTERFAZ (UI) — NEXOCAMPO 2026
**Documento Técnico:** `10-componentes-ui.md`  
**Estado:** Especificación de Componentes, Estados y Patrones Táctiles  
**Fase:** Tarea 2 de 5 (Diseño UX/UI, Sistema Visual y Modelo de Datos)  
**Fecha:** 2026-10-18  

---

## 1. Principios de Componentes Táctiles para Campo

Todos los componentes de NexoCampo 2026 están construidos para responder con cero fricción bajo condiciones adversas de campo (manos con polvo o guantes, pantalla con gotas de rocío o reflejo solar intenso).

### Dimensiones Mínimas de Interacción (WCAG 2.2 AA)
- **Área Táctil Mínima (Hitbox):** $44 \times 44\text{px}$ en botones secundarios e íconos.
- **Acciones Primarias:** Altura mínima de $48\text{px}$ con ancho completo (`w-full`) o horizontal generoso (`px-5 py-3`).
- **Separación entre Elementos Táctiles:** Mínimo $8\text{px}$ de distancia libre entre botones adyacentes para prevenir toques involuntarios.

---

## 2. Tipología y Jerarquía de Botones

| Tipo de Botón | Estilo Visual (Dark / Sol) | Altura Mínima | Uso Exclusivo |
| :--- | :--- | :--- | :--- |
| **Primario** | `bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md active:scale-[0.98]` | 48px | Guardar registro, Iniciar Jornada, Confirmar Pase de Lista. |
| **Secundario** | `bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750` | 44px | Cancelar, Volver, Filtros contextuales, Ver detalles. |
| **Advertencia** | `bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30` | 44px | Abrir Justificación de Pendientes, Reportar Novedad Climática. |
| **Destructivo** | `bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30` | 44px | Anular Registro, Eliminar Asignación Errónea (exige modal). |

---

## 3. Matriz de Estados Visuales de Negocio

El sistema implementa 7 estados visuales unificados con ícono y texto explícito:

| Estado | Etiqueta Visual | Ícono Representativo | Significado Operativo |
| :--- | :--- | :--- | :--- |
| **Cumple** | `Cumple (100%+)` | CheckCircle2 (Verde) | Labor o meta ejecutada al estándar establecido. |
| **No Cumple** | `No Cumple (<100%)` | AlertOctagon (Ámbar/Rojo) | Producción inferior a la meta; requiere trazabilidad. |
| **Pendiente** | `Pendiente Justificación` | Clock (Ámbar) | Hay saldo de unidades sin completar pendiente de justificar. |
| **Sin Registro** | `— (Sin Registrar)` | Minus (Gris Neutro) | Celda o colaborador sin captura aún. **No implica ausencia.** |
| **Incompleto** | `Incompleto (En curso)` | AlertCircle (Azul Celeste) | Falta hora de fin, o registro guardado en progreso. |
| **No Aplicable** | `No Aplica` | Ban (Gris Muted) | Labor sin estándar técnico (Oficios Varios) o festivo. |
| **Error Guardado**| `Fallo en Persistencia` | XCircle (Rojo Carmesí) | Transacción de IndexedDB rechazada o cuota excedida. |

---

## 4. Estados Universales de Interfaz (Lifecycle States)

### 4.1. Estado de Carga (Loading)
- **Indicador:** Esqueleto tipográfico sutil (`animate-pulse bg-slate-800/60 rounded`) respetando las dimensiones finales del contenido para evitar saltos de diseño (CLS = 0).
- **Prohibición:** Prohibido congelar la pantalla completa con un spinner que bloquee la navegación general.

### 4.2. Estado Vacío (Empty State)
- **Componente:** Caja centrada con ícono agrícola neutro en escala de grises, título explicativo en una sola línea (ej. *"No hay jornadas registradas para esta semana"*) y botón de acción primario directo (*«Iniciar Jornada de Hoy»*).

### 4.3. Estado de Error (Error Boundary)
- **Componente:** Panel de aislamiento con borde sutil `#ef4444`, explicación clara del fallo en lenguaje comprensible (sin trazas técnicas internas crudas) y botón de reintento local seguro (*«Reintentar Guardado»* o *«Cargar desde Respaldo Local»*).

### 4.4. Estado de Éxito (Success Toast)
- **Componente:** Notificación discreta de confirmación en la parte superior o inferior (`bg-emerald-950/80 border border-emerald-500/40 text-emerald-200`) que se oculta automáticamente en 2.5 segundos sin requerir acción manual.

### 4.5. Ventana Modal de Confirmación (Bottom-Sheet en Móvil)
- **Estructura en Móvil:** Se despliega desde la parte inferior de la pantalla (`rounded-t-2xl max-h-[85vh] overflow-y-auto`) con barra táctil superior de arrastre (`w-10 h-1 bg-slate-600 rounded-full mx-auto mb-3`).
- **Botones de Decisión:** Botón afirmativo y botón de cancelación apilados verticalmente con separación de 8px, garantizando fácil alcance con el pulgar.

---

## 5. Componentes Especializados de NexoCampo

### 5.1. Matriz Semanal de Asistencia
- **Diseño:** Tabla de filas de altura cómoda ($52\text{px}$) con encabezado fijo de días (Lunes a Sábado) y columna izquierda con el código/alias del colaborador (`COL-001 / J. Pérez`).
- **Celda Táctil:** Botón accesible de $44 \times 44\text{px}$ por celda que permite alternar cíclicamente o abrir el modal de justificación de novedad en caso de permiso o incapacidad médica.

### 5.2. Selector Múltiple de Condiciones Ambientales
- **Diseño:** Cuadrícula de tarjetas táctiles de selección múltiple (chips de selección interactivos de $44\text{px}$) con ícono y texto:
  - `[☀️ Soleado]`
  - `[🌦️ Llovizna Leve]`
  - `[🌧️ Lluvia Moderada / Intensa]`
  - `[💧 Terreno Húmedo]`
  - `[🚜 Terreno Saturado / Lodoso]`
  - `[💨 Vientos Fuertes]`
- **Comportamiento:** Permite seleccionar combinaciones realistas (ej. `Lluvia moderada` + `Terreno lodoso`).

### 5.3. Modal de Justificación de Saldo Pendiente
- **Activación:** Se dispara cuando `unidadesCompletadas < unidadesProgramadas` en coberturas o labores.
- **Opciones Estrictas:**
  - `[ ] Tiempo insuficiente en la jornada`
  - `[ ] Vientos fuertes`
  - `[ ] Lluvia intensa`
- **Nota Opcional:** Campo de texto de hasta 120 caracteres para aclaraciones breves del supervisor.
