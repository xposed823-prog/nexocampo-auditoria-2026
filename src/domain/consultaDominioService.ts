/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Servicio de Consulta de Dominio Compartido (Fase 3)
 * Conecta Consulta Cruzada y Reportes con los almacenes canónicos de IndexedDB:
 *  - colaboradores, labores, areas, ausencias, jornadas, asistencia
 * 
 * Reglas de Arquitectura:
 * 1. Base canónica única ('nexocampo' v4).
 * 2. Cero suposición silenciosa de errores: diferencia explícitamente entre
 *    'EXITO_COMPLETO', 'SIN_REGISTROS', 'DATOS_INCOMPLETOS' y 'ERROR_LECTURA'.
 * 3. Cálculos matemáticos basados en las fórmulas oficiales documentadas.
 * 4. Desacoplamiento estricto: la asistencia/ausencia no penaliza el rendimiento de labor.
 * 5. Labores sin estándar (ej. Oficios Varios) nunca emiten porcentajes inventados.
 * 6. Conteo de jornadas únicas sin duplicar por tramos.
 */

import {
  abrirDB,
  dbGetAll,
  StoreName,
  JornadaRegistro,
  AsistenciaRegistro,
  AusenciaRegistro,
  TramoJornada
} from './nexocampoDB';
import {
  COLABORADORES_CATALOGO,
  LABORES_AGRONOMICAS,
  Colaborador,
  LaborAgricola
} from './catalogoAgronomico';
import {
  calcularRendimientoTemporal,
  calcularCumplimientoCantidad,
  ClasificacionDato
} from './rendimientoCalculator';
import {
  calcularMediaPonderadaRendimiento
} from './businessRulesEngine';
import {
  timeStringToMinutes
} from './jornadaCalculator';

export type EstadoIntegridadConsulta =
  | 'EXITO_COMPLETO'
  | 'SIN_REGISTROS'
  | 'DATOS_INCOMPLETOS'
  | 'ERROR_LECTURA';

import {
  EVENTO_MUTACION_DATOS,
  notificarMutacionDatos,
  suscribirMutacionDatos,
  type MutacionDatosEvento
} from './eventBus';

export {
  EVENTO_MUTACION_DATOS,
  notificarMutacionDatos,
  suscribirMutacionDatos
};
export type { MutacionDatosEvento };

export interface TramoDetalleConsulta {
  id: string;
  tipo: 'labor' | 'auxiliar' | 'interrupcion' | 'incidente';
  titulo: string;
  laborId?: string;
  laborNombre?: string;
  horaInicio: string;
  horaFin: string;
  minutosCalculados: number;
  area?: string;
  bloque?: string;
  tunel?: string;
  unidadesCompletadas?: number;
  unidadMedida?: string;
  meta?: number;
  cumplimientoMetaPct: number | null;
  esOficioVario?: boolean;
  esMetaGrupal?: boolean;
  esSubtarea?: boolean;
  tipoPolisombra?: string;
  unidadesAsignadas?: number;
  cumplimientoCantidadPct?: number | null;
  tareasAsignadas?: number;
  tareasCompletadas?: number;
  cumplimientoTareasPct?: number | null;
  estandarMin?: number | null;
  rendimientoTemporalPct: number | null;
  estadoCalculoRendimiento: 'CALCULADO_VALIDO' | 'ESTANDAR_NO_DISPONIBLE' | 'TIEMPO_EFECTIVO_INVALIDO' | 'NO_APLICA';
  mensajeAuditoriaRendimiento: string;
  estadoLabor: 'planificada' | 'pendiente' | 'cumple' | 'validado' | 'rechazado_calidad' | 'no_cumple';
  observaciones?: string;
  severidadIncidente?: 'leve' | 'moderado' | 'grave';
  primerosAuxilios?: boolean;
}

export interface ResultadoConsultaCruzada {
  estadoIntegridad: EstadoIntegridadConsulta;
  mensajeEstado: string;
  colaborador: {
    id: string;
    codigo: string;
    nombre: string;
    rol: string;
    cuadrilla: string;
  } | null;
  fechaConsultada: string;
  asistencia: {
    registrado: boolean;
    estado: 'presente' | 'retardo' | 'ausencia' | 'sin_registrar' | null;
    horaEntrada?: string;
    detalleTexto: string;
  };
  jornada: {
    registrado: boolean;
    conteoJornadasDia: number;
    jornadaIds: string[];
    jornadaId?: string;
    horaApertura?: string;
    horaCierre?: string;
    minutosBrutos: number;
    minutosEfectivosNetos: number;
    tramos: TramoDetalleConsulta[];
  };
  metricasConsolidadas: {
    totalTramos: number;
    minutosEfectivosLaborales: number;
    rendimientoPonderadoPct: number | null;
    cumplimientoMetasPct: number | null;
    produccionCompletadaValida: number;
    produccionPendiente: number;
  };
  ausencias: Array<{
    id: string;
    tipo: string;
    tipoCodigo: string;
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
    justificada: boolean;
  }>;
  incidentes: Array<{
    id: string;
    hora: string;
    severidad: 'leve' | 'moderado' | 'grave';
    descripcion: string;
    area?: string;
    primerosAuxilios: boolean;
  }>;
  clasificacionDato: ClasificacionDato;
}

