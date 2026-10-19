# ESPECIFICACIÓN FORMAL DE FÓRMULAS, MÉTRICAS Y TRAZABILIDAD — NEXOCAMPO 2026
**Documento Técnico:** `17-especificacion-formulas.md`  
**Estado:** Definición Matemática Rigurosa, Medias Ponderadas y Versionado  
**Fase:** Tarea 3 de 5 (Reglas de Negocio, Jornadas, Labores y Rendimiento)  
**Fecha:** 2026-10-18  

---

## 1. Las Dos Dimensiones Matemáticas del Rendimiento

Es mandato estricto no fusionar ni equiparar la velocidad técnica con el cumplimiento de volumen.

---

## 2. Fórmula 1: Rendimiento Temporal (%)

$$\text{Rendimiento Temporal (\%)} = \left(\frac{\text{Tiempo Estándar de Producción Validada}}{\text{Tiempo Efectivo Computable}}\right) \times 100$$

### 2.1. Desglose de Componentes
- **Numerador ($\text{Tiempo Estándar Total}$):**
  $$\text{Tiempo Estándar Total} = \text{Unidades Validadas Producidas} \times \text{Tiempo Estándar Unitario Aprobado (min)}$$
- **Denominador ($\text{Tiempo Efectivo Computable}$):**
  $$\text{Tiempo Efectivo} = (\text{Hora Fin} - \text{Hora Inicio}) - \sum \text{Pausas Computables Deducibles (min)}$$

### 2.2. Condiciones Obligatorias Excluyentes
Para que el sistema ejecute esta fórmula, deben cumplirse simultáneamente las siguientes 6 condiciones:
1. **Estándar Aprobado:** La labor cuenta con un valor numérico formal $\text{Estándar Unitario} > 0$ en el catálogo oficial de labores.
2. **Unidad Comparable:** Las unidades producidas corresponden exactamente a la unidad de calibración del estándar (e.g. camas de igual longitud, árboles de similar porte).
3. **Producción Validada:** La cantidad fue confirmada por el supervisor.
4. **Tiempo Efectivo Mayor a Cero:** $\text{Tiempo Efectivo} > 0$.
5. **Pausas Homologadas:** Se han descontado únicamente las pausas con deducción autorizada.
6. **No Mezcla de Labores:** Prohibido sumar tiempos o unidades de labores distintas en un mismo cálculo unitario.

### 2.3. Control de División por Cero e Indeterminaciones
- Si $\text{Tiempo Efectivo} \le 0$: El motor matemático **aborta el cálculo**, retorna `null` y genera el estado `TIEMPO_EFECTIVO_INVALIDO`. **Prohibido generar `Infinity` o `NaN`**.
- Si $\text{Estándar Unitario}$ es `null` o no existe: El sistema retorna `null` con el estado `ESTANDAR_NO_DISPONIBLE`.

---

## 3. Fórmula 2: Cumplimiento de Cantidad (%)

$$\text{Cumplimiento de Cantidad (\%)} = \left(\frac{\text{Cantidad Completada Real}}{\text{Cantidad Objetivo Planificada}}\right) \times 100$$

### 3.1. Reglas de Preservación de Valores Reales
1. **Prohibición de Truncamiento Silencioso (No Clamping a 100%):**  
   Si una cuadrilla completa 130 camas sobre una meta de 100 camas, el cumplimiento matemático es **$130.00\%$**. Prohibido recortar silenciosamente el resultado a $100\%$ en la base de datos o en reportes analíticos. (Cualquier tope visual en barras de progreso debe ser un ajuste cosmético documentado, conservando el valor numérico real).
2. **Meta Desconocida o Cero:**  
   Si $\text{Cantidad Objetivo} \le 0$ o no fue fijada, el sistema presenta la cantidad real completada y rotula: *"Meta no definida; porcentaje no calculable"*.

---

## 4. Promedios Simples vs Medias Ponderadas

### 4.1. El Error Crítico del Promedio Simple de Porcentajes
Calcular el promedio aritmético simple de los porcentajes de rendimiento introduce una distorsión matemática grave cuando los tiempos de labor son desiguales:
- *Labor 1 (Corta):* 30 minutos al $150\%$ de rendimiento temporal.
- *Labor 2 (Larga):* 300 minutos al $80\%$ de rendimiento temporal.
- *Promedio simple erróneo:* $\frac{150 + 80}{2} = \mathbf{115\%}$ (Falsa percepción de alta eficiencia).

### 4.2. La Regla de la Media Ponderada por Tiempo Efectivo
El consolidado de rendimiento temporal de una jornada o cuadrilla **debe calcularse obligatoriamente mediante media ponderada ponderada por el tiempo efectivo**:

$$\text{Rendimiento Consolidado Ponderado (\%)} = \left(\frac{\sum \text{Tiempo Estándar Total}_i}{\sum \text{Tiempo Efectivo Computable}_i}\right) \times 100$$

En el ejemplo anterior:
$$\text{Tiempo Estándar Labor 1} = 30 \times 1.5 = 45 \text{ min}$$
$$\text{Tiempo Estándar Labor 2} = 300 \times 0.8 = 240 \text{ min}$$
$$\text{Rendimiento Ponderado Real} = \left(\frac{45 + 240}{30 + 300}\right) \times 100 = \frac{285}{330} \times 100 = \mathbf{86.36\%}$$
*Resultado:* El promedio ponderado refleja la realidad productiva de la jornada.

---

## 5. Detección de Muestras Insuficientes

Cuando el tiempo computable acumulado en una labor sea inferior a **60 minutos**, o la muestra producida sea inferior a **10 unidades**, el sistema acompaña el resultado con la advertencia:  
`⚠️ Muestra estadística insuficiente (confiabilidad preliminar)`.

---

## 6. Versionado Histórico Inmutable de Fórmulas

Para garantizar la seguridad jurídica y la trazabilidad de nómina o auditoría:
- Cada cálculo almacenado en IndexedDB incluye el atributo:
  `versionFormula: "FORMULA_RENDIMIENTO_V1_2026"`.
- **Regla de Inmutabilidad Retroactiva:** Si en el futuro la gerencia modifica la ponderación o los estándares de calibración, **los registros históricos consolidados no se recalculan silenciosamente**. Conservan su resultado original junto con el sello de versión de la fórmula con la que fueron emitidos.
