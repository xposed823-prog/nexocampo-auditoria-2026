# INFORME DE AUDITORÍA MATEMÁTICA Y REGLAS DE NEGOCIO — NEXOCAMPO PRO (v18.1.9)
**Documento:** `MATH_AUDIT_NEXOCAMPO_REPORT.md`  
**Objetivo:** Verificación rigurosa de las fórmulas de rendimiento, deducciones horarias, medias ponderadas, solapamientos y banco de 16 casos de prueba matemáticos.  
**Fecha:** 2026-10-20  
**Estado:** Certificado con 100% de Pruebas Aprobadas en Código  

---

## 1. RESUMEN EJECUTIVO DE LA AUDITORÍA MATEMÁTICA

Se ejecutó la auditoría formal sobre el núcleo algebraico y el motor de reglas de negocio de NexoCampo (`domain/rendimientoCalculator.ts`, `domain/jornadaCalculator.ts`, `domain/businessRulesEngine.ts`), evaluando su concordancia con las normas agronómicas de campo y los principios de cálculo actuarial de cuadrillas.

### Veredicto del Auditor Matemático:
* **Separación de Dimensiones:** Cumplimiento total. El sistema distingue estrictamente entre **Velocidad Técnica (Rendimiento Temporal)** y **Volumen Físico (Cumplimiento de Metas)**.
* **Integridad de Divisiones y Valores Nulos:** Las fórmulas protegen contra divisiones por cero ($T_{\text{efectivo}} \le 0$) retornando estados controlados (`TIEMPO_EFECTIVO_INVALIDO`) sin generar valores `NaN` o `Infinity`.
* **Prohibición de Truncamiento Silencioso (No Clamping):** Las eficiencias superiores a la meta (ej. 120%, 125%) no se truncan artificialmente al 100%, preservando el incentivo real de producción.
* **Media Ponderada Obligatoria:** Se verificó la eliminación de promedios simples de porcentajes, sustituyéndolos por la **media ponderada por minutos efectivos reales**.
* **Oficios Varios:** Se confirmó la prohibición de inventar tiempos estándar en labores auxiliares; se computa por razón de tareas asignadas vs. completadas.

---

## 2. ESPECIFICACIÓN FORMAL DE LAS FÓRMULAS DE DOMINIO

---

### FÓRMULA 1: RENDIMIENTO TEMPORAL (%)
Determina la velocidad o eficiencia técnica del colaborador o cuadrilla respecto a una calibración estándar formal aprobada.

$$\mathbf{R_{\text{temporal}} = \left(\frac{T_{\text{estándar total}}}{T_{\text{efectivo computable}}}\right) \times 100 = \left(\frac{C_{\text{completada}} \times \text{MinEstándarUnitario}}{T_{\text{efectivo en minutos}}}\right) \times 100}$$

* **Datos de Entrada:**
  - $C_{\text{completada}}$: Cantidad de unidades físicas validadas producidas (número real $\ge 0$).
  - $\text{MinEstándarUnitario}$: Minutos estándar por unidad aprobados en el catálogo de 23 labores (número real $> 0$ o `null`).
  - $T_{\text{efectivo computable}}$: Minutos reales de trabajo descontando pausas computables (número real $> 0$).
* **Unidad de Medida:** Porcentaje ($\%$) redondeado a 2 decimales.
* **Condiciones de Validez:**
  1. $\text{MinEstándarUnitario} > 0$ y $\ne \text{null}$.
  2. $T_{\text{efectivo computable}} > 0$.
  3. $C_{\text{completada}} \ge 0$.
* **Exclusiones Específicas:**
  - Si $\text{MinEstándarUnitario}$ es `null` (labores de Oficios Varios o Maquinaria sin estándar): el cálculo **se aborta**, retorna estrictamente `null` y emite el estado `ESTANDAR_NO_DISPONIBLE`.
  - Si $T_{\text{efectivo computable}} \le 0$: retorna `null` y estado `TIEMPO_EFECTIVO_INVALIDO` (cero excepciones `NaN` o `Infinity`).
* **Comportamiento en Sobrepaso:** Si $R_{\text{temporal}} > 100\%$, el valor se registra íntegro (ej. $125.00\%$).
* **Casos de Prueba Vinculados:** Test 1 (Red Team), Test 7, Test 8, Test 9 y Test 13.

---

### FÓRMULA 2: CUMPLIMIENTO DE CANTIDAD (METAS FÍSICAS) (%)
Evalúa el porcentaje de avance respecto a la meta agronómica planificada para el turno.

$$\mathbf{C_{\text{cantidad}} = \left(\frac{\text{Cantidad Completada Real}}{\text{Cantidad Objetivo (Meta)}}\right) \times 100}$$

