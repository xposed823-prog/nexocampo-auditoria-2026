# Auditoría experta de estabilidad, limpieza y UX — NexoCampo Auditoría 2026

**Fecha:** 2026-11-01  
**Rama:** `integracion-pwa-auditoria-2026`  
**Alcance:** revisión estática del código y cambios de presentación en el repositorio alternativo.  
**No es:** certificación de build, pruebas de navegador, aceptación Android ni prueba de restauración de datos.

## Principio de seguridad

- No se modifica el repositorio original `xposed823-prog/nexocampo-pwa-`.
- No se elimina ni migra IndexedDB, catálogos, fórmulas, datos ni módulos operativos en esta fase.
- Las modificaciones visuales no deben cambiar los contratos de persistencia o reglas de negocio.
- El backend remoto no está configurado. La conectividad a internet no se debe presentar como sincronización.

## Hallazgos priorizados

### P0 — No declarar estabilidad hasta resolver/verificar

1. **Dos subsistemas de persistencia**: la base de negocio canónica (`src/domain/nexocampoDB.ts`, DB `nexocampo`, versión 4) y el subsistema PWA/Outbox (`@/js/db.js`) operan separados. Antes de integrar sincronización hay que mapear entidades, evitar duplicados y diseñar migración/Outbox. No unificar ni cambiar versión de DB a ciegas.
2. **Sin API de sincronización real**: el endpoint de desarrollo devuelve 501. La cola no debe limpiarse ni marcarse como sincronizada sin confirmación completa del backend.
3. **Cifrado heredado pendiente**: persiste una clave maestra embebida para lectura de registros antiguos y la clave heredada se puede guardar en localStorage. No afirmar seguridad criptográfica completa hasta migrar registros, verificar lectura y retirar compatibilidad heredada sin pérdida.
4. **CI no confirmado en los últimos cambios**: los últimos commits visuales no tienen un estado de Actions visible desde esta revisión. No se afirma que tests, TypeScript, npm audit o build estén aprobados.
5. **Backend Express prototipo en memoria**: el archivo `server.js` almacenaba sincronizaciones solo en RAM y devolvía éxito; un reinicio podía perder datos después de que el cliente vaciara su cola. El endpoint ahora responde 501 hasta contar con persistencia durable, autenticación e idempotencia.
6. **Prueba de regresión del endpoint**: se añadió `src/domain/serverSync.test.ts` para exigir que el backend no confirme sincronización mientras siga deshabilitado.
5. **Aceptación real en Android pendiente**: no se han comprobado interacción táctil, teclado, scroll, instalación, modo offline, contraste ni restauración desde un navegador móvil real.

### P1 — UX / precisión visual

1. La home repetía tres accesos que ya estaban presentes en el grid de cuatro tarjetas.
2. Un botón flotante de campana llevaba a Administración, duplicando el destino de navegación y el indicador de pendientes del encabezado.
3. El panel PWA incluía un simulador de registro de prueba, afirmaciones de “cero pérdida”, servidor Express, sincronización y explorador de archivos de producción que no representaban el estado real del backend.
4. El CSS global mezclaba fondos, bordes, colores y sombras de distintas pantallas. La apariencia no era uniforme entre claro y oscuro.
5. La barra inferior contiene seis destinos. Se conserva para no quitar rutas; se debe probar en 320–360 px y revisar si la etiqueta Asistencia cabe sin truncamiento.

### P2 — Calidad documental / herramientas internas

1. Los informes antiguos contienen estados como “Certificado” y cifras históricas de tests. Son documentos de referencia, no evidencia de que el commit actual esté validado.
2. El laboratorio matemático contiene indicadores estáticos de aprobación; deben etiquetarse como históricos/de demostración, no como CI.
3. No retirar documentación o laboratorio hasta separar los recursos de auditoría de la interfaz operativa.

## Cambios realizados en esta intervención

- Eliminado el botón flotante redundante de campana/Administración; la cola sigue disponible en el encabezado.
- Retirados los tres accesos rápidos duplicados de Inicio. Se conserva el grid de acceso principal.
- Unificado el sistema visual mediante tokens verde agrícola, superficies, contraste, inputs y paneles diferenciados para claro/oscuro.
- Simplificado el panel PWA: quitado el simulador de registros ficticios, el inspector de código de ocho archivos y las afirmaciones no verificadas sobre backend.
- El endpoint Express de sincronización quedó cerrado por defecto (HTTP 501) y se agregó prueba de regresión para evitar confirmaciones falsas.
- El panel PWA ahora informa claramente que:
  - internet disponible no equivale a sincronización;
  - no hay backend remoto configurado;
  - la cola local vacía no demuestra que datos hayan llegado a un servidor;
  - se conserva el acceso a refrescar cola, notificaciones y exportar JSON.
- Eliminados de `App.tsx` los estados, callbacks e imports ligados al formulario de prueba offline.
- Eliminados imports y estado del shell que no tenían uso.
- Retirados los badges estáticos “46/46 PASS” y “Test OK” en Administración/Laboratorio; ahora se distinguen los casos documentados de los resultados de CI.
- Eliminada la exportación de respaldo duplicada desde el panel PWA; se remite a Administración → Respaldos, que es la vía canónica.

## Elementos que se conservaron deliberadamente

- Navegación de seis destinos y módulos de operación.
- Jornada, labores, Oficios Varios, Plástico/Polisombra, asistencia, ausencias, incidentes, consulta, reportes, respaldo y administración.
- Catálogos y fórmulas de negocio.
- IndexedDB versión 4 y su esquema actual.
- Service Worker, manifest y funciones de respaldo.
- Cifrado heredado de lectura, mientras no exista una migración de datos verificada.

## Verificación que falta antes de fusionar o publicar

En GitHub Actions o en un entorno Node 22 limpio, ejecutar:

```bash
npm ci --legacy-peer-deps
npm audit --audit-level=high
npm test
npm run lint
npm run build
```

Luego probar desde Android:
- 320 px y 360 px; modo claro y oscuro.
- Todas las seis rutas de navegación y las rutas internas.
- Formularios, selección de colaboradores, teclado numérico y scroll.
- Guardar, recargar y volver a abrir jornadas, asistencia, ausencias e incidentes.
- Exportar y restaurar respaldo JSON con datos sintéticos; comprobar rollback si falla.
- Abrir la PWA instalada y usarla sin conexión.
- Confirmar que un error de red no elimina registros ni muestra “sincronizado”.
- Confirmar que Google Drive/OAuth solo se declara operativo tras prueba real.

## Dictamen

**Estado: mejora visual y limpieza parcial aplicada; estabilidad integral aún no certificada.**

La base no requiere borrarse y reconstruirse. El camino de menor riesgo es seguir con correcciones incrementales, proteger datos y cerrar los bloqueos P0 mediante pruebas verificables.
