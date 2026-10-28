/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Motor de Reglas de Negocio, Segmentos y Aritmética Matemática
 * Tarea 3 de 5: Especificación e Implementación de los 16 Casos de Prueba Matemáticos
 */

import { timeStringToMinutes } from './jornadaCalculator.ts';

export interface IntervaloHorario {
  id?: string;
  colaboradorId: string;
  horaInicio: string;
  horaFin: string;
  esSubtarea?: boolean;
}

export interface SolapamientoResultado {
  haySolapamiento: boolean;
  intervaloConflicto?: IntervaloHorario;
  mensajeError?: string;
}

/**
 * Detecta solapamientos reales en la línea temporal de un colaborador.
 * Regla: Se produce solapamiento si: Inicio_B < Fin_A Y Fin_B > Inicio_A.
 * Las subtareas con esSubtarea: true no generan solapamiento.
 * Las tareas contiguas (Fin_A === Inicio_B) son perfectamente válidas.
 */
export function detectarSolapamientoTemporal(
  intervalosExistentes: IntervaloHorario[],
  nuevoIntervalo: IntervaloHorario
): SolapamientoResultado {
  if (nuevoIntervalo.esSubtarea) {
    return { haySolapamiento: false };
  }

  const nuevoInicio = timeStringToMinutes(nuevoIntervalo.horaInicio);
  const nuevoFin = timeStringToMinutes(nuevoIntervalo.horaFin);

  if (nuevoFin <= nuevoInicio) {
    return {
      haySolapamiento: true,
      mensajeError: `Hora de fin (${nuevoIntervalo.horaFin}) debe ser posterior a la de inicio (${nuevoIntervalo.horaInicio}).`,
    };
  }

  for (const existente of intervalosExistentes) {
    if (existente.colaboradorId !== nuevoIntervalo.colaboradorId) continue;
    if (existente.esSubtarea) continue;

    const existInicio = timeStringToMinutes(existente.horaInicio);
    const existFin = timeStringToMinutes(existente.horaFin);

    // Condición estricta de solapamiento
    if (nuevoInicio < existFin && nuevoFin > existInicio) {
      return {
        haySolapamiento: true,
        intervaloConflicto: existente,
        mensajeError: `Error de solapamiento: El colaborador ${nuevoIntervalo.colaboradorId} ya tiene una labor entre ${existente.horaInicio} y ${existente.horaFin}.`,
      };
    }
  }

  return { haySolapamiento: false };
}

/**
 * Valida y calcula una jornada con múltiples labores consecutivas.
 * Regla: Múltiples labores se guardan vinculadas a una sola jornada general,
 * sin sumar ni duplicar jornadas generales.
 */
export function calcularJornadaMultiplesLabores(
  jornadaApertura: string,
  jornadaCierre: string,
  labores: Array<{ id: string; horaInicio: string; horaFin: string }>,
  pausas: Array<{ duracionMinutos: number; esDeduccionComputable: boolean }>
): {
  minutosBrutosJornada: number;
  minutosEfectivosLabores: number;
  minutosPausasComputables: number;
  cuadraExactamente: boolean;
  totalJornadasCreadas: number;
} {
  const minInicio = timeStringToMinutes(jornadaApertura);
  const minFin = timeStringToMinutes(jornadaCierre);
  const minutosBrutosJornada = minFin - minInicio;

  let minutosEfectivosLabores = 0;
  let intervalosValidos = minFin > minInicio;
  const intervalosOrdenados = labores
    .map((l) => ({
      inicio: timeStringToMinutes(l.horaInicio),
      fin: timeStringToMinutes(l.horaFin)
    }))
    .sort((a, b) => a.inicio - b.inicio);

  for (let i = 0; i < intervalosOrdenados.length; i += 1) {
    const intervalo = intervalosOrdenados[i];
    const duracion = intervalo.fin - intervalo.inicio;
    if (
      duracion <= 0 ||
      intervalo.inicio < minInicio ||
      intervalo.fin > minFin ||
      (i > 0 && intervalo.inicio < intervalosOrdenados[i - 1].fin)
    ) {
      intervalosValidos = false;
    }
    minutosEfectivosLabores += duracion;
  }

  let minutosPausasComputables = 0;
  for (const p of pausas) {
    if (p.esDeduccionComputable) {
      minutosPausasComputables += p.duracionMinutos;
    }
  }

  const sumaTotal = minutosEfectivosLabores + minutosPausasComputables;

  return {
    minutosBrutosJornada,
    minutosEfectivosLabores,
    minutosPausasComputables,
    cuadraExactamente: intervalosValidos && sumaTotal === minutosBrutosJornada,
    totalJornadasCreadas: 1, // Se preserva la regla de una sola jornada
  };
}