export interface OpcionesConsulta {
  forzarFalloDBParaTest?: boolean;
  mockDatos?: {
    colaboradores?: Colaborador[];
    labores?: LaborAgricola[];
    jornadas?: JornadaRegistro[];
    asistencia?: AsistenciaRegistro[];
    ausencias?: AusenciaRegistro[];
  };
}

/**
 * Consulta cruzada multidimensional de un colaborador en una fecha determinada.
 * Cruza Asistencia + Jornada + Labores + Ausencias + SG-SST sin datos inventados.
 */
export async function consultarColaboradorFecha(
  colaboradorId: string,
  fecha: string,
  opciones?: OpcionesConsulta
): Promise<ResultadoConsultaCruzada> {
  if (opciones?.forzarFalloDBParaTest) {
    return {
      estadoIntegridad: 'ERROR_LECTURA',
      mensajeEstado: 'Error inducido de lectura en IndexedDB para pruebas de integridad.',
      colaborador: null,
      fechaConsultada: fecha,
      asistencia: { registrado: false, estado: null, detalleTexto: 'Error al consultar IndexedDB' },
      jornada: { registrado: false, conteoJornadasDia: 0, jornadaIds: [], minutosBrutos: 0, minutosEfectivosNetos: 0, tramos: [] },
      metricasConsolidadas: {
        totalTramos: 0,
        minutosEfectivosLaborales: 0,
        rendimientoPonderadoPct: null,
        cumplimientoMetasPct: null,
        produccionCompletadaValida: 0,
        produccionPendiente: 0
      },
      ausencias: [],
      incidentes: [],
      clasificacionDato: 'incompleto'
    };
  }

  try {
    let colaboradores: Colaborador[] = [];
    let laboresCatalogo: LaborAgricola[] = [];
    let jornadas: JornadaRegistro[] = [];
    let asistencias: AsistenciaRegistro[] = [];
    let ausencias: AusenciaRegistro[] = [];

    if (opciones?.mockDatos) {
      colaboradores = opciones.mockDatos.colaboradores || COLABORADORES_CATALOGO;
      laboresCatalogo = opciones.mockDatos.labores || LABORES_AGRONOMICAS;
      jornadas = opciones.mockDatos.jornadas || [];
      asistencias = opciones.mockDatos.asistencia || [];
      ausencias = opciones.mockDatos.ausencias || [];
    } else {
      const db = await abrirDB();
      if (!db) {
        throw new Error('No se pudo conectar a la base canónica nexocampo.');
      }

      // 1. Obtener catálogos para metadata exacta
      [colaboradores, laboresCatalogo, jornadas, asistencias, ausencias] = await Promise.all([
        dbGetAll<Colaborador>('colaboradores'),
        dbGetAll<LaborAgricola>('labores'),
        dbGetAll<JornadaRegistro>('jornadas'),
        dbGetAll<AsistenciaRegistro>('asistencia'),
        dbGetAll<AusenciaRegistro>('ausencias')
      ]);
    }

    // Respaldo con catálogo fijo si colaboradores en IDB aún se están sincronizando
    const colFound = colaboradores.find(c => c.id === colaboradorId) ||
      COLABORADORES_CATALOGO.find(c => c.id === colaboradorId) || null;

    const colaboradorInfo = colFound ? {
      id: colFound.id,
      codigo: colFound.codigo,
      nombre: colFound.nombreCompleto || colFound.alias,
      rol: colFound.rol,
      cuadrilla: colFound.cuadrilla
    } : null;

    // 2. Registro de Asistencia: buscar clave compuesta normada o por ID
    const asistenciaKey = `${colaboradorId}_${fecha}`;
    const asistenciaReg = asistencias.find(
      a => a.id === asistenciaKey || (a.colaborador_id === colaboradorId && a.fecha === fecha)
    );

    let asistenciaResultado: ResultadoConsultaCruzada['asistencia'] = {
      registrado: false,
      estado: null,
      detalleTexto: 'Sin registro'
    };

    if (asistenciaReg) {
      asistenciaResultado = {
        registrado: true,
        estado: asistenciaReg.estado,
        horaEntrada: asistenciaReg.hora_entrada,
        detalleTexto: asistenciaReg.estado === 'presente'
          ? `Presente${asistenciaReg.hora_entrada ? ` (Entrada ${asistenciaReg.hora_entrada})` : ''}`
          : asistenciaReg.estado === 'retardo'
          ? `Retardo${asistenciaReg.hora_entrada ? ` (Entrada ${asistenciaReg.hora_entrada})` : ''}`
          : asistenciaReg.estado === 'ausencia'
          ? 'Ausencia formal reportada'
          : 'Sin registrar'
      };
    }

    // 3. Jornadas y tramos del colaborador en la fecha consultada (soporte multi-jornada)
    const jornadasDia = jornadas.filter(
      j => j.fecha === fecha && (j.colaboradores_ids.includes(colaboradorId) || j.colaboradores_ids.length === 0)
    );

    let jornadaResultado: ResultadoConsultaCruzada['jornada'] = {
      registrado: false,
      conteoJornadasDia: 0,
      jornadaIds: [],
      minutosBrutos: 0,
      minutosEfectivosNetos: 0,
      tramos: []
    };

    const incidentesDetectados: ResultadoConsultaCruzada['incidentes'] = [];
    const evaluacionesRendimiento: Array<{ tiempoEfectivoMinutos: number; tiempoEstandarTotalMinutos: number | null }> = [];
    let sumaMetasPct = 0;
    let conteoMetasValidas = 0;
    let produccionCompletadaValida = 0;
    let produccionPendiente = 0;
    let totalMinutosEfectivos = 0;

    if (jornadasDia.length > 0) {
      let minApertura = Infinity;
      let maxCierre = -Infinity;
      const tramosProcesados: TramoDetalleConsulta[] = [];

      // Procesar TODOS los tramos de TODAS las jornadas del colaborador en el día
      for (const j of jornadasDia) {
        for (const t of j.tramos || []) {
          let minTramo = 0;
          try {
            if (t.hora_inicio && t.hora_fin) {
              const ini = timeStringToMinutes(t.hora_inicio);
              const fin = timeStringToMinutes(t.hora_fin);
              if (fin > ini) {
                minTramo = fin - ini;
                if (ini < minApertura) minApertura = ini;
                if (fin > maxCierre) maxCierre = fin;
              }
            }
          } catch (_) {
            minTramo = 0;
          }

          // Si es incidente
          if (t.tipo === 'incidente') {
            incidentesDetectados.push({
              id: t.id,
              hora: t.hora_inicio || '00:00',
              severidad: t.severidad || 'leve',
              descripcion: t.observaciones || t.titulo || 'Incidente registrado en jornada',
              area: t.area ? `${t.area}${t.bloque ? ` - ${t.bloque}` : ''}` : undefined,
              primerosAuxilios: !!t.primeros_auxilios
            });
          }

          // Obtener labor del catálogo
          const laborInfo = laboresCatalogo.find(l => l.id === t.labor_id || l.nombre === t.labor_nombre) ||
            LABORES_AGRONOMICAS.find(l => l.id === t.labor_id || l.nombre === t.labor_nombre);

          const estandarMin = t.estandar_min !== undefined
            ? t.estandar_min
            : ((laborInfo as any)?.estandar_min !== undefined ? (laborInfo as any).estandar_min : (laborInfo?.min ?? null));
          const unidadMedida = laborInfo?.unidadMedida || (laborInfo as any)?.unidad || t.unidad || 'unidad';
          const esOficioVario = t.modelo === 'oficios_varios' ||
            t.tipo_registro === 'oficio_vario' ||
            laborInfo?.tipo_registro === 'oficio_vario';
          const tareasAsignadas = esOficioVario ? (t.tareas_asignadas ?? t.meta) : undefined;
          const tareasCompletadas = esOficioVario ? (t.tareas_completadas ?? t.completados) : undefined;
          const esMetaGrupal = t.modelo === 'grupal_meta';
          const esSubtarea = t.es_subtarea === true;
          const unidadesAsignadas = typeof t.unidades === 'number' ? t.unidades : undefined;

          // Los Oficios Varios tienen métrica operativa propia; no se suman al rendimiento técnico.
          let cumplimientoMetaPct: number | null = null;
          let cumplimientoTareasPct: number | null = null;
          let cumplimientoCantidadPct: number | null = null;
          const metaValida = !esSubtarea && typeof t.meta === 'number' && t.meta > 0;
          const completadosValidos = typeof t.completados === 'number' && t.completados >= 0;
          if (typeof t.unidades === 'number' && t.unidades > 0 && completadosValidos) {
            cumplimientoCantidadPct = Number(((t.completados! / t.unidades) * 100).toFixed(2));
          }

          if (esOficioVario) {
            if (typeof tareasAsignadas === 'number' && tareasAsignadas > 0 &&
                typeof tareasCompletadas === 'number' && tareasCompletadas >= 0) {
              cumplimientoTareasPct = Number(((tareasCompletadas / tareasAsignadas) * 100).toFixed(2));
            }
          } else if (metaValida && completadosValidos) {
            try {
              const evalCumpl = calcularCumplimientoCantidad(t.completados!, t.meta!);
              cumplimientoMetaPct = evalCumpl.cumplimientoCantidadPct;
              if (t.estado !== 'pendiente' && t.estado !== 'no_cumple') {
                sumaMetasPct += cumplimientoMetaPct;
                conteoMetasValidas++;
              }
            } catch (_) {
              cumplimientoMetaPct = null;
            }
          }

          // No mezclar cantidades de Oficios Varios con unidades técnicas de producción.
          if (!esOficioVario) {
            if (t.estado === 'no_cumple') {
              // No hubo ejecución: no suma producción completada ni pendiente.
            } else if (t.estado === 'pendiente') {
              const cantidadAsignada = metaValida ? t.meta! : (typeof t.unidades === 'number' ? t.unidades : 0);
              produccionPendiente += Math.max(0, cantidadAsignada - (completadosValidos ? t.completados! : 0));
            } else if (completadosValidos) {
              produccionCompletadaValida += t.completados!;
            } else if (typeof t.unidades === 'number' && t.unidades > 0) {
              produccionCompletadaValida += t.unidades;
            }
          }

          // Rendimiento temporal estricto: Oficios Varios no consume tiempo técnico computable.
          let rendimientoTemporalPct: number | null = null;
          let estadoCalculo: TramoDetalleConsulta['estadoCalculoRendimiento'] = 'NO_APLICA';
          let mensajeAuditoria = esOficioVario
            ? 'Oficios Varios se mide por tareas asignadas/completadas, no por estándar temporal.'
            : esSubtarea
              ? 'La subtarea hereda el horario principal y no suma tiempo técnico adicional.'
              : esMetaGrupal
                ? 'Labor grupal por meta/cantidad; no calcula rendimiento temporal.'
                : !(typeof estandarMin === 'number' && estandarMin > 0)
                  ? 'Sin estándar temporal: evaluar por meta/cantidad, sin inventar rendimiento por tiempo.'
                  : 'No aplica cálculo de rendimiento temporal.';

          if (t.tipo === 'labor' && !esOficioVario && !esSubtarea && !esMetaGrupal &&
              typeof estandarMin === 'number' && estandarMin > 0) {
            if (t.estado === 'pendiente' || t.estado === 'no_cumple') {
              mensajeAuditoria = t.estado === 'pendiente'
                ? 'Labor pendiente: excluida del rendimiento del día.'
                : 'No cumple: no hubo ejecución computable para rendimiento.';
            } else {
              totalMinutosEfectivos += minTramo;
              const unidadesParaRendimiento = completadosValidos ? t.completados! : (t.unidades || 0);
              const evalRend = calcularRendimientoTemporal(estandarMin, unidadesParaRendimiento, minTramo);

              rendimientoTemporalPct = evalRend.rendimientoTemporalPct;
              estadoCalculo = evalRend.estadoCalculo;
              mensajeAuditoria = evalRend.mensajeAuditoria;

              evaluacionesRendimiento.push({
                tiempoEfectivoMinutos: minTramo,
                tiempoEstandarTotalMinutos: evalRend.tiempoEstandarTotalMinutos
              });
            }
          }

          tramosProcesados.push({
            id: t.id,
            tipo: t.tipo,
            titulo: t.titulo,
            laborId: t.labor_id,
            laborNombre: t.labor_nombre || laborInfo?.nombre,
            horaInicio: t.hora_inicio,
            horaFin: t.hora_fin,
            minutosCalculados: minTramo,
            area: t.area,
            bloque: t.bloque,
            tunel: t.tunel,
            unidadesCompletadas: t.completados ?? t.unidades,
            unidadMedida,
            meta: t.meta,
            cumplimientoMetaPct,
            esOficioVario,
            esMetaGrupal,
            esSubtarea,
            tipoPolisombra: t.tipo_polisombra,
            unidadesAsignadas,
            cumplimientoCantidadPct,
            tareasAsignadas,
            tareasCompletadas,
            cumplimientoTareasPct,
            estandarMin,
            rendimientoTemporalPct,
            estadoCalculoRendimiento: estadoCalculo,
            mensajeAuditoriaRendimiento: mensajeAuditoria,
            estadoLabor: t.estado || 'cumple',
            observaciones: t.observaciones,
            severidadIncidente: t.severidad,
            primerosAuxilios: t.primeros_auxilios
          });
        }
      }

      const horaAperturaStr = minApertura !== Infinity ? `${String(Math.floor(minApertura / 60)).padStart(2, '0')}:${String(minApertura % 60).padStart(2, '0')}` : undefined;
      const horaCierreStr = maxCierre !== -Infinity ? `${String(Math.floor(maxCierre / 60)).padStart(2, '0')}:${String(maxCierre % 60).padStart(2, '0')}` : undefined;
      const minutosBrutosTotales = (maxCierre > minApertura && minApertura !== Infinity) ? (maxCierre - minApertura) : totalMinutosEfectivos;

      jornadaResultado = {
        registrado: true,
        conteoJornadasDia: jornadasDia.length,
        jornadaIds: jornadasDia.map(j => j.id),
        jornadaId: jornadasDia.map(j => j.id).join(', '),
        horaApertura: horaAperturaStr,
        horaCierre: horaCierreStr,
        minutosBrutos: minutosBrutosTotales,
        minutosEfectivosNetos: totalMinutosEfectivos,
        tramos: tramosProcesados
      };
    }

    // 4. Ausencias en la fecha
    const ausenciasEncontradas = ausencias.filter((a) => {
      if (a.colaborador_id !== colaboradorId) return false;
      return fecha >= a.fecha_inicio && fecha <= a.fecha_fin;
    }).map((a) => {
      const mapeoNombres: Record<string, string> = {
        I: 'Incapacidad Médica',
        JV: 'Jurado de Votación',
        LP: 'Licencia de Paternidad / Maternidad',
        P: 'Permiso Remunerado',
        V: 'Vacaciones',
        SP: 'Suspensión Disciplinaria',
        C: 'Calamidad Doméstica'
      };
      return {
        id: a.id,
        tipo: mapeoNombres[a.tipo] || a.motivo || 'Ausencia Justificada',
        tipoCodigo: a.tipo,
        fechaInicio: a.fecha_inicio,
        fechaFin: a.fecha_fin,
        motivo: a.motivo,
        justificada: a.tipo !== 'SP'
      };
    });

    // 5. Consolidación de indicadores
    let rendimientoPonderadoPct: number | null = null;
    if (evaluacionesRendimiento.length > 0) {
      const media = calcularMediaPonderadaRendimiento(evaluacionesRendimiento);
      rendimientoPonderadoPct = media.rendimientoPonderadoPct;
    }

    const cumplimientoMetasPct = conteoMetasValidas > 0
      ? Number((sumaMetasPct / conteoMetasValidas).toFixed(2))
      : null;

    // 6. Clasificación de integridad del dato
    const tieneAsistencia = asistenciaResultado.registrado;
    const tieneJornada = jornadaResultado.registrado;
    const tieneAusencia = ausenciasEncontradas.length > 0;

    let estadoIntegridad: EstadoIntegridadConsulta = 'EXITO_COMPLETO';
    let mensajeEstado = 'Consulta cruzada realizada con éxito sobre datos persistidos.';
    let clasificacionDato: ClasificacionDato = 'observado';

    if (!tieneAsistencia && !tieneJornada && !tieneAusencia) {
      estadoIntegridad = 'SIN_REGISTROS';
      mensajeEstado = 'Sin registros de jornada, asistencia ni ausencias para la fecha consultada.';
      clasificacionDato = 'incompleto';
    } else if (!tieneAsistencia && tieneJornada) {
      estadoIntegridad = 'DATOS_INCOMPLETOS';
      mensajeEstado = 'Jornada registrada sin pase de lista de asistencia correspondiente.';
      clasificacionDato = 'incompleto';
    } else if (tieneAsistencia && !tieneJornada && !tieneAusencia) {
      estadoIntegridad = 'DATOS_INCOMPLETOS';
      mensajeEstado = 'Asistencia registrada pero sin tramos de jornada asignados.';
      clasificacionDato = 'incompleto';
    }

    return {
      estadoIntegridad,
      mensajeEstado,
      colaborador: colaboradorInfo,
      fechaConsultada: fecha,
      asistencia: asistenciaResultado,
      jornada: jornadaResultado,
      metricasConsolidadas: {
        totalTramos: jornadaResultado.tramos.length,
        minutosEfectivosLaborales: totalMinutosEfectivos,
        rendimientoPonderadoPct,
        cumplimientoMetasPct,
        produccionCompletadaValida,
        produccionPendiente
      },
      ausencias: ausenciasEncontradas,
      incidentes: incidentesDetectados,
      clasificacionDato
    };
  } catch (err: any) {
    console.error('[NexoCampo] Error al ejecutar consultarColaboradorFecha:', err);
    return {
      estadoIntegridad: 'ERROR_LECTURA',
      mensajeEstado: `Error al consultar IndexedDB: ${err?.message || 'Fallo de acceso'}`,
      colaborador: null,
      fechaConsultada: fecha,
      asistencia: { registrado: false, estado: null, detalleTexto: 'Error de lectura' },
      jornada: { registrado: false, conteoJornadasDia: 0, jornadaIds: [], minutosBrutos: 0, minutosEfectivosNetos: 0, tramos: [] },
      metricasConsolidadas: {
        totalTramos: 0,
        minutosEfectivosLaborales: 0,
        rendimientoPonderadoPct: null,
        cumplimientoMetasPct: null,
        produccionCompletadaValida: 0,
        produccionPendiente: 0
      },
      ausencias: [],
      incidentes: [],
      clasificacionDato: 'incompleto'
    };
  }
}

