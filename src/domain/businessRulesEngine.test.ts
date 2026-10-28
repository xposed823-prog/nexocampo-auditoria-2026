import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectarSolapamientoTemporal,
  calcularJornadaMultiplesLabores,
  calcularMediaPonderadaRendimiento,
  calcularOficiosVarios,
  consolidarProduccionCobertura,
} from './businessRulesEngine.ts';
import {
  calcularJornadaLaboral,
} from './jornadaCalculator.ts';
import {
  calcularRendimientoTemporal,
  calcularCumplimientoCantidad,
} from './rendimientoCalculator.ts';

// Caso 1: Jornada con una labor
test('Caso 1: Jornada con una labor (475 min efectivos)', () => {
  const res = calcularJornadaLaboral('06:30', '15:30', [
    { tipo: 'desayuno', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'almuerzo', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'pausa_5min', duracionMinutos: 5, esDeduccionComputable: true },
  ]);
  assert.equal(res.minutosEfectivosNetos, 475);
  assert.equal(res.esConsistenteConEstimacion475, true);
});

// Caso 2: Jornada con tres labores consecutivas (no suma 3 jornadas)
test('Caso 2: Tres labores consecutivas (210m + 105m + 180m + pausas 45m = 540m en 1 sola jornada)', () => {
  const res = calcularJornadaMultiplesLabores(
    '06:30',
    '15:30',
    [
      { id: 'l1', horaInicio: '06:30', horaFin: '10:00' }, // 210 min
      { id: 'l2', horaInicio: '10:15', horaFin: '12:00' }, // 105 min
      { id: 'l3', horaInicio: '12:30', horaFin: '15:30' }, // 180 min
    ],
    [
      { duracionMinutos: 15, esDeduccionComputable: true }, // refrigerio
      { duracionMinutos: 30, esDeduccionComputable: true }, // almuerzo
    ]
  );
  assert.equal(res.minutosBrutosJornada, 540);
  assert.equal(res.minutosEfectivosLabores, 495);
  assert.equal(res.minutosPausasComputables, 45);
  assert.equal(res.cuadraExactamente, true);
  assert.equal(res.totalJornadasCreadas, 1);
});

// Caso 2b: El cálculo rechaza labores solapadas aunque las duraciones sumen la jornada.
test('Rechaza intervalos de labores que se solapan dentro de una jornada', () => {
  const res = calcularJornadaMultiplesLabores(
    '06:30',
    '10:30',
    [
      { id: 'l1', horaInicio: '06:30', horaFin: '09:00' },
      { id: 'l2', horaInicio: '08:30', horaFin: '10:00' },
    ],
    []
  );
  assert.equal(res.cuadraExactamente, false);
});

test('Detecta solapamientos anidados aunque el intervalo intermedio termine antes', () => {
  const res = calcularJornadaMultiplesLabores(
    '06:30',
    '10:30',
    [
      { id: 'l1', horaInicio: '06:30', horaFin: '09:30' },
      { id: 'l2', horaInicio: '07:00', horaFin: '08:00' },
      { id: 'l3', horaInicio: '08:30', horaFin: '10:00' },
    ],
    []
  );
  assert.equal(res.cuadraExactamente, false);
});

// Caso 2c: El cálculo rechaza labores fuera de la jornada general.
test('Rechaza labores que comienzan antes de la jornada registrada', () => {
  const res = calcularJornadaMultiplesLabores(
    '06:30',
    '10:30',
    [{ id: 'l1', horaInicio: '06:00', horaFin: '10:00' }],
    []
  );
  assert.equal(res.cuadraExactamente, false);
});

// Caso 3: Varias subtareas que heredan horario (no duplican período)
test('Caso 3: Subtareas que heredan horario no generan solapamiento temporal', () => {
  const existente = [
    { id: 'l_prin', colaboradorId: 'COL-001', horaInicio: '07:00', horaFin: '12:00' },
  ];
  // Subtarea con esSubtarea: true compartiendo el mismo horario
  const subtarea = {
    id: 'sub_1',
    colaboradorId: 'COL-001',
    horaInicio: '07:00',
    horaFin: '12:00',
    esSubtarea: true,
  };
  const solap = detectarSolapamientoTemporal(existente, subtarea);
  assert.equal(solap.haySolapamiento, false);
});

// Caso 4: Solapamiento real (rechazo de colisión horaria)
test('Caso 4: Solapamiento real en mismo colaborador es detectado y bloqueado', () => {
  const existentes = [
    { id: 'l1', colaboradorId: 'COL-001', horaInicio: '08:00', horaFin: '11:00' },
  ];
  const nuevoChoque = {
    id: 'l2',
    colaboradorId: 'COL-001',
    horaInicio: '10:30',
    horaFin: '12:00',
  };
  const solap = detectarSolapamientoTemporal(existentes, nuevoChoque);
  assert.equal(solap.haySolapamiento, true);
  assert.match(solap.mensajeError!, /COL-001 ya tiene una labor/i);

  // Tareas contiguas exactas (11:00 a 13:00) NO deben solapar
  const contiguo = {
    id: 'l3',
    colaboradorId: 'COL-001',
    horaInicio: '11:00',
    horaFin: '13:00',
  };
  assert.equal(detectarSolapamientoTemporal(existentes, contiguo).haySolapamiento, false);
});

