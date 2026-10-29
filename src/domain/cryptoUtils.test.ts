import test from 'node:test';
import assert from 'node:assert/strict';
import { clearUserEncryptionKey, decryptData, encryptData, setUserEncryptionKey } from './cryptoUtils.ts';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
  removeItem(key: string): void { this.values.delete(key); }
  clear(): void { this.values.clear(); }
}

const localStore = new MemoryStorage();
const sessionStore = new MemoryStorage();

Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: { crypto: globalThis.crypto }
});
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: localStore });
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: sessionStore });

test('rechaza cifrar datos nuevos si no existe una sesión de usuario', async () => {
  clearUserEncryptionKey();
  await assert.rejects(() => encryptData({ prueba: true }), /sesión de usuario/i);
});

test('cifra y descifra usando el mismo PIN y la sal persistida tras recrear la sesión', async () => {
  localStore.clear();
  sessionStore.clear();
  sessionStore.setItem('nexocampo_current_user_id', 'usuario_prueba');
  await setUserEncryptionKey('PIN-prueba-2026');

  const original = { registro: 'jornada', minutos: 475, cantidad: 12 };
  const encrypted = await encryptData(original);
  assert.notEqual(encrypted.ciphertext, JSON.stringify(original));
  assert.ok(localStore.getItem('nexocampo_user_salt_usuario_prueba'));

  clearUserEncryptionKey();
  sessionStore.setItem('nexocampo_current_user_id', 'usuario_prueba');
  await setUserEncryptionKey('PIN-prueba-2026');

  assert.deepEqual(await decryptData(encrypted), original);
});

test('no reutiliza la clave en memoria de otro usuario', async () => {
  localStore.clear();
  sessionStore.clear();
  sessionStore.setItem('nexocampo_current_user_id', 'usuario_a');
  await setUserEncryptionKey('PIN-A');
  const encryptedA = await encryptData({ propietario: 'A' });

  sessionStore.setItem('nexocampo_current_user_id', 'usuario_b');
  await setUserEncryptionKey('PIN-B');
  const encryptedB = await encryptData({ propietario: 'B' });

  assert.deepEqual(await decryptData(encryptedB), { propietario: 'B' });
  await assert.rejects(() => decryptData(encryptedA));
});
