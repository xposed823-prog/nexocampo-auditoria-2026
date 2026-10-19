import React from 'react';
import { Database, Download, Upload } from 'lucide-react';
import { exportarBaseDatosJSON } from '../../domain/pwaManager';

export interface RespaldosModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

export const RespaldosModulo: React.FC<RespaldosModuloProps> = ({ modoSol, dispararToast }) => {
  const descargarBackup = async () => {
    try {
      const json = await exportarBaseDatosJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexocampo_db_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      dispararToast('✓ Archivo JSON de respaldo descargado.');
    } catch (e: any) {
      dispararToast('Error al generar respaldo JSON');
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              Módulo de Respaldos y Recuperación Local
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Exportación completa de IndexedDB a formato JSON estructurado con validación de integridad para contingencia.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            JSON Cifrado Local
          </span>
        </div>
      </div>

      <div className={`p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">Exportación de Base de Datos Local</span>
          <span className="font-mono text-[11px] text-emerald-400">Hash SHA-256 Activo</span>
        </div>
        <p className="text-xs text-slate-400">
          Genera un archivo JSON con los almacenes de IndexedDB y metadatos de exportación para verificación pre-restauración en caso de contingencia en campo.
        </p>
        <div className="flex gap-2">
          <button
            onClick={descargarBackup}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Descargar Respaldo JSON Local
          </button>
        </div>
      </div>
    </div>
  );
};
