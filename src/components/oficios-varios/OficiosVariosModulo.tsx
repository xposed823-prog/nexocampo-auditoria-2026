import React, { useState } from 'react';
import { Wrench, CheckCircle2, AlertCircle } from 'lucide-react';
import { calcularOficiosVarios } from '../../domain/businessRulesEngine';

export interface OficiosVariosModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

export const OficiosVariosModulo: React.FC<OficiosVariosModuloProps> = ({ modoSol, dispararToast }) => {
  const [asignadas, setAsignadas] = useState(5);
  const [completadas, setCompletadas] = useState(3);
  const [observaciones, setObservaciones] = useState('Limpieza profunda de zanjas de desagüe y desyerbe perimetral.');

  const resultado = calcularOficiosVarios(asignadas, completadas);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-500" />
              Módulo de Oficios Varios
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cómputo de tareas asignadas vs. completadas. Sin estándares cronometrados ni rendimientos porcentuales inventados.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
            Regla de Integridad Técnica
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className={`p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Registro de Tareas de Mantenimiento
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tareas Asignadas</label>
              <input
                type="number"
                value={asignadas}
                onChange={(e) => setAsignadas(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tareas Completadas</label>
              <input
                type="number"
                value={completadas}
                onChange={(e) => setCompletadas(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Observaciones Operativas</label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            />
          </div>

          <button
            onClick={() => dispararToast('Registro de Oficios Varios guardado')}
            className="w-full min-h-[44px] py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Guardar Registro de Oficios Varios</span>
          </button>
        </div>

        {/* Diagnóstico de Dominio */}
        <div className={`p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Diagnóstico de Cumplimiento
          </h3>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Porcentaje de Tareas:</span>
              <span className="font-mono font-bold text-emerald-400 text-lg">{resultado.cumplimientoTareasPct}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Estado de la Asignación:</span>
              <span className="uppercase text-[11px] font-bold text-amber-400">{resultado.estado}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-200">Protección de Datos:</p>
            <p>
              En oficios varios no se emite "rendimiento temporal" porcentual porque las tareas no tienen estándar cronometrado. Se computan las horas efectivas y el conteo discreto de tareas completadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
