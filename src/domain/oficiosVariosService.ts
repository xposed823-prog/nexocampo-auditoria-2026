import {
  dbGet,
  dbGetAll,
  dbPut,
  guardarJornadaRegistro,
  type JornadaRegistro
} from './nexocampoDB';
import {
  OFICIOS_VARIOS_INICIALES,
  type LaborAgricola
} from './catalogoAgronomico';
import { calcularOficiosVarios } from './businessRulesEngine';

export interface RegistroOficioVarioInput {
  fecha: string;
  colaboradorId: string;
  tareaId: string;
  horaInicio: string;
  horaFin: string;
  tareasAsignadas: number;
  tareasCompletadas: number;
  area?: string;
  observaciones?: string;
}

function normalizarNombre(nombre: string): string {
  return nombre.trim().replace(/\s+/g, ' ');
}

function validarNombreTarea(nombre: string): string {
  const limpio = normalizarNombre(nombre);
  if (!limpio) throw new Error('Escribe el nombre de la tarea.');
  if (limpio.length > 100) throw new Error('El nombre de la tarea no puede superar 100 caracteres.');
  return limpio;
}

export async function cargarCatalogoOficiosVarios(): Promise<LaborAgricola[]> {
  const existentes = await dbGetAll<LaborAgricola>('labores');
  const ids = new Set(existentes.map((item) => item.id));
  const nombresExistentes = new Set(existentes
    .filter((item) => item.categoria === 'Oficios Varios' || item.tipo_registro === 'oficio_vario' || item.modelo === 'oficios_varios')
    .map((item) => item.nombre.trim().toLocaleLowerCase('es')));
  const faltantes = OFICIOS_VARIOS_INICIALES.filter((item) =>
    !ids.has(item.id) && !nombresExistentes.has(item.nombre.trim().toLocaleLowerCase('es'))
  );

  // Los tres tipos iniciales se agregan al almacén existente; no se cambia el esquema de IndexedDB.
  for (const item of faltantes) {
    await dbPut('labores', item);
  }

  const actualizado = faltantes.length > 0
    ? await dbGetAll<LaborAgricola>('labores')
    : existentes;

  return actualizado
    .filter((item) => item.categoria === 'Oficios Varios' && item.modelo === 'oficios_varios' && item.activa !== false)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export async function crearTipoOficioVario(nombre: string): Promise<LaborAgricola> {
  const limpio = validarNombreTarea(nombre);
  const todos = await dbGetAll<LaborAgricola>('labores');
  if (todos.some((item) => item.categoria === 'Oficios Varios' && item.activa !== false &&
      item.nombre.toLocaleLowerCase('es') === limpio.toLocaleLowerCase('es'))) {
    throw new Error('Ya existe una tarea de Oficios Varios con ese nombre.');
  }

  const ahora = new Date().toISOString();
  const id = `oficio_custom_${Date.now()}`;
  const item: LaborAgricola = {
    id,
    codigo: `OFV-C${Date.now().toString().slice(-6)}`,
    nombre: limpio,
    unidadMedida: 'tarea',
    min: null,
    personalReferencia: 1,
    categoria: 'Oficios Varios',
    modelo: 'oficios_varios',
    medicion: 'oficios_varios',
    tipo_registro: 'oficio_vario',
    activa: true,
    creado: ahora,
    actualizado: ahora
  };
  await dbPut('labores', item);
  return item;
}

export async function actualizarTipoOficioVario(id: string, nombre: string): Promise<LaborAgricola> {
  const limpio = validarNombreTarea(nombre);
  const todos = await dbGetAll<LaborAgricola>('labores');
  const actual = todos.find((item) => item.id === id && item.categoria === 'Oficios Varios');
  if (!actual) throw new Error('No se encontró la tarea de Oficios Varios que deseas editar.');
  if (todos.some((item) => item.id !== id && item.categoria === 'Oficios Varios' && item.activa !== false &&
      item.nombre.toLocaleLowerCase('es') === limpio.toLocaleLowerCase('es'))) {
    throw new Error('Ya existe otra tarea de Oficios Varios con ese nombre.');
  }

  const actualizado: LaborAgricola = { ...actual, nombre: limpio, actualizado: new Date().toISOString() };
  await dbPut('labores', actualizado);
  return actualizado;
}

export async function desactivarTipoOficioVario(id: string): Promise<void> {
  const actual = await dbGet<LaborAgricola>('labores', id);
  if (!actual || actual.categoria !== 'Oficios Varios') {
    throw new Error('No se encontró la tarea de Oficios Varios que deseas desactivar.');
  }
  await dbPut('labores', {
    ...actual,
    activa: false,
    actualizado: new Date().toISOString()
  });
  // Desactivación lógica: no borra la tarea ni altera jornadas históricas.
}

export async function guardarRegistroOficioVario(input: RegistroOficioVarioInput): Promise<JornadaRegistro> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.fecha)) throw new Error('Selecciona una fecha válida.');
  if (!input.colaboradorId) throw new Error('Selecciona un colaborador.');
  if (!/^\d{2}:\d{2}$/.test(input.horaInicio) || !/^\d{2}:\d{2}$/.test(input.horaFin) ||
      input.horaFin <= input.horaInicio) {
    throw new Error('La hora final debe ser posterior a la hora de inicio.');
  }
  if (!Number.isInteger(input.tareasAsignadas) || input.tareasAsignadas < 1) {
    throw new Error('Asigna al menos una tarea.');
  }
  if (!Number.isInteger(input.tareasCompletadas) || input.tareasCompletadas < 0) {
    throw new Error('Las tareas completadas no pueden ser negativas.');
  }
  if (input.tareasCompletadas > input.tareasAsignadas) {
    throw new Error('Las tareas completadas no pueden superar las tareas asignadas.');
  }

  const labor = await dbGet<LaborAgricola>('labores', input.tareaId);
  if (!labor || labor.categoria !== 'Oficios Varios' || labor.modelo !== 'oficios_varios' || labor.activa === false) {
    throw new Error('Selecciona una tarea activa del catálogo de Oficios Varios.');
  }

  const calculo = calcularOficiosVarios(input.tareasAsignadas, input.tareasCompletadas);
  const ahora = new Date().toISOString();
  const id = `jornada_oficio_${input.fecha}_${Date.now()}`;
  const tramoId = `tramo_oficio_${Date.now()}`;

  const jornada: JornadaRegistro = {
    id,
    fecha: input.fecha,
    colaboradores_ids: [input.colaboradorId],
    tramos: [{
      id: tramoId,
      tipo: 'labor',
      titulo: 'Oficios Varios',
      labor_id: labor.id,
      labor_nombre: labor.nombre,
      unidad: 'tarea',
      estandar_min: null,
      modelo: 'oficios_varios',
      hora_inicio: input.horaInicio,
      hora_fin: input.horaFin,
      ...(input.area ? { area: input.area } : {}),
      meta: input.tareasAsignadas,
      completados: input.tareasCompletadas,
      estado: calculo.estado === 'pendiente' ? 'pendiente' : 'cumple',
      tipo_registro: 'oficio_vario',
      tareas_asignadas: input.tareasAsignadas,
      tareas_completadas: input.tareasCompletadas,
      cumplimiento_tareas_pct: calculo.cumplimientoTareasPct,
      observaciones: input.observaciones?.trim() || undefined
    }],
    creadoEn: ahora,
    actualizadoEn: ahora,
    sincronizado: false
  };

  await guardarJornadaRegistro(jornada);
  return jornada;
}
