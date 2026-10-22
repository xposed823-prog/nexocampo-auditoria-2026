# Configuración de Google Drive para Auditoría 2026

## Estado
El repositorio contiene un servicio de copia manual a Google Drive. **No se considera validado hasta que se configure el Client ID, se ejecute el flujo OAuth en el dominio real y se confirme que el archivo aparece en la carpeta correcta.**

El servicio crea o reutiliza esta ruta en Mi unidad:

`NexoCampo/Respaldos/Global`

Por ahora permite subir una copia manual. No implementa descarga/listado de respaldos desde Drive, restauración directa desde Drive ni sincronización automática en segundo plano.

## 1. Variable de entorno

Configura la variable de compilación:

`VITE_GOOGLE_DRIVE_CLIENT_ID`

El valor debe ser el **OAuth 2.0 Client ID de tipo aplicación web** creado en el proyecto de Google Cloud autorizado para esta aplicación.

- Para desarrollo local, usa un archivo `.env.local` que no se suba a Git.
- Para Cloudflare Pages, añade la variable en la configuración de variables de entorno del proyecto y vuelve a desplegar.
- No agregues un OAuth Client Secret al frontend. El cliente web utiliza un Client ID público y el flujo de token del navegador.

Si el Client ID no está configurado, el botón de Drive permanece deshabilitado y la copia local JSON continúa disponible.

## 2. Configuración en Google Cloud

En el proyecto de Google Cloud correspondiente:

1. Habilita **Google Drive API**.
2. Configura la pantalla de consentimiento OAuth y los usuarios de prueba, si la aplicación sigue en modo de pruebas.
3. Crea o reutiliza un cliente OAuth de tipo **Aplicación web**.
4. En **Orígenes autorizados de JavaScript**, agrega el origen exacto del despliegue de Auditoría 2026 y el origen local usado durante las pruebas.
5. Comprueba que la cuenta de Google que probará el flujo está autorizada en la pantalla de consentimiento.

No inventes ni reutilices un dominio de producción distinto: registra el origen exacto que realmente sirve la aplicación.

## 3. Alcance solicitado

El servicio solicita el alcance mínimo:

`https://www.googleapis.com/auth/drive.file`

La autorización debe probarse con el mismo cliente OAuth configurado para el destino. No se da por garantizado que pueda encontrar carpetas creadas por otra aplicación o por otro cliente OAuth.

## 4. Prueba de aceptación obligatoria

Con datos de prueba no sensibles:

1. Abre Auditoría 2026 desde el dominio configurado.
2. Entra a **Respaldos** y confirma que el botón de Drive está habilitado.
3. Toca **Autorizar y guardar en Google Drive** y completa el consentimiento.
4. Comprueba en Mi unidad que exista `NexoCampo/Respaldos/Global`.
5. Confirma que el archivo `nexocampo-backup-*.json` aparece y se puede abrir.
6. Comprueba que el historial local registra el resultado y que un error OAuth/API no aparece como éxito.
7. Repite con conexión ausente y con autorización cancelada.

Registrar el resultado, fecha, dominio probado y error exacto si falla. No escribir “Drive funcional” antes de completar la prueba real.

## 5. Límites actuales

- El token de acceso se mantiene en memoria y no se guarda en `localStorage`.
- El estado de interfaz y la última operación se guardan localmente como metadatos.
- Cada operación crea un nuevo archivo; no sobrescribe automáticamente una copia anterior.
- La sincronización no se ejecuta con la aplicación cerrada.
- Los archivos JSON contienen datos locales y no están cifrados por esta implementación. Mantén los respaldos en una cuenta y ubicación privadas.
