/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Módulo de Dominio Puro: Cálculos de Jornada y Tiempos Efectivos
 */

export interface PausaProgramada {
  id?: string;
  tipo: 'desayuno' | 'almuerzo' | 'pausa_5min' | 'climatica' | 'traslado';
  duracionMinutos: number;
  esDeduccionComputable: boolean;
}

export interface JornadaCalculada {
  horaApertura: string;
  horaCierre: string;
  minutosBrutos: number;
  minutosDescansosComida: number; // desayuno + almuerzo
  minutosPausasAdicionales: number; // pausas de 5 min u otras
  totalDeduccionesMinutos: number;
  minutosEfectivosNetos: number;
  esConsistenteConEstimacion475: boolean;
  esConsistenteConEstimacion360: boolean;
}

/**
 * Convierte una hora en formato "HH:mm" a minutos desde medianoche (0 a 1439).
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) {
    throw new Error(`Formato de hora inválido: "${timeStr}". Se esperaba "HH:mm".`);
  }
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Valores de hora fuera de rango: "${timeStr}".`);
  }

  return hours * 60 + minutes;
}

/**
 * Calcula la aritmética estricta de una jornada laboral agrícola.
 */
export function calcularJornadaLaboral(
  horaApertura: string,
  horaCierre: string,
  pausas: PausaProgramada[]
): JornadaCalculada {
  const minInicio = timeStringToMinutes(horaApertura);
  const minFin = timeStringToMinutes(horaCierre);

  if (minFin <= minInicio) {
    throw new Error(
      `La hora de cierre (${horaCierre}) debe ser posterior a la hora de apertura (${horaApertura}).`
    );
  }

  const minutosBrutos = minFin - minInicio;

  let minutosDescansosComida = 0;
  let minutosPausasAdicionales = 0;

  for (const pausa of pausas) {
    if (pausa.esDeduccionComputable) {
      if (pausa.tipo === 'desayuno' || pausa.tipo === 'almuerzo') {
        minutosDescansosComida += pausa.duracionMinutos;
      } else {
        minutosPausasAdicionales += pausa.duracionMinutos;
      }
    }
  }

  const totalDeduccionesMinutos = minutosDescansosComida + minutosPausasAdicionales;
  const minutosEfectivosNetos = Math.max(0, minutosBrutos - totalDeduccionesMinutos);

  return {
    horaApertura,
    horaCierre,
    minutosBrutos,
    minutosDescansosComida,
    minutosPausasAdicionales,
    totalDeduccionesMinutos,
    minutosEfectivosNetos,
    esConsistenteConEstimacion475: minutosEfectivosNetos === 475,
    esConsistenteConEstimacion360: minutosEfectivosNetos === 360,
  };
}

/**
 * Genera la configuración estándar de lunes a viernes:
 * 06:30 a 15:30 (540 min brutos), Desayuno 30m, Almuerzo 30m, y 1 pausa adicional de 5 min.
 */
export function generarJornadaEstandarSemanal(): JornadaCalculada {
  return calcularJornadaLaboral('06:30', '15:30', [
    { tipo: 'desayuno', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'almuerzo', duracionMinutos: 30, esDeduccionComputable: true },
    { tipo: 'pausa_5min', duracionMinutos: 5, esDeduccionComputable: true },
  ]);
}

/**
 * Genera la configuración estándar del sábado:
 * 06:30 a 13:00 (390 min brutos), Desayuno 30m, sin pausas adicionales.
 */
export function generarJornadaEstandarSabado(): JornadaCalculada {
  return calcularJornadaLaboral('06:30', '13:00', [
    { tipo: 'desayuno', duracionMinutos: 30, esDeduccionComputable: true },
  ]);
}
