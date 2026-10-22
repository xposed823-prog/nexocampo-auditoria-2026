/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Utilidades de Cifrado Web Crypto API
 * Implementación de cifrado AES-GCM-256 para protecciòn de datos en IndexedDB
 */

// Clave maestra derivada de una frase secreta (en producción, usar una clave generada aleatoriamente)
// Para este prototipo, usamos una clave estática pero en producción DEBE ser generada por usuario
const MASTER_PASSWORD = 'NexoCampo2026_SecretKey_DoNotExpose';

// Cache para la clave de cifrado
let cryptoKey: CryptoKey | null = null;

/**
 * Deriva una clave AES-GCM-256 desde una contraseña usando PBKDF2
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array = new TextEncoder().encode('nexocampo_salt_v1')): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Genera una clave AES-GCM-256 aleatoria
 */
export async function generateRandomKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Exporta una clave CryptoKey a formato raw (Uint8Array)
 */
export async function exportKeyToRaw(key: CryptoKey): Promise<Uint8Array> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

/**
 * Importa una clave desde formato raw
 */
export async function importKeyFromRaw(rawKey: Uint8Array): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Obtiene o genera la clave de cifrado
 * En producción, esta clave debería ser almacenada en localStorage o IndexedDB
 * y protegida por autenticación del usuario
 */
export async function getEncryptionKey(): Promise<CryptoKey> {
  if (cryptoKey) {
    return cryptoKey;
  }

  // Intentar obtener la clave de localStorage
  const storedKey = localStorage.getItem('nexocampo_encryption_key');
  if (storedKey) {
    try {
      const rawKey = new Uint8Array(JSON.parse(storedKey));
      cryptoKey = await importKeyFromRaw(rawKey);
      return cryptoKey;
    } catch (e) {
      console.warn('[NexoCampo Crypto] Error al cargar clave almacenada, generando nueva:', e);
    }
  }

  // Generar nueva clave
  cryptoKey = await deriveKeyFromPassword(MASTER_PASSWORD);
  
  // Guardar en localStorage para persistencia
  try {
    const rawKey = await exportKeyToRaw(cryptoKey);
    localStorage.setItem('nexocampo_encryption_key', JSON.stringify(Array.from(rawKey)));
  } catch (e) {
    console.warn('[NexoCampo Crypto] No se pudo guardar la clave en localStorage:', e);
  }

  return cryptoKey;
}

/**
 * Genera un vector de inicialización (IV) aleatorio
 */
function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes = 96 bits para AES-GCM
}

/**
 * Cifra datos usando AES-GCM-256
 * @param data - Datos a cifrar (string o objeto)
 * @returns Objeto con iv y ciphertext en formato Base64
 */
export async function encryptData(data: any): Promise<{ iv: string; ciphertext: string }> {
  const key = await getEncryptionKey();
  const iv = generateIV();
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );

  return {
    iv: btoa(String.fromCharCode(...Array.from(iv))),
    ciphertext: btoa(String.fromCharCode(...Array.from(new Uint8Array(ciphertextBuffer))))
  };
}

/**
 * Descifra datos cifrados con AES-GCM-256
 * @param encrypted - Objeto con iv y ciphertext en Base64
 * @returns Datos originales descifrados
 */
export async function decryptData(encrypted: { iv: string; ciphertext: string }): Promise<any> {
  const key = await getEncryptionKey();
  
  const iv = new Uint8Array(
    Array.from(atob(encrypted.iv)).map(c => c.charCodeAt(0))
  );
  const ciphertext = new Uint8Array(
    Array.from(atob(encrypted.ciphertext)).map(c => c.charCodeAt(0))
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  const decryptedString = decoder.decode(decryptedBuffer);
  return JSON.parse(decryptedString);
}

/**
 * Cifra un campo específico de un objeto
 */
export async function encryptField<T extends Record<string, any>>(
  obj: T,
  field: keyof T
): Promise<T & { _encryptedFields?: (keyof T)[] }> {
  const encrypted = await encryptData(obj[field]);
  const result = { ...obj };
  (result as any)[field] = encrypted;
  (result as any)._encryptedFields = (result._encryptedFields || []).concat(field);
  return result;
}

/**
 * Descifra campos cifrados de un objeto
 */
export async function decryptFields<T extends Record<string, any>>(
  obj: T
): Promise<T> {
  const result = { ...obj };
  const encryptedFields = (obj as any)._encryptedFields || [];
  
  for (const field of encryptedFields) {
    if (result[field] && typeof result[field] === 'object' && 'iv' in result[field] && 'ciphertext' in result[field]) {
      result[field] = await decryptData(result[field]);
    }
  }
  
  delete (result as any)._encryptedFields;
  return result;
}

/**
 * Verifica si un objeto tiene campos cifrados
 */
export function hasEncryptedFields(obj: any): boolean {
  return obj && typeof obj === 'object' && Array.isArray(obj._encryptedFields);
}

/**
 * Limpia la clave de cifrado de la memoria
 * Útil para cuando el usuario cierra sesión
 */
export function clearEncryptionKey(): void {
  cryptoKey = null;
}

/**
 * Elimina la clave de cifrado del almacenamiento
 */
export function deleteEncryptionKey(): void {
  localStorage.removeItem('nexocampo_encryption_key');
  clearEncryptionKey();
}

/**
 * Inicializa el sistema de cifrado
 * Debe ser llamado al inicio de la aplicación
 */
export async function initCrypto(): Promise<boolean> {
  try {
    // Verificar si Web Crypto API está disponible
    if (!window.crypto || !window.crypto.subtle) {
      console.error('[NexoCampo Crypto] Web Crypto API no está disponible');
      return false;
    }
    
    // Intentar obtener/generar la clave
    await getEncryptionKey();
    return true;
  } catch (e) {
    console.error('[NexoCampo Crypto] Error al inicializar cifrado:', e);
    return false;
  }
}
