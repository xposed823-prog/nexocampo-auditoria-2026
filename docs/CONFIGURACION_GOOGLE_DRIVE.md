# Configuración de Google Drive — NexoCampo Auditoría 2026

## Estado actual

El servicio de copia manual ya está implementado en `src/domain/googleDriveBackupService.ts`. No se considera operativo en el despliegue hasta configurar el OAuth Client ID y comprobar una subida real desde el mismo origen donde se abre la aplicación.

**Advertencia de privacidad:** el archivo de respaldo JSON no está cifrado. Puede contener datos personales y fotos opcionales de incidentes. La interfaz solicita confirmación antes de subirlo. No uses una cuenta compartida ni subas información sensible hasta definir y probar una política de cifrado y acceso.

## Pasos de configuración

1. En Google Cloud Console, crea o selecciona un proyecto controlado por el responsable de NexoCampo.
2. Habilita **Google Drive API** para ese proyecto.
3. Configura la pantalla de consentimiento OAuth. Selecciona el tipo de audiencia adecuado a la cuenta administrada y añade usuarios de prueba si Google lo requiere.
4. Crea una credencial OAuth de tipo **ID de cliente para aplicación web**.
5. En **Orígenes autorizados de JavaScript**, registra el origen exacto del despliegue de Auditoría 2026, incluido el protocolo HTTPS. No registres una URL inventada ni el dominio de otro proyecto. Para desarrollo local, registra `http://localhost:5173` solo si vas a probar desde ese origen.
6. Copia el ID de cliente (no un token de acceso) a las variables de entorno del entorno de compilación:
   - Nombre: `VITE_GOOGLE_DRIVE_CLIENT_ID`
   - Valor: el ID de cliente OAuth creado en el paso 4.
7. Vuelve a compilar y desplegar la aplicación para que Vite incluya la variable. No pongas tokens OAuth ni secretos de usuario dentro del código fuente.
8. Abre la aplicación desde el origen autorizado y entra en **Respaldos → Copia manual en Google Drive**.
9. Autoriza el acceso cuando se solicite y confirma la advertencia de respaldo sin cifrar solo si entiendes qué datos se subirán.
10. Comprueba en Google Drive que se creó el archivo en `Mi unidad/NexoCampo/Respaldos/Global` y que el historial de la aplicación registra el resultado.

## Alcance y límites

- El permiso solicitado es `drive.file`; la copia se crea manualmente.
- La aplicación crea o reutiliza las carpetas `NexoCampo/Respaldos/Global`.
- Los tokens de acceso se mantienen en memoria durante la operación; no se guardan en `localStorage`.
- Cada respaldo crea un archivo nuevo; no es una sincronización bidireccional ni una restauración automática.
- Sin Client ID, autorización o conexión a Internet, Drive debe informar el error y mantenerse disponible la descarga local JSON.
- La configuración no queda aprobada hasta probar autorización aceptada, autorización cancelada, modo sin conexión, subida correcta y error de subida desde el despliegue real.

## Evidencia de aceptación pendiente

| Prueba | Resultado |
|---|---|
| Client ID configurado en el despliegue | Pendiente |
| Origen HTTPS autorizado exactamente | Pendiente |
| Autorización OAuth aceptada | Pendiente |
| Archivo visible en la carpeta esperada | Pendiente |
| Cancelación OAuth informa el resultado sin falso éxito | Pendiente |
| Modo sin conexión ofrece una alternativa local | Pendiente |
| JSON restaurado y datos comparados en entorno de prueba | Pendiente |
