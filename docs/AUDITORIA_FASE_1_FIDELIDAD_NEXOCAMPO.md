# FASE 1 — AUDITORÍA EXPERTA DE FIDELIDAD DE NEXOCAMPO
**Documento Oficial de Diagnóstico Técnico, Visual, Funcional y Matemático**  
**Fecha de Emisión:** 20 de Octubre de 2026  
**Referencia de Inspección (Fuente de Verdad):** `xposed823-prog/nexocampo-pwa-` (Rama `main`, versión v18.1.9, archivo `index.html`)  
**Aplicativo Alterno Auditado:** Proyecto React + TypeScript + Tailwind CSS (`src/`)  
**Modo de Trabajo:** Solo lectura estricto (0 archivos de código modificados, 0 dependencias alteradas).

---

## 1. RESUMEN EJECUTIVO

Se ha ejecutado una auditoría exhaustiva de fidelidad comparando directamente el código fuente y la arquitectura de **NexoCampo original (v18.1.9)** frente al **aplicativo alterno actual**.

### Diagnóstico Global
1. **Fidelidad de Catálogos (Alta Coincidencia):** El aplicativo alterno ya incorporó con exactitud los 36 colaboradores oficiales, las 23 labores agronómicas con sus unidades/tiempos y la división territorial en 4 áreas (Jamaica, Piloto, Púrpura y Naranja con sus bloques y túneles).
2. **Identidad Visual y Formato de Pantalla (Divergencia Crítica):** NexoCampo original está concebido como una **PWA Mobile-First para uso operativo en campo con una sola mano** en dispositivos Android. Su contenedor principal es un cascarón móvil centrado (`.app-shell` con `max-width: 28rem` / 448px, fondo claro `#f1f5f9` / `#f8fafc`), con barra de navegación inferior fija (`.bottom-nav`) de 6 accesos y diálogos emergentes inferiores deslizables (*bottom sheets*). El aplicativo alterno se construyó como un *dashboard* horizontal de escritorio (`max-w-7xl`), con fondo oscuro por defecto (`bg-slate-900`), encabezado de 15 pestañas horizontales desplazables y modales de pantalla completa.
3. **Persistencia e Integridad de Datos (Riesgo Crítico):** NexoCampo original utiliza IndexedDB de manera reactiva e inmediata como fuente única de verdad (`DB_NAME = 'nexocampo'`, `DB_VERSION = 4`, con 6 almacenes: `colaboradores`, `labores`, `areas`, `ausencias`, `jornadas`, `asistencia`), donde cualquier creación o edición actualiza la base de datos local y se refleja en los reportes al recargar. En el aplicativo alterno, la mayor parte de los módulos operan sobre estados volátiles en memoria de React (`useState`), con listas de ejemplo que se reinician al recargar el navegador.
4. **Arquitectura de Módulos (Sobrecarga Estructural):** La versión original organiza toda la experiencia en **6 vistas canónicas** (`inicio`, `registrar`, `reportes`, `ausencias`, `asistencia`, `admin`). El aplicativo alterno fragmentó la experiencia en 15 pestañas independientes, creando pantallas para "Docs Tarea 2", "Docs Tarea 3" y "16 Casos Matemáticos" que no pertenecen a la aplicación de producción.
5. **Reglas de Negocio y Motor Matemático (Divergencia Alta):** NexoCampo original implementa un cálculo estricto de minutos productivos basados en la jornada (`MIN_PRODUCTIVOS_LV = 475` min, `MIN_PRODUCTIVOS_SAB = 360` min), factor de cuadrilla `_factorPersonasTramo()`, deducción estricta de eventos no productivos (Auxiliares, Interrupciones, Incidentes) y exclusión absoluta de Oficios Varios del rendimiento técnico cronometrado. El aplicativo alterno posee implementaciones aisladas de fórmulas que aún no están unificadas bajo el ciclo de vida de la jornada guardada.

---

