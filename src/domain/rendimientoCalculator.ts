/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Módulo de Dominio Puro: Fórmulas de Rendimiento y Clasificación de Datos
 */

export type ClasificacionDato =
  | 'observado'
  | 'incompleto'
  | 'estimado'
  | 'calculado_aprobado'
  | 'pendiente_validacion';

export interface EvaluacionRendimientoTemporal {
  tieneEstandarAprobado: boolean;
  minutosEstandarPorUnidad: number | null;
  unidadesCompletadas: number;
  tiempoEfectivoComputableMinutos: number;
  tiempoEstandarTotalMinutos: number | null;
  rendimientoTemporalPct: number | null; // (T.Estandar / T.Efectivo) * 100
  estadoCalculo: 'CALCULADO_VALIDO' | 'ESTANDAR_NO_DISPONIBLE' | 'TIEMPO_EFECTIVO_INVALIDO';
  mensajeAuditoria: string;
}

export interface EvaluacionCumplimientoCantidad {
  cantidadCompletada: number;
  cantidadObjetivo: number;
  cumplimientoCantidadPct: number; // (Cant / Objetivo) * 100
  estadoCumplimiento: 'SOBREPASO_META' | 'META_CUMPLIDA' | 'META_EN_DEFICIT';
}

/**
 * Calcula el Rendimiento Temporal (%) según la fórmula conceptual:
 * Rendimiento temporal (%) = (tiempo estándar de producción validada / tiempo efectivo computable) × 100
 * 
 * Regla: Si no existe un estándar formal aprobado (null o <= 0), no se calcula número ficticio.
 */
export function calcularRendimientoTemporal(
  minutosEstandarPorUnidad: number | null,
  unidadesCompletadas: number,
  tiempoEfectivoComputableMinutos: number
): EvaluacionRendimientoTemporal {
  if (minutosEstandarPorUnidad === null || minutosEstandarPorUnidad <= 0) {
    return {
      tieneEstandarAprobado: false,
      minutosEstandarPorUnidad: null,
      unidadesCompletadas,
      tiempoEfectivoComputableMinutos,
      tiempoEstandarTotalMinutos: null,
      rendimientoTemporalPct: null,
      estadoCalculo: 'ESTANDAR_NO_DISPONIBLE',
      mensajeAuditoria: 'Labor sin estándar temporal aprobado. No se emite porcentaje de rendimiento técnico.',
    };
  }

  if (tiempoEfectivoComputableMinutos <= 0) {
    return {
      tieneEstandarAprobado: true,
      minutosEstandarPorUnidad,
      unidadesCompletadas,
      tiempoEfectivoComputableMinutos,
      tiempoEstandarTotalMinutos: null,
      rendimientoTemporalPct: null,
      estadoCalculo: 'TIEMPO_EFECTIVO_INVALIDO',
      mensajeAuditoria: 'El tiempo efectivo computable debe ser mayor a cero.',
    };
  }

  const tiempoEstandarTotalMinutos = minutosEstandarPorUnidad * unidadesCompletadas;
  const rendimientoTemporalPct = Number(
    ((tiempoEstandarTotalMinutos / tiempoEfectivoComputableMinutos) * 100).toFixed(2)
  );

  return {
    tieneEstandarAprobado: true,
    minutosEstandarPorUnidad,
    unidadesCompletadas,
    tiempoEfectivoComputableMinutos,
    tiempoEstandarTotalMinutos,
    rendimientoTemporalPct,
    estadoCalculo: 'CALCULADO_VALIDO',
    mensajeAuditoria: `Rendimiento técnico validado: ${rendimientoTemporalPct}% (${tiempoEstandarTotalMinutos} min estándar / ${tiempoEfectivoComputableMinutos} min efectivos).`,
  };
}

/**
 * Calcula el Cumplimiento de Cantidad (%) según la fórmula:
 * Cumplimiento de cantidad (%) = (cantidad completada / cantidad objetivo) × 100
 */
export function calcularCumplimientoCantidad(
  cantidadCompletada: number,
  cantidadObjetivo: number
): EvaluacionCumplimientoCantidad {
  if (cantidadObjetivo <= 0) {
    throw new Error('La cantidad objetivo planificada debe ser superior a 0.');
  }

  const pct = Number(((cantidadCompletada / cantidadObjetivo) * 100).toFixed(2));
  let estado: EvaluacionCumplimientoCantidad['estadoCumplimiento'] = 'META_EN_DEFICIT';

  if (pct > 100) {
    estado = 'SOBREPASO_META';
  } else if (pct === 100) {
    estado = 'META_CUMPLIDA';
  }

  return {
    cantidadCompletada,
    cantidadObjetivo,
    cumplimientoCantidadPct: pct,
    estadoCumplimiento: estado,
  };
}
