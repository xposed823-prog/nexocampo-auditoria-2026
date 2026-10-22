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

  it('rechaza una cuadrilla que no tenga exactamente seis integrantes', () => {
    const result = validarPlasticoPolisombra(5, '06:30', '11:30', 100, 100, ['soleado']);
    assert.equal(result.esValido, false);
    assert.match(result.errores.integrantes || '', /exactamente 6/i);
  });

  it('rechaza completados por encima de la cantidad total', () => {
    const result = validarPlasticoPolisombra(6, '06:30', '11:30', 100, 101, ['soleado']);
    assert.equal(result.esValido, false);
    assert.match(result.errores.cantidadCompletada || '', /superar/i);
  });
});
