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
- [ ] Inventariar componentes, servicios de dominio, persistencia, exportaciones y flujos PWA.
- [ ] Registrar hashes/commits de referencia y rutas de archivos relevantes.
- [ ] Ejecutar pruebas, lint/typecheck y build; guardar la salida real.

**Salida:** inventario verificado, riesgos y línea base de pruebas.

### Etapa 1 — Contrato de datos y reglas de negocio (P0)
- [ ] Comparar los tipos y serialización de colaboradores, labores, áreas, ausencias, jornadas y asistencia.
- [ ] Documentar diferencias entre PWA y destino; definir mapeadores solo donde sean necesarios.
- [ ] Probar jornadas con varias labores consecutivas sin solapamiento real.
- [ ] Probar jornada base independiente de los segmentos y descansos.
- [ ] Probar Cumple, No cumple, Pendiente y estados de calidad.
- [ ] Probar que Oficios Varios usa tareas asignadas/completadas y no rendimiento temporal.
- [ ] Probar que Plástico/Polisombra hereda horarios sin doble contabilización.
- [ ] Comparar consulta cruzada y reportes usando datos sintéticos.

**Criterio de salida:** resultados calculados coinciden con los casos de referencia y no se pierden registros.

### Etapa 2 — Backup y restauración segura (P0)
- [ ] Unificar la exportación en un servicio de dominio, evitando dos implementaciones divergentes.
- [ ] Definir metadatos explícitos: versión del formato, fecha de creación, versión de app y almacenes incluidos.
- [ ] Validar estructura y versión antes de restaurar.
- [ ] Probar JSON inválido, almacén ausente, datos malformados, versión no soportada y escritura fallida.
- [ ] Asegurar copia preventiva y estrategia de recuperación verificable antes de reemplazar datos.
- [ ] Confirmar si la restauración usa una transacción atómica; si no, diseñar protección antes de implementarla.
- [ ] Implementar SHA-256 real si se necesita integridad; el hash detecta cambios, no cifra.
- [ ] Si se requiere cifrado real, definir manejo de clave y recuperación; no anunciarlo antes de implementarlo y probarlo.
- [ ] Crear pruebas de exportar → borrar/limpiar entorno de prueba → restaurar → comparar datos.
- [ ] Registrar resultados y límites de compatibilidad.

**Criterio de salida:** restauración probada con fallos controlados y sin pérdida silenciosa de datos.

### Etapa 3 — Destino local, historial y formatos (P1/P2)
- [ ] Adaptar selección de carpeta cuando el navegador soporte File System Access API.
- [ ] Mantener Descargas como fallback; no prometer una ruta arbitraria en Android.
- [ ] Registrar un historial local de metadatos de respaldo (fecha, destino, tamaño, resultado y versión), sin duplicar datos sensibles.
- [ ] Inventariar y completar CSV para los informes que existen en PWA.
- [ ] Implementar PDF mediante impresión/Guardar como PDF o una generación explícita; explicar las limitaciones del navegador.
- [ ] Confirmar si Excel requiere XLSX real o si CSV satisface el flujo de trabajo; no llamar Excel a un CSV sin aclaración.

**Criterio de salida:** cada formato y destino tiene una prueba específica.

### Etapa 4 — Google Drive (P1)
- [ ] Separar Drive en un servicio independiente de los componentes visuales.
- [ ] Revisar cómo se proporciona el OAuth Client ID en el entorno de despliegue del destino; nunca copiar secretos de forma insegura.
- [ ] Reutilizar el alcance mínimo necesario y mantener tokens en memoria cuando corresponda.
- [ ] Implementar autorización, creación/reutilización de carpetas, subida, listado/estado y manejo de errores.
- [ ] Definir si Drive es un destino de copia o sincronización; no sobrescribir datos locales de forma automática.
- [ ] Probar cancelación OAuth, token vencido, modo offline, subida interrumpida, archivo duplicado y recuperación.
- [ ] No prometer ejecución periódica con la PWA cerrada.

