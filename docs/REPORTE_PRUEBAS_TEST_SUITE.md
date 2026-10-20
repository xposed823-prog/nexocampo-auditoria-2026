# INFORME DE PRUEBAS AUTOMATIZADAS (/test)
**Batería de Pruebas Unitarias, Matemáticas y de Dominio Agronómico**  
**Fecha de Ejecución:** 20 de Octubre de 2026  
**Motor de Ejecución:** Node.js Test Runner con TypeScript (`tsx --test`)  
**Archivos Evaluados:** 5 suites de prueba en `src/domain/*.test.ts`  

---

## 1. RESUMEN GLOBAL DE RESULTADOS

```
================================================================================
TOTAL DE PRUEBAS EJECUTADAS:  46
PRUEBAS APROBADAS (PASS):     46 (100%)
PRUEBAS FALLIDAS (FAIL):       0 (0%)
PRUEBAS OMITIDAS (SKIPPED):    0
DURACIÓN TOTAL DE EJECUCIÓN:  714.5 ms
ESTADO DEL MOTOR DE DOMINIO:  VERIFICADO Y APROBADO
================================================================================
```

---

## 2. DETALLE DE SUITES Y CASOS DE PRUEBA EJECUTADOS

### Suite 1: Auditoría de Dominio (`auditSuite.test.ts`)
* ✅ **AUDITORÍA 1.1:** Jornada laboral Lunes a Viernes (06:30 a 15:30) con pausas deducibles (60 min almuerzo + 5 min pausa activa) totaliza exactamente **475 minutos computables netos**.
* ✅ **AUDITORÍA 1.2:** Jornada de Sábado (06:30 a 13:00) con descanso de 30 min totaliza exactamente **360 minutos computables netos**.
* ✅ **AUDITORÍA 2.1:** Múltiples labores consecutivas (210m + 105m + 180m) coexisten dentro de la jornada sin generar falsos solapamientos.
* ✅ **AUDITORÍA 3.1:** Horarios independientes por labor: cada tarea conserva su propia marca horaria sin mezclar tiempos.
* ✅ **AUDITORÍA 4.1:** Detección de solapamiento temporal real: se bloquea cuando un mismo colaborador tiene dos labores con cruce de horario.
* ✅ **AUDITORÍA 4.2:** Tareas contiguas exactas (fin de labor 10:00 = inicio de labor 10:00) son aceptadas sin falso positivo.
* ✅ **AUDITORÍA 5.1:** Rendimiento: labor con tiempo estándar calcula el porcentaje exacto de productividad.
* ✅ **AUDITORÍA 5.2:** Rendimiento: labor sin estándar (o maquinaria con `min: null`) no emite porcentajes inventados.
* ✅ **AUDITORÍA 5.3:** Rendimiento: labor pendiente con justificación aprobada no penaliza injustamente el registro.
* ✅ **AUDITORÍA 5.4:** Rendimiento: producción superior a la meta física (> 100%) se respeta y **no se trunca arbitrariamente a 100%**.
* ✅ **AUDITORÍA 5.5:** Rendimiento: cantidades completadas negativas son rechazadas con error de validación.
* ✅ **AUDITORÍA 5.6:** Rendimiento: la consolidación entre labores utiliza **media ponderada por tiempo efectivo** y no una media aritmética simple.
* ✅ **AUDITORÍA 6.1:** Oficios Varios: 5 tareas asignadas y 3 completadas = **60% de tareas** (métrica operativa pura, sin minutos estándar).
* ✅ **AUDITORÍA 7.1:** Plástico y Polisombra: regla de límite estricto de máximo 6 integrantes en la cuadrilla.
* ✅ **AUDITORÍA 7.2:** Plástico y Polisombra: validación de motivos previstos de saldo pendiente (tiempo insuficiente, viento, lluvia).
* ✅ **AUDITORÍA 8.1:** Asistencia: estado inicial neutro "sin registrar" (`—`) no equivale a falta injustificada.
* ✅ **AUDITORÍA 9.1:** Incidentes SG-SST: registro con hora de evento sin obligatoriedad de hora de cierre.
* ✅ **AUDITORÍA 10.1:** Respaldos: validación de estructura íntegra de esquema JSON.

