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
      className="fixed bottom-0 left-0 right-0 z-40 max-w-[28rem] mx-auto bg-white/98 border-t border-slate-200 text-slate-500 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] select-none"
      aria-label="Navegación principal inferior NexoCampo"
    >
      <div className="grid grid-cols-6 h-15 items-center px-1">
        {VISTAS_NEXOCAMPO.map((item) => {
          const activo = tabActual === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTabActual(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all ${
                activo
                  ? 'text-emerald-800 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activo ? 'bg-emerald-100/80 shadow-xs scale-105' : ''}`}>
                <span className="text-lg leading-none select-none">{item.emoji}</span>
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 leading-tight ${activo ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
