import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validarPlasticoPolisombra } from './formValidators';

describe('validarPlasticoPolisombra', () => {
  it('acepta seis integrantes y marca justificación cuando queda saldo', () => {
    const result = validarPlasticoPolisombra(6, '06:30', '11:30', 100, 75, ['soleado']);
    assert.equal(result.esValido, true);
    assert.equal(result.requiereJustificacion, true);
    assert.equal(result.saldoPendiente, 25);
  });

  it('acepta una cuadrilla de cinco integrantes', () => {
    const result = validarPlasticoPolisombra(5, '06:30', '11:30', 100, 100, ['soleado']);
    assert.equal(result.esValido, true);
    assert.equal(result.errores.integrantes, undefined);
  });

  it('acepta una cuadrilla de un integrante', () => {
    const result = validarPlasticoPolisombra(1, '06:30', '11:30', 100, 100, ['soleado']);
    assert.equal(result.esValido, true);
  });

  it('rechaza una cuadrilla vacía o superior a seis integrantes', () => {
    for (const count of [0, 7]) {
      const result = validarPlasticoPolisombra(count, '06:30', '11:30', 100, 100, ['soleado']);
      assert.equal(result.esValido, false);
      assert.match(result.errores.integrantes || '', /entre 1 y 6/i);
    }
  });

  it('rechaza completados por encima de la cantidad total', () => {
    const result = validarPlasticoPolisombra(6, '06:30', '11:30', 100, 101, ['soleado']);
    assert.equal(result.esValido, false);
    assert.match(result.errores.cantidadCompletada || '', /superar/i);
  });
});