### Suite 2: Motor de Reglas de Negocio y 16 Casos Canónicos (`businessRulesEngine.test.ts`)
* ✅ **Caso 1:** Jornada ordinaria completa con 1 sola labor (475 min).
* ✅ **Caso 2:** Jornada mixta con 3 labores consecutivas y descansos reglamentarios (540 min brutos).
* ✅ **Caso 3:** Subtareas de invernadero que heredan horario no disparan conflicto temporal.
* ✅ **Caso 4:** Conflicto temporal de labores superpuestas en el mismo operario es bloqueado.
* ✅ **Caso 5:** Pausas deducibles se descuentan correctamente del cómputo.
* ✅ **Caso 6:** Justificación de saldos incompletos por causas climáticas.
* ✅ **Caso 7:** Manejo de labor sin estándar retornando estado `ESTANDAR_NO_DISPONIBLE`.
* ✅ **Caso 8:** Manejo robusto de tiempo efectivo cero o negativo retornando `TIEMPO_EFECTIVO_INVALIDO`.
* ✅ **Caso 9:** Producción idéntica a meta resulta en 100% exacto y `META_CUMPLIDA`.
* ✅ **Caso 10:** Muestra de labor con duración < 60 minutos se identifica como insuficiente para estadística.
* ✅ **Casos 11 y 12:** Verificación de media ponderada por tiempo: resultado canónico de **86.36%** (evitando el 115% de la media simple).
* ✅ **Caso 13:** Cumplimiento de 240 unidades sobre meta 200 calcula **120% exacto**.
* ✅ **Caso 14:** Oficios Varios con 5 tareas de 4 asignadas arroja **125%** y estado `supero_asignacion`.
* ✅ **Caso 15:** Deducción explícita de interrupción climática de la jornada laboral.
* ✅ **Caso 16:** Consolidación de cobertura no duplica subtareas en el metraje general.

### Suite 3: Calculadoras de Tiempo y Eficiencia (`calculators.test.ts`)
* ✅ Conversión de cadenas `HH:mm` a minutos enteros desde medianoche.
* ✅ Aritmética de semana completa (Lunes a Viernes).
* ✅ Aritmética especial de media jornada de Sábado.
* ✅ Rendimiento temporal con estándar agronómico.
* ✅ Blindaje contra emisión de números ficticios en tareas no estandarizadas.
* ✅ Cumplimiento físico de cantidad vs. meta.

### Suite 4: Validadores de Formularios e Integridad (`formsAndData.test.ts`)
* ✅ Validación de coherencia en apertura y cierre de jornada (cierre > apertura).
* ✅ Validación de horas de inicio y fin en labor individual.
* ✅ Validación de cuadrilla de polisombra y motivos de saldo pendiente.
* ✅ Validación de motivos de justificación operativa.
* ✅ Determinación de estados visuales (`sin_registro`, `pendiente`, `no_aplicable`, `cumple`).

### Suite 5: Cola de Sincronización Offline (`pwaQueue.test.ts`)
* ✅ Rechazo de paquetes de sincronización vacíos o malformados.
* ✅ Validación exitosa de lote con múltiples registros agrícolas fuera de línea.
* ✅ Detección y aislamiento de registros corruptos dentro del lote sin tumbar la cola.

---

## 3. CONCLUSIÓN Y ESTADO DE FIABILIDAD

El motor de reglas de negocio, los algoritmos de cálculo de rendimiento y los validadores de tiempo superaron con éxito el **100% de las pruebas automatizadas (46 de 46)**.

*Nota técnica:* Las pruebas de dominio confirman que la matemática es matemáticamente sólida y coincide con las reglas de NexoCampo original. El siguiente paso consiste en integrar este motor en la persistencia de IndexedDB y alinear la navegación móvil de 6 vistas.
