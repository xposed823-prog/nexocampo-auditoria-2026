import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Briefcase, Plus, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { detectarSolapamientoTemporal, calcularCumplimientoCantidad } from '../../domain/businessRulesEngine';
import { LABORES_AGRONOMICAS, COLABORADORES_CATALOGO, AREAS_AGRONOMICAS } from '../../domain/catalogoAgronomico';
import { dbGetAll, guardarJornadaRegistro, type JornadaRegistro, type TramoJornada } from '../../domain/nexocampoDB';
import { suscribirMutacionDatos } from '../../domain/consultaDominioService';

const LABORES_TECNICAS = LABORES_AGRONOMICAS.filter((labor) => labor.categoria !== 'Oficios Varios');

function fechaLocalHoy(): string {
  const fecha = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

function minutosHora(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

interface TramoTimeline {
  jornadaId: string;
  fecha: string;
  colaboradorId: string;
  tramo: TramoJornada;
}

export interface LaboresModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

export const LaboresModulo: React.FC<LaboresModuloProps> = ({ modoSol, dispararToast }) => {
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(COLABORADORES_CATALOGO[0]?.id || '');
  const [fecha, setFecha] = useState(fechaLocalHoy);
  const [jornadas, setJornadas] = useState<JornadaRegistro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nuevaInicio, setNuevaInicio] = useState('');
  const [nuevaFin, setNuevaFin] = useState('');
  const [nuevaLabor, setNuevaLabor] = useState(LABORES_TECNICAS[0]?.nombre || '');
  const [nuevaMeta, setNuevaMeta] = useState(1);
  const [nuevaComp, setNuevaComp] = useState(0);
  const [estadoLabor, setEstadoLabor] = useState<'cumple' | 'no_cumple' | 'pendiente'>('pendiente');
  const [area, setArea] = useState('');
  const [bloque, setBloque] = useState('');
  const [tunel, setTunel] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const laborActualObj = LABORES_TECNICAS.find((labor) => labor.nombre === nuevaLabor) || LABORES_TECNICAS[0];
  const esPorMeta = !!laborActualObj && (laborActualObj.modelo === 'grupal_meta' || !(typeof laborActualObj.min === 'number' && laborActualObj.min > 0));
  const colActual = COLABORADORES_CATALOGO.find((colaborador) => colaborador.id === colaboradorSeleccionado) || COLABORADORES_CATALOGO[0];
  const panel = modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60';
  const texto = modoSol ? 'text-slate-900' : 'text-slate-100';
  const secundario = modoSol ? 'text-slate-600' : 'text-slate-400';

  const recargarJornadas = useCallback(async () => {
    const todas = await dbGetAll<JornadaRegistro>('jornadas');
    setJornadas(todas);
  }, []);

  useEffect(() => {
    recargarJornadas()
      .catch((error: any) => dispararToast(`No se pudieron cargar las jornadas: ${error?.message || 'error de IndexedDB'}`))
      .finally(() => setCargando(false));

    const desuscribir = suscribirMutacionDatos((evento) => {
      if (evento.almacen === 'jornadas') {
        recargarJornadas().catch((error: any) =>
          dispararToast(`No se pudieron actualizar las jornadas: ${error?.message || 'error de IndexedDB'}`)
        );
      }
    });
    return () => desuscribir();
  }, [recargarJornadas, dispararToast]);

  const timeline = useMemo<TramoTimeline[]>(() => jornadas
    .filter((jornada) => jornada.fecha === fecha && jornada.colaboradores_ids.includes(colaboradorSeleccionado))
    .flatMap((jornada) => (jornada.tramos || [])
      .filter((tramo) => tramo.tipo === 'labor' && !tramo.es_subtarea)
      .map((tramo) => ({ jornadaId: jornada.id, fecha: jornada.fecha, colaboradorId: colaboradorSeleccionado, tramo })))
    .sort((a, b) => (a.tramo.hora_inicio || '').localeCompare(b.tramo.hora_inicio || '')), [jornadas, fecha, colaboradorSeleccionado]);

  const agregarLabor = async () => {
    if (!colaboradorSeleccionado) {
      dispararToast('Selecciona un colaborador.');
      return;
    }
    if (!fecha || !nuevaInicio || !nuevaFin || nuevaFin <= nuevaInicio) {
      dispararToast('Selecciona fecha, hora de inicio y una hora final posterior.');
      return;
    }
    if (!laborActualObj) {
      dispararToast('No hay una labor técnica disponible en el catálogo.');
      return;
    }
    if ((esPorMeta && (!Number.isInteger(nuevaMeta) || nuevaMeta < 1)) || !Number.isInteger(nuevaComp) || nuevaComp < 0) {
      dispararToast(esPorMeta ? 'La meta debe ser al menos 1 y la cantidad completada no puede ser negativa.' : 'La cantidad completada no puede ser negativa.');
      return;
    }
    if (esPorMeta && estadoLabor === 'cumple' && nuevaComp < nuevaMeta) {
      dispararToast('Para marcar Cumple, la cantidad completada debe alcanzar la meta.');
      return;
    }
    if (esPorMeta && estadoLabor === 'pendiente' && nuevaComp >= nuevaMeta) {
      dispararToast('Una labor completamente terminada debe marcarse como Cumple.');
      return;
    }
    if (estadoLabor === 'no_cumple' && nuevaComp !== 0) {
      dispararToast('Una labor No cumple debe registrar cero unidades ejecutadas.');
      return;
    }
    if (!esPorMeta && estadoLabor === 'cumple' && nuevaComp < 1) {
      dispararToast('Una labor temporal marcada Cumple debe tener al menos una unidad completada.');
      return;
    }

    const jornadasDelDia = jornadas.filter((jornada) =>
      jornada.fecha === fecha && jornada.colaboradores_ids.includes(colaboradorSeleccionado)
    );
    const intervalosExistentes = jornadasDelDia.flatMap((jornada) =>
      (jornada.tramos || [])
        .filter((tramo) => tramo.tipo === 'labor' && !tramo.es_subtarea && tramo.estado !== 'no_cumple' &&
          Boolean(tramo.hora_inicio) && Boolean(tramo.hora_fin))
        .map((tramo) => ({
          id: tramo.id,
          colaboradorId: colaboradorSeleccionado,
          horaInicio: tramo.hora_inicio!,
          horaFin: tramo.hora_fin!
        }))
    );
    const idJornada = `jornada_labor_${fecha}_${Date.now()}`;
    const idTramo = `tramo_labor_${Date.now()}`;
    const nuevoIntervalo = {
      id: idTramo,
      colaboradorId: colaboradorSeleccionado,
      horaInicio: nuevaInicio,
      horaFin: nuevaFin
    };
    const conflicto = detectarSolapamientoTemporal(intervalosExistentes, nuevoIntervalo);
    if (conflicto.haySolapamiento) {
      dispararToast(conflicto.mensajeError || 'Conflicto de horario: se solapa con una labor previa.');
      return;
    }

    const estandar = esPorMeta || laborActualObj.modelo === 'oficios_varios' ? null : laborActualObj.min;
    const tramo: TramoJornada = {
      id: idTramo,
      tipo: 'labor',
      titulo: laborActualObj.nombre,
      labor_id: laborActualObj.id,
      labor_nombre: laborActualObj.nombre,
      unidad: laborActualObj.unidadMedida,
      estandar_min: estandar,
      personal_requerido_tabla: laborActualObj.personalReferencia,
      personas_reales: 1,
      modelo: laborActualObj.modelo,
      hora_inicio: nuevaInicio,
      hora_fin: nuevaFin,
      ...(area ? { area } : {}),
      ...(bloque.trim() ? { bloque: bloque.trim() } : {}),
      ...(tunel.trim() ? { tunel: tunel.trim() } : {}),
      ...(esPorMeta ? { meta: nuevaMeta } : {}),
      completados: nuevaComp,
      unidades: nuevaComp,
      estado: estadoLabor,
      ...(estadoLabor === 'pendiente' ? { motivo_pendiente: observaciones.trim() || 'Pendiente de continuación' } : {}),
      observaciones: observaciones.trim() || undefined
    };

    const ahora = new Date().toISOString();
    const jornada: JornadaRegistro = {
      id: idJornada,
      fecha,
      colaboradores_ids: [colaboradorSeleccionado],
      tramos: [tramo],
      creadoEn: ahora,
      actualizadoEn: ahora,
      sincronizado: false
    };

    try {
      setGuardando(true);
      await guardarJornadaRegistro(jornada);
      await recargarJornadas();
      setNuevaInicio(nuevaFin);
      setNuevaFin('');
      setNuevaComp(0);
      setEstadoLabor('pendiente');
      setObservaciones('');
      dispararToast('Labor guardada en IndexedDB; la línea de tiempo se actualizó.');
    } catch (error: any) {
      dispararToast(`No se guardó la labor: ${error?.message || 'error de IndexedDB'}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className={`p-4 rounded-xl border ${panel}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className={`text-sm font-bold flex items-center gap-2 ${texto}`}>
              <Briefcase className="w-4 h-4 text-emerald-500" />
              Módulo de Labores Agrícolas y Subtareas
            </h2>
            <p className={`text-xs mt-1 leading-relaxed ${secundario}`}>
              La línea de tiempo se carga desde IndexedDB. Los tramos contiguos se permiten; los solapamientos reales se rechazan.
              Solo labores con estándar temporal válido pueden generar rendimiento temporal.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
            Anti-solapamiento
          </span>
        </div>
      </section>

      <section className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${panel}`}>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <span className={`text-xs font-semibold shrink-0 ${secundario}`}>Colaborador:</span>
          <select value={colaboradorSeleccionado} onChange={(e) => setColaboradorSeleccionado(e.target.value)} className="flex-1 sm:flex-initial min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-emerald-300">
            {COLABORADORES_CATALOGO.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nombreCompleto} ({c.cuadrilla})</option>)}
          </select>
        </div>
        <label className="w-full sm:w-auto">
          <span className={`text-[11px] font-semibold block mb-1 ${secundario}`}>Fecha de jornada</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs" />
        </label>
        <span className={`text-[11px] font-mono self-start sm:self-auto ${secundario}`}>{colActual?.rol} · {colActual?.cuadrilla}</span>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-3">
          <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center justify-between ${secundario}`}>
            <span>Línea de tiempo del colaborador</span>
            <span className="text-[10px] text-emerald-400 font-mono">{timeline.length} tramos guardados</span>
          </h3>
          {cargando ? (
            <p className={`text-xs ${secundario}`}>Cargando registros…</p>
          ) : timeline.length === 0 ? (
            <div className={`p-4 rounded-xl border border-dashed ${panel}`}>
              <p className={`text-xs ${secundario}`}>No hay labores guardadas para este colaborador y fecha.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {timeline.map(({ jornadaId, tramo }) => {
                const meta = typeof tramo.meta === 'number' && tramo.meta > 0 ? tramo.meta : null;
                const completados = typeof tramo.completados === 'number' ? tramo.completados : (tramo.unidades || 0);
                const cumplimiento = meta !== null ? calcularCumplimientoCantidad(completados, meta).cumplimientoCantidadPct : null;
                const minutos = tramo.hora_inicio && tramo.hora_fin ? minutosHora(tramo.hora_fin) - minutosHora(tramo.hora_inicio) : 0;
                return (
                  <article key={`${jornadaId}_${tramo.id}`} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${panel}`}>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">{tramo.hora_inicio} - {tramo.hora_fin}</span>
                        <span className={`text-xs font-bold ${texto}`}>{tramo.labor_nombre || tramo.titulo}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono uppercase">{tramo.modelo || 'individual'}</span>
                        {typeof tramo.estandar_min === 'number' && tramo.estandar_min > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-mono">Estándar: {tramo.estandar_min}m</span>
                        )}
                      </div>
                      <div className={`text-xs ${secundario}`}>
                        {completados} completados{meta !== null ? ` / meta ${meta}` : ' · sin meta temporal'} · ${minutos} min registrados
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                        tramo.estado === 'pendiente' ? 'bg-amber-950/60 text-amber-300 border-amber-500/40' :
                        tramo.estado === 'no_cumple' ? 'bg-slate-700 text-slate-300 border-slate-600' :
                        'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {tramo.estado === 'pendiente' ? 'Pendiente' : tramo.estado === 'no_cumple' ? 'No cumple' : 'Cumple'}
                      </span>
                      {cumplimiento !== null && <span className="text-xs font-mono text-violet-400">{cumplimiento}% meta</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className={`p-5 rounded-xl border space-y-4 ${panel}`}>
          <h3 className={`font-bold text-xs uppercase tracking-wider ${secundario}`}>Registrar labor consecutiva</h3>
          <div className="space-y-3 text-xs">
            <label className="block">
              <span className={`block mb-1 font-semibold ${secundario}`}>Tipo de labor agrícola</span>
              <select value={nuevaLabor} onChange={(e) => {
                const value = e.target.value;
                setNuevaLabor(value);
                setNuevaMeta(1);
              }} className={`w-full min-h-[44px] px-3 rounded-lg border text-xs font-medium ${modoSol ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'}`}>
                {LABORES_TECNICAS.map((labor) => <option key={labor.id} value={labor.nombre}>{labor.nombre} ({labor.unidadMedida} · {labor.min ? `${labor.min} min` : 'sin estándar temporal'})</option>)}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className={`block mb-1 font-semibold ${secundario}`}>Hora inicio</span>
                <input type="time" value={nuevaInicio} onChange={(e) => setNuevaInicio(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono" />
              </label>
              <label className="block">
                <span className={`block mb-1 font-semibold ${secundario}`}>Hora fin</span>
                <input type="time" value={nuevaFin} onChange={(e) => setNuevaFin(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono" />
              </label>
            </div>

            <div className={`grid gap-2 ${esPorMeta ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {esPorMeta && (
                <label className="block">
                  <span className={`block mb-1 font-semibold ${secundario}`}>Meta / cantidad asignada</span>
                  <input type="number" min="1" step="1" value={nuevaMeta} onChange={(e) => setNuevaMeta(Number(e.target.value))} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono" />
                </label>
              )}
              <label className="block">
                <span className={`block mb-1 font-semibold ${secundario}`}>{esPorMeta ? 'Cantidad completada' : 'Unidades completadas (estándar temporal)'}</span>
                <input type="number" min="0" step="1" value={nuevaComp} onChange={(e) => setNuevaComp(Number(e.target.value))} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-emerald-400" />
              </label>
            </div>

            <label className="block">
              <span className={`block mb-1 font-semibold ${secundario}`}>Estado de ejecución</span>
              <select value={estadoLabor} onChange={(e) => setEstadoLabor(e.target.value as 'cumple' | 'no_cumple' | 'pendiente')} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100">
                <option value="cumple">Cumple</option>
                <option value="pendiente">Pendiente / continúa</option>
                <option value="no_cumple">No cumple / no ejecutada</option>
              </select>
            </label>

            <label className="block">
              <span className={`block mb-1 font-semibold ${secundario}`}>Área (opcional)</span>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100">
                <option value="">Sin área específica</option>
                {AREAS_AGRONOMICAS.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className={`block mb-1 font-semibold ${secundario}`}>Bloque (opcional)</span>
                <input value={bloque} onChange={(e) => setBloque(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100" />
              </label>
              <label className="block">
                <span className={`block mb-1 font-semibold ${secundario}`}>Túnel (opcional)</span>
                <input value={tunel} onChange={(e) => setTunel(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100" />
              </label>
            </div>

            <label className="block">
              <span className={`block mb-1 font-semibold ${secundario}`}>Observación (opcional)</span>
              <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100" />
            </label>
          </div>

          <button type="button" onClick={agregarLabor} disabled={guardando || cargando} className="w-full min-h-[46px] rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" />
            {guardando ? 'Guardando…' : 'Guardar labor en IndexedDB'}
          </button>
          <p className={`text-[10px] leading-relaxed ${secundario}`}>
            Los registros se guardan por colaborador y fecha. Una labor de tipo meta o una labor sin estándar temporal no genera rendimiento por tiempo.
          </p>
        </section>
      </div>
    </div>
  );
};
