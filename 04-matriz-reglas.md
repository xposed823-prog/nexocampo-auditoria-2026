# MATRIZ DE REGLAS DE NEGOCIO, JORNADAS Y RENDIMIENTO — NEXOCAMPO 2026
**Documento Técnico:** `04-matriz-reglas.md`  
**Estado:** Clasificación Normativa y Verificación Aritmética — Tarea 1 de 5  
**Proyecto:** NexoCampo 2026 (Versión Experimental e Independiente)  

---

## 1. Clasificación Jerárquica de Reglas

| Identificador | Regla de Negocio | Categoría | Estado Actual | Impacto en el Código |
| :--- | :--- | :--- | :--- | :--- |
| **RN-01** | NexoCampo se evoluciona, no se reconstruye. Prototipo aislado de producción. | Arquitectura | **Confirmada** | Código independiente sin modificar GitHub original. |
| **RN-02** | El supervisor opera el terminal; los colaboradores no tienen cuentas personales. | Operativa | **Confirmada** | Modelo de autenticación centrado en el supervisor. |
| **RN-03** | Persistencia primaria en IndexedDB con soporte Offline-First obligatorio. | Técnica | **Confirmada** | Almacenamiento local autónomo sin dependencia de red. |
| **RN-04** | Jornada Lunes a Viernes: 6:30 a. m. a 3:30 p. m. (Desayuno 30m, Almuerzo 30m). | Jornada | **Propuesta** | Parámetros configurables; no hardcodear como constantes rígidas. |
| **RN-05** | Estimación de 475 minutos efectivos de lunes a viernes. | Jornada / Aritmética | **Propuesta / Incierta** | Verificación aritmética: 540m brutos - 60m descanso - 5m pausa = 475m. |
| **RN-06** | Jornada Sábado: 6:30 a. m. a 1:00 p. m. con desayuno (30m). | Jornada | **Propuesta** | 390m brutos - 30m = 360m efectivos exactos. |
| **RN-07** | Pausas adicionales de 5 minutos: cantidad y distribución en la jornada. | Jornada | **Pendiente / Vacío** | Parametrizable en configuración de jornada. |
| **RN-08** | Fórmula de Rendimiento Temporal: `(T. Estándar / T. Efectivo) × 100`. | Rendimiento | **Propuesta Conceptual** | Requiere estándar validado formal; null si no existe. |
| **RN-09** | Fórmula de Cumplimiento de Cantidad: `(Cant. Completada / Cant. Objetivo) × 100`. | Rendimiento | **Propuesta Conceptual** | No confundir con rendimiento temporal. |
| **RN-10** | Si no hay estándar aprobado, prohibido calcular rendimiento técnico ficticio. | Calidad Técnica | **Confirmada** | Retornar estado `ESTANDAR_NO_DISPONIBLE`. |
| **RN-11** | La asistencia y ausencias no deben modificar automáticamente el rendimiento de labor. | Lógica de Negocio | **Confirmada** | Desacoplamiento total entre asistencia y eficiencia técnica. |
| **RN-12** | Clasificación obligatoria del estado del dato (5 categorías analíticas). | Auditoría | **Confirmada** | Metadata obligatoria en todo cálculo emitido. |
| **RN-13** | Labores de "Oficios Varios" no poseen estándares cronometrados obligatorios. | Operativa | **Confirmada** | Registro de horas sin evaluación porcentual forzada. |
| **RN-14** | Módulo de "Plástico y Polisombra" requiere seguimiento de subtareas de cubierta. | Operativa | **Confirmada** | Subtareas de tendido, tensado, grapado y costura. |

---

## 2. Análisis Crítico y Verificación Aritmética de las Jornadas

### 2.1. Desglose de Lunes a Viernes
- **Ventana bruta:** 06:30 a 15:30 = **9 horas = 540 minutos**.
- **Descansos explícitos:**
  - Desayuno: 08:30 a 09:00 = **30 minutos**.
  - Almuerzo: 12:00 a 12:30 = **30 minutos**.
  - Subtotal descansos de comida = **60 minutos**.