export interface LaborResumenReporte {
  laborId: string;
  laborNombre: string;
  unidad: string;
  cantidadCompletada: number;
  cantidadPendiente: number;
  minutosEfectivosTotales: number;
  tiempoEstandarTotalMinutos: number | null;
  rendimientoPonderadoPct: number | null;
  cumplimientoMetaPct: number | null;
  tieneEstandar: boolean;
}

export interface ResultadoReporteConsolidado {
  estadoIntegridad: EstadoIntegridadConsulta;
  mensajeEstado: string;
  periodo: {
    fechaInicio: string;
    fechaFin: string;
    cuadrillaFiltro?: string;
  };
  conteoJornadasUnicas: number;
  conteoTramosTotales: number;
  minutosTotalesEfectivos: number;
  horasTotalesEfectivas: number;
  eficienciaPonderadaGlobalPct: number | null;
  estadoCalculoEficiencia: 'CALCULADO_VALIDO' | 'SIN_ESTANDARES' | 'SIN_TIEMPO_EFECTIVO' | 'SIN_REGISTROS';
  mensajeEficiencia: string;
  cumplimientoMetasGlobalPct: number | null;
  totalUnidadesCompletadas: number;
  totalUnidadesPendientes: number;
  laboresDesglose: LaborResumenReporte[];
  colaboradoresParticipantes: number;
  totalAusenciasPeriodo: number;
  totalIncidentesPeriodo: number;
  oficiosVariosResumen?: {
    registros: number;
    tareasAsignadas: number;
    tareasCompletadas: number;
    cumplimientoPct: number | null;
  };
}

