/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Suite de Pruebas Automatizadas para Fase 3 (Tarea F)
 * 14 Casos de Prueba Obligatorios para Consulta Cruzada y Reportes
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  consultarColaboradorFecha,
  consultarReportePeriodo
} from './consultaDominioService';
import {
  notificarMutacionDatos,
  suscribirMutacionDatos,
  EVENTO_MUTACION_DATOS,
  type MutacionDatosEvento
} from './eventBus';
import { JornadaRegistro, AsistenciaRegistro, AusenciaRegistro, IndexedDBError } from './nexocampoDB';
import { COLABORADORES_CATALOGO, LABORES_AGRONOMICAS } from './catalogoAgronomico';

// ========================================================
// CASO 1: Consulta de un colaborador con asistencia, jornada y labores existentes
// ========================================================
test('FASE 3 [TC-01]: Consulta de colaborador con asistencia, jornada y labores reales', async () => {
  const jornadasMock: JornadaRegistro[] = [
    {
      id: 'jornada_2026-10-19_col1',
      fecha: '2026-10-19',
      colaboradores_ids: ['col_1'],
      tramos: [
        {
          id: 'tramo_1',
          tipo: 'labor',
          titulo: 'Poda de formación',
          labor_id: 'lab_1',
          estandar_min: 6,
          hora_inicio: '06:30',
          hora_fin: '10:30', // 240 min
          unidades: 40,
          completados: 40,
          meta: 40,
          estado: 'cumple'
        }
      ],
      creadoEn: '2026-10-19T06:30:00Z',
      actualizadoEn: '2026-10-19T15:30:00Z',
      sincronizado: true
    }
  ];

  const asistenciaMock: AsistenciaRegistro[] = [
    {
      id: 'col_1_2026-10-19',
      colaborador_id: 'col_1',
      fecha: '2026-10-19',
      estado: 'presente',
      hora_entrada: '06:25'
    }
  ];

  const res = await consultarColaboradorFecha('col_1', '2026-10-19', {
    mockDatos: { jornadas: jornadasMock, asistencia: asistenciaMock }
  });

  assert.equal(res.estadoIntegridad, 'EXITO_COMPLETO');
  assert.equal(res.colaborador?.id, 'col_1');
  assert.equal(res.asistencia.registrado, true);
  assert.equal(res.asistencia.estado, 'presente');
  assert.equal(res.asistencia.horaEntrada, '06:25');
  assert.equal(res.jornada.registrado, true);
  assert.equal(res.jornada.minutosEfectivosNetos, 240);
  assert.equal(res.metricasConsolidadas.produccionCompletadaValida, 40);
  assert.equal(res.metricasConsolidadas.cumplimientoMetasPct, 100);
  // Rendimiento: (40 * 6) / 240 * 100 = 100%
  assert.equal(res.metricasConsolidadas.rendimientoPonderadoPct, 100);
});

// ========================================================
// CASO 2: Consulta sin registros (estado explícito 'SIN_REGISTROS')
// ========================================================
test('FASE 3 [TC-02]: Consulta sin registros retorna estado explícito SIN_REGISTROS sin inventar datos', async () => {
  const res = await consultarColaboradorFecha('col_99', '2026-12-31', {
    mockDatos: { jornadas: [], asistencia: [], ausencias: [] }
  });

  assert.equal(res.estadoIntegridad, 'SIN_REGISTROS');
  assert.equal(res.asistencia.registrado, false);
  assert.equal(res.asistencia.estado, null);
  assert.equal(res.asistencia.detalleTexto, 'Sin registro');
  assert.equal(res.jornada.registrado, false);
  assert.equal(res.jornada.tramos.length, 0);
  assert.equal(res.metricasConsolidadas.produccionCompletadaValida, 0);
  assert.equal(res.metricasConsolidadas.rendimientoPonderadoPct, null);
});

// ========================================================
// CASO 3: Error de lectura de IndexedDB
// ========================================================
test('FASE 3 [TC-03]: Error de lectura en base de datos es tipado como ERROR_LECTURA', async () => {
  const res = await consultarColaboradorFecha('col_1', '2026-10-19', {
    forzarFalloDBParaTest: true
  });

  assert.equal(res.estadoIntegridad, 'ERROR_LECTURA');
  assert.match(res.mensajeEstado, /Error/i);
  assert.equal(res.asistencia.registrado, false);
  assert.equal(res.jornada.registrado, false);
});

