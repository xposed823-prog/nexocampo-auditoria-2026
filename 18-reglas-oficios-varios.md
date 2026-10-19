# REGLAS DE NEGOCIO: MÓDULO DE OFICIOS VARIOS — NEXOCAMPO 2026
**Documento Técnico:** `18-reglas-oficios-varios.md`  
**Estado:** Especificación de Labores sin Estándar Cronometrado  
**Fase:** Tarea 3 de 5 (Reglas de Negocio, Jornadas, Labores y Rendimiento)  
**Fecha:** 2026-10-18  

---

## 1. Naturaleza y Propósito Operativo del Módulo

En la operación agrícola diaria surgen múltiples labores de apoyo, mantenimiento o mitigación imprevista que **carecen de tiempos estándar de ingeniería cronometrados** (ej. limpieza manual de canales y zanjas de desagüe, movimiento de bultos de cal/abono, acarreo de estacas o desyerbe de bordes de vías internas).

Exigir o inventar un rendimiento técnico porcentual para estas tareas distorsiona la analítica y genera evaluaciones injustas. Por ello, el módulo *Oficios Varios* opera bajo un modelo de **conteo de tareas asignadas vs completadas** y registro de horas efectivas.

---

## 2. Catálogo de Campos de Registro

| Campo | Tipo de Dato | Obligatoriedad | Descripción y Restricción |
| :--- | :--- | :--- | :--- |
| **`colaboradorId`** | UUID / String | **Obligatorio** | Identificador del colaborador ficticio asignado (`COL-XXXX`). |
| **`fecha`** | Date (`YYYY-MM-DD`) | **Obligatorio** | Fecha de ejecución dentro de la jornada activa. |
| **`horaInicio`** | Time (`HH:mm`) | **Obligatorio** | Hora de inicio efectivo de la labor de apoyo. |
| **`horaFin`** | Time (`HH:mm`) | **Obligatorio** | Hora de término (`horaFin > horaInicio`). |
| **`tareasAsignadas`** | Entero $\ge 1$ | **Obligatorio** | Número de tareas o frentes asignados. |
| **`tareasCompletadas`** | Entero $\ge 0$ | **Obligatorio** | Número de tareas efectivamente terminadas. |
| **`observaciones`** | String (máx 200) | Opcional | Detalle de herramientas o lote específico atendido. |
| **`estado`** | Enum | **Obligatorio** | `'completa' | 'pendiente' | 'interrumpida'`. |
| **`evidenciaAdjunta`** | String / URL | Opcional | Registro fotográfico o nota de confirmación visual. |

---

## 3. La Métrica de Cumplimiento de Tareas

$$\text{Cumplimiento de Tareas (\%)} = \left(\frac{\text{Número de Tareas Completadas}}{\text{Número de Tareas Asignadas}}\right) \times 100$$

### El Ejemplo Canónico:
- **Tareas asignadas:** 5 tramos de zanja de drenaje.
- **Tareas completadas:** 3 tramos de zanja de drenaje.
- **Cumplimiento:** $\frac{3}{5} \times 100 = \mathbf{60.00\%}$.

> **ADVERTENCIA CONCEPTUAL INVIOLABLE:**  
> **Ese 60.00% representa exclusivamente el porcentaje de avance físico en la lista de tareas asignadas.**
> - **NO representa rendimiento temporal (ritmo técnico de trabajo).**
> - **NO debe promediarse con los porcentajes de labores estandarizadas (poda, cosecha).**
> - **Prohibido inventar pesos relativos de importancia para cada tarea** (ej. asumir que desyerbar vale el doble que acarrear) sin un baremo formal aprobado por la dirección agrícola.

---

## 4. Matriz de Validaciones de Integridad

| Caso de Entrada | Condición Matemática | Acción del Sistema | Mensaje de Error / Estado |
| :--- | :--- | :--- | :--- |
| **Cantidades Negativas** | `tareasAsignadas < 0` o `tareasCompletadas < 0` | **Bloqueo Inmediato** | *"Las cantidades de tareas no pueden ser negativas."* |
| **Cero Tareas Asignadas** | `tareasAsignadas === 0` | **Bloqueo Inmediato** | *"Debe asignar al menos una tarea (mínimo 1)."* |
| **Completadas > Asignadas** | `tareasCompletadas > tareasAsignadas` | **Advertencia / Confirmación** | *"Las tareas completadas superan las asignadas inicialmente. ¿Desea actualizar la meta asignada?"* |
| **Registro Incompleto** | Falta `horaFin` al cerrar turno | **Estado Incompleto** | Se retiene como `Incompleto`; no suma a horas cerradas. |
| **Tareas Pendientes** | `tareasCompletadas < tareasAsignadas` | **Estado Pendiente** | Se marca `Pendiente`; no genera sanción. |

---

## 5. Regla de Suspensión Temporal y Continuidad

En la jornada agrícola, un operario puede encontrarse podando (Labor Principal A) de 06:30 a 09:30. A las 09:30 se le solicita urgentemente descargar un camión de fertilizante (Oficio Vario B) de 09:30 a 11:00, y a las 11:00 retoma la poda (Labor Principal A) hasta las 15:30.

- **Comportamiento en NexoCampo:**
  1. La `Labor Principal A` queda registrada con segmento matutino (06:30 - 09:30) y estado `pausada_por_oficio_vario`.
  2. El `Oficio Vario B` se registra con segmento cerrado (09:30 - 11:00).
  3. A las 11:00 se abre la continuación de la `Labor Principal A` (11:00 - 15:30).
  4. El sistema totaliza para el colaborador: $3.0\text{ h (Poda mañana)} + 1.5\text{ h (Oficio)} + 4.5\text{ h (Poda tarde)} = 9.0\text{ horas brutas}$ de jornada, sin solapamientos ni duplicación.
