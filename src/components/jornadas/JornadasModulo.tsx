import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, CheckCircle2, Database, Check } from 'lucide-react';
import { calcularJornadaLaboral } from '../../domain/jornadaCalculator';
import { validarJornada } from '../../domain/formValidators';
import { dbGetAll, guardarJornadaRegistro, JornadaRegistro } from '../../domain/nexocampoDB';

export interface JornadasModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
  onJornadaGuardada?: () => void;
}

export const JornadasModulo: React.FC<JornadasModuloProps> = ({ modoSol, dispararToast, onJornadaGuardada }) => {
  const [fecha, setFecha] = useState('2026-10-19');
  const [apertura, setApertura] = useState('06:30');
  const [cierre, setCierre] = useState('15:30');
  const [pausaComida, setPausaComida] = useState(60);
  const [pausaActiva, setPausaActiva] = useState(5);
  const [jornadasPersistidas, setJornadasPersistidas] = useState<JornadaRegistro[]>([]);
  const [guardando, setGuardando] = useState(false);

  const cargarJornadas = async () => {
    try {
      const items = await dbGetAll<JornadaRegistro>('jornadas');
      setJornadasPersistidas(items || []);
    } catch (e) {
      console.warn('[JornadasModulo] Error al cargar jornadas de IndexedDB:', e);
    }
  };

  useEffect(() => {
    cargarJornadas();
  }, []);

  const calculo = calcularJornadaLaboral(apertura, cierre, [
    { tipo: 'almuerzo', duracionMinutos: pausaComida, esDeduccionComputable: true },
    { tipo: 'pausa_5min', duracionMinutos: pausaActiva, esDeduccionComputable: true }
  ]);

  const handleGuardarJornada = async () => {
    const val = validarJornada(apertura, cierre);
    if (!val.esValido) {
      dispararToast(`Error: ${Object.values(val.errores)[0] || 'Horario inválido'}`);
      return;
    }

    try {
      setGuardando(true);
      const nuevaJornada: JornadaRegistro = {
        id: `jornada_${fecha}_${Date.now()}`,
        fecha,
        colaboradores_ids: ['col_1', 'col_2', 'col_3', 'col_4'],
        tramos: [
          {
            id: `tramo_${Date.now()}`,
            tipo: 'labor',
            titulo: 'Jornada Ordinaria Agrícola',
            hora_inicio: apertura,
            hora_fin: cierre,
            unidades: calculo.minutosEfectivosNetos,
            estado: 'cumple',
            observaciones: `Apertura ${apertura} a ${cierre}. Descuento comida: ${pausaComida}m, activa: ${pausaActiva}m. Netos: ${calculo.minutosEfectivosNetos} min`
          }
        ],
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        sincronizado: false
      };

      await guardarJornadaRegistro(nuevaJornada);
      await cargarJornadas();
      if (onJornadaGuardada) onJornadaGuardada();
      dispararToast('✓ Jornada registrada y persistida en IndexedDB (store: jornadas)');
    } catch (e: any) {
      dispararToast(`Error al guardar: ${e?.message || 'Error en IndexedDB'}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Módulo de Jornadas y Segmentos Horarios
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Jornada general canónica única con persistencia real en IndexedDB (`store: jornadas`). Permite registrar apertura, descansos y verificar minutos netos computables sin duplicidad.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            Canónica: 540m brutos / 475m netos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración de Jornada */}
        <div className={`p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Horario de la Jornada General
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha de Jornada</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Apertura</label>
              <input
                type="time"
                value={apertura}
                onChange={(e) => setApertura(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Cierre</label>
              <input
                type="time"
                value={cierre}
                onChange={(e) => setCierre(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/40">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Pausa Comidas (Minutos)</label>
              <input
                type="number"
                value={pausaComida}
                onChange={(e) => setPausaComida(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Pausas Activas (Minutos)</label>
              <input
                type="number"
                value={pausaActiva}
                onChange={(e) => setPausaActiva(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <button
            onClick={handleGuardarJornada}
            disabled={guardando}
            className="w-full min-h-[44px] py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{guardando ? 'Persistiendo en IndexedDB...' : 'Guardar Jornada en IndexedDB'}</span>
          </button>
        </div>

        {/* Resumen de Minutos Computables */}
        <div className={`p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Cómputo en Tiempo Real (Motor Desacoplado)
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Minutos Brutos en Finca:</span>
              <span className="font-mono font-bold text-slate-200 text-sm">{calculo.minutosBrutos} min</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Deducciones Computables:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{calculo.minutosDescansosComida + calculo.minutosPausasAdicionales} min</span>
            </div>
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-300">Minutos Efectivos Netos:</span>
              <span className="font-mono font-bold text-emerald-400 text-base">{calculo.minutosEfectivosNetos} min</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            *Regla de protección: múltiples labores dentro de este rango no multiplican la duración general de la jornada (Invariante canónica: 475 min netos).
          </p>
        </div>
      </div>

      {/* Registro Histórico de Jornadas Persistidas en IndexedDB */}
      <div className={`p-5 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Jornadas Guardadas en IndexedDB ({jornadasPersistidas.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Store: 'jornadas'</span>
        </div>

        {jornadasPersistidas.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No hay jornadas persistidas aún. Al presionar "Guardar Jornada en IndexedDB", quedará guardada de forma duradera sin depender de la memoria de sesión.
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {jornadasPersistidas.slice(-5).reverse().map((j) => (
              <div key={j.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2 font-mono font-semibold text-slate-200">
                    <span>{j.fecha}</span>
                    <span className="text-[11px] text-emerald-400">({j.tramos?.[0]?.unidades || 475} min netos)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                    {j.tramos?.[0]?.titulo || 'Jornada'} · {j.tramos?.[0]?.hora_inicio} a {j.tramos?.[0]?.hora_fin}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${j.sincronizado ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {j.sincronizado ? 'Sincronizado' : 'Pendiente Sync'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