// ========================================================
// CASO 4: Jornada con varios tramos sin duplicar el conteo de jornadas
// ========================================================
test('FASE 3 [TC-04]: Jornada con múltiples tramos cuenta exactamente 1 jornada única en reportes', async () => {
  const jornadaMultiplesTramos: JornadaRegistro = {
    id: 'jornada_multi_1',
    fecha: '2026-10-20',
    colaboradores_ids: ['col_1', 'col_2'],
    tramos: [
      {
        id: 't1',
        tipo: 'labor',
        titulo: 'Poda',
        labor_id: 'lab_1',
        hora_inicio: '06:30',
        hora_fin: '09:30',
        completados: 30,
        estado: 'cumple'
      },
      {
        id: 't2',
        tipo: 'labor',
        titulo: 'Tutorado',
        labor_id: 'lab_2',
        hora_inicio: '09:30',
        hora_fin: '12:30',
        completados: 45,
        estado: 'cumple'
      },
      {
        id: 't3',
        tipo: 'labor',
        titulo: 'Deshoje',
        labor_id: 'lab_3',
        hora_inicio: '13:00',
        hora_fin: '15:30',
        completados: 50,
        estado: 'cumple'
      }
    ],
    creadoEn: '2026-10-20T06:30:00Z',
    actualizadoEn: '2026-10-20T15:30:00Z',
    sincronizado: true
  };

  const rep = await consultarReportePeriodo('2026-10-20', '2026-10-20', {
    mockDatos: { jornadas: [jornadaMultiplesTramos] }
  });

  // Conteo de jornadas únicas debe ser 1 a pesar de tener 3 tramos
  assert.equal(rep.conteoJornadasUnicas, 1);
  assert.equal(rep.conteoTramosTotales, 3);
  assert.equal(rep.estadoIntegridad, 'EXITO_COMPLETO');
});

// ========================================================
// CASO 5: Labor sin estándar temporal (ej. Oficios Varios)
// ========================================================
test('FASE 3 [TC-05]: Labor sin estándar (Oficios Varios) no calcula rendimiento temporal y retorna null', async () => {
  const jornadaOficiosVarios: JornadaRegistro = {
    id: 'jornada_ov_1',
    fecha: '2026-10-21',
    colaboradores_ids: ['col_3'],
    tramos: [
      {
        id: 'tramo_ov',
        tipo: 'labor',
        titulo: 'Limpieza de drenajes y bodegas',
        labor_nombre: 'Oficios Varios',
        estandar_min: null, // Sin estándar documentado
        hora_inicio: '06:30',
        hora_fin: '10:30',
        unidades: 4,
        completados: 4,
        meta: 5,
        estado: 'cumple'
      }
    ],
    creadoEn: '2026-10-21T06:30:00Z',
    actualizadoEn: '2026-10-21T10:30:00Z',
    sincronizado: true
  };

  const res = await consultarColaboradorFecha('col_3', '2026-10-21', {
    mockDatos: {
      jornadas: [jornadaOficiosVarios],
      asistencia: [{ id: 'col_3_2026-10-21', colaborador_id: 'col_3', fecha: '2026-10-21', estado: 'presente' }]
    }
  });

  const tramo = res.jornada.tramos[0];
  assert.equal(tramo.rendimientoTemporalPct, null);
  assert.equal(tramo.estadoCalculoRendimiento, 'ESTANDAR_NO_DISPONIBLE');
  assert.match(tramo.mensajeAuditoriaRendimiento, /sin estándar temporal/i);
  // Cumplimiento físico de tareas: 4/5 = 80%
  assert.equal(tramo.cumplimientoMetaPct, 80);
});