// Caso 5: Pausa excluida del tiempo efectivo según regla aprobada
test('Caso 5: Pausa deducible se resta del tiempo computable', () => {
  const res = calcularJornadaLaboral('06:30', '12:30', [
    { tipo: 'desayuno', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'pausa_5min', duracionMinutos: 5, esDeduccionComputable: true },
  ]);
  // 360 min brutos - 35 min pausas = 325 min computables
  assert.equal(res.minutosEfectivosNetos, 325);
});

// Caso 6: Labor pendiente
test('Caso 6: Labor pendiente con justificación calcula cumplimiento sin penalizar injustamente', () => {
  const res = calcularCumplimientoCantidad(70, 100);
  assert.equal(res.cumplimientoCantidadPct, 70);
  assert.equal(res.estadoCumplimiento, 'META_EN_DEFICIT');
});

// Caso 7: Labor sin estándar temporal
test('Caso 7: Labor sin estándar retorna null y estado ESTANDAR_NO_DISPONIBLE', () => {
  const res = calcularRendimientoTemporal(null, 120, 240);
  assert.equal(res.rendimientoTemporalPct, null);
  assert.equal(res.estadoCalculo, 'ESTANDAR_NO_DISPONIBLE');
});

// Caso 8: División por cero prevenida
test('Caso 8: Tiempo efectivo 0 o negativo retorna TIEMPO_EFECTIVO_INVALIDO sin excepción', () => {
  const resCero = calcularRendimientoTemporal(2.5, 10, 0);
  assert.equal(resCero.rendimientoTemporalPct, null);
  assert.equal(resCero.estadoCalculo, 'TIEMPO_EFECTIVO_INVALIDO');
});

// Caso 9: Meta válida y producción completada
test('Caso 9: Producción exactamente igual a meta da 100% y META_CUMPLIDA', () => {
  const res = calcularCumplimientoCantidad(150, 150);
  assert.equal(res.cumplimientoCantidadPct, 100);
  assert.equal(res.estadoCumplimiento, 'META_CUMPLIDA');
});

// Caso 10: Muestra insuficiente (< 60 minutos)
test('Caso 10: Muestra con tiempo efectivo < 60 min se marca como insuficiente', () => {
  const evs = [
    { tiempoEfectivoMinutos: 30, tiempoEstandarTotalMinutos: 36 },
  ];
  const pond = calcularMediaPonderadaRendimiento(evs);
  assert.equal(pond.rendimientoPonderadoPct, 120);
  assert.equal(pond.muestraInsuficiente, true);
});

// Caso 11 & 12: Media ponderada por tiempo efectivo vs promedio simple distorsionado
test('Caso 11 y 12: Media ponderada por tiempo efectivo calcula 86.36% (no el 115% simple)', () => {
  // Labor corta (30m al 150% = 45m estándar), Labor larga (300m al 80% = 240m estándar)
  const evs = [
    { tiempoEfectivoMinutos: 30, tiempoEstandarTotalMinutos: 45 },
    { tiempoEfectivoMinutos: 300, tiempoEstandarTotalMinutos: 240 },
  ];
  const pond = calcularMediaPonderadaRendimiento(evs);
  assert.equal(pond.rendimientoPonderadoPct, 86.36);
  assert.equal(pond.muestraInsuficiente, false);
});

// Caso 13: Cantidad completada superior a la meta (sin clamping silencioso)
test('Caso 13: Completar 240 de meta 200 calcula 120% exacto sin truncar a 100%', () => {
  const res = calcularCumplimientoCantidad(240, 200);
  assert.equal(res.cumplimientoCantidadPct, 120);
  assert.equal(res.estadoCumplimiento, 'SOBREPASO_META');
});

// Caso 14: Oficios Varios con completados > asignados
test('Caso 14: Oficios Varios 5 tareas de 4 asignadas arroja 125% y supero_asignacion', () => {
  const res = calcularOficiosVarios(4, 5);
  assert.equal(res.cumplimientoTareasPct, 125);
  assert.equal(res.estado, 'supero_asignacion');
});

// Caso 15: Interrupción por lluvia torrencial
test('Caso 15: Deducción explícita de interrupción climática', () => {
  // 9 horas brutas (540m) - 60m comidas - 60m lluvia = 420m netos
  const res = calcularJornadaLaboral('06:30', '15:30', [
    { tipo: 'desayuno', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'almuerzo', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'climatica', duracionMinutos: 60, esDeduccionComputable: true },
  ]);
  assert.equal(res.minutosEfectivosNetos, 420);
});

// Caso 16: Producción principal con subtareas sin doble contabilización
test('Caso 16: Consolidación de cobertura no suma subtareas a metros de invernadero', () => {
  const res = consolidarProduccionCobertura(80, [
    { nombre: 'Grapado', cantidad: 80, unidad: 'm' },
    { nombre: 'Costura', cantidad: 60, unidad: 'm' },
  ]);
  assert.equal(res.produccionTotalInfraestructura, 80);
  assert.equal(res.detalleSubtareas.length, 2);
});