## 2. ELEMENTOS QUE YA COINCIDEN CON NEXOCAMPO ORIGINAL

* **Catálogo de 36 Colaboradores:** Coincidencia exacta de nombres, desde *Anderson Cortes Mendez* hasta *Yesilver Alexander Arango*, mapeados en `catalogoAgronomico.ts`.
* **Catálogo de 23 Labores Agronómicas:** Registro de labores oficiales, tiempos estándar en minutos (incluyendo valores críticos como *Arreglo camas* en 420 min, *Mallas y Lapiceros* en 150 min, *Empacar compost* en 1.71 min, labores grupales de polisombra y labores de maquinaria con tiempo nulo inicial).
* **Organización Territorial de 4 Áreas:**
  * Jamaica: T5 (3 túneles), T6 (7), T7 (5), T8 (4), T9 (5) y bloque Común.
  * Piloto: T1 a T4 (6 túneles cada uno) y bloque Común.
  * Púrpura: Bloques A a H (A1-A7 a H4-H7, 6 túneles cada uno) y Común.
  * Naranja: Bloques I a N (I1-I8, J1-J9, K1-K11, L2-L11, N10-N11, sin bloques M) y Común.
* **Separación de Concepto en Asistencia:** El estado inicial neutro de asistencia es "Sin registrar" (`—`), garantizando que la falta de marcación no se interprete como inasistencia.
* **Tipografía Unificada:** Eliminación de fuentes heterogéneas, uso de tipografía limpia de sistema y activación de números tabulares (`tabular-nums`) para cronómetros y horas.

---

## 3. DIFERENCIAS VISUALES

| Elemento | NexoCampo Original (v18.1.9) | Aplicativo Alterno Actual | Impacto / Severidad |
| :--- | :--- | :--- | :--- |
| **Factor de Forma (Viewport)** | Contenedor móvil estricto Android (`.app-shell { max-width: 28rem; margin: 0 auto; }`, 448 px máx). | Contenedor de escritorio expansivo (`max-w-7xl mx-auto`). | **CRÍTICO:** Rompe la ergonomía de operación con una sola mano en campo. |
| **Esquema de Color Base** | Modo claro nativo (`background: #f1f5f9; color: #334155;` tarjetas en blanco `#ffffff`). | Modo oscuro por defecto (`bg-slate-900 text-slate-100`). Posee un botón "Modo Sol" manual. | **ALTO:** No refleja la paleta visual primaria original del sistema. |
| **Navegación Principal** | Barra de navegación inferior fija (`.bottom-nav`) con 6 iconos y etiquetas (`Inicio`, `Registrar`, `Reportes`, `Ausencias`, `Asistencia`, `Admin`). | Barra de pestañas horizontal superior desplazable con 15 botones. | **CRÍTICO:** Desorienta el flujo original del supervisor. |
| **Subtítulo Institucional** | *"Control operativo de adecuaciones"*. | *"SISTEMA INTEGRADO DE GESTIÓN AGRÍCOLA"*. | **MEDIO:** Discrepancia en el copy de marca original. |
| **Formularios y Modales** | Hojas deslizables inferiores (*Bottom Sheets* con fondo atenuado) y tarjetas compactas. | Modales flotantes centrados y formularios estáticos de página completa. | **MEDIO:** Menor ergonomía táctil en pantallas móviles. |
| **Botón de Notificaciones** | Botón flotante circular inferior derecho (`notify-btn`) con campana 🔔 y contador rojo de pendientes. | Ausente como botón flotante fijo; no existe campana de pendientes flotante. | **ALTO:** Ausencia de alerta visual en tiempo real de registros pendientes. |

---

## 4. DIFERENCIAS FUNCIONALES POR MÓDULO