**Criterio de salida:** respaldo en Drive confirmado desde el despliegue real del destino, sin depender de una prueba en la PWA original.

### Etapa 5 — PWA, privacidad y experiencia Android
- [ ] Probar instalación, actualización de Service Worker y limpieza de caché sin borrar datos.
- [ ] Probar uso en modo avión, persistencia tras cerrar/abrir y reconexión.
- [ ] Revisar navegación móvil, foco, contraste, controles táctiles y formularios largos.
- [ ] Revisar autenticación del prototipo frente al modelo operativo de supervisor único; no crear cuentas por colaborador sin necesidad.
- [ ] Mantener datos de prueba sintéticos y documentar privacidad y manejo de respaldos.

### Etapa 6 — Aceptación y liberación controlada
- [ ] Ejecutar pruebas unitarias, lint/typecheck y build.
- [ ] Completar pruebas funcionales Android por módulo.
- [ ] Documentar bugs reproducibles con pasos, resultado esperado/real y evidencia.
- [ ] Corregir regresiones y repetir la batería de pruebas.
- [ ] Solo después de aceptación, evaluar PR/merge; la rama `main` no se modifica automáticamente.

## Registro de seguimiento

| ID | Módulo | Caso / riesgo | Estado | Evidencia | Próximo paso |
|---|---|---|---|---|---|
| NC-001 | Jornada | Varias labores consecutivas y jornada base | Pendiente | Sin prueba ejecutada | Crear fixture sintético y test |
| NC-002 | Rendimiento | Pendientes excluidos de rendimiento técnico | Pendiente | Regla documentada; falta corrida | Añadir/ejecutar pruebas de dominio |
| NC-003 | Oficios Varios | 3 tareas completadas de 5 = 60%, sin minutos estándar | Pendiente | Reglas documentadas | Verificar servicio y reporte |
| NC-004 | Plástico/Polisombra | Subtarea hereda horario sin doble conteo | Pendiente | Módulo y validador localizados | Pruebas de guardado y cálculo |
| NC-005 | Consulta cruzada | Datos de asistencia, jornada y ausencia coherentes | Pendiente | Servicio localizado | Probar registros completos/incompletos |
| NC-006 | Backup | Exportación contiene los seis almacenes esperados | Pendiente | Exportaciones localizadas | Comparar payload y stores |
| NC-007 | Restauración | Archivo inválido/fallo no deja base parcialmente aplicada | Pendiente | Garantía transaccional no demostrada | Inspeccionar implementación y probar |
| NC-008 | Integridad | Hash SHA-256 calculado y validado | Pendiente | Etiqueta UI sin prueba suficiente | Rastrear/implementar |
| NC-009 | Cifrado | Backup realmente cifrado y clave recuperable | Pendiente | Etiqueta UI sin prueba suficiente | Definir modelo antes de afirmar |
| NC-010 | Google Drive | OAuth y subida desde el destino | Pendiente | No localizado en búsqueda inicial | Diseñar integración aislada |
| NC-011 | Local | Carpeta elegida y fallback a Descargas | Pendiente | No localizado en módulo de backup | Adaptar y probar navegador |
| NC-012 | Reportes | CSV/PDF/XLSX por módulo | Pendiente | Impresión localizada; formatos incompletos/no verificados | Inventario de salidas |
| NC-013 | PWA/offline | Instalar, recargar, modo avión, reconectar | Pendiente | Archivos PWA presentes | Ejecutar en Android |

## Regla de estado
- **Pendiente:** todavía no probado.
- **En curso:** hay una implementación en trabajo.
- **Bloqueado:** depende de credenciales, decisión de producto o corrección previa.
- **Aprobado:** pruebas ejecutadas con evidencia registrada.
- **Rechazado:** prueba ejecutada y resultado incorrecto.

No usar “terminado” ni “PASS” basándose únicamente en comentarios, nombres de componentes o documentación.
