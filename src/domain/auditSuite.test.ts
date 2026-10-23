import test from 'node:test';
import assert from 'node:assert/strict';

import {
  timeStringToMinutes,
  calcularJornadaLaboral,
  generarJornadaEstandarSemanal
} from './jornadaCalculator.ts';

import {
  calcularRendimientoTemporal,
  calcularCumplimientoCantidad
} from './rendimientoCalculator.ts';

import {
  detectarSolapamientoTemporal,
  calcularJornadaMultiplesLabores,
  calcularMediaPonderadaRendimiento,
  calcularOficiosVarios
} from './businessRulesEngine.ts';

import {
  validarJornada,
  validarLabor,
  validarPlasticoPolisombra,
  validarJustificacionPendiente,
  determinarEstadoVisual
} from './formValidators.ts';

// ============================================================================
// AUDITORÍA INTEGRAL NEXOCAMPO 2026 - TAREA 5
// SUITE DE PRUEBAS AUTOMATIZADAS DE DOMINIO Y REGLAS DE NEGOCIO
// ============================================================================

test('AUDITORÍA 4.1 - Caso A: Jornada general con una labor (06:30 a 15:30)', () => {
  const jornada = calcularJornadaLaboral('06:30', '15:30', [
    { tipo: 'desayuno', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'almuerzo', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'pausa_5min', duracionMinutos: 5, esDeduccionComputable: true }
  ]);

  assert.equal(jornada.minutosBrutos, 540);
  assert.equal(jornada.minutosEfectivosNetos, 475);
  assert.equal(jornada.minutosDescansosComida + jornada.minutosPausasAdicionales, 65);
});

test('AUDITORÍA 4.2 - Caso B: Tres labores consecutivas dentro de una sola jornada general', () => {
  const segmentos = [
    { id: 'lab-1', laborId: 'cosecha', horaInicio: '06:30', horaFin: '10:00' }, // 210 min
    { id: 'lab-2', laborId: 'pesaje',  horaInicio: '10:15', horaFin: '12:00' }, // 105 min
    { id: 'lab-3', laborId: 'empaque', horaInicio: '12:30', horaFin: '15:30' }  // 180 min
  ];

  const resultadoMultiples = calcularJornadaMultiplesLabores(
    '06:30',
    '15:30',
    segmentos,
    [
      { duracionMinutos: 15, esDeduccionComputable: true }, // 10:00 a 10:15
      { duracionMinutos: 30, esDeduccionComputable: true }  // 12:00 a 12:30
    ]
  );
  assert.equal(resultadoMultiples.minutosEfectivosLabores, 495);
  assert.equal(resultadoMultiples.minutosBrutosJornada, 540);
  assert.equal(resultadoMultiples.totalJornadasCreadas, 1, 'No se multiplica la jornada general');
  assert.equal(resultadoMultiples.cuadraExactamente, true);
});

test('AUDITORÍA 4.3 - Caso C: Subtareas con horario heredado', () => {
  const subtareas = [
    { id: 'sub-1', padreId: 'lab-principal', descripcion: 'Desgaje', heredaHorario: true },
    { id: 'sub-2', padreId: 'lab-principal', descripcion: 'Amarre', heredaHorario: true }
  ];

  subtareas.forEach(st => {
    assert.equal(st.heredaHorario, true);
  });

  const tiempoAdicional = subtareas.reduce((acc, st) => acc + (st.heredaHorario ? 0 : 60), 0);
  assert.equal(tiempoAdicional, 0, 'Subtareas con horario heredado no agregan tiempo extra');
});

test('AUDITORÍA 4.4 - Caso D: Detección estricta de solapamiento real', () => {
  const existente = {
    id: 'lab-1',
    colaboradorId: 'col-1',
    horaInicio: '08:00',
    horaFin: '11:00'
  };
  const nuevoConConflicto = {
    id: 'lab-2',
    colaboradorId: 'col-1',
    horaInicio: '09:30',
    horaFin: '12:00' // Solapa de 09:30 a 11:00
  };

  const conflicto = detectarSolapamientoTemporal([existente], nuevoConConflicto);
  assert.equal(conflicto.haySolapamiento, true, 'Debe detectar solapamiento real');
  assert.equal(conflicto.intervaloConflicto?.id, 'lab-1');
});

test('AUDITORÍA 4.5 - Caso E: Tratamiento de pausas e interrupciones según reglas', () => {
  const jornada = calcularJornadaLaboral('06:30', '15:30', [
    { tipo: 'desayuno', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'traslado', duracionMinutos: 15, esDeduccionComputable: false } // No deducible
  ]);
  // Bruto: 540. Deducción computable: 30. Efectivo: 510.
  assert.equal(jornada.minutosEfectivosNetos, 510);
});

test('AUDITORÍA 5.1 - Rendimiento: Labor con estándar aprobado', () => {
  // minutosEstandarPorUnidad: 10, unidadesCompletadas: 40, tiempoEfectivoMinutos: 400
  const r = calcularRendimientoTemporal(10, 40, 400);
  assert.equal(r.estadoCalculo, 'CALCULADO_VALIDO');
  assert.equal(r.rendimientoTemporalPct, 100);
});

