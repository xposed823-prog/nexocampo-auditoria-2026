import React from 'react';
import { Sun, Wifi, WifiOff, Smartphone, Database, LogOut, Settings } from 'lucide-react';
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
  modoSol, setModoSol, isOnline, isInstallable, isInstalled, isIOS, install,
  setShowIOSPrompt, totalPendientesLocal, setTabActual, user, onLogout, onManageUsers
}) => (
  <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${modoSol ? 'border-slate-200 bg-white/95 shadow-sm' : 'border-slate-800 bg-slate-950/95'}`}>
    <div className="mx-auto flex w-full max-w-[28rem] flex-col gap-3 px-4 pb-3 pt-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-700 to-emerald-500 text-xl text-white shadow-md shadow-emerald-900/15" aria-hidden="true">🌱</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`truncate text-base font-extrabold tracking-tight ${modoSol ? 'text-slate-900' : 'text-white'}`}>NexoCampo</span>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">Auditoría</span>
            </div>
            <p className={`mt-0.5 text-xs ${modoSol ? 'text-slate-500' : 'text-slate-400'}`}>Supervisión de campo · 2026</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold ${isOnline ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-900'}`} role="status">
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isOnline ? 'En línea' : 'Sin red'}</span>
          </span>
          <button type="button" onClick={() => setTabActual('pwa_offline')}
            className={`relative flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold ${totalPendientesLocal > 0 ? 'border-amber-300 bg-amber-50 text-amber-900' : modoSol ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-slate-700 bg-slate-800 text-slate-200'}`}
            aria-label={`Registros pendientes: ${totalPendientesLocal}`} title="Ver registros pendientes">
            <Database className="h-4 w-4" /><span>{totalPendientesLocal}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isInstallable && (
          <button type="button" onClick={install} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-800">
            <Smartphone className="h-4 w-4" /> Instalar app
          </button>
        )}
        {isIOS && !isInstalled && (
          <button type="button" onClick={() => setShowIOSPrompt(true)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold ${modoSol ? 'border-slate-200 bg-white text-slate-700' : 'border-slate-700 bg-slate-800 text-slate-100'}`}>
            <Smartphone className="h-4 w-4" /> Instalar en iOS
          </button>
        )}
        <button type="button" onClick={() => setModoSol(!modoSol)}
          className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors ${modoSol ? 'border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100' : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'}`}
          aria-label={modoSol ? 'Activar modo oscuro' : 'Activar modo claro'}>
          <Sun className="h-4 w-4 text-amber-500" /> {modoSol ? 'Modo sol' : 'Modo oscuro'}
        </button>
        {user && (
          <>
            <button type="button" onClick={onManageUsers}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold ${modoSol ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'}`}
              title={`Gestionar usuarios · ${user.username}`}>
              <Settings className="h-4 w-4" /> Usuarios
            </button>
            <button type="button" onClick={onLogout}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-800 hover:bg-rose-100"
              title="Cerrar sesión"><LogOut className="h-4 w-4" /> Salir</button>
          </>
        )}
      </div>
    </div>
  </header>
);
