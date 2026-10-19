# REGLAS DE NEGOCIO: CONSULTA CRUZADA, REPORTES E INCIDENTES — NEXOCAMPO 2026
**Documento Técnico:** `21-reglas-consulta-reportes.md`  
**Estado:** Reconciliación Analítica, Unicidad de Servicios y Seguridad SG-SST  
**Fase:** Tarea 3 de 5 (Reglas de Negocio, Jornadas, Labores y Rendimiento)  
**Fecha:** 2026-10-18  

---

## 1. Principio de la Fuente Única de Servicio de Dominio

> **REGLA DE ARQUITECTURA ANALÍTICA:**  
> **Tanto la vista interactiva de *Consulta Cruzada* como los informes generados en el módulo de *Reportes* deben invocar exactamente la misma función de cálculo y agregación del módulo `domain/consultaCruzadaService.ts`.**  
> Prohibido duplicar fórmulas, filtros SQL/IndexedDB o algoritmos de agregación en controladores de vista o generadores de plantillas de impresión.

---

## 2. Reconstrucción Multidimensional por Persona y Fecha

Al consultar un colaborador específico en un día determinado, el motor de consulta cruzada consolida y reconcilia las siguientes fuentes de datos:

1. **Estado de Presencia:** Asistencia marcada en la matriz semanal (`Presente`, `Retardo`, `Ausente`, `Sin registrar`).
2. **Jornada General:** Horario de apertura, pausas computables y hora esperada de cierre del predio.
3. **Labores Asignadas y Horarios Efectivos:** Cada intervalo de labor individual con su hora de inicio, hora de fin, área, bloque y túnel.
4. **Cantidades y Rendimiento Técnico:** Cantidades reales producidas frente a estándares oficiales (mostrando `ESTANDAR_NO_DISPONIBLE` si es labor de oficios varios).
5. **Novedades de Ausencia:** Licencias o incapacidades radicadas en el módulo de ausencias.
6. **Incidentes SG-SST Vinculados:** Eventos de seguridad en los que el colaborador estuvo involucrado.

### Tratamiento de Información Faltante:
Si en alguno de los subsistemas no se capturó información (ej. no se registró la labor de la tarde), el informe **despliega explícitamente la etiqueta `Dato No Registrado`**. Prohibido rellenar con ceros o valores asumidos que simulen completitud de datos.

---

## 3. Protocolo de Incidentes y Accidentes de Trabajo (SG-SST)

El módulo de incidentes atiende la normativa de seguridad y salud en el trabajo rural con un enfoque preventivo y de registro inmediato en campo.

### Reglas de Registro:
1. **Campos Requeridos:** Fecha, hora exacta del suceso, severidad (`Leve`, `Moderado`, `Grave`), área/bloque/túnel, tipo de evento y descripción fáctica objetiva.
2. **Prohibición de Hora Final:** **Queda estrictamente prohibido solicitar o exigir una "hora de finalización" para un incidente.** Un accidente (corte, golpe, picadura de insecto) es un hecho puntual en el tiempo; no constituye un segmento laboral.
3. **Fotografía Estrictamente Opcional:** En zonas de campo sin cámara de alta resolución o con batería crítica, el supervisor no debe ser bloqueado por la falta de fotografía.
4. **Prohibición de Diagnósticos Clínicos y Juicios Legales:**  
   El registro en campo se limita a hechos observables (ej. *"Corte superficial en falange distal de mano izquierda; se aplica antiséptico y vendaje estéril"*). **Prohibido incluir clasificaciones médicas de reserva legal o atribuciones de culpabilidad.**
