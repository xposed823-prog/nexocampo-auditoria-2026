# 29 — Limitaciones Conocidas, Restricciones del Entorno y Decisiones Pendientes
## NexoCampo 2026 — Supervisión Agrícola Offline-First

---

### 1. Estado de las Reglas Matemáticas y Operativas

Conforme a la directriz fundamental del proyecto (*"No inventes fórmulas ni sustituyas reglas operativas sin evidencia y aprobación"*), el sistema categoriza estrictamente el estado de cada fórmula:

#### 1.1. Reglas Confirmadas e Implementadas
- **Cálculo de Jornada Bruta y Neta:**
  $$\text{Minutos Brutos} = \text{Hora Fin} - \text{Hora Inicio}$$
  $$\text{Minutos Efectivos} = \text{Minutos Brutos} - \sum \text{Deducciones Computables}$$
  *Implementada y probada al 100% en `jornadaCalculator.ts`.*
- **Cumplimiento de Cantidad Física:**
  $$\text{Cumplimiento de Cantidad (\%)} = \left(\frac{\text{Cantidad Completada}}{\text{Cantidad Objetivo}}\right) \times 100$$
  *Soporta valores superiores al 100% sin truncamiento artificial (`SOBREPASO_META`).*
- **Media Ponderada del Rendimiento Técnico:**
  $$\text{Rendimiento Ponderado (\%)} = \left(\frac{\sum \text{Minutos Estándar Totales}}{\sum \text{Minutos Efectivos Reales}}\right) \times 100$$
  *Evita la distorsión del promedio simple de porcentajes.*
- **Oficios Varios (Avance de Tareas):**
  $$\text{Cumplimiento de Tareas (\%)} = \left(\frac{\text{Tareas Completadas}}{\text{Tareas Asignadas}}\right) \times 100$$
  *Bloquea la emisión de rendimiento temporal porcentual.*
- **Detección Estricta de Solapamientos:**
  $$\text{Solapamiento} \iff (\text{Inicio}_B < \text{Fin}_A) \land (\text{Fin}_B > \text{Inicio}_A)$$
  *Permite labores continuas donde $\text{Fin}_A = \text{Inicio}_B$.*
- **Aislamiento de Subtareas:**
  *Subtareas con `heredaHorario: true` no crean períodos de tiempo independientes en la línea de jornada.*

#### 1.2. Reglas Pendientes de Aprobación por la Dirección Agrícola
1. **Distribución y Duración Exacta de Pausas Activas:**
   - *Situación:* La referencia operativa contempla 475 minutos en semana (6:30 a 15:30) asumiendo 30m de desayuno, 30m de almuerzo y 5m de pausa activa.
   - *Decisión Pendiente:* Definir formalmente si la pausa activa de 5 o 15 minutos debe considerarse legalmente tiempo de trabajo efectivo (no deducible) o deducción computable según el reglamento interno de trabajo.
2. **Estándares Cronometrados para Labores de Invernadero:**
   - *Situación:* Ciertas labores especializadas (ej. entutorado fino, despunte) no cuentan aún con tiempos cronometrados por planta aprobados por ingeniería industrial.
   - *Tratamiento en NexoCampo:* El sistema muestra la labor en estado `ESTANDAR_NO_DISPONIBLE` con porcentaje `null`, sin inventar metas hipotéticas.
3. **Ponderación de Tareas Heterogéneas en Oficios Varios:**
   - *Situación:* Actualmente se computa conteo directo de tareas (3 de 5 = 60%). No existe regla aprobada que asigne pesos distintos a tareas de diferente esfuerzo (ej. mover tierra vs. limpiar herramientas).

---

### 2. Limitaciones Técnicas del Entorno de Desarrollo (AI Studio / Cloud Sandbox)

1. **Falta de Dispositivo GPS Físico en Tiempo Real:**
   - *Descripción:* Los navegadores en contenedores cloud no disponen de hardware satelital GNSS real.
   - *Impacto:* La geolocalización de lotes e invernaderos opera mediante simulación de coordenadas fijas o selección agronómica estructurada (Área, Bloque, Túnel).
2. **Falta de Notificaciones Push Remotas (FCM / WebPush PushManager):**
   - *Descripción:* Sin un servidor push registrado con certificados VAPID en producción, no pueden recibirse mensajes asíncronos cuando el navegador está cerrado durante días.
   - *Impacto:* Mitigado mediante **Notificaciones Nativas Locales** del Service Worker al ejecutar la sincronización de fondo.
3. **Persistencia No Cifrada en el Sandbox:**
   - *Descripción:* IndexedDB opera en el almacenamiento estándar del navegador. No se cuenta con módulos nativos de enclave seguro (Keystore de Android / Secure Enclave de iOS).
   - *Recomendación:* Implementar cifrado a nivel de registro con Web Crypto API (AES-GCM) en la fase de producción empresarial.

---

### 3. Matriz de Decisiones Bloqueadas (No Implementadas para Evitar Suposiciones)

| Decisión Bloqueada | Causa del Bloqueo | Impacto Operativo | Acción Requerida |
| :--- | :--- | :--- | :--- |
| **Sanciones Automáticas por Retardos** | Ausencia de norma laboral interna aprobada | El sistema registra el retardo pero no descuenta tiempo ni emite sanciones automáticas. | Aprobación del Comité Laboral y Jurídico de la empresa. |
| **Rendimiento Ficticio en Oficios Varios** | Prohibición explícita de inventar estándares | Se emite `null` en rendimiento técnico porcentual. | Estudio de tiempos y métodos por parte del equipo de Operaciones Agrícolas. |
| **Cierre Automático de Jornada por Inactividad** | Riesgo de cerrar jornadas de operarios que siguen trabajando en campo sin cobertura | El cierre debe ser confirmado de forma explícita por el supervisor. | Definir protocolo de cierre de emergencia si el supervisor pierde el dispositivo. |
