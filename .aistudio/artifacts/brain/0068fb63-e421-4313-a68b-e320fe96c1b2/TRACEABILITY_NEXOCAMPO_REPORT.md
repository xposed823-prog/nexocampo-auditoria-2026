# INFORME DE TRAZABILIDAD Y LINAJE DE DATOS — NEXOCAMPO PRO (v18.1.9)
**Documento Técnico:** `TRACEABILITY_NEXOCAMPO_REPORT.md`  
**Objetivo:** Especificación de la Matriz de Trazabilidad de Requisitos (RTM), linaje del dato desde la captura en campo hasta la liquidación de nómina, garantías de no-repudio, versionado inmutable de fórmulas y reconciliación analítica.  
**Fecha:** 2026-10-20  
**Estado:** Certificado para Auditoría Actuarial y Cumplimiento Normativo  

---

## 1. RESUMEN EJECUTIVO DE TRAZABILIDAD

El principio de trazabilidad en NexoCampo garantiza que **cada métrica de tiempo, cada cantidad de producción y cada estado de asistencia puedan auditarse en reversa hasta el momento exacto, el lote territorial y el supervisor que efectuó el registro en campo**.

### Pilares de Trazabilidad en NexoCampo:
1. **Linaje Unidireccional y No Ambiguo:** Ningún número en un reporte consolidado o pantalla de consulta cruzada surge de estimaciones heurísticas o cálculos volátiles no registrados.
2. **Principio de la Fuente Única de Servicio:** Tanto la vista interactiva de *Consulta Cruzada* como los consolidados de *Reportes* consumen el mismo servicio de dominio (`domain/consultaCruzadaService.ts`), erradicando discrepancias analíticas entre pantallas.
3. **Versionado Inmutable de Fórmulas:** Cada cálculo registrado en la base de datos se sella con el identificador `FORMULA_RENDIMIENTO_V1_2026`. Las recalibraciones futuras de estándares no alteran el histórico aprobado.
4. **Trazabilidad de Justificaciones de Saldo:** Cuando una labor concluye con producción inferior a la meta, el saldo pendiente queda indisolublemente ligado a los motivos normativos aprobados (`tiempo_insuficiente`, `vientos_fuertes`, `lluvia_intensa`) y la nota del supervisor.

---

## 2. MATRIZ DE TRAZABILIDAD DE REQUISITOS (RTM)

```
========================================================================================================================
ID REQUISITO      DESCRIPCIÓN OPERATIVA          REGLA CANÓNICA       ENTIDAD / STORE       COMPONENTE UI     CASO TEST
========================================================================================================================
REQ-JRN-01        Jornada L-V 475m netos         RJ-04 / RF-04        jornadas_generales    JornadasModulo    Test 1, 34
REQ-JRN-02        Tres labores en 1 jornada      RJ-02 / RF-04        jornadas (tramos)     JornadasModulo    Test 2, 19
REQ-JRN-03        Subtareas heredan horario      RJ-03                jornadas (tramos)     PlasticoModulo    Test 3, 20
REQ-JRN-04        Bloqueo de solapamiento        RJ-09                validarLaborForm      LaboresModulo     Test 4, 21
REQ-RND-01        Rendimiento con estándar       RF-01                jornadas.tramos       LaboresModulo     Test 7, 36
REQ-RND-02        Exclusión Oficios Varios       RF-05 / ROV-01       jornadas.tramos       OficiosVarios     Test 12, 37
REQ-RND-03        Prevención división por 0      RF-01 (Límites)      rendimientoCalc       LaboresModulo     Test 8, 25
REQ-RND-04        No truncar sobrepaso (>100%)   RF-02                rendimientoCalc       LaboresModulo     Test 9, 29
REQ-RND-05        Media ponderada por horas      RF-03                businessRulesEngine   ReportesModulo    Test 11, 28
REQ-CUB-01        Cuadrilla cubiertas máx 6      RPP-01               jornadas.tramos       PlasticoModulo    Test 13, 41
REQ-CUB-02        Justificación saldo faltante   RPP-02               modalJustificacion    PlasticoModulo    Test 14, 42
REQ-ASI-01        Pase de lista matutino         RA-01                asistencia            AsistenciaModulo  Test 15, 43
REQ-ASI-02        No penalización por falta      RA-05                domain/asistencia     ConsultaCruzada   Test 23
REQ-SST-01        Incidente sin hora final       RSST-01              jornadas.incidentes   IncidentesModulo  Test 16, 40
REQ-BCK-01        Respaldo JSON 6 almacenes      RDATA-01             nexocampoDB           RespaldosModulo   Test 17, RT-09
REQ-PWA-01        Cola de sincronización sync    RPWA-01              pendientes_sync       PwaSyncModulo     Test 44, 45, 46
========================================================================================================================
```

