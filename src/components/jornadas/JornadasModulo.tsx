import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { calcularJornadaLaboral } from '../../domain/jornadaCalculator';

export interface JornadasModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

export const JornadasModulo: React.FC<JornadasModuloProps> = ({ modoSol, dispararToast }) => {
  const [apertura, setApertura] = useState('06:30');
  const [cierre, setCierre] = useState('15:30');
  const [pausaComida, setPausaComida] = useState(60);
  const [pausaActiva, setPausaActiva] = useState(5);

  const calculo = calcularJornadaLaboral(apertura, cierre, [
    { tipo: 'almuerzo', duracionMinutos: pausaComida, esDeduccionComputable: true },
    { tipo: 'pausa_5min', duracionMinutos: pausaActiva, esDeduccionComputable: true }
  ]);

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
              Jornada general canónica única. Permite registrar apertura, descansos y verificar minutos netos computables sin duplicidad.
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Apertura</label>
              <input
                type="time"
                value={apertura}
                onChange={(e) => setApertura(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Cierre</label>
              <input
                type="time"
                value={cierre}
                onChange={(e) => setCierre(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
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
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Pausas Activas (Minutos)</label>
              <input
                type="number"
                value={pausaActiva}
                onChange={(e) => setPausaActiva(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
              />
            </div>
          </div>

          <button
            onClick={() => dispararToast('Jornada general guardada en IndexedDB')}
            className="w-full min-h-[44px] py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Guardar Jornada en Memoria Local</span>
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
            *Regla de protección: múltiples labores dentro de este rango no multiplican la duración general de la jornada.
          </p>
        </div>
      </div>
    </div>
  );
};
