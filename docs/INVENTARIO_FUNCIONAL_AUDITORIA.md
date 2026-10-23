# Inventario funcional de Auditoría 2026

**Estado:** inspección estática del código en la rama `integracion-pwa-auditoria-2026`. No se han ejecutado pruebas en navegador ni se ha confirmado cada flujo en Android.

| Módulo/archivo | Persistencia encontrada | Hallazgo actual | Trabajo necesario |
|---|---|---|---|
| `JornadasModulo.tsx` | Primera implementación canónica en esta rama, pendiente de prueba | Fecha dinámica y selección de colaboradores; guarda un tramo `jornada_base` con ventana y minutos efectivos, vinculado por `jornada_base_id`. Ya no se guarda como labor productiva. | Probar jornada base única, cálculo 475 min, recarga y relación con labores posteriores. |
| `LaboresModulo.tsx` | Primera persistencia canónica implementada en esta rama, pendiente de prueba | Se eliminaron los tres tramos de demostración; la línea de tiempo carga jornadas guardadas, agrega tramos por colaborador/fecha y valida solapamientos reales. Los estados Cumple/Pendiente/No cumple tienen validación básica. | Probar varios tramos contiguos, solapamiento real, recarga y reglas de rendimiento. |
| `OficiosVariosModulo.tsx` + `oficiosVariosService.ts` | Implementada en esta rama, pendiente de prueba | Ahora usa el almacén `labores` para los tres tipos iniciales y permite crear/editar/desactivar tipos; guarda los registros en `jornadas` con `modelo: oficios_varios`, muestra el historial local y separa cumplimiento de tareas del rendimiento técnico. | Ejecutar pruebas; comprobar CRUD, persistencia tras recarga, Consulta Cruzada y Reportes en Android. |
| `PlasticoModulo.tsx` + `App.tsx` | Primera escritura canónica implementada en esta rama, pendiente de prueba | El formulario ya construye una jornada con labor principal y subtareas 30%/65%, guarda en IndexedDB y hereda el horario a subtareas sin añadir `meta` en ellas. Se quitaron los datos de demostración y se exige una cuadrilla de seis. | Ejecutar pruebas de validación, guardado/recarga, saldo pendiente, consulta y reporte; confirmar que no se duplica el tiempo. |
| `AsistenciaModulo.tsx` + `App.tsx` | Sí, usa `guardarAsistenciaAtomica` y `guardarLoteAsistencia` | La matriz inicia sin datos de demostración; la semana y las fechas se calculan dinámicamente de lunes a domingo. El botón de marcar presentes usa la fecha real. | Validar persistencia, cambio de semana y estados en Android; no afectar rendimiento. |
| `AusenciasModulo.tsx` | Sí, usa `dbGetAll` y `guardarAusenciaRegistro` | Fechas dinámicas, validación de rango y motivo administrativo sin diagnóstico clínico precargado. | Validar siete códigos, intervalos, persistencia tras recarga y refresco después de restaurar. |
| `ConsultaCruzadaModulo.tsx` | Sí, consume `consultaDominioService` | Se conecta a la consulta de dominio; el catálogo de colaboradores que recibe procede del catálogo importado. | Comparar resultados con PWA para jornada, asistencia, ausencia y datos incompletos. |
| `ReportesModulo.tsx` | Sí, consume `consultaDominioService` | Consulta datos vivos, imprime y dispone de exportación CSV consolidada. XLSX real no está implementado y PDF depende de impresión del navegador. | Probar CSV y completar salidas por módulo; aclarar CSV frente a Excel y probar PDF en Android. |
| `IncidentesModulo.tsx` + `App.tsx` | Primera persistencia canónica implementada en esta rama | Guarda incidentes como tramos `tipo: incidente` dentro de `jornadas`; carga el historial de IndexedDB, fecha/hora del evento, severidad, primeros auxilios, colaborador opcional y foto opcional hasta 3 MB. No exige hora final. | Probar guardado/recarga, adjunto, incidente global sin atribuirlo a todos los colaboradores y reporte. |
| `AdminModulo.tsx` | No encontrada para catálogos | Filtra y presenta arrays importados de `catalogoAgronomico`; no se encontraron escrituras para editar/crear/desactivar colaboradores, labores o áreas. | Portar CRUD del catálogo de PWA a IndexedDB y preservar identificadores e historial. |
| `RespaldosModulo.tsx` | Sí, conectada al servicio canónico | Exporta/restaura seis almacenes con validación, historial local y servicio de copia manual a Google Drive. Drive requiere Client ID y autorización real. El JSON no tiene cifrado ni hash SHA-256 verificados. | Probar restauración transaccional real, historial, configuración OAuth y copia desde Android. |
| `PwaSyncModulo.tsx` + `pwaManager.ts` | Cola local secundaria | La cola IndexedDB guarda registros de prueba; el fallback de sincronización hace POST a `/api/sync`. No se ha localizado el backend correspondiente en esta revisión. | No asumir sincronización remota funcional hasta confirmar endpoint/deploy; separar cola de prueba del flujo operativo real. |
| Autenticación heredada (`src/components/auth`, `authService`) | No forma parte del flujo activo de la app | El login y la administración multiusuario se retiraron del punto de entrada para respetar el modelo de supervisor único; los archivos heredados permanecen fuera del chequeo TypeScript. No se crean cuentas para colaboradores. | Decidir si se necesita un mecanismo de acceso de supervisor independiente antes de recuperar cualquier autenticación. |

