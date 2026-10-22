import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DB_VERSION, validarEstructuraBackupJSON } from './nexocampoDB';

const STORES = ['colaboradores', 'labores', 'areas', 'ausencias', 'jornadas', 'asistencia'] as const;

function payloadDestino() {
  return {
    formato: 'nexocampo_backup',
    version_db: DB_VERSION,
    fecha_exportacion: '2026-10-22T12:00:00.000Z',
    stores: Object.fromEntries(STORES.map((store) => [store, []]))
  };
}

describe('validarEstructuraBackupJSON', () => {
  it('acepta un respaldo del formato canónico de Auditoría 2026 con los seis almacenes', () => {
    assert.deepEqual(validarEstructuraBackupJSON(payloadDestino()), { valido: true });
  });

  it('acepta el marcador de formato usado por la PWA original', () => {
    const payload = payloadDestino() as any;
    delete payload.formato;
    delete payload.version_db;
    payload.version = 'nexocampo-backup-v1';
    payload.appVersion = '18.1.9';

    assert.deepEqual(validarEstructuraBackupJSON(payload), { valido: true });
  });

  it('rechaza un almacén faltante antes de permitir restaurar', () => {
    const payload = payloadDestino() as any;
    delete payload.stores.asistencia;

    const result = validarEstructuraBackupJSON(payload);
    assert.equal(result.valido, false);
    assert.match(result.error || '', /asistencia/i);
  });

  it('rechaza identificadores duplicados en el mismo almacén', () => {
    const payload = payloadDestino() as any;
    payload.stores.colaboradores = [{ id: 'col_1' }, { id: 'col_1' }];

    const result = validarEstructuraBackupJSON(payload);
    assert.equal(result.valido, false);
    assert.match(result.error || '', /duplicado/i);
  });

  it('rechaza una versión de base de datos no compatible', () => {
    const payload = payloadDestino() as any;
    payload.version_db = DB_VERSION + 1;

    const result = validarEstructuraBackupJSON(payload);
    assert.equal(result.valido, false);
    assert.match(result.error || '', /versión|formato/i);
  });

  it('rechaza elementos sin identificador válido', () => {
    const payload = payloadDestino() as any;
    payload.stores.jornadas = [{ fecha: '2026-10-22' }];

    const result = validarEstructuraBackupJSON(payload);
    assert.equal(result.valido, false);
    assert.match(result.error || '', /identificador/i);
  });
});