/**
 * Calcula la media ponderada del rendimiento técnico por tiempo efectivo.
 * Evita la distorsión del promedio aritmético simple de porcentajes.
 */
export function calcularMediaPonderadaRendimiento(
  evaluaciones: Array<{
    tiempoEfectivoMinutos: number;
    tiempoEstandarTotalMinutos: number | null;
  }>
): {
  rendimientoPonderadoPct: number | null;
  tiempoTotalEfectivoMinutos: number;
  tiempoTotalEstandarMinutos: number;
  muestraInsuficiente: boolean;
} {
  let tiempoTotalEfectivo = 0;
  let tiempoTotalEstandar = 0;
  let tieneAlMenosUnEstandar = false;

  for (const ev of evaluaciones) {
    tiempoTotalEfectivo += ev.tiempoEfectivoMinutos;
    if (ev.tiempoEstandarTotalMinutos !== null && ev.tiempoEstandarTotalMinutos > 0) {
      tiempoTotalEstandar += ev.tiempoEstandarTotalMinutos;
      tieneAlMenosUnEstandar = true;
    }
  }

  if (tiempoTotalEfectivo <= 0 || !tieneAlMenosUnEstandar) {
    return {
      rendimientoPonderadoPct: null,
      tiempoTotalEfectivoMinutos: tiempoTotalEfectivo,
      tiempoTotalEstandarMinutos: tiempoTotalEstandar,
      muestraInsuficiente: true,
    };
  }

  const rendimientoPonderadoPct = Number(
    ((tiempoTotalEstandar / tiempoTotalEfectivo) * 100).toFixed(2)
  );

  return {
    rendimientoPonderadoPct,
    tiempoTotalEfectivoMinutos: tiempoTotalEfectivo,
    tiempoTotalEstandarMinutos: tiempoTotalEstandar,
    muestraInsuficiente: tiempoTotalEfectivo < 60, // Regla de muestra mínima 60 min
  };
}

/**
 * Calcula el cumplimiento de tareas en Oficios Varios.
 * Regla: Representa cumplimiento de tareas asignadas, NUNCA rendimiento temporal.
 */
export function calcularOficiosVarios(
  tareasAsignadas: number,
  tareasCompletadas: number
): {
  cumplimientoTareasPct: number;
  estado: 'completa' | 'pendiente' | 'supero_asignacion';
} {
  if (tareasAsignadas < 0 || tareasCompletadas < 0) {
    throw new Error('Las tareas asignadas y completadas no pueden ser negativas.');
  }

  if (tareasAsignadas === 0) {
    throw new Error('Debe asignar al menos una tarea en Oficios Varios.');
  }

  const pct = Number(((tareasCompletadas / tareasAsignadas) * 100).toFixed(2));
  let estado: 'completa' | 'pendiente' | 'supero_asignacion' = 'pendiente';

  if (tareasCompletadas > tareasAsignadas) {
    estado = 'supero_asignacion';
  } else if (tareasCompletadas === tareasAsignadas) {
    estado = 'completa';
  }

  return {
    cumplimientoTareasPct: pct,
    estado,
  };
}

/**
 * Regla de Coberturas: Evita la doble contabilización sumando subtareas a la producción principal.
 */
export function consolidarProduccionCobertura(
  metrosInvernaderoCubiertos: number,
  subtareas: Array<{ nombre: string; cantidad: number; unidad: string }>
): {
  produccionTotalInfraestructura: number;
  unidadInfraestructura: string;
  detalleSubtareas: Array<{ nombre: string; cantidad: number; unidad: string }>;
} {
  // La producción real de avance de la cubierta es estrictamente los metros de invernadero cerrados
  return {
    produccionTotalInfraestructura: metrosInvernaderoCubiertos,
    unidadInfraestructura: 'metros de invernadero cubiertos',
    detalleSubtareas: subtareas,
  };
}
