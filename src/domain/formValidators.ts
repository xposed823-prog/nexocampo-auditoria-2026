/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Módulo de Dominio Puro: Validaciones de Formularios y Estados Visuales
 */

export type EstadoVisualNegocio =
  | 'cumple'
  | 'no_cumple'
  | 'pendiente'
  | 'sin_registro'
  | 'incompleto'
  | 'no_aplicable'
  | 'error_guardado';

export interface ResultadoValidacion {
  esValido: boolean;
  errores: Record<string, string>;
}

/**
 * Valida la consistencia de una Jornada.
 */
export function validarJornada(
  horaApertura: string,
  horaCierreEsperada: string,
  horaCierreReal?: string | null
): ResultadoValidacion {
  const errores: Record<string, string> = {};

  if (!horaApertura || !horaCierreEsperada) {
    errores.general = 'Las horas de apertura y cierre esperada son obligatorias.';
    return { esValido: false, errores };
  }

  if (horaCierreEsperada <= horaApertura) {
    errores.horaCierreEsperada = 'La hora de cierre esperada debe ser estrictamente posterior a la de apertura.';
  }

  if (horaCierreReal && horaCierreReal <= horaApertura) {
    errores.horaCierreReal = 'La hora de cierre real debe ser posterior a la de apertura.';
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  };
}

/**
 * Valida una asignación de labor agrícola.
 */
export function validarLabor(
  horaInicio: string,
  horaFin: string,
  cantidadCompletada: number,
  colaboradoresCount: number
): ResultadoValidacion {
  const errores: Record<string, string> = {};

  if (!horaInicio || !horaFin) {
    errores.general = 'El intervalo de inicio y fin es obligatorio.';
    return { esValido: false, errores };
  }

  if (horaFin <= horaInicio) {
    errores.horaFin = 'El fin de la labor debe ser posterior al inicio.';
  }

  if (isNaN(cantidadCompletada) || cantidadCompletada < 0) {
    errores.cantidadCompletada = 'La cantidad completada no puede ser negativa.';
  }

  if (colaboradoresCount < 1) {
    errores.colaboradores = 'Debe seleccionar al menos un colaborador para la labor.';
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  };
}

/**
 * Valida el registro especializado de Plástico y Polisombra.
 * Regla: cuadrilla de 6 integrantes; el saldo pendiente requiere justificación.
 * Si cantidad completada < cantidad total, activa requerimiento de justificación.
 */
export function validarPlasticoPolisombra(
  integrantesCount: number,
  horaInicio: string,
  horaFin: string,
  cantidadTotal: number,
  cantidadCompletada: number,
  condicionesSeleccionadas: string[]
): ResultadoValidacion & { requiereJustificacion: boolean; saldoPendiente: number } {
  const errores: Record<string, string> = {};

  if (integrantesCount !== 6) {
    errores.integrantes = 'Seleccione exactamente 6 integrantes para la cuadrilla de plástico y polisombra.';
  }

  if (!horaInicio || !horaFin) {
    errores.horario = 'La hora de inicio y fin son obligatorias.';
  } else if (horaFin <= horaInicio) {
    errores.horaFin = 'La hora de fin debe ser posterior a la de inicio.';
  }

  if (isNaN(cantidadTotal) || cantidadTotal <= 0) {
    errores.cantidadTotal = 'La cantidad total programada debe ser un número mayor a cero.';
  }

  if (isNaN(cantidadCompletada) || cantidadCompletada < 0) {
    errores.cantidadCompletada = 'La cantidad completada no puede ser negativa.';
  } else if (cantidadCompletada > cantidadTotal) {
    errores.cantidadCompletada = 'La cantidad completada no puede superar la cantidad total.';
  }

  if (condicionesSeleccionadas.length === 0) {
    errores.condiciones = 'Debe seleccionar al menos una condición ambiental de labor en campo.';
  }

  const saldoPendiente = Math.max(0, cantidadTotal - cantidadCompletada);
  const requiereJustificacion = cantidadCompletada < cantidadTotal;

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
    requiereJustificacion,
    saldoPendiente,
  };
}

/**
 * Valida la justificación de saldos pendientes de plástico y polisombra.
 * Opciones autorizadas: 'tiempo_insuficiente', 'vientos_fuertes', 'lluvia_intensa'.
 */
export function validarJustificacionPendiente(
  motivosSeleccionados: string[]
): ResultadoValidacion {
  const errores: Record<string, string> = {};
  const motivosValidos = ['tiempo_insuficiente', 'vientos_fuertes', 'lluvia_intensa'];

  const seleccionValida = motivosSeleccionados.filter((m) => motivosValidos.includes(m));

  if (seleccionValida.length === 0) {
    errores.motivos = 'Debe seleccionar al menos un motivo aprobado (tiempo insuficiente, vientos fuertes o lluvia intensa).';
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  };
}

/**
 * Determina el estado visual normativo sin inventar calificaciones.
 */
export function determinarEstadoVisual(
  cantidadCompletada: number | null,
  cantidadMeta: number | null,
  tieneEstandar: boolean,
  requiereJustificacion: boolean,
  justificado: boolean
): EstadoVisualNegocio {
  if (cantidadCompletada === null) {
    return 'sin_registro';
  }

  if (!tieneEstandar && cantidadMeta === null) {
    return 'no_aplicable';
  }

  if (requiereJustificacion && !justificado) {
    return 'pendiente';
  }

  if (cantidadMeta !== null && cantidadMeta > 0) {
    if (cantidadCompletada >= cantidadMeta) {
      return 'cumple';
    }
    return 'no_cumple';
  }

  return 'cumple';
}
