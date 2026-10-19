# REGLAS DE NEGOCIO: JORNADAS, SEGMENTOS HORARIOS Y PAUSAS — NEXOCAMPO 2026
**Documento Técnico:** `15-reglas-jornada.md`  
**Estado:** Especificación de Invariantes Temporales y Segmentación  
**Fase:** Tarea 3 de 5 (Reglas de Negocio, Jornadas, Labores y Rendimiento)  
**Fecha:** 2026-10-18  

---

## 1. Clasificación Jerárquica de Reglas de Jornada

En cumplimiento de la metodología de certeza, cada regla se cataloga formalmente:

| Identificador | Regla Operativa / Temporal | Clasificación | Estado de Aprobación |
| :--- | :--- | :--- | :--- |
| **RJ-01** | La jornada general representa el período marco de disponibilidad de la persona en el predio. | **Confirmada** | Aprobada para implementación. |
| **RJ-02** | Múltiples labores consecutivas pertenecen a una misma jornada; **prohibido sumar múltiples jornadas generales**. | **Confirmada** | Regla arquitectónica estricta. |
| **RJ-03** | Las subtareas que heredan horario no generan nuevos segmentos temporales en la jornada. | **Confirmada** | Evita solapamiento aparente y duplicidad. |
| **RJ-04** | Ventana referencial Lunes a Viernes: 06:30 a 15:30 (540 min brutos). Desayuno 30m, Almuerzo 30m. | **Propuesta Técnica** | Pendiente de validación agronómica formal. |
| **RJ-05** | Ventana referencial Sábado: 06:30 a 13:00 (390 min brutos). Desayuno 30m. | **Propuesta Técnica** | Pendiente de validación agronómica formal. |
| **RJ-06** | Pausas adicionales de 5 minutos: cantidad exacta y distribución temporal en campo. | **Pendiente de Información** | Requiere definición del comité operativo. |
| **RJ-07** | Jornadas nocturnas o que cruzan la medianoche (`horaFin < horaInicio`). | **No Implementable de Forma Segura** | Bloqueadas hasta definir soporte de turnos nocturnos. |
| **RJ-08** | Interrupciones climáticas severas (lluvias torrenciales): descuento vs tiempo muerto pagado. | **Pendiente de Información** | Registrado como evento neutral sin penalización. |

---

## 2. Modelo Temporal y Aritmética de Segmentos

### 2.1. El Ejemplo Canónico Obligatorio
Una jornada general de cuadrilla programada de **06:30 a. m. a 03:30 p. m.** (540 minutos brutos):
- **Labor A:** 06:30 a. m. a 10:00 a. m. (Duración: 210 minutos = 3.5 horas).
- *Transición / Refrigerio:* 10:00 a. m. a 10:15 a. m. (15 minutos pausa intermedia).
- **Labor B:** 10:15 a. m. a 12:00 m. (Duración: 105 minutos = 1.75 horas).
- *Almuerzo Oficial:* 12:00 m. a 12:30 p. m. (30 minutos descanso institucional).
- **Labor C:** 12:30 p. m. a 03:30 p. m. (Duración: 180 minutos = 3.0 horas).

**Validación del Sistema:**
$$\text{Tiempo Efectivo Total en Labores} = 210 + 105 + 180 = 495 \text{ minutos}$$
$$\text{Pausas Registradas} = 15 \text{ (Refrigerio)} + 30 \text{ (Almuerzo)} = 45 \text{ minutos}$$
$$\text{Control de Cuadre:} \quad 495 + 45 = 540 \text{ minutos (Consistencia Absoluta)}$$

> **REGLA FUNDAMENTAL:** El sistema registra las labores A, B y C como asignaciones segmentadas dentro del identificador de jornada único `JRN-20261019-LOTE1`. En ningún caso se generan tres jornadas independientes ni se triplican los tiempos del colaborador.

---

## 3. Matriz de Validaciones Temporales y Detección de Solapamientos

```
Línea Temporal: 06:30 ──────────────────────── 10:00 ─── 10:15 ───────────── 15:30
Labor Principal: [====== Labor A ============]       [====== Labor B ======]
Subtarea:        [-- Subtarea 1 (Hereda) --]  (No es solapamiento; es jerarquía)
Error de Choque:       [XXXX Labor Invalida XXXX] (Solapamiento real en mismo operario)
```

### Reglas de Solapamiento:
1. **Solapamiento Real (Infracción de Integridad):** Ocurre si un mismo colaborador $C_1$ tiene asignada una `Labor 1` de 08:00 a 11:00 y se intenta registrar para él una `Labor 2` de 10:30 a 12:00.
   - *Comportamiento:* El sistema **rechaza el guardado** con el mensaje: *"El colaborador COL-001 ya tiene asignada una labor entre 10:30 y 11:00 en el Lote 2."*
2. **Labores Consecutivas Contiguas (Válidas):** Si `Labor A` finaliza a las 10:00 y `Labor B` inicia exactamente a las 10:00:
   - *Comportamiento:* **Es completamente válido y se permite el guardado sin falsos errores**. La condición de solapamiento estricta es: $\text{Inicio}_2 < \text{Fin}_1$.
3. **Subtareas y Tareas Madres (Duplicación Aparente Resuelta):** Una subtarea (ej. costura de malla) asociada a una labor principal de cubierta comparte el mismo intervalo temporal.
   - *Comportamiento:* El motor de persistencia valida que la subtarea tenga `laborPrincipalId`. **La subtarea no entra en el algoritmo de solapamiento de líneas temporales de operario**, impidiendo falsas alertas de colisión.

---

## 4. Tabla de Decisión: Deducción de Pausas e Interrupciones

| Tipo de Interrupción | Registro de Hora | ¿Deduce Tiempo Computable de Labor? | Tratamiento en el Sistema |
| :--- | :--- | :--- | :--- |
| **Desayuno Oficial** (30 min) | 08:30 a 09:00 | **Sí** | Descuento institucional estándar de la jornada. |
| **Almuerzo Oficial** (30 min) | 12:00 a 12:30 | **Sí** | Descuento institucional estándar de la jornada. |
| **Pausa breve hidratación** (5 min) | Variable | **Sí** | Descuento explícito parametrizable en jornada. |
| **Lluvia Torrencial / Tormenta** | Hora inicio y fin | **No deduce automáticamente** | Se registra como evento climático. No penaliza el rendimiento técnico del operario. |
| **Falta de Insumos / Traslado** | Hora inicio y fin | **Sujeto a regla aprobada** | Se registra con estado `tiempo_espera_justificado`. |
