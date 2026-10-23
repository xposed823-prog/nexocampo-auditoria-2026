# Plan de integración y seguimiento — NexoCampo Auditoría 2026

## Objetivo
Adaptar las capacidades verificadas de `xposed823-prog/nexocampo-pwa-` al repositorio independiente `xposed823-prog/nexocampo-auditoria-2026`, conservando los datos, reglas y comportamiento funcional, pero manteniendo el destino modular en React/TypeScript.

## Límites de seguridad y alcance
- Fuente original: solo lectura. No hacer commits, pushes ni cambios en `xposed823-prog/nexocampo-pwa-`.
- Destino: trabajar en la rama `integracion-pwa-auditoria-2026`; no publicar directamente a producción ni fusionar a `main` durante la fase de auditoría.
- No copiar datos reales de colaboradores a tests, fixtures o documentos.
- No modificar `DB_VERSION`, stores o estructura de IndexedDB sin análisis de compatibilidad, migración y pruebas.
- No presentar como implementados el cifrado, hash, sincronización, restauración transaccional ni las pruebas que no se hayan verificado.
- No convertir un fallo de lectura en una lista vacía ni mostrar un falso mensaje de éxito.

## Etapas

### Etapa 0 — Línea base y mapa de dependencias
- [x] Crear rama de integración separada.
- [x] Registrar comparación inicial PWA vs Auditoría 2026.
- [x] Inventariar componentes, servicios de dominio, persistencia, exportaciones y flujos PWA.
- [ ] Registrar hashes/commits de referencia y rutas de archivos relevantes.
- [x] Ejecutar pruebas, lint/typecheck y build; guardar la salida real (98 pruebas aprobadas, lint y build correctos en el commit registrado abajo).

**Salida:** inventario verificado, riesgos y línea base de pruebas.

### Etapa 1 — Contrato de datos y reglas de negocio (P0)
- [ ] Comparar los tipos y serialización de colaboradores, labores, áreas, ausencias, jornadas y asistencia.
- [ ] Documentar diferencias entre PWA y destino; definir mapeadores solo donde sean necesarios.
- [x] Separar jornada base de los tramos productivos y vincularlos por `jornada_base_id`.
- [x] Conectar `LaboresModulo` a IndexedDB y validar solapamientos reales antes de guardar.
- [x] Probar matemáticamente varias labores consecutivas contiguas sin solapamiento real (suite automatizada); falta aceptación de interfaz Android.
- [x] Probar jornada base independiente de segmentos en la suite sintética; falta aceptación de interfaz Android.
- [x] Probar reglas de estados y exclusión de pendientes en la suite automatizada.
- [x] Implementar primera persistencia de Oficios Varios con tareas asignadas/completadas y sin estándar temporal.
- [x] Separar su porcentaje operativo del rendimiento técnico en Consulta Cruzada y Reportes.
- [ ] Probar CRUD, persistencia tras recarga y métricas con casos sintéticos.
- [x] Implementar escritura canónica de Plástico/Polisombra con subtareas que heredan horario sin campo `meta`.
- [ ] Probar que la herencia horaria no duplique minutos ni rendimiento técnico.
- [x] Comparar consulta cruzada y reportes con datos sintéticos en la suite automatizada.

**Criterio de salida:** resultados calculados coinciden con los casos de referencia y no se pierden registros.

### Etapa 2 — Backup y restauración segura (P0)
- [x] Unificar la exportación del módulo Respaldos con el servicio canónico de los seis almacenes.
- [ ] Definir metadatos explícitos: versión del formato, fecha de creación, versión de app y almacenes incluidos.
- [x] Validar formato, versión conocida, seis almacenes, IDs válidos y duplicados antes de restaurar.
- [x] Probar JSON inválido, almacén ausente, IDs inválidos/duplicados y versión no soportada en la suite; falta simular fallo real de escritura en navegador.
- [x] Aplicar la restauración en una sola transacción readwrite de los seis almacenes; un aborto de IndexedDB no confirma cambios parciales.
- [ ] Probar de forma controlada los casos de aborto y recuperación.
- [ ] Confirmar si la restauración usa una transacción atómica; si no, diseñar protección antes de implementarla.
- [ ] Implementar SHA-256 real si se necesita integridad; el hash detecta cambios, no cifra.
- [ ] Si se requiere cifrado real, definir manejo de clave y recuperación; no anunciarlo antes de implementarlo y probarlo.
- [ ] Crear prueba integral de exportar → limpiar entorno de prueba → restaurar → comparar datos en un navegador real.
- [ ] Registrar resultados y límites de compatibilidad.

