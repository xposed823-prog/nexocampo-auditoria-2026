# REGLAS DE NEGOCIO: ASISTENCIA Y GESTIÓN DE AUSENCIAS — NEXOCAMPO 2026
**Documento Técnico:** `20-reglas-asistencia-ausencias.md`  
**Estado:** Especificación de Matriz Semanal, Novedades y Neutralidad Laboral  
**Fase:** Tarea 3 de 5 (Reglas de Negocio, Jornadas, Labores y Rendimiento)  
**Fecha:** 2026-10-18  

---

## 1. Principio de Neutralidad Probatoria de Datos

> **INVARIANTE DE CONTROL LABORAL:**  
> **La ausencia de datos en el sistema no constituye prueba de que un colaborador faltó injustificadamente, ni tampoco de que estuvo presente.**  
> El sistema registra exclusivamente hechos documentados por el supervisor. Toda deducción legal, disciplinaria o salarial queda fuera del alcance de esta versión experimental. Prohibido aplicar sanciones o descuentos automáticos en el dispositivo.

---

## 2. Los Cinco Estados Analíticos de Asistencia

Para erradicar ambigüedades entre el pase de lista y las novedades formales de personal, se definen cinco estados independientes:

| Estado de Asistencia | Símbolo | Significado Operativo | Tratamiento en Nómina Técnica |
| :--- | :---: | :--- | :--- |
| **Sin registro de asistencia** | `—` | **Estado inicial por defecto.** La casilla no ha sido intervenida por el supervisor. | Dato neutro; no computable hasta captura. |
| **Asistencia registrada** | `P` | El supervisor confirmó la presencia del colaborador al inicio de la jornada. | Computa presencia en campo. |
| **Ausencia formal registrada** | `A` | Existe un registro formal de incapacidad médica EPS, calamidad o permiso autorizado. | Novedad justificada con trazabilidad. |
| **Sin ausencia formal registrada** | `N/A` | El colaborador no tiene radicada ninguna justificación formal en el módulo de ausencias. | Estado base administrativo. |
| **Información incompleta** | `?` | Se registró asistencia pero existe discrepancia con las labores reportadas en la jornada. | Requiere validación del supervisor. |

---

## 3. Matriz Semanal de Cuadrilla

La matriz semanal se estructura en un eje bidimensional:
- **Filas:** Colaboradores ficticios ordenados por cuadrilla (`COL-001`, `COL-002`, ...).
- **Columnas:** Días laborales de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado).

### Comportamiento Operativo de la Celda Táctil:
1. Al cargar una nueva semana, **todas las celdas inician obligatoriamente en `—` (sin registrar)**.
2. Un toque rápido en la celda permite al supervisor marcar:
   $$\text{— (Sin registrar)} \longrightarrow \text{P (Presente)} \longrightarrow \text{R (Retardo)} \longrightarrow \text{A (Ausencia)} \longrightarrow \text{—}$$
3. Si se marca **Retardo (R)**: Se habilita opcionalmente el campo de hora real de llegada (ej. `06:45 a. m.`).
4. Si se marca **Ausencia (A)**: Se abre el formulario simplificado de novedad para asociar la causa genérica (Incapacidad médica, Permiso autorizado, Calamidad doméstica).

---

## 4. Desacoplamiento entre Asistencia y Rendimiento Técnico

Una regla cardinal del diseño analítico de NexoCampo es:  
**La asistencia y las ausencias no deben modificar automáticamente el cálculo del rendimiento técnico de una labor.**

- *Ejemplo Práctico:*  
  Si el colaborador `COL-002` llega con retardo a las 07:15 a. m. y se le asigna a deshoje de 07:30 a 11:30 (4 horas efectivas):
  - Su rendimiento técnico de deshoje se calcula estrictamente sobre sus **4 horas efectivas trabajadas**.
  - No se divide su producción entre las 8 horas de la jornada general de la cuadrilla, lo cual castigaría injustamente su destreza técnica de deshoje.
  - El retardo de 45 minutos queda registrado en el módulo de *Asistencia* y en la *Consulta Cruzada* para efectos de tiempo total remunerable, sin contaminar la calibración del estándar agronómico.
