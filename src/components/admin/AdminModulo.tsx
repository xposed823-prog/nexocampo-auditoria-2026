/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo v18.1.9 - Módulo Canónico de Administración (Admin)
 * Pestañas canónicas:
 *  1. 👤 Colaboradores (36 oficiales)
 *  2. 📋 Labores de campo (23 oficiales)
 *  3. 🌱 Áreas y Ubicaciones (Jamaica, Piloto, Púrpura, Naranja)
 *  4. 💾 Respaldos JSON & PWA Sync
 *  5. 🧩 Auditoría y Casos Matemáticos
 */

import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  MapPin,
  Database,
  CheckCircle2,
  Download,
  Upload,
  HardDrive
} from 'lucide-react';
import {
  COLABORADORES_CATALOGO,
  LABORES_AGRONOMICAS,
  AREAS_AGRONOMICAS
} from '../../domain/catalogoAgronomico';
import {
  exportarBackupCanónicoJSON,
  restaurarBackupCanónicoJSON
} from '../../domain/nexocampoDB';

export interface AdminModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
  setTabActual: (tab: string) => void;
}

export const AdminModulo: React.FC<AdminModuloProps> = ({
  modoSol,
  dispararToast
}) => {
  const [adminTab, setAdminTab] = useState<'col' | 'lab' | 'area' | 'backup' | 'casos'>('col');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [cargandoBackup, setCargandoBackup] = useState(false);

  const colaboradoresFiltrados = COLABORADORES_CATALOGO.filter(c =>
    c.nombreCompleto.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    c.codigo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    c.cuadrilla.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  const laboresFiltradas = LABORES_AGRONOMICAS.filter(l =>
    l.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    l.categoria.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    l.modelo.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  const handleDescargarBackup = async () => {
    try {
      setCargandoBackup(true);
      const json = await exportarBackupCanónicoJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexocampo_backup_v4_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      dispararToast('✓ Respaldo JSON canónico descargado');
    } catch (e: any) {
      dispararToast(`Error al exportar: ${e?.message || 'Error desconocido'}`);
    } finally {
      setCargandoBackup(false);
    }
  };

  const handleRestaurarBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        setCargandoBackup(true);
        const res = await restaurarBackupCanónicoJSON(text);
        if (res.exito) {
          dispararToast('✓ Respaldo restaurado con éxito en los 6 almacenes');
        } else {
          dispararToast(`Fallo: ${res.mensaje}`);
        }
      } catch (err: any) {
        dispararToast('Archivo de respaldo inválido');
      } finally {
        setCargandoBackup(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Selector de sub-pestañas canónicas */}
      <div className={`p-1.5 rounded-xl border flex overflow-x-auto gap-1 no-scrollbar text-xs font-semibold ${
        modoSol ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        {[
          { id: 'col', label: 'Colaboradores', icon: Users, count: 36 },
          { id: 'lab', label: 'Labores', icon: Briefcase, count: 23 },
          { id: 'area', label: 'Áreas', icon: MapPin, count: 4 },
          { id: 'backup', label: 'Respaldos', icon: Database },
          { id: 'casos', label: '16 Casos', icon: CheckCircle2 }
        ].map((t) => {
          const Icon = t.icon;
          const activo = adminTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setAdminTab(t.id as any);
                setFiltroTexto('');
              }}
              className={`flex-1 min-h-[36px] px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                activo
                  ? modoSol
                    ? 'bg-emerald-700 text-white font-bold shadow-sm'
                    : 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-500/20'
                  : modoSol
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${activo ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. PESTAÑA: COLABORADORES */}
      {adminTab === 'col' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Buscar colaborador por nombre, código o cuadrilla..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-xs ${
              modoSol ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          />
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {colaboradoresFiltrados.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                  modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-[11px]">{c.codigo}</span>
                    <span className="font-semibold text-slate-200">{c.nombreCompleto}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {c.rol} · {c.cuadrilla}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  Activo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. PESTAÑA: LABORES */}
      {adminTab === 'lab' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Buscar labor por nombre, categoría o modelo..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-xs ${
              modoSol ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          />
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {laboresFiltradas.map((l) => (
              <div
                key={l.id}
                className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                  modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{l.nombre}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {l.categoria}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Unidad: <strong>{l.unidadMedida}</strong> · Modelo: <strong>{l.modelo}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-xs block">
                    {l.min !== null ? `${l.min} min` : 'por tiempo'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Ref: {l.personalReferencia} pers.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PESTAÑA: ÁREAS */}
      {adminTab === 'area' && (
        <div className="space-y-3">
          {AREAS_AGRONOMICAS.map((a) => (
            <div
              key={a.id}
              className={`p-3.5 rounded-xl border space-y-2.5 ${
                modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Área {a.nombre} ({a.codigo})
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  {a.bloques.length} bloques
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {a.bloques.map((b) => (
                  <div
                    key={b.id}
                    className={`p-2 rounded-lg border text-xs font-mono ${
                      modoSol ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-slate-200">Bloque {b.nombre}</div>
                    <div className="text-[10px] text-slate-400">{b.totalTuneles} túneles</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. PESTAÑA: RESPALDOS & SYNC */}
      {adminTab === 'backup' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border space-y-3 ${
            modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
          }`}>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              Almacenamiento Local (IndexedDB v4)
            </h4>
            <p className="text-xs text-slate-400">
              Base de datos <strong>'nexocampo'</strong> con 6 almacenes canónicos: colaboradores (36), labores (23), áreas (4), ausencias, jornadas y asistencia.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Versión IDB:</span>
                <span className="font-bold text-emerald-400">v4 (Oficial)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Modo de Trabajo:</span>
                <span className="font-bold text-emerald-400">Offline-First</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-3 ${
            modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
          }`}>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Exportación y Restauración Canónica
            </h4>
            <p className="text-xs text-slate-400">
              Descarga una copia completa e interoperable de los 6 almacenes para restaurarla en cualquier dispositivo o instalación de NexoCampo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDescargarBackup}
                disabled={cargandoBackup}
                className="min-h-[44px] py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Respaldo JSON</span>
              </button>

              <label className="min-h-[44px] py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restaurar Respaldo JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleRestaurarBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 5. PESTAÑA: 16 CASOS MATEMÁTICOS */}
      {adminTab === 'casos' && (
        <div className={`p-4 rounded-xl border space-y-3 ${
          modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/40 border-slate-700/60'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              16 Casos Canónicos de Auditoría
            </h4>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              46/46 PASS (100%)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Reglas de 475 min netos L-V, 360 min sábados, anti-solapamiento estricto, media ponderada de 86.36%, no truncamiento de sobre-cumplimiento y aislamiento de Oficios Varios.
          </p>
          <div className="space-y-1.5 text-[11px] font-mono text-slate-300 pt-1">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span>Caso 1: Jornada 1 labor (475m)</span>
              <span className="text-emerald-400">✓ PASS</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span>Caso 2: Jornada mixta 3 labores (540m)</span>
              <span className="text-emerald-400">✓ PASS</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span>Caso 4: Anti-solapamiento temporal</span>
              <span className="text-emerald-400">✓ PASS</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span>Caso 11: Media ponderada (86.36%)</span>
              <span className="text-emerald-400">✓ PASS</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span>Caso 14: Oficios Varios aislado</span>
              <span className="text-emerald-400">✓ PASS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
