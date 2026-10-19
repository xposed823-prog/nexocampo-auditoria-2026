# REGLAS DE NEGOCIO: MÓDULO DE PLÁSTICO Y POLISOMBRA — NEXOCAMPO 2026
**Documento Técnico:** `19-reglas-plastico-polisombra.md`  
**Estado:** Especificación de Cuadrillas de Cobertura, Subtareas y Saldos  
**Fase:** Tarea 3 de 5 (Reglas de Negocio, Jornadas, Labores y Rendimiento)  
**Fecha:** 2026-10-18  

---

## 1. Contexto Agrícola de las Cuadrillas de Cubiertas

La instalación, templado, reparación y costura de plásticos y polisombras en invernaderos o túneles agrícolas constituye un trabajo colectivo altamente dependiente de la meteorología (viento y lluvia ponen en riesgo el material y la seguridad física de los colaboradores al trabajar en altura sobre estructuras).

---

## 2. Estructura del Registro Principal de Cobertura

1. **Fecha:** Día de ejecución de la labor.
2. **Integrantes:** **Mínimo 1 y máximo 6 colaboradores** según la configuración homologada de cuadrilla.
3. **Intervalo Horario Único:** Una sola `horaInicio` y una sola `horaFin` (ej. 07:00 a. m. a 12:00 m.).
4. **Ubicación Agraria Precisa:** Área, Bloque y Túnel (o nave).
5. **Cantidad Total Programada ($Q_T$):** Metros lineales, naves o módulos planificados para la jornada.
6. **Cantidad Completada Real ($Q_C$):** Metros o módulos efectivamente terminados y asegurados.
7. **Condiciones Ambientales:** Casillas de selección simultánea.
8. **Estado:** `Cumple`, `No cumple`, `Pendiente`, o `Incompleto`.

---

## 3. Subtareas de Polisombra y Regla Anti-Doble Contabilización

Las labores de cubiertas se desagregan en subtareas complementarias:
- *Subtarea 1:* Tendido y estirado de polietileno.
- *Subtarea 2:* Grapado y aseguramiento perimetral.
- *Subtarea 3:* Costura y tensado de malla polisombra.
- *Subtarea 4:* Anclaje de guayas y vientos.

### Reglas de Integridad Inviolables:
1. **Herencia Horaria Estricta:** Las subtareas **heredan íntegramente el horario del registro principal**. No poseen horas independientes de inicio y fin.
2. **Cómputo Único de Duración en la Jornada:** La duración del período principal (ej. 5 horas) **se computa una sola vez en la jornada general de los operarios**. Prohibido sumar 5 horas por el plástico y 5 horas adicionales por cada subtarea, lo cual inflaría ficticiamente la jornada a 15 o 20 horas diarias.
3. **No Suma de Subtareas a la Producción Principal:**  
   $$\text{Avance de la Labor} = Q_C \text{ (Metros de Cobertura Cerrados)}$$
   No se suman los metros de grapado con los metros de polietileno; cada subtarea mantiene su propia trazabilidad física de ejecución para evitar doble conteo de avance.

---

## 4. Matriz de Condiciones Ambientales de Terreno

Se permite la selección múltiple simultánea para reflejar con realismo las condiciones de campo:
- `[ ] Soleado`
- `[ ] Llovizna leve`
- `[ ] Lluvia moderada o intensa`
- `[ ] Terreno húmedo`
- `[ ] Terreno saturado, gredoso o lodoso`
- `[ ] Vientos fuertes`

> **REGLA DE NO SUSPENSIÓN AUTOMÁTICA:**  
> El sistema **no impone suspensiones automáticas de trabajo** por el simple hecho de marcar lluvia o vientos fuertes. La decisión de continuar o suspender la labor es potestad del supervisor de campo y el líder de SG-SST según los protocolos del predio.

---

## 5. Protocolo de Saldos Pendientes y Justificaciones Aprobadas

Cuando la cantidad completada es menor a la programada ($Q_C < Q_T$), se genera un saldo pendiente:
$$\text{Cantidad Pendiente} = Q_T - Q_C$$

### Requisitos de Justificación:
1. La interfaz despliega inmediatamente el indicador de saldo pendiente y exige seleccionar al menos una justificación autorizada.
2. **Catálogo Exclusivo de Motivos Aprobados:**
   - `[ ] Tiempo insuficiente en la jornada` (conclusión del horario sin incidentes mayores).
   - `[ ] Vientos fuertes` (riesgo inminente de desgarro de mallas o caída de operarios).
   - `[ ] Lluvia intensa` (saturación de terreno y humedad extrema que impide soldadura/costura).
3. **Prohibición de Contaminación Cruzada:**  
   **Prohibido incluir en esta lista averías de engrapadoras, desabastecimiento de insumos o reasignación de personal.** Esos eventos pertenecen a la bitácora de *Incidentes*, registros de *Pausas de Insumos* o novedades de *Asignación*, preservando la pureza de la justificación técnica de cubiertas.
