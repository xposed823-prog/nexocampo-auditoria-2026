# Comparación técnica: NexoCampo PWA vs. NexoCampo Auditoría 2026

**Fecha de revisión:** 22 de octubre de 2026  
**Repositorios revisados**
- Fuente funcional: [xposed823-prog/nexocampo-pwa-](https://github.com/xposed823-prog/nexocampo-pwa-) — rama `main`.
- Destino de evolución: [xposed823-prog/nexocampo-auditoria-2026](https://github.com/xposed823-prog/nexocampo-auditoria-2026) — rama de trabajo `integracion-pwa-auditoria-2026`.

## 1. Alcance y criterio

Esta revisión compara código y documentación disponibles en GitHub. **No equivale a una prueba ejecutada en navegador ni a una compilación local**. Las funciones descritas como existentes necesitan pruebas de aceptación en Android antes de considerarse verificadas de extremo a extremo.

La PWA original es la referencia funcional; Auditoría 2026 es el destino para adaptar y organizar capacidades. No se debe copiar el `index.html` completo ni reemplazar la arquitectura React/TypeScript del destino con el monolito original. Se portarán reglas de negocio y comportamientos de forma selectiva, conservando separación entre UI, dominio y persistencia.

## 2. Diferencias de arquitectura

| Tema | NexoCampo PWA | Auditoría 2026 | Decisión |
|---|---|---|---|
| Interfaz | `index.html` concentra HTML, CSS y lógica vanilla JS | React + TypeScript + Vite, componentes por módulo | Mantener React en el destino y adaptar por módulos |
| Persistencia | IndexedDB, DB `nexocampo`, versión 4, seis almacenes documentados | IndexedDB, DB `nexocampo`, versión 4, seis almacenes declarados | No cambiar esquema/versiones sin auditoría de compatibilidad |
| Dominio | Lógica integrada en el HTML y funciones JS existentes | Servicios TypeScript y módulos desacoplados | Portar reglas verificadas a servicios de dominio testeables |
| PWA/offline | Manifiesto y Service Worker; documentación indica operación offline-first | Manifiesto y `service-worker.js`, gestor PWA y cola de pendientes | Verificar caché, actualización y escritura offline con pruebas |
| Google Drive | Documentación de arquitectura registra OAuth y respaldo JSON a `NexoCampo/Respaldos/Global` | No se encontró integración de Drive en los archivos buscados de Auditoría 2026 | Integrar después de definir credenciales/configuración segura y pruebas |
| Pruebas | Changelog registra verificaciones estructurales y varias aceptaciones móviles pendientes | Scripts `test`, `lint` y `build` disponibles | Ejecutarlos en CI/entorno de ejecución; no afirmar PASS sin salida verificable |

## 3. Matriz funcional preliminar

Estados:
- **Presente en código:** se encontró una implementación identificable.
- **Parcial:** hay una base, pero no cubre el flujo completo descrito en la PWA.
- **No localizado:** no se encontró implementación en los archivos inspeccionados; se debe ampliar búsqueda antes de cerrar como ausencia definitiva.
- **Pendiente de prueba:** el código por sí solo no acredita el funcionamiento real.

| Función | Referencia PWA | Auditoría 2026 | Prioridad/acción |
|---|---|---|---|
| Catálogos de colaboradores, labores y áreas | Presente | Catálogos tipados disponibles | Alta: comparar registros y reglas sin exponer datos reales en pruebas |
| Registro de jornadas individuales/grupales | Presente; tramos de varias labores | Módulo de jornadas y tipos de tramos disponibles | P0: comprobar guardado, edición y varias labores consecutivas |
| Jornada general independiente de sus tramos | Regla funcional documentada en historial y arquitectura | Tipos de jornada/tramo disponibles; falta demostrar equivalencia completa | P0: casos horarios y anti-solapamiento real |
| Fórmulas de rendimiento técnico | Motor existente en PWA | Servicios/reglas y documentos matemáticos en destino | P0: pruebas comparativas con casos idénticos y resultados exactos |
| Estados Cumple/No cumple/Pendiente y exclusiones | Documentados y aplicados en PWA | Taxonomía y reglas documentadas; integración requiere pruebas | P0: asegurar que pendientes no inflen ni reduzcan rendimiento |
| Oficios Varios | Medición por tareas asignadas/completadas, sin estándar temporal | Módulo dedicado presente en imports de App | P1: verificar separación del rendimiento técnico y persistencia |
| Plástico/Polisombra grupal | Reglas de cuadrilla, herencia horaria y subtareas | Módulo y validador presentes | P0: comprobar herencia de tiempo y ausencia de doble conteo |
| Asistencia semanal independiente | Matriz de asistencia y almacén `asistencia` | Módulo y funciones atómicas/de lote presentes | P1: verificar matriz, estados, fechas y que no afecte rendimiento |
| Ausencias formales | Siete códigos documentados; almacén separado | Módulo y tipo de ausencia presentes | P1: verificar intervalos y separación de asistencia |
| Consulta cruzada colaborador-fecha | Asistencia + jornada/rendimiento + ausencia | Módulo y servicio de dominio presentes; documentación registra integración | P0: contrastar datos persistidos y casos incompletos |
| Reportes individual/general y CSV/PDF | PWA documenta PDF/impresión y exportaciones CSV de varios módulos | Reportes y botón de impresión presentes; exportaciones CSV por formato no confirmadas | P1: inventariar cada salida y completar las faltantes |
| Backup completo JSON | Exportación/importación de la base documentadas | El módulo Respaldos ahora exporta los seis almacenes canónicos; validación estricta y compatibilidad con ambos marcadores de formato implementadas en la rama | P0: ejecutar pruebas de contenido y recuperación |
| Historial de respaldos | No se confirmó como historial persistente en PWA | Historial local de hasta 10 operaciones (exportación/restauración/Drive) agregado; depende de localStorage | P2: probar persistencia y comportamiento si localStorage no está disponible |
| Destino de respaldo local configurable | Selector de carpeta y fallback a Descargas documentados en PWA | No se encontró en el módulo revisado | P1: adaptar File System Access API con fallback compatible |
| Google Drive OAuth/sincronización | Arquitectura PWA documenta integración verificada en producción | No se localizó integración en Auditoría 2026 | P1: portar por separado, sin copiar secretos ni suponer configuración OAuth |
| Restauración segura | Importación explícita en PWA | Validación previa exige los seis almacenes y una versión conocida; escritura en una sola transacción IndexedDB. Pruebas de validador añadidas, aún no ejecutadas | P0: probar archivo inválido, incompleto, incompatible y aborto de transacción |
| Cifrado/hash del backup | No se concluye aquí el detalle criptográfico del flujo PWA | La UI ya advierte que el JSON no está cifrado ni tiene hash criptográfico en esta versión | P0: decidir e implementar protección real si se requiere |
| Autenticación/usuarios | Modelo operativo esperado: supervisión local, sin cuentas por colaborador | App importa AuthProvider/LoginScreen/UserManagement | P1: revisar y alinear con el uso de supervisor único; no habilitar cuentas innecesarias |
| Incidentes y fotos | Registro de incidentes en PWA | Módulo de incidentes disponible | P2: comparar campos, severidad, áreas y adjuntos opcionales |
| Instalación y operación offline | Manifiesto/SW; fuente funcional offline-first | Manifiesto/SW y gestor PWA presentes | P0: comprobar instalación, reinicio, modo avión y actualización de caché |

## 4. Riesgos técnicos detectados

1. **No copiar la base de datos sin un mapeo.** Ambos declaran DB versión 4 y seis almacenes, pero eso no garantiza que cada registro tenga exactamente el mismo contrato, índices, cifrado o forma de serialización.
2. **No confiar en etiquetas visuales de seguridad.** En `RespaldosModulo.tsx` aparecen “JSON Cifrado Local” y “Hash SHA-256 Activo”, pero el manejador visible solo invoca una exportación JSON y descarga el archivo. Hay que rastrear las funciones subyacentes antes de afirmar cifrado o hash.
3. **Evitar restauraciones destructivas.** La restauración debe validar formato, versión, almacenes y datos antes de escribir; la recuperación ante fallo debe estar probada.
4. **No duplicar lógica matemática.** Consulta Cruzada, Reportes y visores deben consumir un servicio de dominio compartido.
5. **No asumir que la presencia de componentes significa que funcionan.** La existencia de archivos no prueba persistencia, integridad, cálculo correcto, comportamiento offline o compatibilidad móvil.
6. **No migrar datos personales reales a pruebas.** Los casos de aceptación deben usar datos sintéticos.
7. **No tocar el repositorio PWA de producción.** La integración se realiza en esta rama del repositorio alternativo.

## 5. Prioridades propuestas

### P0 — Integridad de datos y cálculos
- Confirmar contrato de IndexedDB y exportación de ambos repositorios.
- Pruebas matemáticas de jornadas, segmentos consecutivos, pendientes, metas y Oficios Varios.
- Validación robusta y recuperación de respaldo/restauración.
- Pruebas de consulta cruzada con datos completos, faltantes y errores de lectura.
- Ejecutar pruebas, TypeScript/lint y build con resultados registrados.

### P1 — Paridad operativa
- Completar formatos de exportación faltantes.
- Adaptar selector de carpeta local y fallback a Descargas.
- Diseñar e integrar Google Drive en un servicio separado, después de confirmar configuración OAuth del destino.
- Alinear autenticación al modelo real de supervisor único.

### P2 — Organización y calidad de uso
- Historial de respaldos.
- Revisar incidentes, adjuntos opcionales, controles de almacenamiento, accesibilidad y detalles de interfaz móvil.
- Documentar procedimientos de prueba y recuperación.

## 6. Criterios de aceptación

Una función no se marca como terminada solo por existir su componente. Se considera aceptada cuando:
1. pasa sus pruebas automatizadas;
2. conserva datos tras recargar la aplicación;
3. maneja errores sin reportar éxito falso;
4. no altera los resultados matemáticos de referencia;
5. funciona en móvil y, cuando aplica, sin conexión;
6. su resultado queda anotado en el registro de seguimiento.

## 7. Estado de esta revisión

- [x] Identificadas las arquitecturas y los almacenes declarados.
- [x] Localizados los módulos principales de jornadas, asistencia, ausencias, consulta, reportes y respaldos en Auditoría 2026.
- [x] Detectadas diferencias iniciales en Drive, destino local, exportaciones e historial de respaldos.
- [x] Servicio aislado de copia manual a Google Drive agregado en la rama de integración (pendiente de configuración y prueba real).\n- [x] Exportación del respaldo desde los seis almacenes canónicos, restauración transaccional con validación estricta, historial local y pruebas del validador agregadas.\n- [ ] Revisión completa función por función de los módulos y servicios.
- [ ] Ejecución real de `npm test`, `npm run lint` y `npm run build`.
- [ ] Pruebas comparativas con casos sintéticos.
- [ ] Aceptación funcional desde Android.

**Importante:** esta matriz es una línea base de inspección estática. Los estados deben actualizarse al ejecutar y comprobar cada flujo.
