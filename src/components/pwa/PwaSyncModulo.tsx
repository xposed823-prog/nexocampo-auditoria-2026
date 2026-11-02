import React from 'react';
import {
  Wifi, WifiOff, Database, RefreshCw, Bell, Download,
  AlertCircle, CheckCircle2, Clock
} from 'lucide-react';

export interface PwaSyncModuloProps {
  modoSol: boolean;
  isOnline: boolean;
  totalPendientesLocal: number;
  pwaSyncCargando: boolean;
  pwaListaPendientes: any[];
  refrescarColaPWA: () => Promise<void>;
  solicitarPermisoNotificaciones: () => Promise<void>;
  descargarBackupJSON: () => Promise<void>;
}

export const PwaSyncModulo: React.FC<PwaSyncModuloProps> = ({
  modoSol,
  isOnline,
  totalPendientesLocal,
  pwaSyncCargando,
  pwaListaPendientes,
  refrescarColaPWA,
  solicitarPermisoNotificaciones,
  descargarBackupJSON
}) => {
  const panel = modoSol
    ? 'bg-white border-slate-200 text-slate-800'
    : 'bg-slate-800/50 border-slate-700 text-slate-100';
  const muted = modoSol ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="space-y-4">
      <section className={`rounded-2xl border p-4 shadow-sm ${panel}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[.12em] text-emerald-600">Estado del dispositivo</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight">Almacenamiento y conectividad</h2>
            <p className={`mt-1 text-sm leading-relaxed ${muted}`}>
              Los registros se mantienen en el dispositivo. Tener internet no significa que exista sincronización remota.
            </p>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
            isOnline
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-amber-300 bg-amber-50 text-amber-900'
          }`}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isOnline ? 'En línea' : 'Sin red'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className={`rounded-xl border p-3 ${modoSol ? 'border-emerald-100 bg-emerald-50/70' : 'border-emerald-900/50 bg-emerald-950/30'}`}>
            <Database className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-xs font-semibold">Pendientes locales</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{totalPendientesLocal}</p>
          </div>
          <div className={`rounded-xl border p-3 ${modoSol ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/50'}`}>
            <Clock className="h-5 w-5 text-slate-500" />
            <p className="mt-2 text-xs font-semibold">Modo de trabajo</p>
            <p className="mt-1 text-sm font-extrabold">Local / offline-first</p>
          </div>
        </div>

        <div className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${
          modoSol ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-amber-800/50 bg-amber-950/30 text-amber-200'
        }`}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>Sin backend de sincronización conectado.</strong>
            <p className="mt-0.5">La sincronización remota está deshabilitada. No se debe considerar ningún registro enviado a un servidor; los datos locales no se borran por esta pantalla.</p>
          </div>
        </div>
      </section>

      <section className={`rounded-2xl border p-4 shadow-sm ${panel}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold">Cola local</h3>
            <p className={`mt-0.5 text-xs ${muted}`}>Registros pendientes del subsistema de cola.</p>
          </div>
          <button type="button" onClick={() => void refrescarColaPWA()} disabled={pwaSyncCargando}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold disabled:opacity-50 ${
              modoSol ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-slate-700 bg-slate-900 text-slate-200'
            }`} aria-label="Actualizar cola local">
            <RefreshCw className={`h-4 w-4 ${pwaSyncCargando ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>

        {pwaListaPendientes.length === 0 ? (
          <div className={`mt-4 rounded-xl border border-dashed p-5 text-center ${modoSol ? 'border-slate-300 bg-slate-50' : 'border-slate-700 bg-slate-900/40'}`}>
            <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold">La cola está vacía</p>
            <p className={`mt-1 text-xs ${muted}`}>Esto no confirma sincronización con un servidor. El backend remoto aún no está configurado.</p>
          </div>
        ) : (
          <div className="mt-4 max-h-[45vh] space-y-2 overflow-y-auto">
            {pwaListaPendientes.map((item) => (
              <article key={item.id} className={`rounded-xl border p-3 ${modoSol ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold">{item.payload?.labor || item.entidad || 'Registro pendiente'}</p>
                    <p className={`mt-1 text-xs ${muted}`}>ID local: {item.id}</p>
                    <p className={`mt-1 text-xs ${muted}`}>Creado: {item.creadoEn ? new Date(item.creadoEn).toLocaleString() : 'Fecha no disponible'}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">Pendiente</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={`rounded-2xl border p-4 ${panel}`}>
        <h3 className="text-sm font-bold">Herramientas del dispositivo</h3>
        <p className={`mt-1 text-xs ${muted}`}>Permisos y respaldo local. El respaldo debe guardarse en un lugar seguro.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => void solicitarPermisoNotificaciones()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-900 hover:bg-amber-100">
            <Bell className="h-4 w-4" /> Activar notificaciones
          </button>
          <button type="button" onClick={() => void descargarBackupJSON()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 text-xs font-bold text-white hover:bg-emerald-800">
            <Download className="h-4 w-4" /> Exportar respaldo JSON
          </button>
        </div>
      </section>
    </div>
  );
};
