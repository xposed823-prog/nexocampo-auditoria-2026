import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, CheckCircle2, Users, Database } from 'lucide-react';
import { calcularJornadaLaboral } from '../../domain/jornadaCalculator';
import { validarJornada } from '../../domain/formValidators';
import { dbGetAll, guardarJornadaRegistro, type JornadaRegistro, type TramoJornada } from '../../domain/nexocampoDB';
import { COLABORADORES_CATALOGO } from '../../domain/catalogoAgronomico';

function fechaLocalHoy(): string {
  const fecha = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

export interface JornadasModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
  onJornadaGuardada?: () => void;
}

export const JornadasModulo: React.FC<JornadasModuloProps> = ({ modoSol, dispararToast, onJornadaGuardada }) => {
  const [fecha, setFecha] = useState(fechaLocalHoy);
  const [apertura, setApertura] = useState('06:30');
  const [cierre, setCierre] = useState('15:30');
  const [pausaComida, setPausaComida] = useState(60);
  const [pausaActiva, setPausaActiva] = useState(5);
  const [colaboradoresSeleccionados, setColaboradoresSeleccionados] = useState<string[]>([]);
  const [jornadasPersistidas, setJornadasPersistidas] = useState<JornadaRegistro[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const cargarJornadas = async () => {
    try {
      const items = await dbGetAll<JornadaRegistro>('jornadas');
      setJornadasPersistidas(items || []);
    } catch (error: any) {
      dispararToast(`No se pudieron consultar las jornadas: ${error?.message || 'error de IndexedDB'}`);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarJornadas();
  }, []);

  const calculo = calcularJornadaLaboral(apertura, cierre, [
    { tipo: 'almuerzo', duracionMinutos: pausaComida, esDeduccionComputable: true },
    { tipo: 'pausa_5min', duracionMinutos: pausaActiva, esDeduccionComputable: true }
  ]);

  const jornadasBase = jornadasPersistidas
    .filter((jornada) => (jornada.tramos || []).some((tramo) => tramo.tipo === 'jornada_base'))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEn.localeCompare(a.creadoEn));

  const alternarColaborador = (id: string) => {
    setColaboradoresSeleccionados((actuales) =>
      actuales.includes(id) ? actuales.filter((item) => item !== id) : [...actuales, id]
    );
  };

  const guardarJornadaBase = async () => {
    if (!fecha) {
      dispararToast('Selecciona la fecha de la jornada.');
      return;
    }
    if (colaboradoresSeleccionados.length === 0) {
      dispararToast('Selecciona al menos un colaborador para registrar la jornada base.');
      return;
    }
    const validacion = validarJornada(apertura, cierre);
    if (!validacion.esValido) {
      dispararToast(`Error: ${Object.values(validacion.errores)[0] || 'Horario inválido'}`);
      return;
    }

    const existentes = await dbGetAll<JornadaRegistro>('jornadas');
    const colaboradoresConJornada = existentes.find((jornada) =>
      jornada.fecha === fecha &&
      (jornada.tramos || []).some((tramo) => tramo.tipo === 'jornada_base') &&
      jornada.colaboradores_ids.some((id) => colaboradoresSeleccionados.includes(id))
    );
    if (colaboradoresConJornada) {
      dispararToast('Uno o más colaboradores ya tienen una jornada base en esta fecha. No se guardó una jornada duplicada.');
      return;
    }

    const ahora = new Date().toISOString();
    const marca = Date.now();
    const jornadaId = `jornada_base_${fecha}_${marca}`;
    const tramoBase: TramoJornada = {
      id: `tramo_base_${marca}`,
      tipo: 'jornada_base',
      titulo: 'Jornada ordinaria',
      hora_inicio: apertura,
      hora_fin: cierre,
      minutos_efectivos_jornada: calculo.minutosEfectivosNetos,
      estandar_min: null,
      observaciones: `Ventana ${apertura}–${cierre}. Descuento de alimentación: ${pausaComida} min; pausas activas: ${pausaActiva} min; tiempo efectivo calculado: ${calculo.minutosEfectivosNetos} min.`
    };
    const nuevaJornada: JornadaRegistro = {
      id: jornadaId,
      fecha,
      jornada_base_id: jornadaId,
      colaboradores_ids: [...colaboradoresSeleccionados],
      tramos: [tramoBase],
      creadoEn: ahora,
      actualizadoEn: ahora,
      sincronizado: false
    };

    try {
      setGuardando(true);
      await guardarJornadaRegistro(nuevaJornada);
      await cargarJornadas();
      onJornadaGuardada?.();
      dispararToast('Jornada base guardada en IndexedDB. Las labores se registran por separado.');
      setColaboradoresSeleccionados([]);
    } catch (error: any) {
      dispararToast(`No se guardó la jornada: ${error?.message || 'error de IndexedDB'}`);
    } finally {
      setGuardando(false);
    }
  };

  const texto = modoSol ? 'text-slate-900' : 'text-slate-100';
  const secundario = modoSol ? 'text-slate-600' : 'text-slate-400';
  const panel = modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/40 border-slate-700/60';

  return (
    <div className="space-y-6">
      <section className={`p-4 rounded-xl border ${panel}`}>
        <h2 className={`text-sm font-bold flex items-center gap-2 ${texto}`}>
          <Calendar className="w-4 h-4 text-emerald-500" />
          Jornada base del colaborador
        </h2>
        <p className={`text-xs mt-2 leading-relaxed ${secundario}`}>
          La jornada define la ventana general de trabajo y sus minutos efectivos. No se guarda como una labor productiva,
          por lo que no bloquea las labores consecutivas ni suma minutos dos veces al rendimiento técnico.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={`p-5 rounded-xl border space-y-4 ${panel}`}>
          <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${secundario}`}>
            <Clock className="w-4 h-4" /> Configurar horario general
          </h3>
          <label className="block">
            <span className={`block mb-1 text-xs font-semibold ${secundario}`}>Fecha de jornada</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={`block mb-1 text-xs font-semibold ${secundario}`}>Hora de apertura</span>
              <input type="time" value={apertura} onChange={(e) => setApertura(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono" />
            </label>
            <label className="block">
              <span className={`block mb-1 text-xs font-semibold ${secundario}`}>Hora de cierre</span>
              <input type="time" value={cierre} onChange={(e) => setCierre(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={`block mb-1 text-xs font-semibold ${secundario}`}>Desayuno + almuerzo (min)</span>
              <input type="number" min="0" step="5" value={pausaComida} onChange={(e) => setPausaComida(Math.max(0, Number(e.target.value)))} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono" />
            </label>
            <label className="block">
              <span className={`block mb-1 text-xs font-semibold ${secundario}`}>Pausas activas (min)</span>
              <input type="number" min="0" step="5" value={pausaActiva} onChange={(e) => setPausaActiva(Math.max(0, Number(e.target.value)))} className="w-full min-h-[44px] px-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono" />
            </label>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Duración bruta</span>
              <span className="text-sm font-mono font-bold text-slate-100">{calculo.minutosBrutos} min</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Descuentos</span>
              <span className="text-sm font-mono font-bold text-amber-300">{calculo.minutosDeducidos} min</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-emerald-300">Tiempo efectivo de jornada</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{calculo.minutosEfectivosNetos} min</span>
            </div>
          </div>
        </section>

        <section className={`p-5 rounded-xl border space-y-4 ${panel}`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${secundario}`}>
              <Users className="w-4 h-4" /> Colaboradores incluidos
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">{colaboradoresSeleccionados.length} seleccionados</span>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {COLABORADORES_CATALOGO.map((colaborador) => (
              <label key={colaborador.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${colaboradoresSeleccionados.includes(colaborador.id) ? 'border-emerald-500/50 bg-emerald-500/10' : modoSol ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/40'}`}>
                <input type="checkbox" checked={colaboradoresSeleccionados.includes(colaborador.id)} onChange={() => alternarColaborador(colaborador.id)} className="w-4 h-4 accent-emerald-500" />
                <span className={`flex-1 text-xs font-semibold ${texto}`}>{colaborador.nombreCompleto}</span>
                <span className={`text-[10px] ${secundario}`}>{colaborador.cuadrilla}</span>
              </label>
            ))}
          </div>
          <button type="button" onClick={guardarJornadaBase} disabled={guardando || cargando} className="w-full min-h-[46px] rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2">
            {guardando ? <Database className="w-4 h-4 animate-pulse" /> : <Plus className="w-4 h-4" />}
            {guardando ? 'Guardando…' : 'Guardar jornada base en IndexedDB'}
          </button>
        </section>
      </div>

      <section className={`p-4 rounded-xl border space-y-3 ${panel}`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${secundario}`}>
          <Database className="w-4 h-4" /> Jornadas base guardadas
        </h3>
        {cargando ? (
          <p className={`text-xs ${secundario}`}>Consultando IndexedDB…</p>
        ) : jornadasBase.length === 0 ? (
          <p className={`text-xs ${secundario}`}>Todavía no hay jornadas base guardadas.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {jornadasBase.slice(0, 20).map((jornada) => {
              const tramo = jornada.tramos.find((item) => item.tipo === 'jornada_base');
              if (!tramo) return null;
              const nombres = jornada.colaboradores_ids.map((id) => COLABORADORES_CATALOGO.find((c) => c.id === id)?.nombreCompleto || id);
              return (
                <article key={jornada.id} className={`p-3 rounded-lg border ${modoSol ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-700'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-xs font-bold ${texto}`}>{jornada.fecha} · {tramo.hora_inicio}–{tramo.hora_fin}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{tramo.minutos_efectivos_jornada ?? 0} min efectivos</span>
                  </div>
                  <p className={`text-[11px] mt-1 ${secundario}`}>{nombres.join(', ')}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
