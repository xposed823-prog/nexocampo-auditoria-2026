import React, { useEffect, useRef, useState } from 'react';
import { Database, Download, Upload, History, AlertTriangle, Cloud } from 'lucide-react';
import {
  exportarBackupCanónicoJSON,
  restaurarBackupCanónicoJSON
} from '../../domain/nexocampoDB';
import {
  getGoogleDriveBackupState,
  isGoogleDriveConfigured,
  guardarRespaldoEnGoogleDrive,
  preloadGoogleIdentityServices,
  type GoogleDriveBackupState
} from '../../domain/googleDriveBackupService';

type TipoEventoBackup = 'exportación' | 'restauración' | 'Google Drive';
type EstadoEventoBackup = 'correcto' | 'fallido';

interface EventoHistorialBackup {
  id: string;
  fecha: string;
  tipo: TipoEventoBackup;
  estado: EstadoEventoBackup;
  archivo: string;
  detalle: string;
}

const HISTORIAL_BACKUP_KEY = 'nexocampo_historial_respaldos_v1';
const MAX_EVENTOS_HISTORIAL = 10;

function leerHistorialBackup(): EventoHistorialBackup[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORIAL_BACKUP_KEY);
    if (!raw) return [];
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.slice(0, MAX_EVENTOS_HISTORIAL) : [];
  } catch {
    return [];
  }
}

export interface RespaldosModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
  onRestauracionExitosa?: () => void | Promise<void>;
}

