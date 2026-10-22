# Inventario funcional de Auditoría 2026

**Estado:** inspección estática del código en la rama `integracion-pwa-auditoria-2026`. No se han ejecutado pruebas en navegador ni se ha confirmado cada flujo en Android.

| Módulo/archivo | Persistencia encontrada | Hallazgo actual | Trabajo necesario |
|---|---|---|---|
| `JornadasModulo.tsx` | Sí, usa `guardarJornadaRegistro` y lee `jornadas` | Guarda una jornada, pero inicia con fecha fija y asigna un grupo fijo de colaboradores. El formulario principal no sustituye aún el registro completo de varias labores consecutivas de la PWA. | Usar fecha actual/seleccionable, selección real de colaboradores y segmentos; probar que jornada y tramos no se solapen indebidamente. |
| `LaboresModulo.tsx` | No encontrada en el módulo | La línea de tiempo comienza con tres tramos precargados en estado React; añadir una labor solo actualiza la vista y calcula resultados. | Conectar el flujo con el modelo canónico de jornadas/labores o dejar explícito que es un simulador; no presentar el toast como persistencia. |
| `OficiosVariosModulo.tsx` + `oficiosVariosService.ts` | Implementada en esta rama, pendiente de prueba | Ahora usa el almacén `labores` para los tres tipos iniciales y permite crear/editar/desactivar tipos; guarda los registros en `jornadas` con `modelo: oficios_varios`, muestra el historial local y separa cumplimiento de tareas del rendimiento técnico. | Ejecutar pruebas; comprobar CRUD, persistencia tras recarga, Consulta Cruzada y Reportes en Android. |
| `PlasticoModulo.tsx` | No encontrada en el componente | El botón “Guardar Registro en IndexedDB” solo muestra un toast de éxito. La información vive en estado de React y algunos valores iniciales son de demostración. | Conectar con `guardarJornadaRegistro`, registrar integrantes/ubicación/cantidad/completados/condiciones y subtareas con horario heredado; solo confirmar éxito tras transacción. |
| `AsistenciaModulo.tsx` + `App.tsx` | Sí, usa `guardarAsistenciaAtomica` y `guardarLoteAsistencia` | La matriz contiene datos iniciales de ejemplo y usa fechas codificadas en octubre de 2026; el cálculo de fechas no está basado en la semana seleccionada. | Empezar con celdas sin registro, calcular lunes-domingo/seis días según regla acordada y generar fechas ISO reales; no afectar rendimiento. |
| `AusenciasModulo.tsx` | Sí, usa `dbGetAll` y `guardarAusenciaRegistro` | Tiene persistencia, pero el formulario usa fechas iniciales fijas; hay que validar recarga y rangos. | Reemplazar defaults fijos, probar siete códigos, intervalos y refresco tras restauración. |
| `ConsultaCruzadaModulo.tsx` | Sí, consume `consultaDominioService` | Se conecta a la consulta de dominio; el catálogo de colaboradores que recibe procede del catálogo importado. | Comparar resultados con PWA para jornada, asistencia, ausencia y datos incompletos. |
| `ReportesModulo.tsx` | Sí, consume `consultaDominioService` | Consulta datos vivos y permite impresión; no se ha confirmado un menú completo de CSV/PDF/XLSX equivalente al de la PWA. | Añadir exportaciones específicas y probar cálculos por periodo/cuadrilla. |
| `IncidentesModulo.tsx` + `App.tsx` | No encontrada | El listado inicial es un arreglo en memoria; el formulario actualiza estado local, no el almacén canónico. | Definir persistencia compatible sin crear un nuevo store sin análisis; se puede registrar como tramo de tipo incidente si el contrato se valida. |
| `AdminModulo.tsx` | No encontrada para catálogos | Filtra y presenta arrays importados de `catalogoAgronomico`; no se encontraron escrituras para editar/crear/desactivar colaboradores, labores o áreas. | Portar CRUD del catálogo de PWA a IndexedDB y preservar identificadores e historial. |
| `RespaldosModulo.tsx` | Sí, recién conectada al servicio canónico | La rama de integración ahora exporta seis almacenes, restaura con validación estricta, registra historial local y dispone de copia manual a Drive condicionada a OAuth. | Pruebas automatizadas y aceptación móvil/OAuth pendientes. |
| `PwaSyncModulo.tsx` + `pwaManager.ts` | Cola local secundaria | La cola IndexedDB guarda registros de prueba; el fallback de sincronización hace POST a `/api/sync`. No se ha localizado el backend correspondiente en esta revisión. | No asumir sincronización remota funcional hasta confirmar endpoint/deploy; separar cola de prueba del flujo operativo real. |
| `AuthProvider`, `LoginScreen`, `UserManagement` | Estado de autenticación del prototipo | La arquitectura incluye login y administración de usuarios. | Revisar alcance para el modelo de supervisor único; no crear cuentas individuales para colaboradores sin requerimiento. |

## Hallazgos de alta prioridad

1. **Toast de éxito sin persistencia:** se detectó en Oficios Varios y Plástico/Polisombra; son falsos positivos funcionales.
2. **Datos de demostración:** la línea de tiempo de labores, la matriz de asistencia y el listado inicial de incidentes contienen valores precargados.
3. **Fechas codificadas:** varios flujos usan `2026-10-19` u otras fechas fijas. Deben convertirse a fechas seleccionables/dinámicas según el flujo.
4. **Catálogos estáticos:** la vista Admin no es aún un editor persistente de catálogos.
5. **Sincronización remota sin backend confirmado:** la cola local no prueba que el POST a `/api/sync` tenga un destino funcional.
6. **Respaldo:** el módulo ya fue corregido en esta rama para usar los almacenes canónicos; la corrección todavía necesita ejecución de pruebas.

## Orden recomendado para la siguiente fase

1. Ejecutar `npm test`, `npm run lint` y `npm run build`; corregir errores de compilación primero.
2. Conectar Plástico/Polisombra a persistencia canónica; Oficios Varios ya tiene una primera implementación que requiere pruebas.
3. Eliminar falsos éxitos y persistir incidentes.
4. Corregir fechas y matriz de asistencia.
5. Habilitar CRUD persistente de catálogos.
6. Completar formatos de reportes y selector de carpeta local.
7. Validar Google Drive en el dominio real.
8. Probar todo en Android y documentar evidencia.

No se debe marcar ningún módulo como funcional completo hasta completar su prueba de aceptación.
