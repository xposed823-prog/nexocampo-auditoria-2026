# MATRIZ DE RIESGOS TÉCNICOS, OPERATIVOS, SEGURIDAD Y PRIVACIDAD — NEXOCAMPO 2026
**Documento Técnico:** `05-riesgos.md`  
**Estado:** Evaluación Integral de Riesgos y Mitigaciones — Tarea 1 de 5  
**Proyecto:** NexoCampo 2026 (Versión Experimental e Independiente)  

---

## 1. Clasificación General de Riesgos

| ID | Riesgo | Categoría | Probabilidad | Impacto | Nivel | Estrategia de Mitigación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RT-01** | Pérdida de datos por desalojo de caché (Storage Eviction) en navegadores móviles. | Técnico | Media | Muy Alto | **Crítico** | Solicitar `navigator.storage.persist()`; copias locales periódicas en JSON con hash de integridad. |
| **RT-02** | Colisiones o inconsistencias al sincronizar lotes con conectividad intermitente. | Técnico | Alta | Alto | **Alto** | Identificadores deterministas (UUIDv4), marcas de tiempo UTC y registro de cambios append-only. |
| **RT-03** | Ciclo de vida agresivo de PWA en iOS/WebKit (reinicio inesperado tras segundo plano). | Técnico | Alta | Medio | **Medio** | Guardado inmediato de cada pulsación y cambio en IndexedDB; auto-recuperación de formularios en progreso. |
| **RO-01** | Batería agotada del dispositivo del supervisor a mitad de la jornada en campo. | Operativo | Alta | Alto | **Alto** | Interfaz optimizada en consumo de CPU (cero re-renderizados continuos a 60fps), paleta de bajo brillo y modo ahorro. |
| **RO-02** | Falla de ingreso táctil por lluvia, sudor, guantes o luminosidad extrema bajo el sol. | Operativo | Alta | Medio | **Medio** | Modo visual "Alto Contraste Solar" (fondos blancos puros y texto negro denso), botones de área táctil mínima de 48x48px. |
| **RS-01** | Exposición de datos locales si el dispositivo móvil es sustraído o extraviado. | Seguridad | Media | Alto | **Alto** | Concientizar que **IndexedDB no es un cifrado ni frontera de seguridad**; promover bloqueo de pantalla por PIN/biometría en el OS. |
| **RS-02** | Fuga de credenciales o secretos API/OAuth integrados en el código JavaScript cliente. | Seguridad | Baja | Crítico | **Crítico** | **Cero secretos en frontend**. Autenticación OAuth hacia Google Drive gestionada mediante flujo PKCE o tokens efímeros en memoria. |
| **RP-01** | Tratamiento indebido de datos personales de colaboradores sin consentimiento previo. | Privacidad | Media | Muy Alto | **Crítico** | Aplicación estricta de la Ley 1581 de 2012 y Dec. 1074 de 2015: perfiles pseudonimizados en prototipo; política de minimización. |
| **RP-02** | Captura indiscriminada de datos sensibles de salud en registros de ausencias o incidentes. | Privacidad | Media | Alto | **Alto** | En ausencias registrar únicamente la causal genérica (ej. "Incapacidad médica EPS"), nunca diagnósticos clínicos reservados. |
| **RI-01** | Infracción de propiedad intelectual o uso de dependencias con licencias incompatibles. | Legal / PI | Baja | Medio | **Medio** | Auditoría estricta de licencias de software (MIT / Apache 2.0); trazabilidad de autoría conforme a Ley 23 de 1982 y Decisión 351. |

---

## 2. Marco de Privacidad y Protección de Datos Personales

### 2.1. Referencia Normativa (Colombia)
- **Ley Estatutaria 1581 de 2012** (Régimen General de Protección de Datos Personales).
- **Decreto 1074 de 2015** (Capítulo 25 - Reglamentación del Registro Nacional de Bases de Datos).
- Circulares e instrucciones de la **Superintendencia de Industria y Comercio (SIC)**.

> **DECLARACIÓN DE NO CONFORMIDAD AUTOMÁTICA:**  
> Ningún componente de software puede autoproclamarse "100% conforme con la Ley 1581" por el simple hecho de incorporar controles técnicos. La conformidad legal exige políticas organizacionales, avisos de privacidad formales, registros institucionales ante la SIC y autorizaciones expresas del titular. Este prototipo provee las salvaguardas técnicas necesarias pero no suple el marco legal corporativo.

### 2.2. Principios de Privacidad desde el Diseño (Privacy by Design)
1. **Minimización de Datos:** En la base de datos de campo, el colaborador solo se referencia por un código funcional (`COL-015`) y su alias operativo. No se almacenan números de cuenta bancaria, direcciones residenciales ni datos de familiares.
2. **Datos Sensibles:** La información médica derivada de incidentes o ausencias goza de protección reforzada. El módulo de ausencias clasifica las novedades en categorías abstractas sin requerir historial médico confidencial.
3. **Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición):** El sistema contará con utilidades de consulta consolidada y rectificación de asignaciones ante reclamos de los trabajadores.
4. **Ciclo de Retención:** Los datos de asistencia y rendimiento local deben depurarse del dispositivo móvil una vez consolidada la copia de seguridad histórica y transmitida a los registros corporativos.

---

## 3. Seguridad de la Aplicación y Controles OWASP

Siguiendo las pautas de **OWASP ASVS (Application Security Verification Standard v4.0)** y **OWASP Top 10**:

1. **Prevención de Inyecciones y Cross-Site Scripting (XSS):**
   - Todos los inputs del supervisor (nombres de lotes, notas de novedad) son sanitizados antes de persistir o renderizar.
   - Prohibido el uso de `dangerouslySetInnerHTML` o `eval()`.
2. **Gestión de Secretos:**
   - La aplicación jamás incluirá claves maestras, contraseñas de bases de datos o client-secrets en archivos `.js`, `.ts` o `manifest.json`.
   - Las variables en `.env.example` son únicamente públicas o descriptivas.
3. **Auditoría e Integridad de Respaldos:**
   - Toda exportación de datos genera un hash criptográfico **SHA-256** empacado dentro del JSON. Al importar, el sistema recalcula el hash para verificar que el archivo no fue manipulado ni sufrió corrupción en el almacenamiento.

---

## 4. Propiedad Intelectual y Gestión de Licencias

En cumplimiento de la **Ley 23 de 1982** de Colombia y la **Decisión Andina 351 de 1993** (Régimen Común sobre Derecho de Autor y Conexos):

1. **Inventario de Dependencias de Terceros:**
   - React 19 / ReactDOM: Licencia MIT.
   - Tailwind CSS: Licencia MIT.
   - Lucide React (iconografía): Licencia ISC / MIT.
   - TSX / TypeScript: Apache 2.0.
2. **Recursos de Inteligencia Artificial:**
   - No se declarará que ningún código o recurso gráfico generado mediante modelos de lenguaje está automáticamente exento de derechos o libre de examen; todo desarrollo se audita como obra experimental derivada sujeta a revisión humana.
3. **Respeto a la Obra Preexistente:**
   - Al no tener acceso al código fuente del repositorio original de NexoCampo, no se produce plagio, copia literal ni ingeniería inversa de código propietario; este prototipo es una arquitectura limpia e independiente.