## Hallazgos de alta prioridad

1. **Persistencia operativa:** Oficios Varios, Plástico/Polisombra e incidentes escriben en IndexedDB. La suite automatizada valida reglas de dominio; falta la aceptación real de recarga/navegador Android.
2. **Datos de demostración:** se retiraron los valores precargados de la matriz de asistencia y del listado inicial de incidentes. Debe hacerse una inspección final de todos los formularios.
3. **Fechas:** jornada, labores, ausencias, incidentes, asistencia y consulta usan fechas dinámicas; revisar otros formularios secundarios.
4. **Catálogos estáticos:** la vista Admin no es aún un editor persistente de catálogos.
5. **Sincronización remota sin backend confirmado:** la cola local no prueba que el POST a `/api/sync` tenga un destino funcional.
6. **Respaldo:** las pruebas automatizadas pasan; falta probar descarga/restauración real en navegador. El hash SHA-256 y el cifrado del archivo no están implementados/confirmados.

## Orden recomendado para la siguiente fase

1. Ejecutar `npm test`, `npm run lint` y `npm run build`; corregir errores de compilación primero.
2. Ejecutar pruebas de Plástico/Polisombra y Oficios Varios; corregir cualquier regresión antes de avanzar con incidentes.
3. Eliminar falsos éxitos y persistir incidentes.
4. Corregir fechas y matriz de asistencia.
5. Habilitar CRUD persistente de catálogos.
6. Completar formatos de reportes y selector de carpeta local.
7. Validar Google Drive en el dominio real.
8. Probar todo en Android y documentar evidencia.

## Evidencia de validación automatizada

- Rama: `integracion-pwa-auditoria-2026`
- Commit validado: `91983e607205ba587df820bd79aeb90b5a48cebc`
- GitHub Actions: [ejecución 39884286240](https://github.com/xposed823-prog/nexocampo-auditoria-2026/actions/runs/39884286240)
- Resultado: `npm test` — 98/98 pruebas aprobadas; `npm run lint` — aprobado; `npm run build` — aprobado.
- Limitación: esto no sustituye pruebas de IndexedDB, OAuth ni interfaz en Android. La instalación usa `npm ci --legacy-peer-deps` por el conflicto declarado entre Vite 8 y la versión de esbuild bloqueada; queda pendiente alinear dependencias y lockfile.

No se debe marcar ningún módulo como funcional completo hasta completar su prueba de aceptación.