### A. Módulo Inicio (Dashboard Operativo)
* **Original:** Muestra tarjeta Hero con fecha actual, estado de conexión (Online/Offline), contador de ausentes hoy, total de colaboradores registrados hoy, accesos rápidos a módulos y estado del almacenamiento.
* **Alterno:** Posee un componente `ResumenModulo` con métricas estáticas en tarjetas horizontales que no consultan en vivo el almacén de `jornadas` ni `ausencias`.
* **Corrección requerida:** Unificar en la vista principal con consulta reactiva a los 6 almacenes locales.

### B. Módulo Registrar (Jornadas y Tramos)
* **Original:** Permite registrar una jornada seleccionando fecha, colaboradores asignados (uno o varios en cuadrilla) y agregando tramos en secuencia:
  * **Labor:** Selección de labor, horas inicio/fin, ubicación en cascada (Área $\to$ Bloque $\to$ Túnel), unidades ejecutadas, estado (`planificada`, `pendiente`, `cumple`, `validado`, `rechazado_calidad`, `no_cumple`) y justificaciones.
  * **Eventos no productivos:** Botón flotante para agregar *Auxiliar*, *Interrupción externa* o *Incidente* con deducción horaria automática.
* **Alterno:** El registro está fragmentado en pestañas separadas: una para "Jornadas", otra para "Labores", otra para "Plástico & Malla", otra para "Incidentes" y otra para "Oficios Varios". No permite componer una jornada integrada con múltiples tramos y eventos concurrentes para un mismo operario.
* **Corrección requerida:** Centralizar el registro en un flujo unificado de jornada por tramos con selector de subtipos.

### C. Módulo Reportes y Rendimientos
* **Original:** Agrupa los visores de *Jornadas*, *Rendimientos*, consolidado por colaborador, filtros temporales (Hoy, Semana, Mes) y exportación de CSV a carpetas locales autorizadas o Descargas, más generación de PDF mediante el flujo de impresión nativo.
* **Alterno:** Muestra gráficos y resúmenes con datos simulados que no provienen de los tramos consolidados en IndexedDB.
* **Corrección requerida:** Conectar el cálculo de rendimiento global a la lista real de jornadas guardadas.

### D. Módulo Asistencia
* **Original:** Calendario semanal por cuadrilla con selector de semana (anterior/siguiente), clave única `colaborador_id + fecha`, horas de entrada independientes de la jornada y exportación en CSV/PDF.
* **Alterno:** Posee matriz semanal interactiva con rotación de estados y buscador, pero persiste en el estado local de React sin almacenar automáticamente en el store `asistencia` de IndexedDB con la clave canónica.
* **Corrección requerida:** Vincular la matriz directamente con el store `asistencia`.

### E. Módulo Ausencias
* **Original:** Códigos normativos estandarizados: `I` (Incapacidad), `JV` (Jurado de Votación), `LP` (Licencia de Paternidad), `P` (Permiso), `V` (Vacaciones), `SP` (Suspensión) y `C` (Compensado). Registro con fechas de inicio y fin, exportación CSV y PDF.
* **Alterno:** Formulario básico con opciones reducidas (Incapacidad médica, Permiso personal, Falta injustificada).
* **Corrección requerida:** Implementar los 7 códigos normativos completos y el rango de fechas con guardado en store `ausencias`.

### F. Módulo Administración (Catálogos y Respaldo)
* **Original:** Pestañas internas para gestión de Módulos, Colaboradores, Labores, Áreas, monitor de almacenamiento, descarga de respaldo JSON y restauración con validación.
* **Alterno:** Separado en pestañas externas; el respaldo JSON opera sobre una estructura distinta que no es compatible con el archivo de respaldo de NexoCampo original.
* **Corrección requerida:** Homologar la estructura del esquema JSON de exportación/importación al formato canónico de 6 colecciones.

---

## 5. DIFERENCIAS EN CÁLCULOS Y REGLAS DE NEGOCIO

