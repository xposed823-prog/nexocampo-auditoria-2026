/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NexoCampo Auditoría 2026 — Web Crypto API (AES-GCM-256).
 *
 * Compatibility note: getEncryptionKey() is retained only to read legacy records.
 * New encryption always requires a user-specific PIN-derived key; it never silently
 * encrypts new data with the compiled-in legacy secret.
 */
const LEGACY_MASTER_PASSWORD = 'NexoCampo2026_SecretKey_DoNotExpose';
let cryptoKey: CryptoKey | null = null;
let userCryptoKey: CryptoKey | null = null;
let userCryptoKeyId: string | null = null;

const USER_SALT_STORE = 'nexocampo_user_salt';
const CURRENT_USER_KEY = 'nexocampo_current_user_id';
const USER_PIN_KEY = 'nexocampo_user_pin';

function toArrayBufferSource(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer as ArrayBuffer;
}

async function deriveKeyFromPassword(password: string, salt: Uint8Array = new TextEncoder().encode('nexocampo_salt_v1')): Promise<CryptoKey> {
  const importedKey = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveKey']);
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: toArrayBufferSource(salt), iterations: 100000, hash: 'SHA-256' },
    importedKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

export async function generateRandomKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function exportKeyToRaw(key: CryptoKey): Promise<Uint8Array> {
  return new Uint8Array(await window.crypto.subtle.exportKey('raw', key));
}

export async function importKeyFromRaw(rawKey: Uint8Array): Promise<CryptoKey> {
  return window.crypto.subtle.importKey('raw', toArrayBufferSource(rawKey), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

/** Legacy key loader retained for backwards-compatible reads only. */
export async function getEncryptionKey(): Promise<CryptoKey> {
  if (cryptoKey) return cryptoKey;
  const storedKey = localStorage.getItem('nexocampo_encryption_key');
  if (storedKey) {
    try {
      cryptoKey = await importKeyFromRaw(new Uint8Array(JSON.parse(storedKey)));
      return cryptoKey;
    } catch (error) {
      console.error('[NexoCampo Crypto] No se pudo importar la clave heredada:', error);
      throw new Error('La clave de cifrado heredada no se puede leer. No se reemplazó para evitar perder acceso a los datos.');
    }
  }
  // Keep only until old encrypted records have been migrated and verified.
  cryptoKey = await deriveKeyFromPassword(LEGACY_MASTER_PASSWORD);
  try {
    localStorage.setItem('nexocampo_encryption_key', JSON.stringify(Array.from(await exportKeyToRaw(cryptoKey))));
  } catch (error) {
    console.warn('[NexoCampo Crypto] No se pudo persistir la clave heredada:', error);
  }
  return cryptoKey;
}

function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

export async function encryptData(data: unknown): Promise<{ iv: string; ciphertext: string }> {
  const key = await getRequiredUserEncryptionKey();
  const iv = generateIV();
  const dataBuffer = new TextEncoder().encode(JSON.stringify(data));
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBufferSource(iv) }, key, toArrayBufferSource(dataBuffer)
  );
  return {
    iv: btoa(String.fromCharCode(...Array.from(iv))),
    ciphertext: btoa(String.fromCharCode(...Array.from(new Uint8Array(ciphertextBuffer))))
  };
}

export async function decryptData(encrypted: { iv: string; ciphertext: string }): Promise<any> {
  const key = await getUserEncryptionKey();
  const iv = new Uint8Array(Array.from(atob(encrypted.iv)).map((character) => character.charCodeAt(0)));
  const ciphertext = new Uint8Array(Array.from(atob(encrypted.ciphertext)).map((character) => character.charCodeAt(0)));
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBufferSource(iv) }, key, toArrayBufferSource(ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(decryptedBuffer));
}

export async function encryptField<T extends Record<string, any>>(obj: T, field: keyof T): Promise<T & { _encryptedFields?: (keyof T)[] }> {
  const encrypted = await encryptData(obj[field]);
  const result = { ...obj };
  (result as any)[field] = encrypted;
  (result as any)._encryptedFields = (result._encryptedFields || []).concat(field);
  return result;
}

