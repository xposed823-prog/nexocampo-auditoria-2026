import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';

test('el endpoint de sincronización no confirma datos sin almacenamiento remoto durable', async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';

  try {
    const { default: app } = await import('../../server.js');
    const server = app.listen(0);

    try {
      await new Promise<void>((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
      });

      const address = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${address.port}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registros: [{ id: 'synthetic-test-record', payload: { test: true } }] })
      });

      const body = await response.json() as { success?: boolean; code?: string };
      assert.equal(response.status, 501);
      assert.equal(body.success, false);
      assert.equal(body.code, 'SYNC_BACKEND_NOT_CONFIGURED');
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});