---

## 3. LINAJE DEL DATO AGRÍCOLA (DE CAMPO A NÓMINA)

```
                            CICLO DE VIDA Y LINAJE DEL DATO
 ┌────────────────────────────────────────────────────────┐
 │ 1. CAPTURA EN CAMPO (06:30 a. m.)                     │
 │ - Supervisor selecciona colaborador COL-001 (A. Cortes)│
 │ - Abre labor LAB-004 (Colgar polisombra) en Lote 2     │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. REGISTRO LOCAL ATÓMICO (IndexedDB)                 │
 │ - id: "jrn_20261020_001"                              │
 │ - horaInicio: "06:30", horaFin: "10:30" (240 min)      │
 │ - cantidadCompletada: 120 metros                      │
 │ - minutosEstandar: 15.0 min / metro                   │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. COMPUTACIÓN DE RENDIMIENTO CON VERSIÓN DE FÓRMULA   │
 │ - T. Estándar = 120 * 15.0 = 1,800 minutos            │
 │ - R. Temporal = (1,800 / 240) * 100 = 750% (Cuadrilla) │
 │ - Sello: FORMULA_RENDIMIENTO_V1_2026                   │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. RECONCILIACIÓN EN CONSULTA CRUZADA / REPORTES      │
 │ - Cruce con asistencia: Presente a las 06:28 a. m.    │
 │ - Cruce con ausencias: Sin novedades activas           │
 │ - Cruce con SST: Sin incidentes reportados             │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5. LIQUIDACIÓN CENTRAL Y SINCRONIZACIÓN               │
 │ - Exportación en JSON canónico o push a /api/sync     │
 │ - Aprobación administrativa con bitácora inmutable    │
 └────────────────────────────────────────────────────────┘
```

---

## 4. INMUTABILIDAD Y TRATAMIENTO DE MODIFICACIONES

Cuando un supervisor requiere corregir una planilla de campo posterior a su guardado inicial (ej. ajuste de unidades producidas tras el recuento en centro de acopio):

1. **Invariante de Trazabilidad:** El registro original no se sobrescribe destructivamente sin historial.
2. **Esquema de Bitácora de Modificación (`historial_auditoria`):**
   ```typescript
   interface EntradaAuditoria {
     id: string;                     // UUID de auditoría
     entidadAfectada: 'jornada' | 'asistencia' | 'labor';
     registroId: string;             // ID del tramo modificado
     campoModificado: string;        // ej. "cantidadCompletada"
     valorAnterior: any;             // ej. 80
     valorNuevo: any;                // ej. 85
     motivoModificacion: string;     // ej. "Ajuste tras recuento físico de empaque"
     modificadoPorSupervisorId: string;
     timestampUTC: string;           // ISO 8601
     versionFormula: string;         // "FORMULA_RENDIMIENTO_V1_2026"
   }
   ```
3. **Recálculo Seguro:** Al actualizar la cantidad a `85`, el porcentaje se recalcula bajo la misma versión de fórmula original, impidiendo inconsistencias retroactivas.

---

## 5. RECONCILIACIÓN ANALÍTICA: CONSULTA CRUZADA VS REPORTES

Para garantizar que el departamento de nómina y el jefe de campo vean exactamente los mismos datos:
* **Módulo de Consulta Cruzada (`ConsultaCruzadaModulo.tsx`):**  
  Vista granular por colaborador y fecha.
* **Módulo de Reportes (`ReportesModulo.tsx`):**  
  Vista agregada por cuadrilla y período.
* **Garantía Técnica:** Ambas vistas consumen el mismo agregador de dominio desacoplado. Si una labor está incompleta o carece de hora final, ambas vistas muestran de forma idéntica la etiqueta: `Dato No Registrado`, erradicando la invención de ceros artificiales.

---

> **CERTIFICACIÓN DE TRAZABILIDAD:** El modelo de gobernanza de datos de NexoCampo PRO v18.1.9 garantiza el linaje ininterrumpido del dato, el no-repudio de planillas de campo y la concordancia matemática absoluta en todos los puntos de reporte.
