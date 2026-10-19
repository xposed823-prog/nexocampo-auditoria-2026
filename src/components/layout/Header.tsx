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
        
        {/* Logotipo Original NexoCampo */}
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 text-emerald-500"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Logotipo NexoCampo"
          >
            <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.15" />
            <path d="M16 6L23 14H9L16 6Z" fill="currentColor" />
            <path d="M9 16H23L16 26L9 16Z" fill="currentColor" fillOpacity="0.8" />
            <circle cx="16" cy="15" r="3" fill="#ffffff" />
          </svg>
          <div className="min-w-0">
            <span className="font-bold text-sm sm:text-base tracking-tight block truncate leading-tight">NEXOCAMPO 2026</span>
            <span className={`text-[10px] block truncate ${modoSol ? 'text-slate-600' : 'text-slate-400'}`}>
              Supervisión Agrícola · Android UI
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