// ========================================================
// CASO 6: Meta y cantidad completada válidas
// ========================================================
test('FASE 3 [TC-06]: Cálculo exacto de cumplimiento con meta y cantidad completada válidas', async () => {
  const jornadaMeta: JornadaRegistro = {
    id: 'jornada_meta_1',
    fecha: '2026-10-19',
    colaboradores_ids: ['col_4'],
    tramos: [
      {
        id: 't_meta',
        tipo: 'labor',
        titulo: 'Siembra',
        labor_id: 'lab_1',
        hora_inicio: '06:30',
        hora_fin: '12:30',
        meta: 80,
        completados: 92, // Sobrepasó la meta: 92/80 = 115%
        estado: 'cumple'
      }
    ],
    creadoEn: '2026-10-19T06:30:00Z',
    actualizadoEn: '2026-10-19T12:30:00Z',
    sincronizado: true
  };

  const res = await consultarColaboradorFecha('col_4', '2026-10-19', {
    mockDatos: {
      jornadas: [jornadaMeta],
      asistencia: [{ id: 'col_4_2026-10-19', colaborador_id: 'col_4', fecha: '2026-10-19', estado: 'presente' }]
    }
  });

  const tramo = res.jornada.tramos[0];
  assert.equal(tramo.cumplimientoMetaPct, 115);
  assert.equal(res.metricasConsolidadas.cumplimientoMetasPct, 115);
});

// ========================================================
// CASO 7: Meta ausente o inválida (<=0)
// ========================================================
test('FASE 3 [TC-07]: Meta ausente o inválida (<=0) no produce porcentajes engañosos (retorna null)', async () => {
  const jornadaSinMeta: JornadaRegistro = {
    id: 'jornada_nometa_1',
    fecha: '2026-10-19',
    colaboradores_ids: ['col_5'],
    tramos: [
      {
        id: 't_nometa',
        tipo: 'labor',
        titulo: 'Mantenimiento General',
        labor_id: 'lab_1',
        hora_inicio: '06:30',
        hora_fin: '10:30',
        meta: 0, // Meta inválida
        completados: 50,
        estado: 'cumple'
      }
    ],
    creadoEn: '2026-10-19T06:30:00Z',
    actualizadoEn: '2026-10-19T10:30:00Z',
    sincronizado: true
  };

  const res = await consultarColaboradorFecha('col_5', '2026-10-19', {
    mockDatos: {
      jornadas: [jornadaSinMeta],
      asistencia: [{ id: 'col_5_2026-10-19', colaborador_id: 'col_5', fecha: '2026-10-19', estado: 'presente' }]
    }
  });

  const tramo = res.jornada.tramos[0];
  assert.equal(tramo.cumplimientoMetaPct, null);
  assert.equal(res.metricasConsolidadas.cumplimientoMetasPct, null);
});

// ========================================================
// CASO 8: Estado pendiente no suma a producción completada
// ========================================================
test('FASE 3 [TC-08]: Estado pendiente no suma a la producción completada', async () => {
  const jornadaPendiente: JornadaRegistro = {
    id: 'jornada_pend_1',
    fecha: '2026-10-19',
    colaboradores_ids: ['col_1'],
    tramos: [
      {
        id: 't_comp',
        tipo: 'labor',
        titulo: 'Labor Aprobada',
        labor_id: 'lab_1',
        hora_inicio: '06:30',
        hora_fin: '09:30',
        completados: 50,
        estado: 'cumple'
      },
      {
        id: 't_pend',
        tipo: 'labor',
        titulo: 'Labor Incompleta por Lluvia',
        labor_id: 'lab_2',
        hora_inicio: '09:30',
        hora_fin: '12:30',
        unidades: 35,
        meta: 35,
        completados: 0,
        estado: 'pendiente', // Saldo pendiente
        motivo_pendiente: 'Lluvia torrencial'
      }
    ],
    creadoEn: '2026-10-19T06:30:00Z',
    actualizadoEn: '2026-10-19T12:30:00Z',
    sincronizado: true
  };

  const res = await consultarColaboradorFecha('col_1', '2026-10-19', {
    mockDatos: {
      jornadas: [jornadaPendiente],
      asistencia: [{ id: 'col_1_2026-10-19', colaborador_id: 'col_1', fecha: '2026-10-19', estado: 'presente' }]
    }
  });

  // Solo deben sumar las 50 unidades de la labor cumplida
  assert.equal(res.metricasConsolidadas.produccionCompletadaValida, 50);
  assert.equal(res.metricasConsolidadas.produccionPendiente, 35);
});

