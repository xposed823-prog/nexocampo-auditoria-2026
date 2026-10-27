/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo v18.1.9 - Barra de Navegación Inferior Móvil Canónica (Bottom Nav)
 * 6 Vistas Oficiales: Inicio, Registrar, Reportes, Ausencias, Asistencia, Admin
 */

import React from 'react';
import {
  Home,
  Edit3,
  BarChart3,
  Calendar,
  CheckCircle2,
  Settings
} from 'lucide-react';

export interface NavigationProps {
  tabActual: string;
  setTabActual: (tab: string) => void;
  modoSol: boolean;
}

export const VISTAS_NEXOCAMPO = [
  { id: 'inicio', label: 'Inicio', icon: Home, emoji: '🏠' },
  { id: 'registrar', label: 'Registrar', icon: Edit3, emoji: '✏️' },
  { id: 'reportes', label: 'Reportes', icon: BarChart3, emoji: '📊' },
  { id: 'ausencias', label: 'Ausencias', icon: Calendar, emoji: '📅' },
  { id: 'asistencia', label: 'Asistencia', icon: CheckCircle2, emoji: '✅' },
  { id: 'admin', label: 'Admin', icon: Settings, emoji: '⚙️' }
];

export const Navigation: React.FC<NavigationProps> = ({
  tabActual,
  setTabActual,
  modoSol
}) => {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-[28rem] mx-auto border-t select-none transition-colors duration-100 ${
        modoSol
          ? 'bg-white/95 border-slate-200 text-slate-600 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]'
          : 'bg-slate-900/95 border-slate-800 text-slate-400 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]'
      } backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)]`}
      aria-label="Navegación principal inferior NexoCampo"
    >
      <div className="grid grid-cols-6 h-14 items-center px-1">
        {VISTAS_NEXOCAMPO.map((item) => {
          const Icon = item.icon;
          const activo = tabActual === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTabActual(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors duration-100 ${
                activo
                  ? modoSol
                    ? 'text-emerald-800 font-bold'
                    : 'text-emerald-300 font-bold'
                  : modoSol
                    ? 'hover:text-slate-900 text-slate-500'
                    : 'hover:text-slate-200 text-slate-400'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${activo ? (modoSol ? 'bg-emerald-50' : 'bg-emerald-500/15') : ''}`}>
                <Icon className={`w-4 h-4 ${activo ? (modoSol ? 'text-emerald-700' : 'text-emerald-400') : 'currentColor'}`} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