**Criterio de salida:** restauración probada con fallos controlados y sin pérdida silenciosa de datos.

### Etapa 3 — Destino local, historial y formatos (P1/P2)
- [ ] Adaptar selección de carpeta cuando el navegador soporte File System Access API.
- [ ] Mantener Descargas como fallback; no prometer una ruta arbitraria en Android.
- [x] Registrar historial local de hasta 10 operaciones (fecha, destino/archivo, resultado y detalle), sin duplicar los datos respaldados.
- [ ] Probar persistencia del historial y fallback cuando localStorage no esté disponible.
- [x] Agregar exportación CSV al reporte consolidado de Auditoría 2026.
- [ ] Inventariar y completar CSV por cada informe/módulo que exista en PWA.
- [ ] Implementar PDF mediante impresión/Guardar como PDF o una generación explícita; explicar las limitaciones del navegador.
- [ ] Confirmar si Excel requiere XLSX real o si CSV satisface el flujo de trabajo; no llamar Excel a un CSV sin aclaración.

**Criterio de salida:** cada formato y destino tiene una prueba específica.

### Etapa 4 — Google Drive (P1)
- [x] Crear servicio aislado `src/domain/googleDriveBackupService.ts` y conectarlo al módulo de respaldos para copia manual.
- [ ] Separar/validar el estado de autorización y el manejo de errores mediante pruebas.
- [ ] Configurar `VITE_GOOGLE_DRIVE_CLIENT_ID` en el entorno de compilación del destino; nunca copiar secretos de forma insegura.
- [ ] Reutilizar el alcance mínimo necesario y mantener tokens en memoria cuando corresponda.
- [x] Implementar autorización, creación/reutilización de carpetas, subida y manejo de errores en el servicio aislado; la prueba real está pendiente.
- [ ] Definir si Drive es un destino de copia o sincronización; no sobrescribir datos locales de forma automática.
- [ ] Probar cancelación OAuth, token vencido, modo offline, subida interrumpida, archivo duplicado y recuperación.
- [ ] No prometer ejecución periódica con la PWA cerrada.

**Criterio de salida:** respaldo en Drive confirmado desde el despliegue real del destino, sin depender de una prueba en la PWA original.

### Etapa 5 — PWA, privacidad y experiencia Android
- [ ] Probar instalación, actualización de Service Worker y limpieza de caché sin borrar datos.
- [ ] Probar uso en modo avión, persistencia tras cerrar/abrir y reconexión.
- [ ] Revisar navegación móvil, foco, contraste, controles táctiles y formularios largos.
- [x] Retirar login/gestión multiusuario del flujo activo y mantener el modelo de supervisor único; los archivos heredados se conservan fuera del chequeo TypeScript.
- [x] Retirar datos de demostración de asistencia/incidentes y usar fechas dinámicas.
- [x] Persistir incidentes en el store de jornadas con colaborador opcional y foto opcional de máximo 3 MB.
- [x] Advertir y pedir confirmación antes de subir a Drive un JSON sin cifrar.
- [ ] Mantener datos de prueba sintéticos y documentar privacidad y manejo de respaldos.

### Etapa 6 — Aceptación y liberación controlada
- [x] Ejecutar pruebas unitarias, lint/typecheck y build: 98/98 pruebas, lint y build aprobados en el commit registrado abajo.
- [ ] Completar pruebas funcionales Android por módulo.
- [ ] Documentar bugs reproducibles con pasos, resultado esperado/real y evidencia.
- [ ] Corregir regresiones y repetir la batería de pruebas.
- [ ] Solo después de aceptación, evaluar PR/merge; la rama `main` no se modifica automáticamente.

## Registro de seguimiento