- **Tiempo residual:** 540 minutos - 60 minutos = **480 minutos**.
- **Análisis de la cifra objetivo de 475 minutos:**
  $$\text{Minutos Residuales (480)} - \text{Tiempo Objetivo (475)} = 5 \text{ minutos}$$
  *Hallazgo Aritmético:* Para que el tiempo efectivo sea exactamente 475 minutos, el modelo asume **exactamente UNA pausa adicional de 5 minutos** (o 5 minutos diarios de alistamiento/traslado de cuadrilla).
  *Alerta para desarrollo:* Si en campo se toman dos o tres pausas de 5 minutos (e.g. hidratación a las 10:30 y a las 14:00), el tiempo efectivo real sería de 470 min o 465 min. **Por ende, 475 no debe ser una constante quemada en el código, sino un valor calculado a partir de las pausas registradas o parametrizadas.**

### 2.2. Desglose del Sábado
- **Ventana bruta:** 06:30 a 13:00 = **6 horas y 30 minutos = 390 minutos**.
- **Descansos explícitos:**
  - Desayuno: 08:30 a 09:00 = **30 minutos**.
- **Tiempo residual:** 390 minutos - 30 minutos = **360 minutos efectivos**.
  *Hallazgo Aritmético:* La matemática del sábado coincide con exactitud (360 minutos) asumiendo **cero pausas adicionales de 5 minutos**. Si el sábado también se aplica una pausa de 5 minutos, el neto sería 355 minutos.

> **ADVERTENCIA LABORAL Y LEGAL:**  
> Estos esquemas horarios son referencias operativas del predio y **no deben presentarse como una norma laboral legal de orden público**. Las leyes laborales colombianas (Código Sustantivo del Trabajo, Ley 2101 de 2021 sobre reducción gradual de la jornada máxima) regulan los topes semanales y descansos remunerados. La aplicación debe almacenar los hechos cronológicos reales sin tipificar legalmente el contrato.

---

## 3. Modelo Analítico de Rendimiento y Distinción Conceptual

Es mandatorio no confundir las dos dimensiones del rendimiento:

### 3.1. Rendimiento Temporal (%)
$$\text{Rendimiento Temporal (\%)} = \left(\frac{\text{Tiempo Estándar de Producción Validada}}{\text{Tiempo Efectivo Computable}}\right) \times 100$$
- **Finalidad:** Evalúa la velocidad técnica o ritmo de trabajo frente a un estándar ingenieril cronometrado.
- **Condición excluyente:** Solo es calculable si existe un estándar formalmente medido y aprobado para la labor (e.g. *"Poda tipo A: 2.5 minutos por árbol"*). Si se produjeron 100 árboles en 240 minutos efectivos:
  $$\text{Tiempo Estándar} = 100 \times 2.5 = 250 \text{ min} \implies \text{Rendimiento Temporal} = \frac{250}{240} \times 100 = 104.17\%$$

### 3.2. Cumplimiento de Cantidad (%)
$$\text{Cumplimiento de Cantidad (\%)} = \left(\frac{\text{Cantidad Completada Real}}{\text{Cantidad Objetivo Planificada}}\right) \times 100$$
- **Finalidad:** Evalúa el grado de alcance de una meta de producción diaria o por lote fijada para la cuadrilla.
- **Diferencia clave:** Un colaborador puede alcanzar un 100% de cumplimiento físico habiendo trabajado horas extras o a un ritmo inferior al estándar, o viceversa. Son variables ortogonales.

---

## 4. Clasificación Estricta del Estado del Dato

Todo registro analítico en NexoCampo debe rotularse con uno de estos cinco estados:

1. **Dato Observado:** Capturado directamente por el supervisor en campo con inicio y fin cronometrados en tiempo real.
2. **Dato Incompleto:** Falta hora de cierre, no se registró la unidad producida o existe discrepancia de horario.
3. **Dato Estimado:** Asignación de producción calculada por prorrateo de cuadrilla o estimación ocular de avance.
4. **Resultado Calculado y Aprobado:** Cumple todas las reglas de consistencia y cuenta con estándar oficial validado.
5. **Resultado Pendiente de Validación:** Calculado provisionalmente a la espera de que el supervisor o agrónomo confirme la muestra de calidad o el conteo en báscula/empaque.
