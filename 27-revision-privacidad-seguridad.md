# 27 — Revisión de Privacidad (Normativa Colombiana) y Seguridad Técnica
## NexoCampo 2026 — Supervisión Agrícola Offline-First

**Marco Normativo de Referencia:**
- Ley Estatutaria 1581 de 2012 (Régimen General de Protección de Datos Personales en Colombia).
- Decreto Único Reglamentario 1074 de 2015 (Capítulo 25 — Disposiciones aplicables al tratamiento de datos personales).
- Circulares e Instrucciones de la Delegatura para la Protección de Datos Personales de la Superintendencia de Industria y Comercio (SIC).
- Principios de Seguridad de la Información (Confidencialidad, Integridad y Disponibilidad — OWASP Top 10 Web Application Security).

---

### PARTE I: PRIVACIDAD Y HÁBEAS DATA (LEY 1581 DE 2012)

#### 1. Roles en el Tratamiento de Datos
- **Responsable del Tratamiento:** La empresa o entidad agropecuaria operadora de la plantación o invernaderos que contrata a los trabajadores y utiliza el sistema para la gestión laboral y liquidación de jornadas.
- **Encargado del Tratamiento:** NexoCampo 2026 en su calidad de plataforma tecnológica de registro y procesamiento de datos en campo.

#### 2. Principio de Minimización de Datos
El diseño de NexoCampo 2026 sigue una política estricta de **minimización de datos por diseño (Privacy by Design)**:
- **Datos Recopilados en Campo:** Código de empleado interno (ej. `COL-001`), alias o nombre de trabajo (ej. `Carlos Mendoza`), cuadrilla asignada, horas de inicio/fin de jornada, labor ejecutada y unidades producidas.
- **Datos Excluidos del Cliente Móvil:** No se almacenan números de identificación ciudadana (Cédulas de Ciudadanía), números de cuenta bancaria, salarios nominales, afiliaciones a seguridad social ni direcciones residenciales en los dispositivos móviles de los supervisores.
- **Manejo de Datos Sensibles (Salud e Incidentes SST):**
  - Los incidentes laborales únicamente describen el evento operativo y primeros auxilios de contingencia (ej. *"Corte superficial con alambre tensor"*).
  - El sistema **prohíbe expresamente emitir diagnósticos médicos, pronósticos clínicos o juicios de responsabilidad legal**. La información médica detallada es canalizada exclusivamente hacia la ARL a través de los canales formales de la empresa.

#### 3. Base Jurídica y Finalidades del Tratamiento
- **Base Jurídica:** Ejecución de la relación contractual laboral y cumplimiento de obligaciones legales de control de asistencia y jornadas de trabajo (Código Sustantivo del Trabajo de Colombia).
- **Finalidades Declaradas:**
  1. Monitoreo del avance de labores agronómicas en campo (poda, cosecha, entutorado, plástico y malla).
  2. Verificación de asistencia y registro de justificaciones de ausencias.
  3. Consolidación de información operativa para liquidación de jornales.
  4. Prevención de riesgos laborales y registro de incidentes en el marco del SG-SST (Sistema de Gestión de Seguridad y Salud en el Trabajo).

#### 4. Derechos de los Titulares y Procedimientos
Los colaboradores gozan de los derechos fundamentales consagrados en el artículo 8 de la Ley 1581 de 2012:
- **Conocer, actualizar y rectificar** sus registros de asistencia y producción ante inexactitudes detectadas.
- **Procedimiento de Reclamación:** A través del departamento de Gestión Humana de la empresa agrícola, con un tiempo máximo de respuesta legal de 15 días hábiles conforme al artículo 15 de la Ley 1581.

#### 5. Políticas de Conservación y Eliminación
- Los registros locales en IndexedDB se purgan de la cola de salida al confirmarse la sincronización con el servidor central.
- Los historiales agregados en el servidor se conservan durante el período legal exigido para registros de nómina y seguridad social en Colombia.

---

### PARTE II: AUDITORÍA DE SEGURIDAD TÉCNICA

#### 1. Validación en Capa de Dominio vs. Validación en UI
- **Control:** Toda entrada de datos es validada en el motor puro de dominio (`src/domain/formValidators.ts`) antes de llegar a la persistencia en IndexedDB o de enviarse por red.
- **Protección contra Datos Corruptos:** Las metas con valores negativos o cero, las horas de finalización anteriores a la hora de apertura y las cuadrillas con más de 6 integrantes son interceptadas y rechazadas a nivel lógico.

#### 2. Mitigación de Cross-Site Scripting (XSS) e Inyecciones
- **Control:** La interfaz de usuario desarrollada en React renderiza texto mediante bindings automáticos escapados (`{inc.descripcion}`, `{col.alias}`), evitando el uso de APIs inseguras como `dangerouslySetInnerHTML`.
- **Persistencia en IndexedDB:** Las consultas y búsquedas se realizan a través de índices tipados de la API estructurada de IndexedDB, eliminando la posibilidad de inyecciones SQL tradicionales en el cliente móvil.

#### 3. Fronteras de Seguridad del Almacenamiento Local
- **Advertencia Expresa:** Conforme a los principios de seguridad de OWASP, **IndexedDB no debe considerarse un entorno de almacenamiento criptográfico seguro ni una frontera de aislamiento frente a usuarios maliciosos con acceso físico o privilegios de depuración (DevTools/Root) en el dispositivo móvil**.
- **Contramedida:** La aplicación no almacena credenciales administrativas, tokens maestros ni secretos corporativos en la base de datos local del navegador.

#### 4. Integridad de los Respaldos (Backups)
- El módulo de exportación de respaldos (`descargarBackupJSON`) genera una estructura JSON estandarizada con identificador unívoco de aplicación (`appId: 'nexocampo-2026'`) y timestamp ISO.
- Antes de procesar cualquier restauración, el sistema verifica la compatibilidad del esquema, impidiendo la sobreescritura accidental de la base de datos con archivos corruptos o pertenecientes a otros sistemas.

#### 5. Configuración de Red y Encabezados HTTP
- **Endpoint `/api/sync`:** Valida que el payload contenga la estructura esperada de registros agrícolas y rechaza cuerpos malformados con código HTTP 400.
- **Service Worker:** Restringe su alcance (scope) al origen de la aplicación y utiliza estrategias de caché con aislamiento de dominios de terceros.

---

### Declaración de Alcance Técnico
Esta revisión constituye una auditoría de buenas prácticas de ingeniería de software y cumplimiento técnico de privacidad. No reemplaza un dictamen jurídico emitido por un abogado especialista en derecho informático ni un dictamen pericial de la Superintendencia de Industria y Comercio (SIC).