export async function decryptFields<T extends Record<string, any>>(obj: T): Promise<T> {
  const result = { ...obj };
  const encryptedFields = (obj as any)._encryptedFields || [];
  for (const field of encryptedFields) {
    const value = result[field];
    if (value && typeof value === 'object' && 'iv' in value && 'ciphertext' in value) {
      (result as Record<string, any>)[field] = await decryptData(value);
    }
  }
  delete (result as any)._encryptedFields;
  return result;
}

export function hasEncryptedFields(obj: any): boolean {
  return Boolean(obj && typeof obj === 'object' && Array.isArray(obj._encryptedFields));
}

export function clearEncryptionKey(): void {
  cryptoKey = null;
}

export function deleteEncryptionKey(): void {
  localStorage.removeItem('nexocampo_encryption_key');
  clearEncryptionKey();
}

export async function initCrypto(): Promise<boolean> {
  return Boolean(window.crypto?.subtle);
}

async function deriveUserKeyFromPin(pin: string, userId: string): Promise<CryptoKey> {
  const saltStoreKey = `${USER_SALT_STORE}_${userId}`;
  // Salt is not secret and must persist across browser sessions.
  let storedSalt = localStorage.getItem(saltStoreKey);
  if (!storedSalt) {
    storedSalt = sessionStorage.getItem(saltStoreKey);
    if (storedSalt) localStorage.setItem(saltStoreKey, storedSalt);
  }
  const salt = storedSalt ? new Uint8Array(JSON.parse(storedSalt)) : window.crypto.getRandomValues(new Uint8Array(16));
  const importedKey = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(pin), { name: 'PBKDF2' }, false, ['deriveKey']);
  const userKey = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: toArrayBufferSource(salt), iterations: 100000, hash: 'SHA-256' },
    importedKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
  localStorage.setItem(saltStoreKey, JSON.stringify(Array.from(salt)));
  return userKey;
}

export async function setUserEncryptionKey(pin: string): Promise<void> {
  const currentUserId = sessionStorage.getItem(CURRENT_USER_KEY);
  if (!currentUserId) throw new Error('No hay usuario identificado para inicializar el cifrado.');
  if (!pin) throw new Error('El PIN no puede estar vacío.');
  userCryptoKey = await deriveUserKeyFromPin(pin, currentUserId);
  userCryptoKeyId = currentUserId;
}

async function getRequiredUserEncryptionKey(): Promise<CryptoKey> {
  const currentUserId = sessionStorage.getItem(CURRENT_USER_KEY);
  if (!currentUserId) throw new Error('No se cifraron datos nuevos: se requiere una sesión de usuario.');
  if (userCryptoKey && userCryptoKeyId === currentUserId) return userCryptoKey;
  const userPin = sessionStorage.getItem(USER_PIN_KEY);
  if (!userPin) throw new Error('No se cifraron datos nuevos: inicialice el cifrado con el PIN del usuario.');
  userCryptoKey = await deriveUserKeyFromPin(userPin, currentUserId);
  userCryptoKeyId = currentUserId;
  return userCryptoKey;
}

/** Read path supports legacy records; new writes use a user-specific key. */
export async function getUserEncryptionKey(): Promise<CryptoKey> {
  const currentUserId = sessionStorage.getItem(CURRENT_USER_KEY);
  if (currentUserId && userCryptoKey && userCryptoKeyId === currentUserId) return userCryptoKey;
  const userPin = sessionStorage.getItem(USER_PIN_KEY);
  if (currentUserId && userPin) {
    userCryptoKey = await deriveUserKeyFromPin(userPin, currentUserId);
    userCryptoKeyId = currentUserId;
    return userCryptoKey;
  }
  console.warn('[NexoCampo Crypto] Lectura sin sesión de usuario: se intenta compatibilidad con registros heredados.');
  return getEncryptionKey();
}

export function clearUserEncryptionKey(): void {
  userCryptoKey = null;
  userCryptoKeyId = null;
  sessionStorage.removeItem(CURRENT_USER_KEY);
}
