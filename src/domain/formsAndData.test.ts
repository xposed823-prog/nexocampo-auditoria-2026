import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validarJornada,
  validarLabor,
  validarPlasticoPolisombra,
  validarJustificacionPendiente,
  determinarEstadoVisual,
} from './formValidators.ts';

test('Validación de Jornada: detecta inconsistencia cuando cierre <= apertura', () => {
  const invalido = validarJornada('06:30', '06:30');
  assert.equal(invalido.esValido, false);
  assert.match(invalido.errores.horaCierreEsperada, /estrictamente posterior/i);

  const valido = validarJornada('06:30', '15:30');
  assert.equal(valido.esValido, true);
  assert.equal(Object.keys(valido.errores).length, 0);
});

test('Validación de Labor: requiere fin > inicio y cantidad >= 0', () => {
  const invalido = validarLabor('10:00', '09:30', -5, 0);
  assert.equal(invalido.esValido, false);
  assert.match(invalido.errores.horaFin, /posterior al inicio/i);
  assert.match(invalido.errores.cantidadCompletada, /no puede ser negativa/i);
  assert.match(invalido.errores.colaboradores, /al menos un colaborador/i);

  const valido = validarLabor('06:30', '10:00', 120, 4);
  assert.equal(valido.esValido, true);
});

test('Validación de Plástico y Polisombra: limita integrantes a máx 6 y detecta justificación pendiente', () => {
  // Caso de más de 6 integrantes
  const excesoIntegrantes = validarPlasticoPolisombra(7, '07:00', '11:00', 100, 80, ['soleado']);
  assert.equal(excesoIntegrantes.esValido, false);
  assert.match(excesoIntegrantes.errores.integrantes, /entre 1 y 6 integrantes/i);

  // Caso válido con saldo pendiente (80 completados de 100)
  const conSaldo = validarPlasticoPolisombra(5, '07:00', '11:00', 100, 80, ['soleado', 'vientos_fuertes']);
  assert.equal(conSaldo.esValido, true);
  assert.equal(conSaldo.requiereJustificacion, true);
  assert.equal(conSaldo.saldoPendiente, 20);

  // Caso completo (100 de 100)
  const completo = validarPlasticoPolisombra(6, '07:00', '11:00', 100, 100, ['soleado']);
  assert.equal(completo.esValido, true);
  assert.equal(completo.requiereJustificacion, false);
  assert.equal(completo.saldoPendiente, 0);
});

test('Validación de Justificación: aprueba motivos válidos y rechaza vacíos', () => {
  const sinMotivos = validarJustificacionPendiente([]);
  assert.equal(sinMotivos.esValido, false);
  assert.match(sinMotivos.errores.motivos, /al menos un motivo aprobado/i);

  const conMotivoValido = validarJustificacionPendiente(['vientos_fuertes', 'lluvia_intensa']);
  assert.equal(conMotivoValido.esValido, true);
});

test('Determinación de Estado Visual: distingue sin_registro, pendiente, no_aplicable y cumple', () => {
  assert.equal(determinarEstadoVisual(null, 100, true, false, false), 'sin_registro');
  assert.equal(determinarEstadoVisual(80, 100, true, true, false), 'pendiente');
  assert.equal(determinarEstadoVisual(80, null, false, false, false), 'no_aplicable');
  assert.equal(determinarEstadoVisual(105, 100, true, false, false), 'cumple');
  assert.equal(determinarEstadoVisual(90, 100, true, false, false), 'no_cumple');
});