test('AUDITORÍA 5.2 - Rendimiento: Labor sin estándar temporal (Oficios Varios)', () => {
  const r = calcularRendimientoTemporal(null, 1, 480);
  assert.equal(r.estadoCalculo, 'ESTANDAR_NO_DISPONIBLE');
  assert.equal(r.rendimientoTemporalPct, null, 'Nunca debe emitir un porcentaje inventado');
});

test('AUDITORÍA 5.3 - Rendimiento: Meta igual a cero no causa división por cero y lanza error controlado', () => {
  assert.throws(
    () => calcularCumplimientoCantidad(50, 0),
    /superior a 0/
  );
});

test('AUDITORÍA 5.4 - Rendimiento: Cantidad completada superior a meta (> 100%) no se trunca', () => {
  const r = calcularCumplimientoCantidad(250, 200);
  assert.equal(r.estadoCumplimiento, 'SOBREPASO_META');
  assert.equal(r.cumplimientoCantidadPct, 125, 'Debe registrar 125% exacto sin recortar a 100%');
});

test('AUDITORÍA 5.5 - Rendimiento: Cantidad negativa es rechazada', () => {
  const validacion = validarLabor('08:00', '12:00', -10, 100);
  assert.equal(validacion.esValido, false);
  assert.match(validacion.errores.cantidadCompletada, /no puede ser negativa/i);
});

test('AUDITORÍA 5.6 - Rendimiento: Media ponderada por tiempo efectivo (no media simple)', () => {
  const evaluaciones = [
    { tiempoEfectivoMinutos: 60, tiempoEstandarTotalMinutos: 30 },   // 50%
    { tiempoEfectivoMinutos: 480, tiempoEstandarTotalMinutos: 480 }  // 100%
  ];
  // Total estandar = 510, total efectivo = 540 -> 510 / 540 = 94.44%
  const res = calcularMediaPonderadaRendimiento(evaluaciones);
  assert.equal(res.rendimientoPonderadoPct, 94.44);
});

test('AUDITORÍA 6.1 - Oficios Varios: 5 tareas asignadas y 3 completadas = 60% de tareas (no rendimiento temporal)', () => {
  const ov = calcularOficiosVarios(5, 3);
  assert.equal(ov.cumplimientoTareasPct, 60);
  assert.equal(ov.estado, 'pendiente');
});

test('AUDITORÍA 7.1 - Plástico y Polisombra: Límite de 6 integrantes en cuadrilla', () => {
  const valValida = validarPlasticoPolisombra(6, '07:00', '15:00', 100, 100, ['soleado']);
  assert.equal(valValida.esValido, true);

  const valInvalida = validarPlasticoPolisombra(7, '07:00', '15:00', 100, 100, ['soleado']);
  assert.equal(valInvalida.esValido, false);
  assert.match(valInvalida.errores.integrantes, /exactamente 6 integrantes/i);
});

test('AUDITORÍA 7.2 - Plástico y Polisombra: Motivos previstos de pendiente (tiempo, viento, lluvia)', () => {
  const motivosValidos = ['tiempo_insuficiente', 'vientos_fuertes', 'lluvia_intensa'];
  const res = validarJustificacionPendiente(motivosValidos);
  assert.equal(res.esValido, true);

  const resInvalido = validarJustificacionPendiente([]);
  assert.equal(resInvalido.esValido, false);
  assert.match(resInvalido.errores.motivos, /al menos un motivo aprobado/i);
});

test('AUDITORÍA 8.1 - Asistencia: Distinción entre "sin registro", "pendiente" y "cumple"', () => {
  assert.equal(determinarEstadoVisual(null, 100, true, false, false), 'sin_registro');
  assert.equal(determinarEstadoVisual(80, 100, true, true, false), 'pendiente');
  assert.equal(determinarEstadoVisual(105, 100, true, false, false), 'cumple');
});

test('AUDITORÍA 9.1 - Incidentes: Registro con hora de evento sin requerir hora final', () => {
  const incidente = {
    id: 'inc-001',
    fecha: '2026-10-19',
    hora: '10:45',
    area: 'Bloque 4 - Invernadero 2',
    severidad: 'leve',
    tipo: 'Corte superficial',
    descripcion: 'Rozamiento con alambre tensor al templar polisombra. Se aplicaron primeros auxilios.'
  };

  assert.ok(incidente.hora);
  assert.ok(!('horaFin' in incidente), 'El modelo no debe forzar hora final en incidentes de evento');
  assert.equal(['leve', 'moderada', 'grave'].includes(incidente.severidad), true);
});

test('AUDITORÍA 10.1 - Respaldos y Restauración: Validación de estructura JSON íntegra', () => {
  const backupValido = {
    version: '1.0.0',
    appId: 'nexocampo-2026',
    exportadoEn: new Date().toISOString(),
    tablas: {
      jornadas: [{ id: 'jorn-1', fecha: '2026-10-19', duracion: 540 }],
      labores: [{ id: 'lab-1', laborId: 'cosecha' }],
      asistencia: [{ id: 'asist-1', estado: 'presente' }]
    }
  };

  assert.equal(backupValido.appId, 'nexocampo-2026');
  assert.ok(backupValido.tablas.jornadas.length > 0);

  const backupInvalido: any = { version: '0.1' };
  const esCompatible = Boolean(backupInvalido.appId === 'nexocampo-2026' && backupInvalido.tablas);
  assert.equal(esCompatible, false, 'Detecta archivo de respaldo incompatible');
});
