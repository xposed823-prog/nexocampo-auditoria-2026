# CASOS DE PRUEBA MATEMÁTICOS OBLIGATORIOS (16 CASOS) — NEXOCAMPO 2026
**Documento Técnico:** `22-casos-prueba-matematicos.md`  
**Estado:** Especificación de Escenarios de Prueba, Entradas y Salidas Esperadas  
**Fase:** Tarea 3 de 5 (Reglas de Negocio, Jornadas, Labores y Rendimiento)  
**Fecha:** 2026-10-18  

---

## 1. Banco de 16 Casos de Prueba Matemáticos y de Integridad

Cada caso define rigurosamente sus datos de entrada, el algoritmo a aplicar, el resultado esperado y el comportamiento ante incertidumbres:

---

### Caso 1: Jornada con Una Labor
- **Entrada:**
  - Jornada: 06:30 a 15:30 (540 min brutos).
  - Pausas: Desayuno 30 min + Almuerzo 30 min + Pausa breve 5 min = 65 min.
  - Labor: 06:30 a 15:30 (misma ventana de la jornada).
- **Cálculo:**
  $$\text{Tiempo Computable} = 540 - 65 = 475 \text{ minutos}$$
- **Resultado Esperado:**
  - Tiempo efectivo: **475 minutos**.
  - Total de jornadas creadas: **1**.
  - Estado: `Válido`.

---

### Caso 2: Jornada con Tres Labores Consecutivas
- **Entrada:**
  - Jornada general: 06:30 a 15:30 (540 min).
  - Labor A: 06:30 a 10:00 (210 min).
  - Pausa refrigerio: 10:00 a 10:15 (15 min).
  - Labor B: 10:15 a 12:00 (105 min).
  - Almuerzo oficial: 12:00 a 12:30 (30 min).
  - Labor C: 12:30 a 15:30 (180 min).
- **Cálculo:**
  $$\text{Tiempo Labores} = 210 + 105 + 180 = 495 \text{ min}$$
  $$\text{Tiempo Pausas} = 15 + 30 = 45 \text{ min}$$
  $$\text{Total Cuadre} = 495 + 45 = 540 \text{ min}$$
- **Resultado Esperado:**
  - Las 3 labores se guardan vinculadas a **1 sola jornada**.
  - Prohibido crear 3 jornadas independientes.
  - Cero errores de solapamiento en transiciones contiguas (10:00, 12:00, 12:30).

---

### Caso 3: Varias Subtareas que Heredan Horario
- **Entrada:**
  - Labor Principal (Plástico): 07:00 a 12:00 (300 min brutos).
  - Subtarea 1 (Tendido): Hereda 07:00 a 12:00.
  - Subtarea 2 (Grapado): Hereda 07:00 a 12:00.
  - Subtarea 3 (Costura): Hereda 07:00 a 12:00.
- **Cálculo:**
  $$\text{Tiempo Total Jornada} = 300 \text{ minutos (Se contabiliza una sola vez)}$$
- **Resultado Esperado:**
  - Tiempo acumulado para los operarios: **300 minutos** (no $300 \times 4 = 1200\text{ min}$).
  - Cero falsas alertas de solapamiento entre subtareas y labor madre.

---

### Caso 4: Solapamiento Real
- **Entrada:**
  - Colaborador `COL-001` asignado a Labor A de 08:00 a 11:00 en Lote 1.
  - Se intenta registrar para `COL-001` Labor B de 10:30 a 12:00 en Lote 2.
- **Cálculo:**
  $$\text{Condición de Choque:} \quad \text{Inicio}_B (10:30) < \text{Fin}_A (11:00)$$
- **Resultado Esperado:**
  - **Rechazo de la transacción**.
  - Mensaje: *"Error de solapamiento: COL-001 ya tiene asignada una labor entre 10:30 y 11:00."*

---

### Caso 5: Pausa Excluida del Tiempo Efectivo según Regla Aprobada
- **Entrada:**
  - Labor de Cosecha: 06:30 a 12:30 (360 min brutos).
  - Pausa de Desayuno (08:30 a 09:00 = 30 min) con deducción oficial `esDeduccionComputable: true`.
  - Pausa de Hidratación (10:00 a 10:05 = 5 min) con deducción `esDeduccionComputable: true`.
- **Cálculo:**
  $$\text{Tiempo Computable} = 360 - 30 - 5 = 325 \text{ minutos}$$
- **Resultado Esperado:**
  - Tiempo computable para rendimiento: **325 minutos**.

---

### Caso 6: Labor Pendiente
- **Entrada:**
  - Labor de Poda: Meta 100 camas en 480 min.
  - Final de jornada: Se completan 70 camas en 480 min.
  - Supervisor adjunta justificación por viento fuerte.
- **Cálculo:**
  $$\text{Cumplimiento Meta} = \left(\frac{70}{100}\right) \times 100 = 70.00\%$$
- **Resultado Esperado:**
  - Estado: **`Pendiente`** (no se marca `No cumple` si hay justificación aprobada).
  - Se registra el saldo pendiente de 30 camas para continuidad en la siguiente asignación.

---