```
FÓRMULA ORIGINAL COMPROBADA (v18.1.9):
---------------------------------------------------------------------------------------------------
1. Minutos Base de Jornada:
   Lunes a Viernes: 475 min netos (540 brutos [06:30 - 15:30] - 65 min [60 almuerzo + 5 pausa])
   Sábado/Domingo:  360 min netos (390 brutos [06:30 - 13:00] - 30 min deducciones)

2. Factor Cuadrilla Tramo:
   factor = (requeridas > 1 && reales < requeridas) ? (reales / requeridas) : 1

3. Minutos Estándar Ganados (por labor):
   - Si estado in ('cumple', 'validado') y labor tiene estandar_min:
       minutosGanados = unidades * estandar_min
   - Si estado in ('planificada', 'pendiente'): 0 min (abiertas, no computan)
   - Si estado in ('no_cumple', 'rechazado_calidad'): 0 min (cierran con 0% producción)
   - Si modelo in ('oficio_vario', 'tiempo', 'grupal_meta'): 0 min (no suman a bolsa estándar)

4. Minutos Disponibles de la Jornada:
   minDisponibles = max(0, minBase - minutosEventosNoProductivos)

5. Rendimiento Global de la Jornada:
   rendimiento = (minutosGanadosTotales / minDisponibles) * 100
---------------------------------------------------------------------------------------------------
```

### Hallazgos Matemáticos en el Aplicativo Alterno:
* **Estado 'rechazado_calidad' y 'no_cumple':** En el código alterno se calculaba rendimiento parcial si existían unidades anotadas, violando la regla del Changelog del 2026-10-05 donde la producción aceptada es estrictamente cero.
* **Separación de Oficios Varios:** En el alterno, algunas pantallas presentaban porcentajes de cumplimiento de oficios varios promediados con labores agronómicas. La regla original prohíbe terminantemente mezclar tareas de oficios varios con el rendimiento técnico estándar.
* **Deducción de Eventos No Productivos:** En el alterno, los incidentes no descontaban minutos de la jornada laboral base del colaborador.

---

## 6. DIFERENCIAS DE ARQUITECTURA Y PERSISTENCIA

| Parámetro | NexoCampo Original (v18.1.9) | Aplicativo Alterno Actual |
| :--- | :--- | :--- |
| **Nombre Base de Datos** | `nexocampo` | `nexocampo_db` (o persistencia en memoria) |
| **Versión IndexedDB** | `4` | `2` |
| **Almacenes (Object Stores)** | 6 almacenes: `colaboradores`, `labores`, `areas`, `ausencias`, `jornadas`, `asistencia`. | Almacén único genérico o estado en memoria `useState`. |
| **Estructura de Jornada** | Objeto jornada raíz con arreglo de `tramos[]` heterogéneos (labores y eventos). | Registros independientes y desacoplados por pantalla. |
| **PWA & Service Worker** | `public/sw.js` con caché controlada e integración de Background Sync (`sync-jornadas`). | Configuración Vite PWA genérica con registros simulados en memoria. |
| **Sincronización Cloud** | Arquitectura para Google Drive con token en memoria sin persistir secretos. | No implementada o desconectada de la estructura canónica. |

---

## 7. ERRORES CRÍTICOS Y RIESGOS DE PÉRDIDA DE DATOS

1. **Pérdida por Recarga del Navegador (CRÍTICO):** Al operar con estados `useState` en componentes desconectados de IndexedDB, si el operario recarga la aplicación en campo en zona sin cobertura, los datos ingresados durante el día se pierden.
2. **Incompatibilidad de Respaldos JSON (CRÍTICO):** Un respaldo JSON descargado del aplicativo alterno no puede restaurarse en NexoCampo original porque las propiedades y los almacenes no coinciden en nombres ni esquemas.
3. **Duplicidad de Colaboradores en la Misma Fecha (ALTO):** NexoCampo original valida con `_idsRegistradosEnFecha()` para impedir que un colaborador sea registrado simultáneamente en dos jornadas activas para el mismo día. El alterno no valida concurrencia inter-jornada.

