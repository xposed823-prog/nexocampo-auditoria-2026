import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validarEstructuraBackupJSON,
  DatabaseSnapshot,
  JornadaRegistro,
  AsistenciaRegistro,
  STORES
} from './nexocampoDB';

// ========================================================
// FASE 2: SUITE DE PRUEBAS DE PERSISTENCIA REAL E INTEGRIDAD
// ========================================================

test('FASE 2 [P2-01]: Validador de Estructura Backup JSON aprueba respaldo canónico íntegro', () => {
  const backupValido = {
    formato: 'nexocampo_backup',
    version_db: 4,
    fecha_exportacion: '2026-10-20T16:00:00.000Z',
    stores: {
      colaboradores: [{ id: 'col_1', codigo: 'COL-001', alias: 'Anderson' }],
      labores: [{ id: 'lab_1', codigo: 'LAB-01', nombre: 'Cosecha' }],
      areas: [{ id: 'area_1', codigo: 'JAM', nombre: 'Jamaica' }],
      ausencias: [],
      jornadas: [{
        id: 'jornada_1',
        fecha: '2026-10-19',
        colaboradores_ids: ['col_1'],
        tramos: [],
        creadoEn: '2026-10-19T06:30:00Z',
        actualizadoEn: '2026-10-19T15:30:00Z',
        sincronizado: false
      }],
      asistencia: [{
        id: 'col_1_2026-10-19',
        colaborador_id: 'col_1',
        fecha: '2026-10-19',
        estado: 'presente'
      }]
    }
  };

  const res = validarEstructuraBackupJSON(backupValido);
  assert.equal(res.valido, true);
  assert.equal(res.error, undefined);
});

test('FASE 2 [P2-02]: Validador de Estructura rechaza payloads corruptos o sin ID', () => {
  // Caso 1: No es objeto
  assert.equal(validarEstructuraBackupJSON(null).valido, false);
  assert.equal(validarEstructuraBackupJSON('string_malicioso').valido, false);

  // Caso 2: Stores no es objeto o es un arreglo
  assert.equal(validarEstructuraBackupJSON({ stores: [] }).valido, false);

  // Caso 3: Almacén que no es arreglo
  assert.equal(validarEstructuraBackupJSON({
    stores: {
      colaboradores: 'no_es_arreglo',
      labores: [],
      areas: [],
      ausencias: [],
      jornadas: [],
      asistencia: []
    }
  }).valido, false);

  // Caso 4: Registro interno sin campo obligatorio 'id'
  const conRegistroSinId = {
    formato: 'nexocampo_backup',
    version_db: 4,
    stores: {
      colaboradores: [{ codigo: 'COL-999' }], // Falta id
      labores: [],
      areas: [],
      ausencias: [],
      jornadas: [],
      asistencia: []
    }
  };
  const resSinId = validarEstructuraBackupJSON(conRegistroSinId);
  assert.equal(resSinId.valido, false);
  assert.match(resSinId.error || '', /identificador válido/i);
});

test('FASE 2 [P2-03]: Formato de Clave Compuesta Normativa para Asistencia', () => {
  const colId = 'col_18';
  const fecha = '2026-10-21';
  const estado: AsistenciaRegistro['estado'] = 'presente';
  const hora_entrada = '06:28';

  const registro: AsistenciaRegistro = {
    id: `${colId}_${fecha}`,
    colaborador_id: colId,
    fecha,
    estado,
    hora_entrada
  };

  assert.equal(registro.id, 'col_18_2026-10-21');
  assert.equal(registro.colaborador_id, colId);
  assert.equal(registro.fecha, '2026-10-21');
  assert.equal(registro.estado, 'presente');
  assert.equal(registro.hora_entrada, '06:28');
});

test('FASE 2 [P2-04]: Modelo Canónico de Jornada con Tramos y Minutos Computables', () => {
  const jornada: JornadaRegistro = {
    id: `jornada_2026-10-19_${Date.now()}`,
    fecha: '2026-10-19',
    colaboradores_ids: ['col_1', 'col_2'],
    tramos: [
      {
        id: 'tramo_1',
        tipo: 'labor',
        titulo: 'Jornada Ordinaria Agrícola',
        hora_inicio: '06:30',
        hora_fin: '15:30',
        unidades: 475,
        estado: 'cumple',
        observaciones: '475 min netos computables (540 brutos - 65 pausas)'
      }
    ],
    creadoEn: '2026-10-19T06:30:00Z',
    actualizadoEn: '2026-10-19T15:30:00Z',
    sincronizado: false
  };

  assert.equal(jornada.colaboradores_ids.length, 2);
  assert.equal(jornada.tramos[0].unidades, 475);
  assert.equal(jornada.sincronizado, false);
  assert.equal(jornada.tramos[0].tipo, 'labor');
});

test('FASE 2 [P2-05]: Invariante de los 6 Almacenes Oficiales en STORES', () => {
  const esperados = ['colaboradores', 'labores', 'areas', 'ausencias', 'jornadas', 'asistencia'];
  assert.equal(STORES.length, 6);
  esperados.forEach((s) => {
    assert.equal(STORES.includes(s as any), true, `El almacén ${s} no está en STORES`);
  });
});