* **Datos de Entrada:**
  - $\text{Cantidad Completada}$: Unidades físicas ejecutadas (número real $\ge 0$).
  - $\text{Cantidad Objetivo (Meta)}$: Meta requerida planificada (número real $> 0$).
* **Unidad de Medida:** Porcentaje ($\%$).
* **Condiciones de Validez:**
  - $\text{Cantidad Objetivo} > 0$. Si la meta es $\le 0$, se lanza un error controlado de parámetro inválido.
* **Clasificación Automática de Estados:**
  - Si $C_{\text{cantidad}} > 100\%$: Estado `SOBREPASO_META`.
  - Si $C_{\text{cantidad}} = 100\%$: Estado `META_CUMPLIDA`.
  - Si $C_{\text{cantidad}} < 100\%$: Estado `META_EN_DEFICIT`.
* **Prohibición de Truncamiento:** Prohibido limitar a 100.0% en bases de datos o reportes analíticos.

---

### FÓRMULA 3: RENDIMIENTO PONDERADO DE CUADRILLA (MEDIA PONDERADA)
Consolida el rendimiento temporal de múltiples labores o colaboradores ponderando exclusivamente por las horas efectivas de cada intervalo.

$$\mathbf{R_{\text{ponderado}} = \frac{\sum_{i=1}^{n} (R_i \times T_i)}{\sum_{i=1}^{n} T_i} = \left(\frac{\sum_{i=1}^{n} T_{\text{estándar}, i}}{\sum_{i=1}^{n} T_{\text{efectivo}, i}}\right) \times 100}$$

* **El Error del Promedio Simple (Demostración de Invalidez):**
  - Supóngase Labor 1 de 30 min al $150\%$ y Labor 2 de 300 min al $80\%$.
  - *Promedio simple aritmético erróneo:* $\frac{150 + 80}{2} = \mathbf{115.00\%}$ (distorsión grave).
  - *Ponderación oficial por tiempo efectivo:*
    $$T_{\text{estándar}} = (30 \times 1.5) + (300 \times 0.8) = 45 + 240 = 285 \text{ min}$$
    $$T_{\text{efectivo}} = 30 + 300 = 330 \text{ min}$$
    $$R_{\text{ponderado}} = \frac{285}{330} \times 100 = \mathbf{86.36\%}$$
* **Condición de Muestra Insuficiente:** Si $\sum T_i < 60\text{ minutos}$ o las unidades acumuladas son $< 10$, se etiqueta: `⚠️ Muestra estadística insuficiente (confiabilidad preliminar)`.

---

### FÓRMULA 4: ARITMÉTICA DE JORNADA Y DESCUENTO DE PAUSAS
Calcula el tiempo marco disponible y el tiempo productivo neto según la ventana horaria del predio.

$$\mathbf{T_{\text{efectivo}} = (H_{\text{cierre}} - H_{\text{apertura}}) - \sum \text{Pausas Computables Deducibles}}$$

* **Jornada Ordinaria Lunes a Viernes:**
  - Apertura: `06:30` | Cierre: `15:30` $\to$ Duración bruta $= 540 \text{ minutos (9.0 horas)}$.
  - Desayuno: `30 min` (Deducible).
  - Almuerzo: `30 min` (Deducible).
  - Pausa reglamentaria: `5 min` (Deducible).
  - Deducciones totales $= 30 + 30 + 5 = 65 \text{ minutos}$.
  - $$\text{Tiempo Efectivo Computable} = 540 - 65 = \mathbf{475 \text{ minutos netos (7 horas 55 min)}}.$$
* **Jornada de Sábado:**
  - Apertura: `06:30` | Cierre: `13:00` $\to$ Duración bruta $= 390 \text{ minutos (6.5 horas)}$.
  - Desayuno: `30 min` (Deducible).
  - Deducciones totales $= 30 \text{ minutos}$.
  - $$\text{Tiempo Efectivo Computable} = 390 - 30 = \mathbf{360 \text{ minutos netos (6 horas)}}.$$

---

### FÓRMULA 5: CUMPLIMIENTO EN OFICIOS VARIOS (CONTEO DE TAREAS)
Para labores del catálogo donde no existe estándar temporal calibrado formalmente (`min === null`).

$$\mathbf{\text{Cumplimiento}_{\text{Oficios Varios}} = \left(\frac{\text{Tareas Completadas}}{\text{Tareas Asignadas}}\right) \times 100}$$

* **Regla Innegociable:** Prohibido inventar minutos estándar o asignar 100% de rendimiento por omisión. Se reporta el porcentaje de tareas concluidas (ej. 3 de 5 tareas $= 60.0\%$).

---

## 3. BANCO CERTIFICADO DE LOS 16 CASOS DE PRUEBA MATEMÁTICOS

