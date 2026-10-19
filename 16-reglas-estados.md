# REGLAS OPERATIVAS DE ESTADOS Y TRANSICIONES — NEXOCAMPO 2026
**Documento Técnico:** `16-reglas-estados.md`  
**Estado:** Taxonomía de Estados, Criterios de Transición y Neutralidad de Fórmulas  
**Fase:** Tarea 3 de 5 (Reglas de Negocio, Jornadas, Labores y Rendimiento)  
**Fecha:** 2026-10-18  

---

## 1. Principio Fundamental de No Penalización Implícita

> **REGLA DE ORO DE DOMINIO:**  
> Ningún estado de interfaz o administrativo puede mutar ni penalizar silenciosamente los cálculos matemáticos de rendimiento.
> - **La ausencia de datos jamás equivale a incumplimiento.**
> - **Un registro pendiente no representa negligencia ni sanción.**
> - **Una interrupción por lluvia o daño mecánico nunca disminuye la velocidad técnica calculada sobre el tiempo efectivamente trabajado.**

---

## 2. Definición Canónica de los 7 Estados Operativos

### 2.1. Estado: `Cumple`
- **Definición:** La labor o asignación satisface plenamente un estándar técnico o una meta física de producción validada y documentada ($\text{Avance} \ge 100\%$).
- **Requisitos de Entrada:**
  - Existe un estándar o meta formal aprobada.
  - La cantidad completada fue validada por el supervisor o agrónomo.
  - El tiempo computable está cerrado con horas de inicio y fin válidas.
- **Efecto Matemático:** Emite resultado porcentual definitivo catalogado como `Dato Calculado y Aprobado`.

### 2.2. Estado: `No cumple`
- **Definición:** La labor culminó su tiempo programado y no alcanzó la meta o estándar establecido ($\text{Avance} < 100\%$).
- **Prohibición Estricta:** **Prohibido asignar este estado automáticamente ante la simple falta de datos.** Si no se ingresaron cantidades o falta la hora de cierre, el estado normativo es `Incompleto` o `Pendiente`, jamás `No cumple`.
- **Efecto Matemático:** Se registra el porcentaje real obtenido sin truncamientos artificiales.

### 2.3. Estado: `Pendiente`
- **Definición:** La labor o cubierta permanece sin terminar debido a que la jornada concluyó antes de completar el volumen programado, o requiere continuidad en un turno posterior.
- **Diferenciación Clave:** **No equivale a incumplimiento definitivo.** Indica que existe un saldo de producción diferido (ej. 25 camas pendientes de 100) que se encuentra justificado por factores operacionales (viento, lluvia, tiempo insuficiente).
- **Efecto Matemático:** No penaliza el promedio histórico de la persona. Se contabilizan únicamente las unidades reales terminadas contra el tiempo efectivamente invertido hasta la suspensión.

### 2.4. Estado: `Sin registro`
- **Definición:** No existe información en la base de datos local para constatar la ocurrencia de un hecho en una fecha u hora determinada.
- **Símbolo Visual:** Emplea estrictamente el glifo `—`.
- **Regla de Neutralidad:** La falta de pase de lista matutino no demuestra ausencia injustificada ni tampoco presencia. Representa neutralidad analítica absoluta hasta que el supervisor capture el dato.

### 2.5. Estado: `Incompleto`
- **Definición:** El registro contiene información parcial (ej. se registró la hora de inicio `06:30` y la labor `Poda`, pero el supervisor aún no ha digitado la hora de finalización o las unidades realizadas).
- **Efecto Matemático:** **Se excluye de las fórmulas de rendimiento técnico final** hasta que se completen todos sus campos requeridos, evitando emitir denominadores en cero o infinitos.

### 2.6. Estado: `No aplicable`
- **Definición:** Asignaciones que por su naturaleza agronómica no admiten evaluación porcentual temporal (e.g. labores del módulo *Oficios Varios*, tareas de mantenimiento de caminos o festivos).
- **Efecto en Pantalla:** Muestra horas reales y cantidades orientativas, bloqueando la generación de porcentajes técnicos ficticios.

### 2.7. Estado: `Error de guardado`
- **Definición:** Excepción técnica en la capa de persistencia (cuota de IndexedDB excedida, base de datos bloqueada por el navegador).
- **Comportamiento:** Los datos se retienen intactos en el estado de memoria del formulario; la interfaz presenta opciones de reintento o exportación de emergencia.

---

## 3. Matriz de Transiciones de Estado y Gobernanza de Datos

| Estado Inicial | Evento Desencadenante | Estado Resultante | ¿Entra a Cálculo de Rendimiento? |
| :--- | :--- | :--- | :--- |
| `Sin registro` (`—`) | Supervisor marca asistencia matutina. | `Presente` | No (la asistencia no computa rendimiento técnico). |
| `Incompleto` | Se registra hora de inicio sin hora de fin. | `Incompleto` | **No** (espera cierre). |
| `Incompleto` | Se registra hora de fin y cantidad completada. | `Evaluando` | Pasa a motor de cálculo. |
| `Evaluando` | Cantidad $\ge$ Meta con estándar aprobado. | **`Cumple`** | **Sí** (emite % técnico y % de cantidad). |
| `Evaluando` | Cantidad $<$ Meta y supervisor justifica saldo. | **`Pendiente`** | **Sí** (computa únicamente lo efectivamente hecho). |
| `Evaluando` | Labor pertenece a "Oficios Varios". | **`No aplicable`** | **No** (solo totaliza horas efectivas). |
| `Evaluando` | Cantidad $<$ Meta sin justificación tras cierre. | **`No cumple`** | **Sí** (registra déficit con auditoría). |
