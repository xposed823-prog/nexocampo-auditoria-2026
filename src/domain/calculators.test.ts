import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeStringToMinutes,
  calcularJornadaLaboral,
  generarJornadaEstandarSemanal,
  generarJornadaEstandarSabado,
} from './jornadaCalculator.ts';
import {
  calcularRendimientoTemporal,
  calcularCumplimientoCantidad,
} from './rendimientoCalculator.ts';

test('Conversión de hora HH:mm a minutos', () => {
  assert.equal(timeStringToMinutes('06:30'), 390);
  assert.equal(timeStringToMinutes('15:30'), 930);
  assert.equal(timeStringToMinutes('00:00'), 0);
  assert.equal(timeStringToMinutes('12:00'), 720);
});

test('Aritmética de semana (L-V): 06:30 a 15:30 con 1 pausa de 5 min da exactamente 475 min', () => {
  const jornada = generarJornadaEstandarSemanal();
  assert.equal(jornada.minutosBrutos, 540); // 9 horas
  assert.equal(jornada.minutosDescansosComida, 60); // 30m desayuno + 30m almuerzo
  assert.equal(jornada.minutosPausasAdicionales, 5); // 1 pausa de 5 minutos
  assert.equal(jornada.totalDeduccionesMinutos, 65);
  assert.equal(jornada.minutosEfectivosNetos, 475);
  assert.equal(jornada.esConsistenteConEstimacion475, true);
});

test('Aritmética de sábado: 06:30 a 13:00 con desayuno 30m da exactamente 360 min', () => {
  const jornada = generarJornadaEstandarSabado();
  assert.equal(jornada.minutosBrutos, 390); // 6.5 horas
  assert.equal(jornada.minutosDescansosComida, 30); // desayuno
  assert.equal(jornada.minutosPausasAdicionales, 0);
  assert.equal(jornada.totalDeduccionesMinutos, 30);
  assert.equal(jornada.minutosEfectivosNetos, 360);
  assert.equal(jornada.esConsistenteConEstimacion360, true);
});

test('Rendimiento Temporal: labor con estándar válido calcula porcentaje exacto', () => {
  // 120 unidades a 2.5 min/u = 300 min estándar. Tiempo efectivo: 300 min => 100%
  const res = calcularRendimientoTemporal(2.5, 120, 300);
  assert.equal(res.estadoCalculo, 'CALCULADO_VALIDO');
  assert.equal(res.rendimientoTemporalPct, 100);
  assert.equal(res.tiempoEstandarTotalMinutos, 300);

  // Mismas 120 unidades hechas en 240 minutos (más rápido que el estándar) => 125%
  const resRapido = calcularRendimientoTemporal(2.5, 120, 240);
  assert.equal(resRapido.rendimientoTemporalPct, 125);
});

test('Rendimiento Temporal: labor sin estándar (Oficios Varios) nunca emite número inventado', () => {
  const resSinEstandar = calcularRendimientoTemporal(null, 50, 475);
  assert.equal(resSinEstandar.estadoCalculo, 'ESTANDAR_NO_DISPONIBLE');
  assert.equal(resSinEstandar.rendimientoTemporalPct, null);
  assert.equal(resSinEstandar.tiempoEstandarTotalMinutos, null);
  assert.match(resSinEstandar.mensajeAuditoria, /sin estándar temporal aprobado/i);
});

test('Cumplimiento de Cantidad: calcula porcentaje respecto a la meta física', () => {
  const res = calcularCumplimientoCantidad(450, 500);
  assert.equal(res.cumplimientoCantidadPct, 90);
  assert.equal(res.estadoCumplimiento, 'META_EN_DEFICIT');

  const resMeta = calcularCumplimientoCantidad(500, 500);
  assert.equal(resMeta.cumplimientoCantidadPct, 100);
  assert.equal(resMeta.estadoCumplimiento, 'META_CUMPLIDA');

  const resExcedida = calcularCumplimientoCantidad(550, 500);
  assert.equal(resExcedida.cumplimientoCantidadPct, 110);
  assert.equal(resExcedida.estadoCumplimiento, 'SOBREPASO_META');
});