| Caso | Escenario Matemático de Prueba | Entradas Oficiales | Fórmulas Aplicadas | Resultado Esperado | Estado de Verificación |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **C-01** | Jornada simple con 1 labor | 06:30-15:30, pausas: 30m + 30m + 5m | $540 - 65$ | **475 min netos**, 1 sola jornada | **APROBADO** |
| **C-02** | 3 labores consecutivas en 1 jornada | 210m + 105m + 180m; pausas: 15m + 30m | $495\text{ lab} + 45\text{ pau} = 540$ | Cuadre exacto en 540 min; 1 sola jornada | **APROBADO** |
| **C-03** | Subtareas que heredan horario | Labor madre (300m) + 3 subtareas heredadas | $300 + 0$ extra | Acumulado **300 min** (no 1200 min) | **APROBADO** |
| **C-04** | Detección de solapamiento real | Labor A: 08:00-11:00, Labor B: 10:30-12:00 | $\text{Inicio}_B < \text{Fin}_A$ | **Rechazo y bloqueo de guardado** | **APROBADO** |
| **C-05** | Pausas deducibles vs no deducibles | Bruto 540 min, comida deducible 30m, traslado 15m | $540 - 30$ | **510 min netos computables** | **APROBADO** |
| **C-06** | Labor pendiente con justificación | Meta 100 camas, avance 70 camas, justificado | $(70 / 100) \times 100$ | **70.0%**, estado `Pendiente` (no `No Cumple`) | **APROBADO** |
| **C-07** | Labor sin estándar (Oficios Varios) | Limpieza canales: 240 min, 120m, $\text{estándar} = \text{null}$ | $f(\text{Rendimiento}) = \text{null}$ | Rendimiento **`null`**, estado `ESTANDAR_NO_DISPONIBLE` | **APROBADO** |
| **C-08** | Prevención de división por cero | $T_{\text{efectivo}} = 0\text{ min}$ (08:00 a 08:00), 10 unidades | $\frac{30}{0} \to \text{Indeterminación}$ | Retorna **`null`**, estado `TIEMPO_EFECTIVO_INVALIDO` | **APROBADO** |
| **C-09** | Producción exactamente igual a meta | Meta 150 camas, completado 150 camas | $(150 / 150) \times 100$ | Cumplimiento **100.0%**, estado `Cumple` | **APROBADO** |
| **C-10** | Información incompleta | Inicio 06:30, sin hora fin ni unidades | Faltan variables obligatorias | Estado **`Incompleto`**, excluido de promedios | **APROBADO** |
| **C-11** | Consulta cruzada vs Reportes | Colaborador `COL-001`, fecha `2026-10-19` | Motor único desacoplado | **Identidad matemática absoluta** | **APROBADO** |
| **C-12** | Modificación de registro guardado | Inicial 80 unidades, corregido a 85 unidades | Recálculo con misma versión | Actualiza a **85**, emite bitácora | **APROBADO** |
| **C-13** | Superación de meta (> 100%) | Meta 200 árboles, completado 240 árboles | $(240 / 200) \times 100$ | **120.0% exacto**, prohíbe truncar a 100% | **APROBADO** |
| **C-14** | Superación en Oficios Varios | Asignadas 4 tareas, completadas 5 tareas | $(5 / 4) \times 100$ | **125.0%**, rotula `supero_asignacion` | **APROBADO** |
| **C-15** | Interrupción climática (Lluvia) | Parada por tormenta de 11:00 a 12:00 | Descuento de tiempo efectivo | Cero penalización en velocidad técnica | **APROBADO** |
| **C-16** | Subtareas de infraestructura | 80m cubiertos, 80m grapados, 60m cosidos | No sumar metros de subtareas | Avance total lote: **80 metros** (no 220m) | **APROBADO** |

---

## 4. VERSIONADO HISTÓRICO Y TRAZABILIDAD

Todo cálculo consolidado y guardado en la base de datos local `nexocampo` lleva incorporado el identificador inmutable de versión:
```json
{
  "versionFormula": "FORMULA_RENDIMIENTO_V1_2026",
  "algoritmoPonderacion": "MEDIA_PONDERADA_TIEMPO_EFECTIVO",
  "timestampUTC": "2026-10-20T15:51:00.000Z"
}
```
**Regla de Inmutabilidad Retroactiva:** Cualquier calibración futura de tiempos estándar por la gerencia técnica no alterará ni recalculará silenciosamente los registros históricos aprobados en fechas pasadas.

---

> **CERTIFICACIÓN MATEMÁTICA:** Se certifica que las 5 fórmulas de dominio, las reglas de exclusión, la protección ante división por cero y los 16 casos de prueba matemáticos cumplen con rigor el 100% de las especificaciones y se encuentran respaldados por pruebas unitarias automatizadas ejecutables.
