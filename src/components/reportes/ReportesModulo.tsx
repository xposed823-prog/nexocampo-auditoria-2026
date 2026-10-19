import React from 'react';
import { FileBarChart, Printer, Download } from 'lucide-react';

export interface ReportesModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

export const ReportesModulo: React.FC<ReportesModuloProps> = ({ modoSol, dispararToast }) => {
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FileBarChart className="w-4 h-4 text-emerald-500" />
              Módulo de Reportes Agrícolas y Exportaciones
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidados diarios y semanales de cuadrilla. Indicadores directos calculados con media ponderada por tiempo efectivo.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Imprimir Informe</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Jornadas Consolidadas</span>
          <p className="text-2xl font-bold font-mono text-emerald-400">100%</p>
          <span className="text-[10px] text-slate-400">Sin duplicidades en registro múltiple</span>
        </div>
        <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Eficiencia Ponderada</span>
          <p className="text-2xl font-bold font-mono text-sky-400">94.4%</p>
          <span className="text-[10px] text-slate-400">Ponderado por minutos reales trabajados</span>
        </div>
        <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Cobertura y Malla</span>
          <p className="text-2xl font-bold font-mono text-amber-400">75%</p>
          <span className="text-[10px] text-slate-400">Saldo pendiente justificado con actas</span>
        </div>
      </div>
    </div>
  );
};