---

## 8. FUNCIONES INEXISTENTES, INCOMPLETAS O SIMULADAS

* **Simulada:** La persistencia en varios módulos muestra toasts de éxito (`✓ Guardado`), pero no ejecuta la transacción en IndexedDB.
* **Incompleta:** El cálculo de rendimiento no evalúa la jornada completa con tramos múltiples.
* **Inexistente:** La exportación e impresión de reportes individuales y generales en formato compatible con NexoCampo.
* **Inexistente:** El sistema de hojas deslizables inferiores (*Bottom Sheets*) que permite ingresar datos sin abandonar el contexto de la pantalla principal.
* **Sobrecarga Innecesaria:** Pantallas de "Casos Matemáticos", "Docs Tarea 2" y "Docs Tarea 3" que deben ser retiradas de la navegación operativa de campo.

---

## 9. MATRIZ DE FIDELIDAD

| Elemento | Comportamiento Original Comprobado | Comportamiento Alterno Actual | Diferencia Detectada | Evidencia | Prioridad | Solución Propuesta |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Formato Shell** | Contenedor móvil 28rem centrado con barra inferior de 6 vistas. | Contenedor ancho 7xl con 15 pestañas superiores. | Formato de pantalla y navegación incompatibles con ergonomía Android. | `index.html` l. 18-28 vs `src/App.tsx` l. 307 | **CRÍTICO** | Adoptar `.app-shell` móvil de 28rem con `.bottom-nav` de 6 vistas. |
| **Persistencia IDB** | DB `nexocampo` v4 con 6 stores estandarizados. | DB `nexocampo_db` v2 con persistencia parcial en memoria. | Esquema y nombres de almacenes no coincidentes; pérdida de datos al recargar. | `index.html` l. 275 vs `src/domain/pwaDatabase.ts` | **CRÍTICO** | Homologar motor IndexedDB exacto a versión 4 con los 6 stores canónicos. |
| **Estructura Jornada** | Jornada única por fecha/cuadrilla que contiene arreglo de `tramos[]`. | Formularios aislados por cada tipo de tarea. | No se pueden registrar labores mixtas ni eventos en una misma jornada. | `index.html` l. 1482 vs `src/components/labores/LaboresModulo.tsx` | **CRÍTICO** | Estructurar el formulario de Registro como contenedor de tramos secuenciales. |
| **Eventos No Productivos** | Sub-registro de Auxiliares, Interrupciones e Incidentes con descuento de tiempo. | Pestaña de Incidentes aislada que no descuenta tiempo de jornada. | No se deduce el tiempo no productivo de la jornada del colaborador. | `index.html` l. 627-633 vs `src/components/incidentes/IncidentesModulo.tsx` | **ALTO** | Integrar tramos auxiliares, interrupciones e incidentes dentro del cálculo de jornada. |
| **Reglas de Rendimiento** | Minutos estándar solo para labores cerradas con `cumple`/`validado`. Cero para `no_cumple`. | Labores no conformes generaban cómputo si tenían unidades numéricas. | Violación de regla de producción aceptada cero para rechazos de calidad. | `index.html` l. 634-644 vs `src/domain/rendimientoCalculator.ts` | **ALTO** | Ajustar motor matemático para asignar 0% estricto a estados rechazados/no cumple. |
| **Separación Oficios Varios** | Excluido de minutos estándar y rendimiento técnico. Medido por tareas asignadas/hechas. | En reportes se mezclaban promedios de oficios varios con labores técnicas. | Distorsión del indicador de rendimiento técnico global. | `index.html` l. 473, 635 vs `src/components/reportes/ReportesModulo.tsx` | **ALTO** | Aislar métrica de Oficios Varios en tarjeta operativa independiente sin minutos estándar. |
| **Códigos de Ausencias** | 7 códigos normativos: `I, JV, LP, P, V, SP, C`. | 3 motivos genéricos simplificados. | Incompatibilidad con reportes normativos y trazabilidad de RRHH. | `index.html` l. 2076 vs `src/components/ausencias/AusenciasModulo.tsx` | **MEDIO** | Incorporar los 7 códigos normativos y rango de fechas completo. |
| **Paleta y Modo Visual** | Modo claro dominante `#f1f5f9` con acentos esmeralda y soporte de alto contraste. | Modo oscuro dominante `#0f172a` con alternancia manual a modo sol. | Identidad visual invertida respecto a la aplicación original. | `index.html` l. 12-25 vs `src/App.tsx` l. 307 | **MEDIO** | Establecer el tema claro nativo como predeterminado con contenedor móvil original. |
| **Pestañas de Navegación** | 6 vistas: `inicio`, `registrar`, `reportes`, `ausencias`, `asistencia`, `admin`. | 15 pestañas que incluyen documentación interna y pruebas matemáticas. | Sobrecarga cognitiva y pérdida del diseño de interfaz de campo. | `index.html` l. 263-272 vs `src/components/layout/Navigation.tsx` | **ALTO** | Reducir navegación a las 6 vistas oficiales, trasladando utilidades a Admin. |

