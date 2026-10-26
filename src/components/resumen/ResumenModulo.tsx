import React from 'react';
import { ArrowRight, ClipboardCheck, Layers, Plus, ShieldAlert } from 'lucide-react';

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
  const surface = modoSol
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-slate-800/50 border-slate-700/60';

  return (
    <section className="space-y-4" aria-labelledby="inicio-title">
      <header className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-5 text-white shadow-lg shadow-emerald-950/10">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-emerald-300/15 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <Layers className="h-5 w-5 text-emerald-100" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">Centro de operaciones</p>
            <h1 id="inicio-title" className="text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">NexoCampo</h1>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-emerald-50/90">
              Registra la jornada, consulta resultados y gestiona novedades de campo.
            </p>
          </div>
        </div>
      </header>

      <div className={`rounded-2xl border p-4 ${surface}`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className={`text-base font-bold ${modoSol ? 'text-slate-900' : 'text-white'}`}>Acciones frecuentes</h2>
            <p className={`mt-1 text-sm ${modoSol ? 'text-slate-500' : 'text-slate-400'}`}>Accesos directos para el trabajo diario.</p>
          </div>
          <span className="rounded-lg bg-emerald-50 p-2 text-emerald-800">
            <ClipboardCheck className="h-5 w-5" />
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          <button type="button" onClick={() => setTabActual('asistencia')}
            className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl bg-emerald-700 px-4 py-3 text-left text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800">
            <span className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 shrink-0" /> Pase de lista</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
          <button type="button" onClick={() => setTabActual('polisombra')}
            className={`flex min-h-[52px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors ${modoSol ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-emerald-50' : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'}`}>
            <span className="flex items-center gap-3"><Layers className="h-5 w-5 shrink-0 text-emerald-600" /> Registrar plástico / malla</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
          <button type="button" onClick={() => setModalIncidenteAbierto(true)}
            className={`flex min-h-[52px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors ${modoSol ? 'border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100' : 'border-amber-700/50 bg-amber-950/30 text-amber-200 hover:bg-amber-900/40'}`}>
            <span className="flex items-center gap-3"><ShieldAlert className="h-5 w-5 shrink-0" /> Reportar incidente</span>
            <Plus className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </section>
  );
};
