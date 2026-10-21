import React from 'react';
import { Layers, ArrowRight, Plus } from 'lucide-react';

export interface ResumenModuloProps {
  modoSol: boolean;
  setTabActual: (tab: string) => void;
  setModalIncidenteAbierto: (val: boolean) => void;
}

export const ResumenModulo: React.FC<ResumenModuloProps> = ({
  modoSol,
  setTabActual,
  setModalIncidenteAbierto
}) => {
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" />
          Panel de Control de Cuadrilla de Campo (Día en Curso)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Visualización sintetizada de la jornada del supervisor. En este modelo operativo los operarios no usan cuentas personales.
        </p>
      </div>

      {/* Tarjetas de Métricas Clave (Grilla 2x2 Ergonómica) */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3.5 rounded-xl border ${modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Jornada Activa</span>
          <p className="text-lg font-bold font-mono text-emerald-400 mt-1">06:30 - 15:30</p>
          <span className="text-[10px] text-slate-400 block mt-0.5">475 min netos estimados</span>
        </div>
        <div className={`p-3.5 rounded-xl border ${modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Cuadrilla Presente</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-sky-400">5 / 6</span>
            <span className="text-xs text-slate-300 font-sans">operarios</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">1 retardo registrado</span>
        </div>
        <div className={`p-3.5 rounded-xl border ${modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Cubiertas (Plástico)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-amber-400">75%</span>
            <span className="text-xs text-slate-300 font-sans">avance</span>
          </div>
          <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">Saldo justificado</span>
        </div>
        <div className={`p-3.5 rounded-xl border ${modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Incidentes SST</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-slate-200">1</span>
            <span className="text-xs text-slate-300 font-sans">reporte</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Severidad leve · Atendido</span>
        </div>
      </div>

      {/* Accesos Rápidos Táctiles para Android */}
      <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/30 border-slate-700/50'}`}>
        <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Acciones Táctiles de Campo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => setTabActual('asistencia')}
            className="min-h-[48px] py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-between"
          >
            <span>Pase de Lista Rápido</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTabActual('polisombra')}
            className="min-h-[48px] py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-between"
          >
            <span>Registrar Plástico/Malla</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setModalIncidenteAbierto(true)}
            className="min-h-[48px] py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-semibold text-xs flex items-center justify-between"
          >
            <span>Reportar Incidente SST</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