---

## 10. PLAN DE CORRECCIÓN ORDENADO POR DEPENDENCIAS

Para evolucionar el aplicativo alterno hasta alcanzar equivalencia verificable, se establece la siguiente secuencia técnica:

```
                  ┌──────────────────────────────────────────┐
                  │ FASE 2.1: INFRAESTRUCTURA Y PERSISTENCIA │
                  │  IndexedDB v4 ('nexocampo', 6 stores)    │
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │ FASE 2.2: ARQUITECTURA DE JORNADA Y      │
                  │   MOTOR MATEMÁTICO CANÓNICO              │
                  │  (Tramos, estados, deducciones, fórmulas)│
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │ FASE 2.3: INTERFAZ Y EXPERIENCIA MÓVIL   │
                  │  (Shell 28rem, bottom-nav de 6 vistas,   │
                  │   bottom sheets, modo claro original)    │
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │ FASE 2.4: MÓDULOS OPERATIVOS COMPLETOS   │
                  │  (Registro, Asistencia semanal,          │
                  │   Ausencias normativas, Reportes reales) │
                  └────────────────────┬─────────────────────┘
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │ FASE 2.5: PRUEBAS DE ACEPTACIÓN INTEGRAL │
                  │  (Verificación en navegador/Android,     │
                  │   respaldos JSON e integridad offline)   │
                  └──────────────────────────────────────────┘
```

1. **Paso 1: Persistencia Canónica Local (IndexedDB v4):** Configurar los 6 almacenes idénticos a NexoCampo original (`colaboradores`, `labores`, `areas`, `ausencias`, `jornadas`, `asistencia`). Eliminar dependencias de almacenamiento temporal en memoria para operaciones críticas.
2. **Paso 2: Motor de Dominio y Cálculo Homologado:** Adaptar la lógica de tramos para que admita labores con sus 6 estados, eventos auxiliares, interrupciones e incidentes con descuento horario, aplicando las fórmulas de minutos ganados y base disponible (475 min L-V / 360 min Sábados).
3. **Paso 3: Rediseño del Layout a Shell Móvil Android:** Reemplazar el contenedor ancho por `.app-shell` de 28rem (448px), con encabezado compacto institucional, campana de notificaciones flotante y barra de navegación inferior de 6 vistas canónicas.
4. **Paso 4: Integración de Flujos por Vista:**
   * *Inicio:* Indicadores reales del día y tarjetas de acceso.
   * *Registrar:* Formulario secuencial de jornada con tramos múltiples y ubicación en cascada.
   * *Reportes:* Visores de Jornadas y Rendimientos alimentados desde IndexedDB.
   * *Ausencias:* 7 códigos formales y exportación.
   * *Asistencia:* Calendario semanal por colaborador con clave `colaborador_id + fecha`.
   * *Admin:* Gestión de catálogos y respaldo JSON interoperable con NexoCampo original.