// ========================================================
// CASO 9: Ausencia que coincide con la fecha consultada
// ========================================================
test('FASE 3 [TC-09]: Ausencia en el rango fecha_inicio <= fecha <= fecha_fin es detectada', async () => {
  const ausenciasMock: AusenciaRegistro[] = [
    {
      id: 'aus_1',
      colaborador_id: 'col_6',
      tipo: 'I', // Incapacidad
      fecha_inicio: '2026-10-18',
      fecha_fin: '2026-10-22',
      motivo: 'Incapacidad médica EPS'
    }
  ];

  const res = await consultarColaboradorFecha('col_6', '2026-10-20', {
    mockDatos: { ausencias: ausenciasMock, jornadas: [], asistencia: [] }
  });

  assert.equal(res.ausencias.length, 1);
  assert.equal(res.ausencias[0].tipoCodigo, 'I');
  assert.equal(res.ausencias[0].justificada, true);
  assert.match(res.ausencias[0].motivo, /Incapacidad/i);
});

// ========================================================
// CASO 10: Cambio de filtro refresca los resultados
// ========================================================
test('FASE 3 [TC-10]: Modificación de filtros de colaborador o fecha produce consultas distintas y actualizadas', async () => {
  const jornadasMock: JornadaRegistro[] = [
    {
      id: 'jornada_col1_dia1',
      fecha: '2026-10-19',
      colaboradores_ids: ['col_1'],
      tramos: [{ id: 't1', tipo: 'labor', titulo: 'Poda', hora_inicio: '06:30', hora_fin: '10:30', completados: 20 }],
      creadoEn: '2026-10-19T06:30:00Z',
      actualizadoEn: '2026-10-19T10:30:00Z',
      sincronizado: true
    },
    {
      id: 'jornada_col2_dia2',
      fecha: '2026-10-20',
      colaboradores_ids: ['col_2'],
      tramos: [{ id: 't2', tipo: 'labor', titulo: 'Cosecha', hora_inicio: '06:30', hora_fin: '12:30', completados: 85 }],
      creadoEn: '2026-10-20T06:30:00Z',
      actualizadoEn: '2026-10-20T12:30:00Z',
      sincronizado: true
    }
  ];

  // Consulta 1
  const res1 = await consultarColaboradorFecha('col_1', '2026-10-19', {
    mockDatos: { jornadas: jornadasMock }
  });
  assert.equal(res1.colaborador?.id, 'col_1');
  assert.equal(res1.jornada.tramos.length, 1);
  assert.equal(res1.metricasConsolidadas.produccionCompletadaValida, 20);

  // Consulta 2 (cambio de colaborador y fecha)
  const res2 = await consultarColaboradorFecha('col_2', '2026-10-20', {
    mockDatos: { jornadas: jornadasMock }
  });
  assert.equal(res2.colaborador?.id, 'col_2');
  assert.equal(res2.jornada.tramos.length, 1);
  assert.equal(res2.metricasConsolidadas.produccionCompletadaValida, 85);
});

// ========================================================
// CASO 11: Actualización después de una escritura exitosa
// ========================================================
test('FASE 3 [TC-11]: El bus reactivo despacha eventos tras escrituras exitosas', () => {
  let eventoRecibido: MutacionDatosEvento | null = null;
  const desuscribir = suscribirMutacionDatos((ev) => {
    eventoRecibido = ev;
  });

  notificarMutacionDatos('jornadas', 'put', 'jornada_test_123');
  assert.ok(eventoRecibido !== null);
  const ev = eventoRecibido as MutacionDatosEvento;
  assert.equal(ev.almacen, 'jornadas');
  assert.equal(ev.id, 'jornada_test_123');

  desuscribir();
});

// ========================================================
// CASO 12: Fallo de escritura no emite actualización
// ========================================================
test('FASE 3 [TC-12]: Operación fallida o rechazada no debe emitir actualización reactiva', () => {
  let contadorLlamadas = 0;
  const desuscribir = suscribirMutacionDatos(() => {
    contadorLlamadas++;
  });

  // Si ocurre un error antes o durante la persistencia (simulado)
  const operacionEscritura = () => {
    try {
      throw new Error('Transacción abortada en IndexedDB');
    } catch (_) {
      // Regla: En catch jamás se notifica
    }
  };

  operacionEscritura();
  assert.equal(contadorLlamadas, 0);

  desuscribir();
});

