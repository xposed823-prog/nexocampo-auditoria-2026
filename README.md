# NexoCampo Auditoría 2026

Repositorio alternativo para organizar, verificar y evolucionar módulos de NexoCampo sin modificar la aplicación PWA original.

> **Principio de trabajo:** NexoCampo no se reconstruye. NexoCampo se evoluciona.

## Repositorios

- **Fuente funcional de referencia:** [`xposed823-prog/nexocampo-pwa-`](https://github.com/xposed823-prog/nexocampo-pwa-)
- **Repositorio de auditoría y evolución:** este repositorio.

La PWA original se inspecciona en modo de solo lectura. Los cambios de esta fase se hacen en la rama `integracion-pwa-auditoria-2026`, no directamente en `main`.

## Arquitectura del destino

- React + TypeScript + Vite.
- Interfaz organizada por módulos en `src/components`.
- Reglas y persistencia en `src/domain`.
- IndexedDB local con seis almacenes declarados: `colaboradores`, `labores`, `areas`, `ausencias`, `jornadas` y `asistencia`.
- Manifiesto PWA y Service Worker.
- Pruebas de dominio con `tsx --test src/domain/*.test.ts`.

La aplicación alternativa no debe recibir una copia monolítica de `index.html`. Se adaptan reglas y flujos específicos a los servicios y componentes existentes.

## Documentación de integración

- [Comparación PWA vs. Auditoría 2026](docs/COMPARACION_PWA_VS_AUDITORIA_2026.md)
- [Inventario funcional por módulo](docs/INVENTARIO_FUNCIONAL_AUDITORIA.md)
- [Plan de integración y seguimiento](docs/PLAN_INTEGRACION_Y_SEGUIMIENTO.md)
- [Configuración de Google Drive](docs/CONFIGURACION_GOOGLE_DRIVE.md)

## Funcionalidades en evolución

- Jornadas base y tramos de labores, con separación de tiempos y validación de solapamientos.
- Rendimiento técnico y estados de labor; los trabajos pendientes no deben incrementar el rendimiento del día.
- Oficios Varios medido por tareas asignadas/completadas, sin inventar un estándar temporal.
- Plástico/Polisombra con cuadrilla de seis, subtareas y herencia horaria.
- Asistencia, ausencias, consulta cruzada e incidentes con persistencia local implementada en la rama.
- Respaldo y restauración JSON, historial local y copia manual a Google Drive.
- Exportación CSV consolidada; XLSX real no implementado y PDF mediante impresión del navegador.

La presencia de código no equivale a aceptación funcional. Las pruebas en Android, la restauración real en navegador y el flujo OAuth de Drive continúan pendientes de aceptación.

## Comandos de verificación

Ejecutar desde un entorno con Node.js 22:

```bash
npm ci --legacy-peer-deps
npm test
npm run lint
npm run build
```

La rama incluye un flujo de GitHub Actions para ejecutar estas verificaciones en cada actualización de la rama de integración. El uso de `--legacy-peer-deps` es una solución temporal documentada mientras se resuelve la compatibilidad de dependencias.

## Reglas de protección

1. No modificar el repositorio PWA original.
2. No cambiar el esquema de IndexedDB ni `DB_VERSION` sin análisis y plan de compatibilidad.
3. No copiar datos reales de colaboradores a pruebas o fixtures.
4. No afirmar que hay cifrado, hash, sincronización o restauración segura sin implementación comprobada.
5. No fusionar a `main` ni publicar a producción hasta completar las pruebas automatizadas y la aceptación funcional en Android.