/**
 * Consulta agregada y consolidada para Reportes Agrícolas en un periodo.
 * 
 * Reglas de oro:
 * 1. Conteo de jornadas únicas: NO multiplica por tramos.
 * 2. Rendimiento técnico: Media ponderada por tiempo efectivo.
 * 3. Labores sin estándar (Oficios Varios): excluidas de la eficiencia temporal técnica.
 * 4. Labores pendientes: NO suman a producción completada.
 * 5. Cero !== Ausencia de registro !== No calculable.
 */
export interface OpcionesReporte {
  cuadrilla?: string;
  forzarFalloDBParaTest?: boolean;
  mockDatos?: {
    colaboradores?: Colaborador[];
    labores?: LaborAgricola[];
    jornadas?: JornadaRegistro[];
    asistencia?: AsistenciaRegistro[];
    ausencias?: AusenciaRegistro[];
  };
}

export async function consultarReportePeriodo(
  fechaInicio: string,
  fechaFin: string,
  opciones?: OpcionesReporte
): Promise<ResultadoReporteConsolidado> {
  if (opciones?.forzarFalloDBParaTest) {
    return {
      estadoIntegridad: 'ERROR_LECTURA',
      mensajeEstado: 'Error inducido al consultar reporte en IndexedDB.',
      periodo: { fechaInicio, fechaFin, cuadrillaFiltro: opciones?.cuadrilla },
      conteoJornadasUnicas: 0,
      conteoTramosTotales: 0,
      minutosTotalesEfectivos: 0,
      horasTotalesEfectivas: 0,
      eficienciaPonderadaGlobalPct: null,
      estadoCalculoEficiencia: 'SIN_REGISTROS',
      mensajeEficiencia: 'Error de lectura en base de datos.',
      cumplimientoMetasGlobalPct: null,
      totalUnidadesCompletadas: 0,
      totalUnidadesPendientes: 0,
      laboresDesglose: [],
      colaboradoresParticipantes: 0,
      totalAusenciasPeriodo: 0,
      totalIncidentesPeriodo: 0
    };
  }

  try {
    let jornadas: JornadaRegistro[] = [];
    let laboresCatalogo: LaborAgricola[] = [];
    let ausencias: AusenciaRegistro[] = [];
    let colaboradores: Colaborador[] = [];

    if (opciones?.mockDatos) {
      jornadas = opciones.mockDatos.jornadas || [];
      laboresCatalogo = opciones.mockDatos.labores || LABORES_AGRONOMICAS;
      ausencias = opciones.mockDatos.ausencias || [];
      colaboradores = opciones.mockDatos.colaboradores || COLABORADORES_CATALOGO;
    } else {
      const db = await abrirDB();
      if (!db) {
        throw new Error('No se pudo acceder a la base canónica nexocampo.');
      }

      [jornadas, laboresCatalogo, ausencias, colaboradores] = await Promise.all([
        dbGetAll<JornadaRegistro>('jornadas'),
        dbGetAll<LaborAgricola>('labores'),
        dbGetAll<AusenciaRegistro>('ausencias'),
        dbGetAll<Colaborador>('colaboradores')
      ]);
    }

    // Filtrar colaboradores por cuadrilla si aplica
    const mapaCuadrillas = new Map<string, string>();
    colaboradores.forEach(c => mapaCuadrillas.set(c.id, c.cuadrilla));
    COLABORADORES_CATALOGO.forEach(c => {
      if (!mapaCuadrillas.has(c.id)) mapaCuadrillas.set(c.id, c.cuadrilla);
    });

    // 1. Filtrar jornadas en el rango de fechas
    const jornadasEnRango = jornadas.filter((j) => {
      if (j.fecha < fechaInicio || j.fecha > fechaFin) return false;
      if (opciones?.cuadrilla && opciones.cuadrilla !== 'todas') {
        // Al menos un colaborador de la cuadrilla
        const pertenece = j.colaboradores_ids.some(cid => mapaCuadrillas.get(cid) === opciones.cuadrilla);
        return pertenece;
      }
      return true;
    });

    // Conteo estricto de jornadas únicas (por ID)
    const jornadaIdsUnicos = new Set(jornadasEnRango.map(j => j.id));
    const conteoJornadasUnicas = jornadaIdsUnicos.size;

    // Conjunto de colaboradores únicos que participaron
    const colaboradoresUnicos = new Set<string>();
    jornadasEnRango.forEach(j => j.colaboradores_ids.forEach(cid => colaboradoresUnicos.add(cid)));

    // 2. Procesamiento de tramos agregados
    let conteoTramosTotales = 0;
    let minutosTotalesEfectivos = 0;
    let totalUnidadesCompletadas = 0;
    let totalUnidadesPendientes = 0;
    let totalIncidentesPeriodo = 0;

    const mapaLabores = new Map<string, {
      laborId: string;
      laborNombre: string;
      unidad: string;
      completadas: number;
      pendientes: number;
      minutosEfectivos: number;
      minutosEstandarTotal: number;
      metasTotal: number;
      completadasParaMetas: number;
      tieneEstandar: boolean;
      conteoTramosConMeta: number;
    }>();

    const evaluacionesGlobalesEficiencia: Array<{
      tiempoEfectivoMinutos: number;
      tiempoEstandarTotalMinutos: number | null;
    }> = [];

    let sumaCumplimientoMetas = 0;
    let conteoTramosMetasGlobal = 0;
    let conteoRegistrosOficiosVarios = 0;
    let totalTareasOficiosAsignadas = 0;
    let totalTareasOficiosCompletadas = 0;

    for (const j of jornadasEnRango) {
      for (const t of j.tramos || []) {
        conteoTramosTotales++;

        if (t.tipo === 'incidente') {
          totalIncidentesPeriodo++;
        }

        let duracionMin = 0;
        try {
          if (t.hora_inicio && t.hora_fin) {
            const ini = timeStringToMinutes(t.hora_inicio);
            const fin = timeStringToMinutes(t.hora_fin);
            if (fin > ini) duracionMin = fin - ini;
          }
        } catch (_) {
          duracionMin = 0;
        }

        // Identificar labor y separar Oficios Varios de las métricas técnicas.
        const laborInfo = laboresCatalogo.find(l => l.id === t.labor_id || l.nombre === t.labor_nombre) ||
          LABORES_AGRONOMICAS.find(l => l.id === t.labor_id || l.nombre === t.labor_nombre);

        const esOficioVario = t.modelo === 'oficios_varios' ||
          t.tipo_registro === 'oficio_vario' ||
          laborInfo?.tipo_registro === 'oficio_vario';

        if (esOficioVario) {
          conteoRegistrosOficiosVarios++;
          totalTareasOficiosAsignadas += Math.max(0, t.tareas_asignadas ?? t.meta ?? 0);
          totalTareasOficiosCompletadas += Math.max(0, t.tareas_completadas ?? t.completados ?? 0);
          continue;
        }

        // Incidentes, interrupciones y auxiliares no se suman como minutos técnicos de labor.
        if (t.tipo !== 'labor') continue;
        if (t.estado === 'no_cumple') continue;
        const esMetaGrupal = t.modelo === 'grupal_meta';
        const esSubtareaCobertura = t.es_subtarea === true;
        if (t.estado !== 'pendiente' && !esMetaGrupal && !esSubtareaCobertura) minutosTotalesEfectivos += duracionMin;

        const claveLabor = laborInfo?.id || t.labor_id || t.labor_nombre || t.titulo;
        const nombreLabor = laborInfo?.nombre || t.labor_nombre || t.titulo;
        const unidadLabor = laborInfo?.unidadMedida || (laborInfo as any)?.unidad || t.unidad || 'unidad';
        const estandarMin = t.estandar_min !== undefined
          ? t.estandar_min
          : ((laborInfo as any)?.estandar_min !== undefined ? (laborInfo as any).estandar_min : (laborInfo?.min ?? null));
        const tieneEstandar = !esMetaGrupal && !esSubtareaCobertura && typeof estandarMin === 'number' && estandarMin > 0;

        let accum = mapaLabores.get(claveLabor);
        if (!accum) {
          accum = {
            laborId: claveLabor,
            laborNombre: nombreLabor,
            unidad: unidadLabor,
            completadas: 0,
            pendientes: 0,
            minutosEfectivos: 0,
            minutosEstandarTotal: 0,
            metasTotal: 0,
            completadasParaMetas: 0,
            tieneEstandar,
            conteoTramosConMeta: 0
          };
          mapaLabores.set(claveLabor, accum);
        }

        if (t.estado !== 'pendiente' && !esMetaGrupal && !esSubtareaCobertura) accum.minutosEfectivos += duracionMin;

        // Meta física
        const metaValida = !esSubtareaCobertura && typeof t.meta === 'number' && t.meta > 0;
        const compValidos = typeof t.completados === 'number' && t.completados >= 0;

        if (metaValida && compValidos) {
          accum.metasTotal += t.meta!;
          accum.completadasParaMetas += t.completados!;
          accum.conteoTramosConMeta++;

          const pct = (t.completados! / t.meta!) * 100;
          sumaCumplimientoMetas += pct;
          conteoTramosMetasGlobal++;
        }

        // Estado pendiente vs completado
        if (t.estado === 'pendiente') {
          const cantidadAsignada = metaValida ? t.meta! : (typeof t.unidades === 'number' ? t.unidades : 0);
          const qty = Math.max(0, cantidadAsignada - (compValidos ? t.completados! : 0));
          accum.pendientes += qty;
          totalUnidadesPendientes += qty;
        } else {
          const qty = compValidos ? t.completados! : (t.unidades || 0);
          accum.completadas += qty;
          totalUnidadesCompletadas += qty;

          // Si tiene estándar computable y tiempo efectivo > 0
          if (tieneEstandar && duracionMin > 0 && t.estado !== 'pendiente') {
            const minEstTramo = estandarMin! * qty;
            accum.minutosEstandarTotal += minEstTramo;
            evaluacionesGlobalesEficiencia.push({
              tiempoEfectivoMinutos: duracionMin,
              tiempoEstandarTotalMinutos: minEstTramo
            });
          }
        }
      }
    }

    // 3. Ausencias en el periodo
    const totalAusenciasPeriodo = ausencias.filter(a => {
      // Solapamiento de rango [fechaInicio, fechaFin] con [a.fecha_inicio, a.fecha_fin]
      return a.fecha_fin >= fechaInicio && a.fecha_inicio <= fechaFin;
    }).length;

    // 4. Eficiencia ponderada global
    let eficienciaPonderadaGlobalPct: number | null = null;
    let estadoCalculoEficiencia: ResultadoReporteConsolidado['estadoCalculoEficiencia'] = 'SIN_REGISTROS';
    let mensajeEficiencia = 'Sin registros en el periodo.';

    if (conteoJornadasUnicas === 0) {
      estadoCalculoEficiencia = 'SIN_REGISTROS';
      mensajeEficiencia = 'Sin registros de jornada en el intervalo de fechas seleccionado.';
    } else if (evaluacionesGlobalesEficiencia.length === 0) {
      estadoCalculoEficiencia = 'SIN_ESTANDARES';
      mensajeEficiencia = 'No calculable: las labores registradas no cuentan con estándar temporal documentado (ej. Oficios Varios).';
    } else {
      const media = calcularMediaPonderadaRendimiento(evaluacionesGlobalesEficiencia);
      eficienciaPonderadaGlobalPct = media.rendimientoPonderadoPct;
      estadoCalculoEficiencia = 'CALCULADO_VALIDO';
      mensajeEficiencia = `Eficiencia calculada con media ponderada por ${media.tiempoTotalEfectivoMinutos} min reales trabajados.`;
    }

    // 5. Cumplimiento de metas global
    const cumplimientoMetasGlobalPct = conteoTramosMetasGlobal > 0
      ? Number((sumaCumplimientoMetas / conteoTramosMetasGlobal).toFixed(2))
      : null;

    // 6. Desglose por labor
    const laboresDesglose: LaborResumenReporte[] = Array.from(mapaLabores.values()).map(l => {
      let rendPct: number | null = null;
      if (l.tieneEstandar && l.minutosEfectivos > 0 && l.minutosEstandarTotal > 0) {
        rendPct = Number(((l.minutosEstandarTotal / l.minutosEfectivos) * 100).toFixed(2));
      }

      let metaPct: number | null = null;
      if (l.metasTotal > 0) {
        metaPct = Number(((l.completadasParaMetas / l.metasTotal) * 100).toFixed(2));
      }

      return {
        laborId: l.laborId,
        laborNombre: l.laborNombre,
        unidad: l.unidad,
        cantidadCompletada: l.completadas,
        cantidadPendiente: l.pendientes,
        minutosEfectivosTotales: l.minutosEfectivos,
        tiempoEstandarTotalMinutos: l.tieneEstandar ? l.minutosEstandarTotal : null,
        rendimientoPonderadoPct: rendPct,
        cumplimientoMetaPct: metaPct,
        tieneEstandar: l.tieneEstandar
      };
    });

    const horasTotalesEfectivas = Number((minutosTotalesEfectivos / 60).toFixed(1));

    return {
      estadoIntegridad: conteoJornadasUnicas === 0 ? 'SIN_REGISTROS' : 'EXITO_COMPLETO',
      mensajeEstado: conteoJornadasUnicas === 0
        ? 'No se encontraron jornadas para el periodo seleccionado.'
        : `Reporte consolidado exitoso: ${conteoJornadasUnicas} jornadas únicas auditadas.`,
      periodo: {
        fechaInicio,
        fechaFin,
        cuadrillaFiltro: opciones?.cuadrilla
      },
      conteoJornadasUnicas,
      conteoTramosTotales,
      minutosTotalesEfectivos,
      horasTotalesEfectivas,
      eficienciaPonderadaGlobalPct,
      estadoCalculoEficiencia,
      mensajeEficiencia,
      cumplimientoMetasGlobalPct,
      totalUnidadesCompletadas,
      totalUnidadesPendientes,
      laboresDesglose,
      colaboradoresParticipantes: colaboradoresUnicos.size,
      totalAusenciasPeriodo,
      totalIncidentesPeriodo,
      oficiosVariosResumen: {
        registros: conteoRegistrosOficiosVarios,
        tareasAsignadas: totalTareasOficiosAsignadas,
        tareasCompletadas: totalTareasOficiosCompletadas,
        cumplimientoPct: totalTareasOficiosAsignadas > 0
          ? Number(((totalTareasOficiosCompletadas / totalTareasOficiosAsignadas) * 100).toFixed(2))
          : null
      }
    };
  } catch (err: any) {
    console.error('[NexoCampo] Error al ejecutar consultarReportePeriodo:', err);
    return {
      estadoIntegridad: 'ERROR_LECTURA',
      mensajeEstado: `Error al consultar IndexedDB: ${err?.message || 'Fallo de acceso'}`,
      periodo: { fechaInicio, fechaFin, cuadrillaFiltro: opciones?.cuadrilla },
      conteoJornadasUnicas: 0,
      conteoTramosTotales: 0,
      minutosTotalesEfectivos: 0,
      horasTotalesEfectivas: 0,
      eficienciaPonderadaGlobalPct: null,
      estadoCalculoEficiencia: 'SIN_REGISTROS',
      mensajeEficiencia: 'Error en transacción de lectura.',
      cumplimientoMetasGlobalPct: null,
      totalUnidadesCompletadas: 0,
      totalUnidadesPendientes: 0,
      laboresDesglose: [],
      colaboradoresParticipantes: 0,
      totalAusenciasPeriodo: 0,
      totalIncidentesPeriodo: 0
    };
  }
}