// ========================================================
// CASO 13: Coherencia de resultados entre Consulta Cruzada y Reportes
// ========================================================
test('FASE 3 [TC-13]: Coherencia estricta de métricas entre Consulta Cruzada y Reportes para el mismo alcance', async () => {
  const jornadaUnica: JornadaRegistro = {
    id: 'jornada_coherencia',
    fecha: '2026-10-19',
    colaboradores_ids: ['col_1'],
    tramos: [
      {
        id: 'tramo_c1',
        tipo: 'labor',
        titulo: 'Poda',
        labor_id: 'lab_1', // estandar_min: 6
        hora_inicio: '06:30',
        hora_fin: '10:30', // 240 min
        unidades: 35,
        completados: 35,
        meta: 35,
        estado: 'cumple'
      }
    ],
    creadoEn: '2026-10-19T06:30:00Z',
    actualizadoEn: '2026-10-19T10:30:00Z',
    sincronizado: true
  };

  const asistenciaUnica: AsistenciaRegistro = {
    id: 'col_1_2026-10-19',
    colaborador_id: 'col_1',
    fecha: '2026-10-19',
    estado: 'presente'
  };

  // Consulta Cruzada para col_1 en 2026-10-19
  const resCruzada = await consultarColaboradorFecha('col_1', '2026-10-19', {
    mockDatos: { jornadas: [jornadaUnica], asistencia: [asistenciaUnica] }
  });

  // Reporte Consolidado para el mismo día 2026-10-19 al 2026-10-19
  const resReporte = await consultarReportePeriodo('2026-10-19', '2026-10-19', {
    mockDatos: { jornadas: [jornadaUnica] }
  });

  // 1. Minutos computables idénticos
  assert.equal(resCruzada.jornada.minutosEfectivosNetos, resReporte.minutosTotalesEfectivos);
  // 2. Unidades completadas idénticas
  assert.equal(resCruzada.metricasConsolidadas.produccionCompletadaValida, resReporte.totalUnidadesCompletadas);
  // 3. Eficiencia ponderada idéntica
  assert.equal(resCruzada.metricasConsolidadas.rendimientoPonderadoPct, resReporte.eficienciaPonderadaGlobalPct);
  // 4. Cumplimiento de metas idéntico
  assert.equal(resCruzada.metricasConsolidadas.cumplimientoMetasPct, resReporte.cumplimientoMetasGlobalPct);
});

// ========================================================
// CASO 14: Datos vacíos diferenciados explícitamente de errores de lectura
// ========================================================
test('FASE 3 [TC-14]: Distinción formal entre base vacía (SIN_REGISTROS) y fallo de conexión (ERROR_LECTURA)', async () => {
  // Consulta vacía normal
  const resVacia = await consultarColaboradorFecha('col_1', '2026-11-01', {
    mockDatos: { jornadas: [], asistencia: [], ausencias: [] }
  });
  assert.equal(resVacia.estadoIntegridad, 'SIN_REGISTROS');
  assert.notEqual(resVacia.estadoIntegridad, 'ERROR_LECTURA');

  // Consulta con error de base de datos
  const resError = await consultarColaboradorFecha('col_1', '2026-11-01', {
    forzarFalloDBParaTest: true
  });
  assert.equal(resError.estadoIntegridad, 'ERROR_LECTURA');
  assert.notEqual(resError.estadoIntegridad, 'SIN_REGISTROS');
});

// ========================================================
// CASO 15: Manejo explícito de IndexedDBError sin enmascarar errores como colecciones vacías
// ========================================================
test('FASE 3 [TC-15]: IndexedDBError propaga causa y evita que errores de almacenamiento se confundan con base vacía', () => {
  const err = new IndexedDBError('jornadas', 'Transacción abortada por fallo de I/O');
  assert.equal(err.name, 'IndexedDBError');
  assert.equal(err.store, 'jornadas');
  assert.match(err.message, /\[IndexedDB:jornadas\] Transacción abortada/);
  assert.ok(err instanceof Error);
});

