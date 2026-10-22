/**
 * Copia manual de respaldos a Google Drive.
 * No conserva tokens OAuth: cada token permanece solo en memoria durante la operación.
 * Requiere configurar VITE_GOOGLE_DRIVE_CLIENT_ID y autorizar el origen en Google Cloud.
 */

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_STATE_KEY = 'nexocampo_google_drive_state_v1';
const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

declare global {
  interface Window {
    google?: any;
    NEXOCAMPO_GOOGLE_DRIVE_CONFIG?: { clientId?: string };
  }
}

export interface GoogleDriveBackupResult {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export interface GoogleDriveBackupState {
  connected: boolean;
  lastSync: string | null;
  lastBackupName: string | null;
  lastError: string | null;
}

let identityScriptPromise: Promise<void> | null = null;

function getClientId(): string {
  const configured = (import.meta as any).env?.VITE_GOOGLE_DRIVE_CLIENT_ID;
  const runtime = typeof window !== 'undefined'
    ? window.NEXOCAMPO_GOOGLE_DRIVE_CONFIG?.clientId
    : '';
  return String(configured || runtime || '').trim();
}

export function isGoogleDriveConfigured(): boolean {
  return getClientId().length > 0;
}

export function getGoogleDriveBackupState(): GoogleDriveBackupState {
  const empty: GoogleDriveBackupState = {
    connected: false,
    lastSync: null,
    lastBackupName: null,
    lastError: null
  };
  if (typeof window === 'undefined') return empty;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRIVE_STATE_KEY) || '{}');
    return {
      connected: parsed.connected === true,
      lastSync: typeof parsed.lastSync === 'string' ? parsed.lastSync : null,
      lastBackupName: typeof parsed.lastBackupName === 'string' ? parsed.lastBackupName : null,
      lastError: typeof parsed.lastError === 'string' ? parsed.lastError : null
    };
  } catch {
    return empty;
  }
}

function saveDriveState(patch: Partial<GoogleDriveBackupState>): GoogleDriveBackupState {
  const next = { ...getGoogleDriveBackupState(), ...patch };
  try {
    window.localStorage.setItem(DRIVE_STATE_KEY, JSON.stringify(next));
  } catch {
    // El estado de interfaz es auxiliar; el token nunca se persiste aquí.
  }
  return next;
}

export function preloadGoogleIdentityServices(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Google Drive solo está disponible en el navegador.'));
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (identityScriptPromise) return identityScriptPromise;

  identityScriptPromise = new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const onLoad = () => {
      if (window.google?.accounts?.oauth2) resolve();
      else reject(new Error('Google Identity Services se cargó, pero OAuth no está disponible.'));
    };
    const onError = () => reject(new Error('No se pudo cargar Google Identity Services.'));
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (window.google?.accounts?.oauth2) resolve();
  }).catch((error) => {
    identityScriptPromise = null;
    throw error;
  });

  return identityScriptPromise;
}

async function requestAccessToken(prompt: string): Promise<string> {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error('Google Drive no está configurado. Define VITE_GOOGLE_DRIVE_CLIENT_ID en el entorno de compilación.');
  }

  await preloadGoogleIdentityServices();
  const oauth = window.google?.accounts?.oauth2;
  if (!oauth) throw new Error('Google Identity Services no está disponible.');

  return await new Promise((resolve, reject) => {
    try {
      const client = oauth.initTokenClient({
        client_id: clientId,
        scope: DRIVE_SCOPE,
        callback: (response: any) => {
          if (response?.error) {
            reject(new Error(`Google OAuth: ${response.error_description || response.error}`));
            return;
          }
          if (!response?.access_token) {
            reject(new Error('Google no devolvió un token de acceso.'));
            return;
          }
          // El token solo vive en esta operación; nunca se guarda en localStorage.
          resolve(String(response.access_token));
        }
      });
      client.requestAccessToken({ prompt });
    } catch (error: any) {
      reject(new Error(error?.message || 'No se pudo solicitar autorización de Google.'));
    }
  });
}

async function driveRequest(token: string, url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(url, { ...init, headers });

  if (response.status === 401) {
    throw new Error('La autorización de Google Drive expiró. Vuelve a autorizar la cuenta.');
  }
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.error?.message || '';
    } catch {
      // No asumir que el servidor devuelve JSON.
    }
    throw new Error(`Google Drive API ${response.status}${detail ? `: ${detail.slice(0, 240)}` : ''}`);
  }
  return response;
}

function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function findOrCreateFolder(
  token: string,
  name: string,
  parentId?: string
): Promise<{ id: string; name: string }> {
  let query = `name = '${escapeDriveQuery(name)}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) query += ` and '${escapeDriveQuery(parentId)}' in parents`;

  const searchUrl = 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
    pageSize: '100',
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name)',
    q: query
  }).toString();

  const searchResponse = await driveRequest(token, searchUrl);
  const searchData = await searchResponse.json();
  const existing = Array.isArray(searchData.files) ? searchData.files[0] : null;
  if (existing?.id) return { id: existing.id, name: existing.name || name };

  const metadata: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) metadata.parents = [parentId];

  const createResponse = await driveRequest(
    token,
    'https://www.googleapis.com/drive/v3/files?fields=id,name',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    }
  );
  const created = await createResponse.json();
  if (!created?.id) throw new Error(`Google Drive no devolvió el ID de la carpeta "${name}".`);
  return { id: created.id, name: created.name || name };
}

function timestampForFile(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

async function uploadJsonBackup(
  token: string,
  json: string,
  parentId: string,
  name: string
): Promise<GoogleDriveBackupResult> {
  const boundary = `nexocampo_${Date.now().toString(36)}`;
  const metadata = JSON.stringify({
    name,
    mimeType: 'application/json',
    parents: [parentId]
  });

  // Google multipart requiere separadores CRLF reales.
  const body = [
    `--${boundary}\r\n`,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    `${metadata}\r\n`,
    `--${boundary}\r\n`,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    `${json}\r\n`,
    `--${boundary}--\r\n`
  ].join('');

  const response = await driveRequest(
    token,
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body
    }
  );
  const result = await response.json();
  if (!result?.id) throw new Error('Google Drive no confirmó la creación del archivo de respaldo.');
  return result as GoogleDriveBackupResult;
}

/**
 * Crea una copia manual en Mi unidad/NexoCampo/Respaldos/Global.
 * No descarga ni restaura datos automáticamente y no sobrescribe respaldos anteriores.
 */
export async function guardarRespaldoEnGoogleDrive(json: string): Promise<GoogleDriveBackupResult> {
  if (!navigator.onLine) {
    throw new Error('No hay conexión a internet. Genera primero el respaldo local y reintenta cuando estés en línea.');
  }

  const priorState = getGoogleDriveBackupState();
  try {
    const token = await requestAccessToken(priorState.connected ? '' : 'consent');
    const root = await findOrCreateFolder(token, 'NexoCampo');
    const backups = await findOrCreateFolder(token, 'Respaldos', root.id);
    const global = await findOrCreateFolder(token, 'Global', backups.id);
    const name = `nexocampo-backup-${timestampForFile()}.json`;
    const result = await uploadJsonBackup(token, json, global.id, name);

    saveDriveState({
      connected: true,
      lastSync: new Date().toISOString(),
      lastBackupName: result.name || name,
      lastError: null
    });
    return result;
  } catch (error: any) {
    saveDriveState({
      connected: false,
      lastError: error?.message || 'Error desconocido al guardar en Google Drive.'
    });
    throw error;
  }
}
