/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Navegación inferior principal, optimizada para uso táctil en Android.
 */
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
    className={`fixed bottom-0 left-0 right-0 z-40 max-w-[28rem] mx-auto border-t select-none transition-colors pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl ${
      modoSol
        ? 'bg-white/95 border-slate-200 text-slate-600 shadow-[0_-6px_24px_rgba(24,52,34,0.08)]'
        : 'bg-slate-950/95 border-slate-800 text-slate-400 shadow-[0_-6px_24px_rgba(0,0,0,0.28)]'
    }`}
    aria-label="Navegación principal"
  >
    <div className="grid grid-cols-6 min-h-16 items-stretch px-1 py-1">
      {VISTAS_NEXOCAMPO.map((item) => {
        const Icon = item.icon;
        const activo = tabActual === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTabActual(item.id)}
            aria-current={activo ? 'page' : undefined}
            className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl min-h-[52px] px-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-500 ${
              activo
                ? modoSol ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-emerald-400/10 text-emerald-300 font-bold'
                : modoSol ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
            <span className="max-w-full truncate text-[10px] sm:text-[11px] font-semibold leading-tight tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);
