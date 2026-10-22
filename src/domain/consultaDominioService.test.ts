import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  consultarColaboradorFecha,
  consultarReportePeriodo
} from './consultaDominioService';
import type { Colaborador } from './catalogoAgronomico';
import type { JornadaRegistro } from './nexocampoDB';

const FECHA = '2026-10-22';
const colaborador: Colaborador = {
  id: 'col_test_001',
  codigo: 'TEST-001',
  nombreCompleto: 'Colaborador de prueba',
  alias: 'Prueba',
  rol: 'Operario de prueba',
  cuadrilla: 'Cuadrilla de prueba'
};

const jornadaOficios: JornadaRegistro = {
  id: 'jornada_test_oficio_001',
  fecha: FECHA,
  colaboradores_ids: [colaborador.id],
  tramos: [{
    id: 'tramo_test_oficio_001',
    tipo: 'labor',
    titulo: 'Oficios Varios',
    labor_id: 'oficio_test',
    labor_nombre: 'Limpieza de laterales',
    unidad: 'tarea',
    estandar_min: null,
    modelo: 'oficios_varios',
    tipo_registro: 'oficio_vario',
    hora_inicio: '06:30',
    hora_fin: '08:00',
    meta: 5,
    completados: 3,
    tareas_asignadas: 5,
    tareas_completadas: 3,
    estado: 'pendiente'
  }],
  creadoEn: '2026-10-22T12:00:00.000Z',
  actualizadoEn: '2026-10-22T12:00:00.000Z',
  sincronizado: false
};

const mockDatos = {
  colaboradores: [colaborador],
  labores: [],
  jornadas: [jornadaOficios],
  asistencia: [],
  ausencias: []
};

describe('separación matemática de Oficios Varios', () => {
  it('muestra el porcentaje de tareas en Consulta Cruzada sin afectar el rendimiento técnico', async () => {
    const result = await consultarColaboradorFecha(colaborador.id, FECHA, { mockDatos });

    assert.equal(result.jornada.tramos.length, 1);
    assert.equal(result.jornada.tramos[0].esOficioVario, true);
    assert.equal(result.jornada.tramos[0].tareasAsignadas, 5);
    assert.equal(result.jornada.tramos[0].tareasCompletadas, 3);
    assert.equal(result.jornada.tramos[0].cumplimientoTareasPct, 60);
    assert.equal(result.jornada.tramos[0].rendimientoTemporalPct, null);
    assert.equal(result.metricasConsolidadas.minutosEfectivosLaborales, 0);
    assert.equal(result.metricasConsolidadas.rendimientoPonderadoPct, null);
    assert.equal(result.metricasConsolidadas.cumplimientoMetasPct, null);
    assert.equal(result.metricasConsolidadas.produccionCompletadaValida, 0);
    assert.equal(result.metricasConsolidadas.produccionPendiente, 0);
  });

  it('separa las tareas de Oficios Varios del consolidado técnico del periodo', async () => {
    const result = await consultarReportePeriodo(FECHA, FECHA, { mockDatos });

    assert.equal(result.conteoJornadasUnicas, 1);
    assert.equal(result.oficiosVariosResumen?.registros, 1);
    assert.equal(result.oficiosVariosResumen?.tareasAsignadas, 5);
    assert.equal(result.oficiosVariosResumen?.tareasCompletadas, 3);
    assert.equal(result.oficiosVariosResumen?.cumplimientoPct, 60);
    assert.equal(result.minutosTotalesEfectivos, 0);
    assert.equal(result.eficienciaPonderadaGlobalPct, null);
    assert.equal(result.totalUnidadesCompletadas, 0);
    assert.equal(result.cumplimientoMetasGlobalPct, null);
  });
});
