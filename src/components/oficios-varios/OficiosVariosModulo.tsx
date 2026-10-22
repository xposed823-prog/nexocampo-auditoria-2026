import React, { useEffect, useMemo, useState } from 'react';
import { Wrench, CheckCircle2, AlertCircle, Plus, Pencil, Ban, Save, X, ClipboardList } from 'lucide-react';
import { COLABORADORES_CATALOGO, AREAS_AGRONOMICAS, type LaborAgricola } from '../../domain/catalogoAgronomico';
import { dbGetAll, type JornadaRegistro } from '../../domain/nexocampoDB';
import { calcularOficiosVarios } from '../../domain/businessRulesEngine';
import {
  actualizarTipoOficioVario,
  cargarCatalogoOficiosVarios,
  crearTipoOficioVario,
  desactivarTipoOficioVario,
  guardarRegistroOficioVario
} from '../../domain/oficiosVariosService';

function fechaLocalHoy(): string {
  const hoy = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
}

function esTramoOficio(t: JornadaRegistro['tramos'][number]): boolean {
  return t.modelo === 'oficios_varios' || t.tipo_registro === 'oficio_vario';
}

export interface OficiosVariosModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

export const OficiosVariosModulo: React.FC<OficiosVariosModuloProps> = ({ modoSol, dispararToast }) => {
  const [catalogo, setCatalogo] = useState<LaborAgricola[]>([]);
  const [jornadas, setJornadas] = useState<JornadaRegistro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [colaboradorId, setColaboradorId] = useState(COLABORADORES_CATALOGO[0]?.id || '');
  const [fecha, setFecha] = useState(fechaLocalHoy);
  const [tareaId, setTareaId] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [area, setArea] = useState('');
  const [tareasAsignadas, setTareasAsignadas] = useState(1);
  const [tareasCompletadas, setTareasCompletadas] = useState(0);
  const [observaciones, setObservaciones] = useState('');

  const [nuevaTarea, setNuevaTarea] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState('');

  const panel = modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/60';
  const texto = modoSol ? 'text-slate-900' : 'text-slate-100';
  const secundario = modoSol ? 'text-slate-600' : 'text-slate-400';

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [tipos, todasJornadas] = await Promise.all([
        cargarCatalogoOficiosVarios(),
        dbGetAll<JornadaRegistro>('jornadas')
      ]);
      setCatalogo(tipos);
      setJornadas(
        todasJornadas
          .filter((j) => (j.tramos || []).some(esTramoOficio))
          .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEn.localeCompare(a.creadoEn))
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos().catch((error: any) => {
      dispararToast(`No se pudo cargar Oficios Varios: ${error?.message || 'error de IndexedDB'}`);
    });
  }, []);

  useEffect(() => {
    if (catalogo.length > 0 && !catalogo.some((tarea) => tarea.id === tareaId)) {
      setTareaId(catalogo[0].id);
    }
  }, [catalogo, tareaId]);

  const resultado = useMemo(() => {
    if (!Number.isInteger(tareasAsignadas) || tareasAsignadas < 1 ||
        !Number.isInteger(tareasCompletadas) || tareasCompletadas < 0 || tareasCompletadas > tareasAsignadas) return null;
    try {
      return calcularOficiosVarios(tareasAsignadas, tareasCompletadas);
    } catch {
      return null;
    }
  }, [tareasAsignadas, tareasCompletadas]);

  const guardarRegistro = async () => {
    try {
      setGuardando(true);
      await guardarRegistroOficioVario({
        fecha,
        colaboradorId,
        tareaId,
        horaInicio,
        horaFin,
        tareasAsignadas,
        tareasCompletadas,
        ...(area ? { area } : {}),
        observaciones
      });
      await cargarDatos();
      setObservaciones('');
      dispararToast('Registro de Oficios Varios guardado en IndexedDB.');
    } catch (error: any) {
      dispararToast(`No se guardó Oficios Varios: ${error?.message || 'error de persistencia'}`);
    } finally {
      setGuardando(false);
    }
  };

  const agregarTipo = async () => {
    try {
      const creado = await crearTipoOficioVario(nuevaTarea);
      await cargarDatos();
      setTareaId(creado.id);
      setNuevaTarea('');
      dispararToast('Tipo de tarea agregado al catálogo de Oficios Varios.');
    } catch (error: any) {
      dispararToast(error?.message || 'No se pudo agregar el tipo de tarea.');
    }
  };

  const guardarEdicion = async (id: string) => {
    try {
      await actualizarTipoOficioVario(id, nombreEdicion);
      await cargarDatos();
      setEditandoId(null);
      setNombreEdicion('');
      dispararToast('Tipo de tarea actualizado.');
    } catch (error: any) {
      dispararToast(error?.message || 'No se pudo editar el tipo de tarea.');
    }
  };

  const desactivarTipo = async (tarea: LaborAgricola) => {
    if (!window.confirm(`¿Desactivar "${tarea.nombre}"? Los registros históricos se conservarán.`)) return;
    try {
      await desactivarTipoOficioVario(tarea.id);
      await cargarDatos();
      if (tareaId === tarea.id) setTareaId('');
      dispararToast('Tipo de tarea desactivado; el historial se conserva.');
    } catch (error: any) {
      dispararToast(error?.message || 'No se pudo desactivar el tipo de tarea.');
    }
  };

  return (
    <div className="space-y-5">
      <section className={`p-4 rounded-xl border ${panel}`}>
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-emerald-500" />
          <h2 className={`text-sm font-bold ${texto}`}>Oficios Varios</h2>
        </div>
        <p className={`text-xs mt-2 leading-relaxed ${secundario}`}>
          Registro por tareas asignadas y completadas. No utiliza minutos estándar ni aporta porcentajes al rendimiento técnico.
          Los registros se guardan en IndexedDB y se incluyen en Consulta Cruzada.
        </p>
      </section>

      <section className={`p-4 rounded-xl border space-y-4 ${panel}`}>
        <h3 className={`text-xs font-bold ${texto}`}>Nuevo registro operativo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1 block">
            <span className={`text-[11px] font-semibold ${secundario}`}>Colaborador</span>
            <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs">
              {COLABORADORES_CATALOGO.map((c) => <option key={c.id} value={c.id}>{c.nombreCompleto}</option>)}
            </select>
          </label>
          <label className="space-y-1 block">
            <span className={`text-[11px] font-semibold ${secundario}`}>Fecha</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs" />
          </label>
          <label className="space-y-1 block sm:col-span-2">
            <span className={`text-[11px] font-semibold ${secundario}`}>Tipo de tarea</span>
            <select value={tareaId} onChange={(e) => setTareaId(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs" disabled={catalogo.length === 0}>
              {catalogo.map((tarea) => <option key={tarea.id} value={tarea.id}>{tarea.nombre}</option>)}
            </select>
          </label>
          <label className="space-y-1 block">
            <span className={`text-[11px] font-semibold ${secundario}`}>Hora de inicio</span>
            <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs" required />
          </label>
          <label className="space-y-1 block">
            <span className={`text-[11px] font-semibold ${secundario}`}>Hora de finalización</span>
            <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs" required />
          </label>
          <label className="space-y-1 block">
            <span className={`text-[11px] font-semibold ${secundario}`}>Área (opcional)</span>
            <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs">
              <option value="">Sin área específica</option>
              {AREAS_AGRONOMICAS.map((a) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 block">
              <span className={`text-[11px] font-semibold ${secundario}`}>Tareas asignadas</span>
              <input type="number" min="1" step="1" value={tareasAsignadas} onChange={(e) => setTareasAsignadas(Number(e.target.value))} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs" />
            </label>
            <label className="space-y-1 block">
              <span className={`text-[11px] font-semibold ${secundario}`}>Tareas completadas</span>
              <input type="number" min="0" step="1" value={tareasCompletadas} onChange={(e) => setTareasCompletadas(Number(e.target.value))} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs" />
            </label>
          </div>
        </div>

        <label className="space-y-1 block">
          <span className={`text-[11px] font-semibold ${secundario}`}>Observación (opcional)</span>
          <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs" placeholder="Nota operativa, si hace falta." />
        </label>

        <div className={`rounded-lg border p-3 flex items-center justify-between gap-3 ${modoSol ? 'bg-violet-50 border-violet-200' : 'bg-violet-950/20 border-violet-500/30'}`}>
          <div>
            <p className={`text-[11px] font-semibold ${texto}`}>Cumplimiento de tareas</p>
            <p className={`text-[10px] mt-0.5 ${secundario}`}>Indicador operativo independiente del rendimiento técnico.</p>
          </div>
          <p className="text-lg font-bold font-mono text-violet-400">
            {resultado ? `${resultado.cumplimientoTareasPct}%` : '—'}
          </p>
        </div>
        {tareasCompletadas > tareasAsignadas && (
          <p className="text-xs text-rose-400">Las tareas completadas no pueden superar las asignadas.</p>
        )}

        <button
          type="button"
          onClick={guardarRegistro}
          disabled={guardando || catalogo.length === 0 || !resultado}
          className="w-full min-h-[46px] rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {guardando ? 'Guardando…' : 'Guardar registro en IndexedDB'}
        </button>
      </section>

      <section className={`p-4 rounded-xl border space-y-3 ${panel}`}>
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-500" />
          <h3 className={`text-xs font-bold ${texto}`}>Catálogo de tipos de tarea</h3>
        </div>
        <div className="flex gap-2">
          <input value={nuevaTarea} onChange={(e) => setNuevaTarea(e.target.value)} maxLength={100} placeholder="Crear tipo de tarea" className="flex-1 min-w-0 min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs" />
          <button type="button" onClick={agregarTipo} className="min-h-[44px] px-3 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {catalogo.map((tarea) => (
            <div key={tarea.id} className={`p-3 rounded-lg border flex items-center gap-2 ${modoSol ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-700'}`}>
              {editandoId === tarea.id ? (
                <>
                  <input value={nombreEdicion} onChange={(e) => setNombreEdicion(e.target.value)} maxLength={100} className="flex-1 min-w-0 min-h-[40px] px-2 rounded bg-slate-900 border border-slate-700 text-slate-100 text-xs" />
                  <button type="button" onClick={() => guardarEdicion(tarea.id)} aria-label="Guardar nombre" className="min-w-[40px] min-h-[40px] rounded bg-emerald-700 text-white"><Save className="w-4 h-4 mx-auto" /></button>
                  <button type="button" onClick={() => { setEditandoId(null); setNombreEdicion(''); }} aria-label="Cancelar edición" className="min-w-[40px] min-h-[40px] rounded bg-slate-700 text-white"><X className="w-4 h-4 mx-auto" /></button>
                </>
              ) : (
                <>
                  <span className={`flex-1 text-xs font-semibold ${texto}`}>{tarea.nombre}</span>
                  <button type="button" onClick={() => { setEditandoId(tarea.id); setNombreEdicion(tarea.nombre); }} aria-label={`Editar ${tarea.nombre}`} className="min-w-[40px] min-h-[40px] rounded bg-slate-700 text-white"><Pencil className="w-4 h-4 mx-auto" /></button>
                  <button type="button" onClick={() => desactivarTipo(tarea)} aria-label={`Desactivar ${tarea.nombre}`} className="min-w-[40px] min-h-[40px] rounded bg-rose-900 text-rose-200"><Ban className="w-4 h-4 mx-auto" /></button>
                </>
              )}
            </div>
          ))}
          {catalogo.length === 0 && <p className={`text-xs ${secundario}`}>No hay tipos de tarea activos. Crea uno para comenzar.</p>}
        </div>
      </section>

      <section className={`p-4 rounded-xl border space-y-3 ${panel}`}>
        <h3 className={`text-xs font-bold ${texto}`}>Registros guardados</h3>
        {cargando ? (
          <p className={`text-xs ${secundario}`}>Consultando IndexedDB…</p>
        ) : jornadas.length === 0 ? (
          <p className={`text-xs ${secundario}`}>No hay registros de Oficios Varios guardados.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {jornadas.slice(0, 20).map((jornada) => {
              const tramo = (jornada.tramos || []).find(esTramoOficio);
              if (!tramo) return null;
              const asignadas = tramo.tareas_asignadas ?? tramo.meta ?? 0;
              const completadas = tramo.tareas_completadas ?? tramo.completados ?? 0;
              const pct = tramo.cumplimiento_tareas_pct ?? (asignadas > 0 ? Number(((completadas / asignadas) * 100).toFixed(2)) : null);
              const colaborador = COLABORADORES_CATALOGO.find((c) => jornada.colaboradores_ids.includes(c.id));
              return (
                <article key={jornada.id} className={`rounded-lg border p-3 ${modoSol ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-700'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-xs font-semibold ${texto}`}>{tramo.labor_nombre || tramo.titulo}</p>
                      <p className={`text-[11px] mt-1 ${secundario}`}>{colaborador?.nombreCompleto || 'Colaborador'} · {jornada.fecha}</p>
                      <p className={`text-[11px] mt-1 ${secundario}`}>{tramo.hora_inicio}–{tramo.hora_fin}{tramo.area ? ` · ${tramo.area}` : ''}</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-violet-400">{pct !== null ? `${pct}%` : 'N/C'}</span>
                  </div>
                  <p className={`text-[11px] mt-2 ${secundario}`}>{completadas} / {asignadas} tareas completadas</p>
                  {tramo.observaciones && <p className={`text-[11px] mt-1 ${secundario}`}>{tramo.observaciones}</p>}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