### Caso 7: Labor sin Estándar Temporal (Oficios Varios)
- **Entrada:**
  - Limpieza de canales: 4 horas trabajadas (240 min). Cantidad: 120 metros de zanja.
  - Catálogo de labores: `minutosEstandarPorUnidad: null`.
- **Cálculo:**
  $$f(\text{Rendimiento Temporal}) = \text{No computable}$$
- **Resultado Esperado:**
  - Rendimiento Temporal = **`null`**.
  - Estado = **`ESTANDAR_NO_DISPONIBLE`**.
  - Prohibido inventar un estándar de 2.0 min/metro o emitir 100%.

---

### Caso 8: Prevención de División por Cero
- **Entrada:**
  - Labor con tiempo efectivo computable = **0 minutos** (inicio y fin coinciden a las `08:00`).
  - Producción validada: 10 unidades. Estándar: 3.0 min/unidad.
- **Cálculo:**
  $$\text{Rendimiento} = \frac{30}{0} \implies \text{Indeterminación Matemática}$$
- **Resultado Esperado:**
  - Retorna **`null`**.
  - Estado = **`TIEMPO_EFECTIVO_INVALIDO`**.
  - Cero excepciones de tipo `Infinity` o `NaN` en el código.

---

### Caso 9: Meta Válida y Producción Completada
- **Entrada:**
  - Meta planificada: 150 camas.
  - Producción completada: 150 camas.
- **Cálculo:**
  $$\text{Cumplimiento} = \left(\frac{150}{150}\right) \times 100 = 100.00\%$$
- **Resultado Esperado:**
  - Cumplimiento de cantidad: **100.00%**.
  - Estado: **`Cumple`**.

---

### Caso 10: Información Insuficiente
- **Entrada:**
  - Registro de labor con hora de inicio `06:30`, pero sin hora de cierre ni unidades producidas.
- **Cálculo:**
  - Faltan variables obligatorias para el cálculo.
- **Resultado Esperado:**
  - Estado: **`Incompleto`**.
  - Se excluye del cálculo de promedios hasta su cierre formal.

---

### Caso 11: Consulta Cruzada frente al Reporte
- **Entrada:**
  - Mismo colaborador `COL-001` y fecha `2026-10-19`.
  - Se consulta en la pantalla de *Consulta Cruzada* y se genera el informe en *Reportes*.
- **Resultado Esperado:**
  - **Identidad exacta en los valores reportados:** Ambos consumen `domain/consultaCruzadaService.ts`. Cero discrepancias por redondeo o filtros.

---

### Caso 12: Modificación de un Registro Guardado
- **Entrada:**
  - Labor guardada inicialmente con 80 unidades completadas.
  - Supervisor edita a las 16:00 y corrige a 85 unidades tras recuento de empaque.
- **Resultado Esperado:**
  - Se actualiza la cantidad a **85**.
  - Se recalcula el porcentaje con la misma versión de fórmula (`FORMULA_RENDIMIENTO_V1_2026`).
  - Se genera un registro de auditoría en `historial_auditoria` con el valor previo y el nuevo.

---

### Caso 13: Cantidad Completada Superior a la Meta (Superación de Meta)
- **Entrada:**
  - Meta: 200 árboles de aguacate podados.
  - Producción completada: 240 árboles.
- **Cálculo:**
  $$\text{Cumplimiento} = \left(\frac{240}{200}\right) \times 100 = 120.00\%$$
- **Resultado Esperado:**
  - Cumplimiento de cantidad: **120.00%**.
  - **Prohibido limitar o truncar a 100% en la base de datos**.

---

### Caso 14: Cantidad Completada Superior a Cantidad Asignada (Oficios Varios)
- **Entrada:**
  - Tareas asignadas: 4 tramos de camino.
  - Tareas completadas: 5 tramos (el operario avanzó en un tramo extra).
- **Cálculo:**
  $$\text{Cumplimiento de Tareas} = \left(\frac{5}{4}\right) \times 100 = 125.00\%$$
- **Resultado Esperado:**
  - Sistema permite el guardado con aviso de superación de asignación: **125.00%**.

---

### Caso 15: Interrupción Durante una Jornada
- **Entrada:**
  - Jornada: 06:30 a 15:30.
  - A las 11:00 ocurre una tormenta eléctrica que detiene el trabajo hasta las 12:00.
  - Registro de evento climático en `pausas_jornada` con `tipo: 'climatica_lluvia'`.
- **Resultado Esperado:**
  - Si el predio estipula que la lluvia es tiempo muerto no deducible de la remuneración: el tiempo se reconoce pero se descuenta del tiempo efectivo computable de la labor de poda.
  - Cero penalización en el índice de velocidad técnica del podador.

---

### Caso 16: Producción Principal con Subtareas sin Doble Contabilización
- **Entrada:**
  - Labor Principal Cobertura: 80 metros lineales de invernadero cubiertos.
  - Subtarea Grapado: 80 metros grapados.
  - Subtarea Costura: 60 metros cosidos.
- **Cálculo:**
  $$\text{Producción Total del Lote} = 80 \text{ metros de invernadero cubiertos}$$
- **Resultado Esperado:**
  - **No sumar** $80 + 80 + 60 = 220\text{ metros}$.
  - El avance de la infraestructura es estrictamente **80 metros**; las subtareas mantienen su avance porcentual interno sin contaminar el volumen global.