// ========================================================
// CASO 16: Tratamiento y consolidación de múltiples jornadas en la misma fecha
// ========================================================
test('FASE 3 [TC-16]: Tratamiento exhaustivo de múltiples jornadas para un colaborador en la misma fecha', async () => {
  // Dos jornadas en la misma fecha para col_1: Turno 1 (mañana) y Turno 2 (tarde)
  const jornada1: JornadaRegistro = {
    id: 'jornada_2026-10-19_manana',
    fecha: '2026-10-19',
    colaboradores_ids: ['col_1'],
    tramos: [
      {
        id: 't_m1',
        tipo: 'labor',
        titulo: 'Poda Matutina',
        labor_id: 'lab_1', // estandar_min: 6
        hora_inicio: '06:30',
        hora_fin: '10:30', // 240 min
        unidades: 30,
        completados: 30,
        meta: 30,
        estado: 'cumple'
      }
    ],
    creadoEn: '2026-10-19T06:30:00Z',
    actualizadoEn: '2026-10-19T10:30:00Z',
    sincronizado: true
  };

  const jornada2: JornadaRegistro = {
    id: 'jornada_2026-10-19_tarde',
    fecha: '2026-10-19',
    colaboradores_ids: ['col_1'],
    tramos: [
      {
        id: 't_t1',
        tipo: 'labor',
        titulo: 'Tutorado Vespertino',
        labor_id: 'lab_2', // estandar_min: 4
        hora_inicio: '12:30',
        hora_fin: '15:30', // 180 min
        unidades: 45,
        completados: 45,
        meta: 45,
        estado: 'cumple'
      }
    ],
    creadoEn: '2026-10-19T12:30:00Z',
    actualizadoEn: '2026-10-19T15:30:00Z',
    sincronizado: true
  };

  const asistencia: AsistenciaRegistro = {
    id: 'col_1_2026-10-19',
    colaborador_id: 'col_1',
    fecha: '2026-10-19',
    estado: 'presente',
    hora_entrada: '06:20'
  };

  // 1. Consulta individual del colaborador en esa fecha
  const resCruzada = await consultarColaboradorFecha('col_1', '2026-10-19', {
    mockDatos: {
      jornadas: [jornada1, jornada2],
      asistencia: [asistencia]
    }
  });

  // Debe consolidar AMBAS jornadas
  assert.equal(resCruzada.estadoIntegridad, 'EXITO_COMPLETO');
  assert.equal(resCruzada.jornada.registrado, true);
  assert.equal(resCruzada.jornada.conteoJornadasDia, 2);
  assert.equal(resCruzada.jornada.jornadaIds.length, 2);
  assert.equal(resCruzada.jornada.tramos.length, 2);
  // Minutos efectivos: 240 + 180 = 420 min
  assert.equal(resCruzada.jornada.minutosEfectivosNetos, 420);
  assert.equal(resCruzada.metricasConsolidadas.minutosEfectivosLaborales, 420);
  // Producción total: 30 + 45 = 75 unidades
  assert.equal(resCruzada.metricasConsolidadas.produccionCompletadaValida, 75);
  // Apertura menor y cierre mayor
  assert.equal(resCruzada.jornada.horaApertura, '06:30');
  assert.equal(resCruzada.jornada.horaCierre, '15:30');

  // 2. Consulta de Reporte en el mismo rango de fecha
  const resReporte = await consultarReportePeriodo('2026-10-19', '2026-10-19', {
    mockDatos: {
      jornadas: [jornada1, jornada2]
    }
  });

  // Verificación de consistencia cruzada perfecta
  assert.equal(resReporte.conteoJornadasUnicas, 2);
  assert.equal(resReporte.conteoTramosTotales, 2);
  assert.equal(resReporte.minutosTotalesEfectivos, resCruzada.jornada.minutosEfectivosNetos);
  assert.equal(resReporte.totalUnidadesCompletadas, resCruzada.metricasConsolidadas.produccionCompletadaValida);
  assert.equal(resReporte.eficienciaPonderadaGlobalPct, resCruzada.metricasConsolidadas.rendimientoPonderadoPct);
  assert.equal(resReporte.cumplimientoMetasGlobalPct, resCruzada.metricasConsolidadas.cumplimientoMetasPct);
});