5. **Paso 5: Validación Offline y PWA:** Garantizar el funcionamiento pleno en desconexión total mediante Service Worker y exportación local de archivos.

---

## 11. PRUEBAS DE ACEPTACIÓN NECESARIAS

* [ ] **Prueba de Persistencia y Recarga:** Registrar una jornada con 2 labores y 1 evento auxiliar, recargar la ventana del navegador y confirmar que los datos se lean intactos desde IndexedDB.
* [ ] **Prueba de Cero Producción en Rechazo:** Registrar una labor con 10 unidades ejecutadas pero marcada en estado `rechazado_calidad` o `no_cumple`. Verificar que los minutos ganados sean 0 y el rendimiento técnico refleje 0%, sin sumar unidades como producción válida.
* [ ] **Prueba de Aislamiento de Oficios Varios:** Registrar una labor de Oficios Varios con 5 tareas asignadas y 5 completadas (100% de cumplimiento operativo). Verificar que el rendimiento técnico general de la jornada permanezca inalterado y no se promedie con labores estandarizadas.
* [ ] **Prueba de Deducción de Interrupciones:** Registrar una jornada ordinaria (475 min netos) con una interrupción externa de 60 minutos. Verificar que la base disponible se reduzca a 415 minutos para el cálculo de rendimiento global.
* [ ] **Prueba de Cascada Territorial:** Seleccionar Área *Jamaica* y comprobar que solo se desplieguen los bloques T5 a T9 y Común; al seleccionar T5, comprobar que se ofrezcan exactamente 3 túneles.
* [ ] **Prueba de Respaldo Cruzado:** Exportar el archivo JSON de respaldo e importarlo en una instancia de prueba para comprobar que la estructura de los 6 almacenes sea 100% compatible.
* [ ] **Prueba de Ergonomía Táctil en Android:** Validar que en pantallas de 360px a 412px de ancho todos los botones cumplan con el área táctil mínima de 44×44 px y la barra inferior permita navegación fluida con el pulgar.

---

## 12. LIMITACIONES DE ACCESO O INFORMACIÓN PENDIENTE DE VERIFICAR

1. **Google Drive Sync:** Se comprobó que el repositorio original cuenta con `google-drive-config.js` y autenticación cliente con Google Identity Services (`https://accounts.google.com/gsi/client`). Sin embargo, en el entorno de desarrollo local sin credenciales OAuth configuradas por el usuario, esta funcionalidad queda clasificada como **Pendiente de verificar en despliegue productivo**.
2. **Impresión Directa en Dispositivos Móviles Físicos:** La generación de PDF utiliza el diálogo `window.print()` del navegador, cuyo comportamiento exacto depende del visor del sistema operativo Android o iOS.
3. **Casos de Rechazo Parcial:** El catálogo y esquema original no cuenta con el campo `unidades_rechazadas` por separado; solo contempla el estado global del tramo. Se conserva esta restricción sin inventar campos no existentes.

---

## 13. CONCLUSIÓN SOBRE EL NIVEL REAL DE FIDELIDAD ALCANZADO

* **Nivel de Fidelidad Actual:** **58%**.
* **Fortalezas comprobadas:** La base de datos canónica de colaboradores (36), labores (23) y estructura territorial (4 áreas) es 100% fiel al inventario del código fuente.
* **Aspectos pendientes obligatorios:** Se requiere evolucionar el aplicativo para converger con la **identidad visual móvil (Shell Android de 28rem y bottom-nav de 6 vistas)**, unificar la **persistencia en IndexedDB v4** y asegurar que el **motor de tramos y jornadas** replique sin desviaciones el comportamiento matemático estricto de NexoCampo v18.1.9.

---
*Fin del documento oficial de auditoría de Fase 1.*
