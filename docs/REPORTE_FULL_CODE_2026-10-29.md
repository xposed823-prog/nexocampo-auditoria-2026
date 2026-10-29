# Informe de correcciones — NexoCampo Auditoría 2026

**Fecha:** 2026-10-29  
**Rama:** `integracion-pwa-auditoria-2026`  
**Alcance:** repositorio de auditoría exclusivamente. No se modificó `xposed823-prog/nexocampo-pwa-` ni su rama `main`.

## Cambios aplicados

### Interfaz y experiencia móvil
- Unificación de la paleta agrícola en verde `#047857`, fondos claros, superficies blancas y bordes suaves.
- Fondo con textura ambiental sutil, jerarquía tipográfica más consistente y controles de formulario legibles.
- Ajustes de áreas táctiles, foco visible, estados activos y navegación inferior.
- Simplificación del encabezado: identidad correcta de Auditoría 2026, controles más compactos y etiqueta de conectividad sin afirmar que existe un servidor remoto.
- Metadatos de la PWA alineados con el nombre del proyecto y eliminación de `select-none` global para permitir seleccionar y copiar texto.

### Persistencia y sincronización
- El middleware de desarrollo ya no simula que una carga fue enviada a un servidor. Devuelve `501 SYNC_BACKEND_NOT_CONFIGURED` hasta que exista una API real.
- La sincronización directa exige una respuesta JSON con `success: true` y confirmación de que se recibió el lote completo antes de vaciar la cola.
- El Service Worker valida la confirmación del backend antes de mover registros de pendientes a confirmados.
- Fechas de respaldo y cola en las rutas modificadas usan fecha local en lugar de cortar una fecha UTC, evitando desfases cerca de medianoche.
- Se eliminó el aviso de `__dirname` en la configuración ESM de Vite mediante una ruta derivada de `import.meta.url`.

### Cifrado
- Las nuevas operaciones de cifrado requieren una clave derivada del PIN y no recurren silenciosamente a la clave maestra heredada para cifrar nuevos datos.
- La sal por usuario se persiste en `localStorage` porque no es secreta y debe sobrevivir al cierre de la pestaña; se migra la sal de sesión anterior cuando existe.
- La clave en memoria queda asociada al identificador de usuario para evitar reutilizarla accidentalmente al cambiar de usuario.
- Se añadieron pruebas de cifrado/descifrado, persistencia de sal y separación entre usuarios.

## Limitaciones y riesgos abiertos

1. **No hay backend remoto de sincronización configurado.** La cola local se conserva y no debe presentarse como sincronizada hasta conectar un servicio real que cumpla el contrato documentado.
2. La contraseña maestra heredada permanece únicamente para compatibilidad de lectura de datos antiguos. No debe declararse el sistema criptográfico completamente seguro hasta identificar registros heredados, diseñar una migración y retirar esa clave sin perder acceso a datos.
3. El proyecto mantiene dos modelos de persistencia: IndexedDB de negocio y almacenes usados por el subsistema PWA. Hay que verificar la frontera entre ambos antes de consolidarlos; no se cambió el esquema de base de datos.
4. La compilación, los tests y el chequeo TypeScript deben quedar confirmados en GitHub Actions tras estos commits.
5. Falta ejecutar auditoría de dependencias e identificar la vulnerabilidad alta reportada previamente.
6. Se requiere prueba visual y funcional real en Android: modo claro/oscuro, anchura de 320 px, instalación, uso sin conexión, reintentos y restauración.

## Verificación

El despliegue anterior de Cloudflare compiló correctamente, pero eso no valida por sí solo las pruebas de dominio, la persistencia ni la sincronización. El resultado de GitHub Actions para los cambios de este informe debe considerarse pendiente hasta que el flujo termine.

## Reglas de protección
- No modificar el repositorio original `xposed823-prog/nexocampo-pwa-`.
- No fusionar a `main` sin revisión y aceptación funcional.
- No declarar segura una sincronización o un cifrado sin evidencia de ejecución.
- No eliminar datos ni cambiar el esquema de IndexedDB sin una migración probada.
