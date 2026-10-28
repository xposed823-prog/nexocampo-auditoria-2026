import React from 'react';
import {
  Sun,
  Wifi,
  WifiOff,
  Smartphone,
  Database,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { AuthUser } from '../../domain/authTypes';

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
  user?: AuthUser | null;
  onLogout?: () => void;
  onManageUsers?: () => void;
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
  setTabActual,
  user,
  onLogout,
  onManageUsers
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/80 backdrop-blur-md transition-colors">
      <div className="max-w-[28rem] mx-auto">
        {/* Barra Superior con Chips de Estado Offline Nativos (Capturas Oficiales) */}
        <div className="flex items-center gap-2 px-4 pt-2.5 pb-1 overflow-x-auto text-[11px] font-semibold select-none no-scrollbar">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Offline Listo
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/80 text-[11px]">
            <span>🔒</span>
            Datos en este dispositivo
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-xs text-[11px]">
            {isOnline ? 'En línea' : 'Offline'}
          </span>
        </div>

        {/* Logotipo Oficial NexoCampo PRO y Controles */}
        <div className="px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={() => setTabActual('inicio')}>
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md text-white text-xl select-none">
              🌱
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight leading-none">
                  NexoCampo
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-700 border border-emerald-300">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 block truncate mt-0.5">
                Control operativo de adecuaciones
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

          {/* Usuario y Autenticación */}
          {user && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onManageUsers}
                className="min-h-[36px] px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 hover:bg-slate-700 transition-colors"
                title="Gestionar usuarios"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{user.username}</span>
              </button>
              <button
                onClick={onLogout}
                className="min-h-[36px] px-2 py-1 rounded-lg bg-rose-800/50 border border-rose-700 text-rose-300 text-[10px] font-semibold flex items-center gap-1 hover:bg-rose-700/50 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
    </div>
  </header>
);
};
