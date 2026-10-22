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
- [Plan de integración y seguimiento](docs/PLAN_INTEGRACION_Y_SEGUIMIENTO.md)
- [Configuración de Google Drive](docs/GOOGLE_DRIVE_CONFIGURACION.md)

## Funcionalidades en evolución

- Registro de jornadas y tramos.
- Rendimiento y estados de labor.
- Oficios Varios.
- Plástico/Polisombra.
- Asistencia y ausencias.
- Consulta cruzada y reportes.
- Exportación/restauración de respaldo JSON e historial local.
- Copia manual a Google Drive, pendiente de configuración OAuth y prueba real.

## Comandos de verificación

Ejecutar desde un entorno con Node.js 22:

```bash
npm ci
npm test
npm run lint
npm run build
```

La rama incluye un flujo de GitHub Actions para ejecutar estas verificaciones en cada actualización de la rama de integración. No se debe afirmar que una prueba pasó hasta consultar su resultado real.

## Reglas de protección

1. No modificar el repositorio PWA original.
2. No cambiar el esquema de IndexedDB ni `DB_VERSION` sin análisis y plan de compatibilidad.
3. No copiar datos reales de colaboradores a pruebas o fixtures.
4. No afirmar que hay cifrado, hash, sincronización o restauración segura sin implementación comprobada.
5. No fusionar a `main` ni publicar a producción hasta completar las pruebas automatizadas y la aceptación funcional en Android.
