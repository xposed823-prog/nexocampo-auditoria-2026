import React from 'react';
import { Home, Edit3, BarChart3, Calendar, CheckCircle2, Settings } from 'lucide-react';

export interface NavigationProps {
  tabActual: string;
  setTabActual: (tab: string) => void;
  modoSol: boolean;
}

export const VISTAS_NEXOCAMPO = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'registrar', label: 'Registrar', icon: Edit3 },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'ausencias', label: 'Ausencias', icon: Calendar },
  { id: 'asistencia', label: 'Asistencia', icon: CheckCircle2 },
  { id: 'admin', label: 'Admin', icon: Settings }
];

export const Navigation: React.FC<NavigationProps> = ({ tabActual, setTabActual, modoSol }) => (
  <nav
    className={`fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[28rem] border-t pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl ${modoSol ? 'border-slate-200 bg-white/95 text-slate-600 shadow-[0_-4px_16px_rgba(15,23,42,0.08)]' : 'border-slate-800 bg-slate-950/95 text-slate-400 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]'}`}
    aria-label="Navegación principal"
  >
    <div className="grid min-h-[4.25rem] grid-cols-6 items-stretch px-1">
      {VISTAS_NEXOCAMPO.map((item) => {
        const Icon = item.icon;
        const activo = tabActual === item.id || (item.id === 'registrar' && ['jornadas', 'labores', 'oficios', 'polisombra', 'incidentes'].includes(tabActual));
        return (
          <button key={item.id} type="button" onClick={() => setTabActual(item.id)}
            aria-current={activo ? 'page' : undefined}
            className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-center transition-colors focus-visible:z-10 ${activo ? (modoSol ? 'font-bold text-emerald-800' : 'font-bold text-emerald-300') : (modoSol ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white')}`}>
            <span className={`flex h-7 w-8 items-center justify-center rounded-lg ${activo ? (modoSol ? 'bg-emerald-50' : 'bg-emerald-500/15') : ''}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
