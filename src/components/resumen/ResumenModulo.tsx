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

      {/* Indicadores: no mostrar cifras de ejemplo como si fueran datos reales */}
      <section className="space-y-3" aria-labelledby="resumen-indicadores-titulo">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="resumen-indicadores-titulo" className="text-sm font-bold text-slate-800">Resumen operativo</h3>
            <p className="text-xs text-slate-500 mt-1">Consulta cada módulo para ver los registros disponibles.</p>
          </div>
          <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
            Sin consolidado en vivo
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTabActual('asistencia')}
            className={`min-h-[112px] rounded-xl border p-3.5 text-left ${modoSol ? 'bg-white border-slate-200 hover:border-emerald-300' : 'bg-slate-800/50 border-slate-700 hover:border-emerald-700'}`}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Jornada y asistencia</span>
            <span className="mt-2 block text-sm font-bold text-emerald-700">Consultar registros</span>
            <span className="mt-1 block text-xs text-slate-500">Verifica la información registrada.</span>
          </button>
          <button
            type="button"
            onClick={() => setTabActual('polisombra')}
            className={`min-h-[112px] rounded-xl border p-3.5 text-left ${modoSol ? 'bg-white border-slate-200 hover:border-emerald-300' : 'bg-slate-800/50 border-slate-700 hover:border-emerald-700'}`}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Plástico y polisombra</span>
            <span className="mt-2 block text-sm font-bold text-emerald-700">Ver avance</span>
            <span className="mt-1 block text-xs text-slate-500">Consulta las labores registradas.</span>
          </button>
          <button
            type="button"
            onClick={() => setTabActual('reportes')}
            className={`min-h-[112px] rounded-xl border p-3.5 text-left ${modoSol ? 'bg-white border-slate-200 hover:border-emerald-300' : 'bg-slate-800/50 border-slate-700 hover:border-emerald-700'}`}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Indicadores</span>
            <span className="mt-2 block text-sm font-bold text-emerald-700">Abrir reportes</span>
            <span className="mt-1 block text-xs text-slate-500">Consolidados basados en registros.</span>
          </button>
          <button
            type="button"
            onClick={() => setModalIncidenteAbierto(true)}
            className={`min-h-[112px] rounded-xl border p-3.5 text-left ${modoSol ? 'bg-white border-slate-200 hover:border-amber-300' : 'bg-slate-800/50 border-slate-700 hover:border-amber-700'}`}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Seguridad y salud</span>
            <span className="mt-2 block text-sm font-bold text-amber-700">Registrar incidente</span>
            <span className="mt-1 block text-xs text-slate-500">Abre el formulario de reporte.</span>
          </button>
        </div>
      </section>

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