export const RespaldosModulo: React.FC<RespaldosModuloProps> = ({
  modoSol,
  dispararToast,
  onRestauracionExitosa
}) => {
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState<EventoHistorialBackup[]>(leerHistorialBackup);
  const [estadoDrive, setEstadoDrive] = useState<GoogleDriveBackupState>(getGoogleDriveBackupState);
  const driveConfigurado = isGoogleDriveConfigured();
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEstadoDrive(getGoogleDriveBackupState());
    if (isGoogleDriveConfigured()) {
      // Precarga el cliente OAuth para reducir el riesgo de bloquear la ventana de autorización.
      preloadGoogleIdentityServices().catch(() => undefined);
    }
  }, []);

  const registrarHistorial = (evento: Omit<EventoHistorialBackup, 'id' | 'fecha'>) => {
    const registro: EventoHistorialBackup = {
      ...evento,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fecha: new Date().toISOString()
    };
    const siguiente = [registro, ...historial].slice(0, MAX_EVENTOS_HISTORIAL);
    setHistorial(siguiente);
    try {
      window.localStorage.setItem(HISTORIAL_BACKUP_KEY, JSON.stringify(siguiente));
    } catch {
      // El historial es auxiliar: si el navegador bloquea localStorage,
      // no se debe convertir una exportación/restauración correcta en fallo.
    }
  };

  const descargarBackup = async () => {
    const nombreArchivo = `nexocampo_backup_v4_${new Date().toISOString().slice(0, 10)}.json`;
    setCargando(true);
    try {
      // Usar el almacén canónico de seis colecciones, no la cola secundaria de sincronización PWA.
      const json = await exportarBackupCanónicoJSON();
      const payload = JSON.parse(json);
      const stores = payload?.stores || {};
      const totalRegistros = [
        'colaboradores', 'labores', 'areas', 'ausencias', 'jornadas', 'asistencia'
      ].reduce((total, store) => total + (Array.isArray(stores[store]) ? stores[store].length : 0), 0);

      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      registrarHistorial({
        tipo: 'exportación',
        estado: 'correcto',
        archivo: nombreArchivo,
        detalle: `Respaldo JSON generado. ${totalRegistros} registros en los seis almacenes.`
      });
      dispararToast('Respaldo JSON de los seis almacenes generado.');
    } catch (error: any) {
      registrarHistorial({
        tipo: 'exportación',
        estado: 'fallido',
        archivo: nombreArchivo,
        detalle: error?.message || 'No fue posible generar el respaldo.'
      });
      dispararToast(`No se pudo generar el respaldo: ${error?.message || 'error desconocido'}`);
    } finally {
      setCargando(false);
    }
  };

  const guardarEnDrive = async () => {
    if (!window.confirm('El respaldo JSON no está cifrado y puede incluir datos personales y fotos de incidentes. Confirma que esta es tu cuenta privada de Google Drive y que autorizas subir el archivo. ¿Continuar?')) return;
    const nombreFallback = `nexocampo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    setCargando(true);
    try {
      const json = await exportarBackupCanónicoJSON();
      const result = await guardarRespaldoEnGoogleDrive(json);
      setEstadoDrive(getGoogleDriveBackupState());
      registrarHistorial({
        tipo: 'Google Drive',
        estado: 'correcto',
        archivo: result.name || nombreFallback,
        detalle: 'Copia guardada en Mi unidad/NexoCampo/Respaldos/Global.'
      });
      dispararToast('Respaldo guardado en Google Drive.');
    } catch (error: any) {
      setEstadoDrive(getGoogleDriveBackupState());
      const detalle = error?.message || 'No fue posible guardar el respaldo en Google Drive.';
      registrarHistorial({
        tipo: 'Google Drive',
        estado: 'fallido',
        archivo: nombreFallback,
        detalle
      });
      dispararToast(`Google Drive: ${detalle}`);
    } finally {
      setCargando(false);
    }
  };

  const restaurarArchivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    // Permite volver a seleccionar el mismo archivo si hay que reintentar.
    event.currentTarget.value = '';
    if (!file) return;

    if (!window.confirm(
      'La restauración reemplazará los datos actuales de los seis almacenes. ' +
      'Solo continúa si seleccionaste un respaldo confiable. ¿Deseas validar y restaurar este archivo?'
    )) return;

    setCargando(true);
    try {
      const json = await file.text();
      const resultado = await restaurarBackupCanónicoJSON(json);
      registrarHistorial({
        tipo: 'restauración',
        estado: resultado.exito ? 'correcto' : 'fallido',
        archivo: file.name,
        detalle: resultado.mensaje
      });

      if (!resultado.exito) {
        dispararToast(`Restauración rechazada: ${resultado.mensaje}`);
        return;
      }

      dispararToast(resultado.mensaje);
      await onRestauracionExitosa?.();
    } catch (error: any) {
      const detalle = error?.message || 'No fue posible leer el archivo.';
      registrarHistorial({
        tipo: 'restauración',
        estado: 'fallido',
        archivo: file.name,
        detalle
      });
      dispararToast(`No se pudo restaurar el respaldo: ${detalle}`);
    } finally {
      setCargando(false);
    }
  };

  const panel = modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/60';
  const textoPrincipal = modoSol ? 'text-slate-900' : 'text-slate-100';
  const textoSecundario = modoSol ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="space-y-5">
      <section className={`p-4 rounded-xl border ${panel}`}>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-500" />
          <h2 className={`text-sm font-bold ${textoPrincipal}`}>Respaldos y recuperación local</h2>
        </div>
        <p className={`text-xs mt-2 leading-relaxed ${textoSecundario}`}>
          El respaldo incluye los seis almacenes canónicos de IndexedDB: colaboradores, labores,
          áreas, ausencias, jornadas y asistencia. Puedes descargar una copia o restaurarla después
          de validar el archivo.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
          <p className={`text-xs leading-relaxed ${textoSecundario}`}>
            El JSON no está cifrado ni incorpora un hash criptográfico en esta versión. Guárdalo
            en un lugar privado. Google Drive todavía no está conectado en esta rama.
          </p>
        </div>
      </section>

      <section className={`p-4 rounded-xl border space-y-3 ${panel}`}>
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-sky-500" />
          <h3 className={`text-xs font-bold ${textoPrincipal}`}>Copia manual en Google Drive</h3>
        </div>
        <p className={`text-xs leading-relaxed ${textoSecundario}`}>
          {estadoDrive.connected
            ? `Cuenta autorizada en este dispositivo. Último respaldo: ${estadoDrive.lastSync ? new Date(estadoDrive.lastSync).toLocaleString() : 'sin registro'}.`
            : 'La autorización se solicita al guardar. No se almacenan tokens OAuth en localStorage.'}
        </p>
        <p className="text-xs leading-relaxed text-amber-500">
          Atención: el archivo JSON no está cifrado. Puede contener datos personales y fotografías opcionales de incidentes. Súbelo solo a una cuenta privada autorizada.
        </p>
        {!driveConfigurado && (
          <p className="text-xs text-amber-500">
            Falta configurar VITE_GOOGLE_DRIVE_CLIENT_ID en las variables de compilación y autorizar el dominio en Google Cloud.
          </p>
        )}
        {estadoDrive.lastError && (
          <p className="text-xs text-rose-500">Último error: {estadoDrive.lastError}</p>
        )}
        <button
          type="button"
          onClick={guardarEnDrive}
          disabled={cargando || !driveConfigurado}
          className="w-full min-h-[46px] px-4 py-3 rounded-lg bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Cloud className="w-4 h-4" />
          {cargando ? 'Procesando…' : estadoDrive.connected ? 'Guardar copia en Google Drive' : 'Autorizar y guardar en Google Drive'}
        </button>
      </section>

      <section className={`p-4 rounded-xl border space-y-3 ${panel}`}>
        <h3 className={`text-xs font-bold ${textoPrincipal}`}>Crear o restaurar respaldo</h3>
        <button
          type="button"
          onClick={descargarBackup}
          disabled={cargando}
          className="w-full min-h-[46px] px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          {cargando ? 'Procesando…' : 'Descargar respaldo JSON completo'}
        </button>
        <input
          ref={inputArchivoRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={restaurarArchivo}
          disabled={cargando}
        />
        <button
          type="button"
          onClick={() => inputArchivoRef.current?.click()}
          disabled={cargando}
          className={`w-full min-h-[46px] px-4 py-3 rounded-lg border disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2 ${modoSol ? 'border-slate-300 text-slate-800 bg-slate-50' : 'border-slate-600 text-slate-100 bg-slate-900'}`}
        >
          <Upload className="w-4 h-4" />
          Seleccionar archivo para restaurar
        </button>
        <p className={`text-[11px] leading-relaxed ${textoSecundario}`}>
          La restauración requiere confirmación y valida el formato antes de escribir. Los seis almacenes
          se actualizan en una sola transacción; si la transacción falla, IndexedDB no confirma cambios parciales.
        </p>
      </section>

      <section className={`p-4 rounded-xl border ${panel}`}>
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-emerald-500" />
          <h3 className={`text-xs font-bold ${textoPrincipal}`}>Historial local reciente</h3>
        </div>
        {historial.length === 0 ? (
          <p className={`text-xs ${textoSecundario}`}>Todavía no hay operaciones registradas en este dispositivo.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {historial.map((item) => (
              <article key={item.id} className={`rounded-lg border p-3 ${modoSol ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${textoPrincipal}`}>{item.tipo === 'Google Drive' ? 'Google Drive' : item.tipo === 'exportación' ? 'Exportación' : 'Restauración'}</p>
                    <p className={`text-[11px] break-all mt-0.5 ${textoSecundario}`}>{item.archivo}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold rounded px-2 py-1 ${item.estado === 'correcto' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
                    {item.estado === 'correcto' ? 'Correcto' : 'Fallido'}
                  </span>
                </div>
                <p className={`text-[11px] mt-2 leading-relaxed ${textoSecundario}`}>{item.detalle}</p>
                <time className={`text-[10px] mt-2 block ${textoSecundario}`} dateTime={item.fecha}>
                  {new Date(item.fecha).toLocaleString()}
                </time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
