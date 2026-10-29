import React from 'react';
import { Sun, Wifi, WifiOff, Smartphone, Database, Sprout } from 'lucide-react';

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
  modoSol, setModoSol, isOnline, isInstallable, isInstalled, isIOS,
  install, setShowIOSPrompt, totalPendientesLocal, setTabActual
}) => {
  const controlBase = 'min-h-[44px] rounded-xl border inline-flex items-center justify-center gap-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500';

  return (
    <header className={`sticky top-0 z-40 border-b ${modoSol ? 'bg-white/95 border-slate-200 shadow-sm' : 'bg-slate-900/95 border-slate-800 backdrop-blur-md'}`}>
      <div className="max-w-[28rem] mx-auto px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center shadow-sm border border-emerald-500/30 text-white">
            <Sprout className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`font-extrabold text-sm sm:text-base tracking-tight leading-tight ${modoSol ? 'text-slate-900' : 'text-white'}`}>
                NexoCampo
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                Auditoría 2026
              </span>
            </div>
            <span className={`text-[10px] font-medium block truncate mt-0.5 ${modoSol ? 'text-slate-500' : 'text-slate-400'}`}>
              Supervisión de campo · PWA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isOnline
              ? (modoSol ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30')
              : (modoSol ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-500/50')}`}
            title={isOnline ? 'Dispositivo conectado a internet; sincronización remota no garantizada' : 'Sin internet; los datos locales permanecen en el dispositivo'}
            aria-label={isOnline ? 'Con conexión a internet' : 'Sin conexión a internet'}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>

          {isInstallable && (
            <button onClick={install} className={`${controlBase} px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold border-emerald-700`} aria-label="Instalar NexoCampo como aplicación móvil">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
          )}

          {isIOS && !isInstalled && (
            <button onClick={() => setShowIOSPrompt(true)} className={`${controlBase} px-2 bg-slate-100 border-slate-300 text-slate-700 text-[10px] font-semibold`} aria-label="Instrucciones de instalación en iOS">
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setModoSol(!modoSol)}
            className={`${controlBase} w-10 ${modoSol ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700'}`}
            aria-label={modoSol ? 'Activar modo oscuro' : 'Activar modo claro'}
            title={modoSol ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            <Sun className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={() => setTabActual('pwa_offline')}
            className={`${controlBase} px-2 ${totalPendientesLocal > 0
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : modoSol ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'}`}
            title="Ver registros pendientes en la cola local"
            aria-label={`Ver cola local: ${totalPendientesLocal} registros pendientes`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tabular-nums">{totalPendientesLocal}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
