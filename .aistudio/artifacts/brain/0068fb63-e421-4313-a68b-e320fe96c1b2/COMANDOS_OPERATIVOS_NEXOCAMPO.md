# ESPECIFICACIÓN Y PROTOCOLO DE COMANDOS OPERATIVOS — NEXOCAMPO AUDITORÍA 2026

**Skill:** `nexocampo-commands`  
**Complementa:** `nexocampo-pwa-expert`  
**Entorno de Operación:** `xposed823-prog/nexocampo-auditoria-2026`  
**Fecha de Publicación:** Octubre 2026  
**Estado:** Activo y Vinculante  

---

## 1. RELACIÓN CON LA SKILL MAESTRA

Esta especificación formaliza el catálogo y protocolo de ejecución de los comandos operativos de **NexoCampo Auditoría 2026**, complementando las directrices de `nexocampo-pwa-expert`.

- La **skill maestra** (`nexocampo-pwa-expert`) establece la arquitectura de software, las reglas de negocio agronómicas, las fórmulas matemáticas de rendimiento, el modelo canónico de datos en IndexedDB y las restricciones de seguridad e integridad.
- Esta **skill operativa** (`nexocampo-commands`) interpreta los comandos CLI emitidos por el usuario, determina el procedimiento metodológico aplicable, valida los permisos de alcance y estructura los resultados con trazabilidad obligatoria.
- **Jerarquía y resolución de conflictos:** Ante cualquier discrepancia o ambigüedad, prevalecen siempre la autorización explícita del usuario, la protección del repositorio de producción (`xposed823-prog/nexocampo-pwa-`), la invariabilidad de las fórmulas auditadas y la integridad de los datos persistidos.

---

## 2. REGLAS GENERALES Y LÍMITES DE AUTORIZACIÓN

1. **Identificación estricta:** Identificar con precisión el comando y sus argumentos antes de cualquier invocación técnica.
2. **Consulta documental:** Verificar la documentación real y el código fuente existente en el repositorio antes de atribuir comportamientos o implementar cambios.
3. **No auto-autorización de escritura:** 
   - Un comando **no concede permisos de escritura por sí mismo**.
   - Los comandos `/code`, `/refactor` y `/optimize` **no autorizan modificaciones automáticas** en disco sin la previa aprobación explícita del usuario respecto a la propuesta de cambio.
4. **Respeto a directivas de control de alcance:**
   - `/solo lectura`: Prohíbe terminantemente la edición, eliminación o creación de archivos en el repositorio durante toda la tarea.
   - `/full`: Instruye la ampliación de la profundidad técnica, pruebas exhaustivas y documentación completa, pero **no anula** las salvaguardas de autorización ni autoriza cambios no solicitados.
5. **Evidencia verificable y no simulación:** Toda conclusión debe estar sustentada en evidencias reales obtenidas de la ejecución de pruebas (`node:test`), compilación (`tsc`, `vite build`) o inspección de archivos. Está prohibido afirmar resultados ficticios.

---

## 3. CATÁLOGO COMPLETO DE COMANDOS OPERATIVOS

### 3.1. Auditoría y Comprensión
| Comando | Propósito Operativo | Procedimiento y Entregable |
| :--- | :--- | :--- |
| `/audit` | Auditar el alcance solicitado, identificar discrepancias, fallas de persistencia, riesgos y evidencias. | Inspección de solo lectura, cotejo contra especificación y emisión de informe con matriz de hallazgos. |
| `/explain` | Explicar arquitectura, dependencias, flujo de datos o comportamiento funcional. | Análisis pedagógico y técnico citando archivos reales del repositorio. |
| `/review` | Revisar cambios, lógica de negocio, seguridad, integridad de datos y regresiones potenciales. | Auditoría de diferencias de código con evaluación de impacto en contratos existentes. |
| `/debug` | Investigar incidentes, anomalías o errores de ejecución; reproducirlos y localizar la causa raíz. | Análisis de traza de error, reproducción mediante prueba unitaria fallida y diagnóstico causal. |
| `/Razonamiento` | Proporcionar una justificación técnica estructurada, conclusiones y argumentación verificable. | Explicación formal externa sustentada en principios de ingeniería y normas agronómicas sin revelar monólogos internos privados. |

### 3.2. Desarrollo y Calidad
| Comando | Propósito Operativo | Procedimiento y Entregable |
| :--- | :--- | :--- |
| `/code` | Preparar o implementar código según la autorización expresa recibida. | Redacción de código limpio, modular, tipado y validado mediante compilación y pruebas. Requiere confirmación de alcance previo a escritura si no fue autorizado. |
| `/test` | Diseñar o ejecutar suites de pruebas automatizadas y documentar resultados reales. | Ejecución de `node --import tsx --test`, captura de salida stdout/stderr y reporte de suites aprobadas/fallidas. |
| `/refactor` | Proponer o ejecutar una refactorización controlada preservando contratos externos. | Plan de refactorización previa, aprobación del usuario, aplicación incremental y verificación de suite de no-regresión. |
| `/optimize` | Identificar y justificar mejoras de rendimiento, tamaño de paquete o mantenibilidad. | Medición de baseline, análisis de complejidad temporal/espacial, justificación técnica e implementación aprobada. |
| `/responsive-movil` | Auditar y validar diseño adaptable, ergonomía táctil y legibilidad en dispositivos Android/iOS. | Inspección de viewport, áreas táctiles mínimas (48x48px), contraste cromático y verificación en resolución móvil (e.g. 390x844). |

