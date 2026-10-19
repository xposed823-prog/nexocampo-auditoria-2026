# DIAGNÓSTICO GENERAL Y LÍMITES DE INFORMACIÓN — NEXOCAMPO 2026
**Documento Técnico:** `01-diagnostico.md`  
**Estado:** Versión Preliminar de Arquitectura — Tarea 1 de 5  
**Proyecto:** NexoCampo 2026 (Versión Experimental e Independiente)  
**Fecha:** 2026-10-18  

---

## 1. Declaración Expresa de Aislamiento y Límites de Acceso

> **DECLARACIÓN OBLIGATORIA:**  
> Como ingeniero y arquitecto a cargo, se declara de forma expresa que **no se ha tenido acceso directo ni verificable al repositorio de código fuente original de NexoCampo en GitHub, a sus bases de datos productivas ni a su infraestructura en producción**.
> En consecuencia:
> - Esta arquitectura y diagnóstico se fundamentan rigurosamente en las especificaciones funcionales y técnicas provistas en la presente encomienda.
> - **No se afirma compatibilidad empírica ya probada** con el código histórico sin previa homologación formal.
> - Se aplica estrictamente la máxima: *"NexoCampo no se reconstruye. NexoCampo se evoluciona."* Esta versión experimental se diseña de manera aislada, no destructiva y modular, sin sustituir, sobrescribir ni comprometer el sistema preexistente.

---

## 2. Diagnóstico del Entorno Operativo Agrícola

NexoCampo opera en un entorno de campo abierto con características singulares que condicionan radicalmente las decisiones de diseño:

1. **Perfil de Usuario Principal:**
   - Supervisor de campo / líder de cuadrilla.
   - Utiliza terminales móviles (smartphones/tablets de gama media o baja) en condiciones de alta luminosidad solar, intemperie, eventual contacto con humedad o tierra, y uso intermitente con guantes.
   - En el modelo operativo actual, **los colaboradores de campo no poseen ni requieren cuentas individuales en el sistema**; su actividad, registro de asistencia, asignaciones y novedades son capturadas por el supervisor.

2. **Conectividad Discontinua o Nula:**
   - La operación agrícola se desarrolla en zonas rurales con señal celular intermitente, precaria (Edge/3G inestable) o completamente inexistente durante 8 a 10 horas continuas de jornada.
   - **Offline-First no es una característica opcional ni un degradado; es el estado operativo normal y primario de la aplicación.**

3. **Ciclo de Trabajo y Fricción Cero:**
   - El supervisor debe registrar asistencia matutina masiva en lapsos reducidos (6:15 a. m. a 6:35 a. m.), asignaciones dinámicas por lote o bloque, pausas y novedades sin demoras de interfaz.
   - Cualquier lentitud en la carga de vistas o bloqueo de hilo principal impacta directamente el rendimiento del equipo en campo.

---

## 3. Matriz de Certeza de Requisitos

A partir del análisis de la encomienda, se categoriza el estado del conocimiento técnico y funcional:

| Componente / Aspecto | Clasificación | Evidencia / Justificación | Estado de Aprobación |
| :--- | :--- | :--- | :--- |
| **Rol operativo del supervisor** | **Confirmado** | Supervisor único/líder registra a la cuadrilla; colaboradores sin cuentas personales. | Aprobado para diseño |
| **Pila de Persistencia Local** | **Confirmado** | HTML5, CSS3, JavaScript Vanilla / TypeScript, IndexedDB y arquitectura PWA. | Aprobado para diseño |
| **Aislamiento de producción** | **Confirmado** | Prohibición absoluta de tocar GitHub prod, credenciales reales o bases existentes. | Requisito No Negociable |
| **Horario Lunes a Viernes** | **Propuesto** | 6:30 a. m. a 3:30 p. m. (9 horas brutas = 540 min). Desayuno 30 min, almuerzo 30 min. | Requiere validación agronómica |
| **Horario Sábado** | **Propuesto** | 6:30 a. m. a 1:00 p. m. (6.5 horas brutas = 390 min). Desayuno 30 min. | Requiere validación agronómica |
| **Pausas adicionales de 5 min** | **Pendiente / Incierto** | Cantidad y distribución en la jornada desconocidas (¿1 pausa = 5 min para dar 475 min netos?). | Falta definición formal |
| **Fórmulas de Rendimiento** | **Propuesto** | R. Temporal = (T. Estándar / T. Efectivo) × 100; Cumplimiento = (Cant. / Objetivo) × 100. | Referencia conceptual; sin estándares aprobados |
| **Labores "Oficios Varios"** | **Confirmado** | Labores sin estándar temporal confirmado; deben rastrearse sin cálculo de rendimiento ficticio. | Aprobado para diseño |
| **Módulo Plástico y Polisombra**| **Confirmado** | Subtareas especializadas de postura, ajuste, sellado y mantenimiento de cubiertas. | Aprobado para diseño |
| **Integración con Google Drive** | **Propuesto** | Respaldos JSON manuales/asistidos vía API autorizada. | Requiere flujo OAuth seguro |
| **No alteración automática por ausencia** | **Confirmado** | Ausencias y asistencias no deben penalizar ni mutar automáticamente el rendimiento técnico. | Regla de negocio confirmada |

---

## 4. Vacíos de Información Críticos (Gap Analysis)

1. **Catálogo Oficial de Labores y Estándares:**  
   Se desconocen los códigos de labor, unidades de medida (metros lineales, camas, surcos, racimos, canastillas) y tiempos estándar fijados por ingeniería agrícola.  
   *Mitigación:* Se implementará un catálogo desacoplado en el módulo `domain/labores` con soporte para estándares nullables (labor sin estándar = sin cálculo forzado).

2. **Estructura Histórica de Datos:**  
   Al no acceder a los almacenes IndexedDB históricos, se desconoce el esquema previo exacto (`db.version`, nombres de ObjectStores e índices).  
   *Mitigación:* Se diseña un adaptador de esquema con detección de versiones y migración progresiva sin alteración destructiva.

3. **Mecanismo de Desayuno y Almuerzo en Campo:**  
   ¿Son pausas fijas sincronizadas para toda la cuadrilla o escalonadas por lote/finca?  
   *Mitigación:* Soporte para pausas globales de jornada y pausas específicas por colaborador/labor.

---

## 5. Directrices Técnicas de la Versión Experimental

1. **Independencia Estricta:** Almacenamiento en una base IndexedDB con nombre de espacio aislado (`NexoCampo_Exp_2026_DB`) para evitar colisiones con instancias productivas que pudieran convivir en el mismo origen de navegador.
2. **Cero Datos Personales Reales:** Uso exclusivo de perfiles sintéticos, identificadores anonimizados (e.g., `COL-001`, `COL-002`) y alias funcionales durante todas las fases de prueba.
3. **Fórmulas como Funciones Puras:** Prohibición absoluta de dispersar operaciones aritméticas dentro de vistas UI. Toda lógica residirá en módulos de dominio auditables y testeables unitariamente.