| ID | Módulo | Caso / riesgo | Estado | Evidencia | Próximo paso |
|---|---|---|---|---|---|
| NC-001 | Jornada | Varias labores consecutivas y jornada base | En curso | Suite sintética aprobada; jornada base separada de tramos y minutos efectivos | Validar guardado/recarga y horarios reales desde Android |
| NC-002 | Rendimiento | Pendientes excluidos de rendimiento técnico | En curso | Suite de dominio aprobada; pendientes excluidos de rendimiento técnico y metas pendientes no alteran el consolidado | Validar casos reales y conciliación visual en Android |
| NC-003 | Oficios Varios | 3 tareas completadas de 5 = 60%, sin minutos estándar | En curso | Suite automatizada aprobada; servicio y métrica operativa separados del rendimiento técnico | Probar CRUD y persistencia tras recarga en Android |
| NC-004 | Plástico/Polisombra | Subtarea hereda horario sin doble conteo | En curso | Suite automatizada aprobada; escritura canónica y validación de seis integrantes | Probar guardado/recarga, pendientes y reporte en Android |
| NC-005 | Consulta cruzada | Datos de asistencia, jornada y ausencia coherentes | En curso | Suite sintética aprobada; incidentes globales no se atribuyen a todos y no cuentan como jornada | Verificar datos persistidos y estados incompletos en Android |
| NC-006 | Backup | Exportación contiene los seis almacenes esperados | En curso | Validador de seis almacenes y pruebas automatizadas aprobadas; descarga real pendiente | Probar exportación y comparar contenido de los seis almacenes |
| NC-007 | Restauración | Archivo inválido/fallo no deja base parcialmente aplicada | En curso | Validación de estructura aprobada en tests; transacción única en código, no verificada con fallo real de IndexedDB | Probar restauración válida, archivo inválido y aborto controlado |
| NC-008 | Integridad | Hash SHA-256 calculado y validado | Pendiente | UI corregida: se informa que no hay hash en esta versión | Decidir si se requiere e implementar con pruebas |
| NC-009 | Cifrado | Backup realmente cifrado y clave recuperable | Pendiente | UI corregida: se informa que el JSON no está cifrado | Definir modelo de clave/recuperación antes de implementar |
| NC-010 | Google Drive | OAuth y subida desde el destino | En curso | Servicio OAuth y botón manual implementados; Client ID y autorización real pendientes | Configurar Client ID y validar origen, carpeta y subida desde Android |
| NC-011 | Local | Carpeta elegida y fallback a Descargas | Pendiente | No localizado en módulo de backup | Adaptar y probar navegador |
| NC-012 | Reportes | CSV/PDF/XLSX por módulo | En curso | CSV consolidado agregado; impresión disponible; XLSX real no implementado | Probar CSV y completar salidas faltantes |
| NC-013 | PWA/offline | Instalar, recargar, modo avión, reconectar | Pendiente | Archivos PWA presentes; todavía sin prueba funcional Android | Ejecutar prueba de aceptación en Android y documentar resultado |
| NC-014 | Incidentes | Persistencia, foto opcional y atribución correcta | En curso | Guardado y lectura desde IndexedDB; suite sintética valida que un incidente global no se atribuya a todos ni cuente como jornada | Probar formulario, recarga, adjunto y consulta desde Android |
| NC-015 | Asistencia | Semana actual lunes-domingo y fecha correcta al marcar | En curso | Matriz sin datos demo; fechas calculadas para los siete días; CI aprobado | Probar cambio de semana, guardado de todos presentes y recarga en Android |
| NC-016 | Privacidad backup | Evitar subida accidental de JSON sin cifrar | En curso | Aviso visible y confirmación antes de Google Drive; el archivo sigue sin cifrado | Definir modelo de cifrado/clave antes de habilitar respaldo cifrado |

## Evidencia de CI

- Commit validado: `a74f3c47ee5259f74dd4ec2230314a0fcac5d91f`.
- [Ejecución GitHub Actions 39884286240](https://github.com/xposed823-prog/nexocampo-auditoria-2026/actions/runs/39884286240).
- `npm test`: 98 aprobadas, 0 fallidas.
- `npm run lint`: aprobado.
- `npm run build`: aprobado.
- La instalación todavía usa `npm ci --legacy-peer-deps` por el conflicto de peer dependency entre Vite 8 y esbuild bloqueado; la alineación de dependencias/lockfile queda como deuda técnica.
- Esta evidencia no equivale a aceptación Android, OAuth ni restauración real de IndexedDB.

## Regla de estado
- **Pendiente:** todavía no probado.
- **En curso:** hay una implementación en trabajo.
- **Bloqueado:** depende de credenciales, decisión de producto o corrección previa.
- **Aprobado:** pruebas ejecutadas con evidencia registrada.
- **Rechazado:** prueba ejecutada y resultado incorrecto.

No usar “terminado” ni “PASS” basándose únicamente en comentarios, nombres de componentes o documentación.