### 3.3. Documentación y Análisis Especializado
| Comando | Propósito Operativo | Procedimiento y Entregable |
| :--- | :--- | :--- |
| `/documentation` | Crear o actualizar documentación técnica oficial en `/docs` y artifacts. | Redacción de especificaciones, matrices de linaje, bitácoras de cambios y manuales operativos. |
| `/redteam` | Ejecutar evaluación de seguridad adversaria, análisis de amenazas y pruebas de fuzzing/inyección. | Pruebas de estrés, sanitización de entradas, prevención de CSV injection y verificación de límites físicos. |
| `/Visualize` | Representar flujos, diagramas de arquitectura, jerarquías o dependencias. | Diagramas estructurados (Mermaid, ASCII o esquemas conceptuales) que ilustran interacciones de componentes. |
| `/Investigación profunda` | Llevar a cabo una indagación técnica profunda con fuentes verificables y cotejo documental. | Revisión cruzada de estándares W3C, RFCs, normativas agrícolas o APIs web con citas rigurosas. |
| `/Estudiar` | Explicar de manera didáctica un concepto o módulo paso a paso con ejemplos y verificaciones. | Desglose modular progresivo, casos prácticos y preguntas de autocomprobación. |
| `/expert` | Abordar el requerimiento con criterio de alta especialización técnica, supuestos explícitos y límites de evidencia. | Análisis exhaustivo de nivel Senior/Staff Engineer, sopesando trade-offs, escalabilidad y resiliencia offline. |

### 3.4. Control del Alcance
| Comando | Propósito Operativo | Restricción Inmutable |
| :--- | :--- | :--- |
| `/solo lectura` | Inspeccionar, auditar y documentar sin modificar ningún archivo del repositorio. | **ESTRICTAMENTE SIN ESCRITURA.** Prohibido llamar herramientas de modificación de archivos. |
| `/full` | Desarrollar el alcance completo autorizado y documentar detalladamente actividades, pruebas y riesgos. | Profundidad máxima de cobertura sin atajos, manteniendo intactas las restricciones de autorización de cambios. |

---

## 4. COMANDOS DE PERSISTENCIA Y REGRESIÓN

El repositorio cuenta con comandos e indicadores especializados documentados en `docs/`:
- `/data-integrity`: Auditoría y validación del esquema de IndexedDB `nexocampo` v4 y consistencia de claves compuestas (`${colaborador_id}_${fecha}`).
- `/math-audit`: Verificación del banco de 16 casos matemáticos canónicos y fórmulas de rendimiento/cumplimiento.
- `/regression`: Ejecución completa del banco de pruebas (80 pruebas automatizadas) garantizando cero regresiones.
- `/pwa-audit`: Verificación de Service Worker, Background Sync, notificaciones y caché dual.
- `/security-audit`: Evaluación de seguridad legal (Ley 1581 de 2012) y protección de datos SG-SST.
- `/traceability`: Verificación de la Matriz de Trazabilidad de Requisitos (RTM) y linaje del dato.
- `/release-check`: Evaluación de las 10 compuertas de calidad pre-lanzamiento.

---

## 5. COMBINACIÓN DE COMANDOS

Los comandos pueden combinarse de manera complementaria para componer misiones operativas específicas:

- `/audit /solo lectura`: Inspección técnica integral garantizando cero alteraciones de archivos.
- `/debug /test`: Investigación profunda de una anomalía con diseño y ejecución de prueba unitaria de regresión.
- `/review /redteam`: Revisión de código bajo un enfoque adversario enfocado en vectores de explotación y fuga de datos.
- `/refactor /test /full`: Propuesta de refactorización aprobada, ejecución modular, 100% de pruebas pasando y documentación técnica exhaustiva.
- `/responsive-movil /test`: Evaluación de accesibilidad y ergonomía táctil en pantalla móvil acompañada de validación automatizada.
- `/audit /documentation /full`: Auditoría exhaustiva multidimensional con actualización completa del dossier documental.

*Regla de resolución:* Si se detecta una contradicción (por ejemplo, `/code` acompañado de `/solo lectura`), prevalece la directiva restrictiva (`/solo lectura`) y se solicita aclaración al usuario antes de modificar cualquier línea.

---

## 6. ESTRUCTURA OBLIGATORIA DE REGISTRO Y REPORTE

Cada ejecución de un comando operativo debe emitir o registrar formalmente una bitácora con los siguientes 8 puntos:

1. **Comando solicitado:** Identificador del comando y argumentos recibidos.
2. **Objetivo:** Propósito técnico concreto de la acción solicitada.
3. **Alcance:** Módulos, componentes o almacenes que abarca la operación.
4. **Skill complementaria utilizada:** Referencia explícita a `nexocampo-pwa-expert`, `nexocampo-commands` u otras aplicadas.
5. **Archivos examinados o modificados:** Lista explícita de rutas afectadas con justificación de cualquier cambio.
6. **Herramientas y pruebas utilizadas:** Comandos de terminal, suites de prueba (`node:test`), compiladores (`tsc`, `vite`) o utilidades ejecutadas.
7. **Evidencias y resultados:** Métricas exactas, capturas de texto de salida de pruebas y estado de cumplimiento.
8. **Limitaciones y autorizaciones pendientes:** Fronteras de la tarea, supuestos asumidos y pasos que requieren autorización adicional.

### Distinción de Estados Operativos:
- `[PROPUESTO]`: La acción ha sido diseñada y descrita, pendiente de autorización del usuario.
- `[INICIADO]`: La tarea cuenta con autorización y se encuentra en proceso de ejecución.
- `[EJECUTADO]`: La modificación técnica o prueba fue aplicada con éxito en el entorno.
- `[APROBADO]`: Los resultados satisfacen los criterios técnicos y cuentan con validación de calidad.
- `[VERIFICADO]`: La suite completa de no-regresión y compilación confirma la integridad del sistema.
