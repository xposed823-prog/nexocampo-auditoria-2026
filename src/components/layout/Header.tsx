import React from 'react';
import {
  Sun,
  Wifi,
  WifiOff,
  Smartphone,
  Database
} from 'lucide-react';

export interface HeaderProps {
  modoSol: boolean;
  setModoSol: (val: boolean) => void;
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  install: () => void;
  setShowIOSPrompt: (val: boolean) => void;
  totalPendientesLocal: number;
  setTabActual: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  modoSol,
  setModoSol,
  isOnline,
  isInstallable,
  isInstalled,
  isIOS,
  install,
  setShowIOSPrompt,
  totalPendientesLocal,
  setTabActual
}) => {
  return (
    <header className={`sticky top-0 z-40 border-b ${modoSol ? 'bg-slate-50/95 border-slate-300' : 'bg-slate-900/90 border-slate-800 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        
        {/* Logotipo Oficial NexoCampo PRO */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-[10px] bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-[0_4px_12px_rgba(34,197,94,0.35)] border border-emerald-400/30">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22V12" />
              <path d="M12 12C12 7.5 7.5 5 2 6c0 5.5 3.5 10 10 10z" />
              <path d="M12 12C12 7.5 16.5 5 22 6c0 5.5-3.5 10-10 10z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
                NexoCampo
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                PRO
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400">
                v18.1.9
              </span>
            </div>
            <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide block truncate uppercase mt-0.5 ${modoSol ? 'text-slate-600' : 'text-slate-400'}`}>
              SISTEMA INTEGRADO DE GESTIÓN AGRÍCOLA
            </span>
          </div>
        </div>

        {/* Controles de Accesibilidad, Conectividad y PWA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Indicador de Conectividad en Campo */}
          <div
            className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 border transition-colors ${
              isOnline
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/50 animate-pulse'
            }`}
            title={isOnline ? 'Conexión activa con el servidor central' : 'Modo Offline en Campo: Guardando en IndexedDB'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">En Línea</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Botón de Instalación In-App PWA */}
          {isInstallable && (
            <button
              onClick={install}
              className="min-h-[36px] px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition"
              aria-label="Instalar NexoCampo como aplicación móvil"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          {isIOS && !isInstalled && (
            <button
              onClick={() => setShowIOSPrompt(true)}
              className="min-h-[36px] px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1"
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Instalar iOS</span>
            </button>
          )}

          {/* Botón Modo Sol */}
          <button
            onClick={() => setModoSol(!modoSol)}
            className={`min-h-[36px] px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border ${
              modoSol
                ? 'bg-amber-100 border-amber-400 text-amber-950'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
            aria-label="Alternar modo contraste sol campo"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">{modoSol ? 'Normal' : 'Sol'}</span>
          </button>

          {/* Píldora de Cola IndexedDB con enlace a la vista PWA */}
          <button
            onClick={() => setTabActual('pwa_offline')}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-mono border flex items-center gap-1 cursor-pointer transition ${
              totalPendientesLocal > 0
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/50 hover:bg-amber-900/50'
                : modoSol
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
            }`}
            title="Ver registros pendientes en IndexedDB"
          >
            <Database className="w-3 h-3 text-emerald-400" />
            <span>{totalPendientesLocal} pend.</span>
          </button>
        </div>
      </div>
    </header>
  );
};
