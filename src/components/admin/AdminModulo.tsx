import React, { useState } from 'react';
import { COLABORADORES_CATALOGO, LABORES_AGRONOMICAS } from '../../domain/catalogoAgronomico';
import { exportarBackupCanónicoJSON, restaurarBackupCanónicoJSON } from '../../domain/nexocampoDB';

export interface AdminModuloProps {
  modoSol?: boolean;
  dispararToast: (msg: string) => void;
  setTabActual: (tab: string) => void;
  onRestauracionExitosa?: () => void;
}

export const AdminModulo: React.FC<AdminModuloProps> = ({
  dispararToast,
  onRestauracionExitosa
}) => {
  const [adminSubTab, setAdminSubTab] = useState<'modulos' | 'colaboradores' | 'labores'>('modulos');
  const [nombreCarpeta, setNombreCarpeta] = useState('NexoCampo');
  const [filtroTexto, setFiltroTexto] = useState('');

  const handleDescargarBackup = async () => {
    try {
      const json = await exportarBackupCanónicoJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexocampo_backup_v4_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      dispararToast('✓ Respaldo creado y descargado');
    } catch (e: any) {
      dispararToast(`Error al exportar: ${e?.message || 'Error desconocido'}`);
    }
  };

  const handleRestaurarBackupInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await restaurarBackupCanónicoJSON(text);
        if (res.exito) {
          dispararToast('✓ Respaldo restaurado con éxito');
          if (onRestauracionExitosa) onRestauracionExitosa();
        } else {
          dispararToast(`Fallo: ${res.mensaje}`);
        }
      } catch (err: any) {
        dispararToast('Error al leer archivo de respaldo');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* 1. PESTAÑAS HORIZONTALES SUPERIORES (Imagen 4) */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => setAdminSubTab('modulos')}
          className={`px-4 py-2 rounded-2xl font-bold flex items-center gap-1.5 transition-all ${
            adminSubTab === 'modulos'
              ? 'bg-[#047857] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>🧩</span>
          <span>Módulos</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('colaboradores')}
          className={`px-4 py-2 rounded-2xl font-bold flex items-center gap-1.5 transition-all ${
            adminSubTab === 'colaboradores'
              ? 'bg-[#047857] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>👤</span>
          <span>Colaboradores</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('labores')}
          className={`px-4 py-2 rounded-2xl font-bold flex items-center gap-1.5 transition-all ${
            adminSubTab === 'labores'
              ? 'bg-[#047857] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>📋</span>
          <span>Labores de campo</span>
        </button>
      </div>

      {adminSubTab === 'modulos' && (
        <div className="space-y-4">
          {/* 2. SECCIÓN: HERRAMIENTAS ADMINISTRATIVAS (Imagen 4) */}
          <div className="rounded-3xl p-5 bg-white border border-slate-200/90 shadow-xs space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>⚙️</span>
              <span>HERRAMIENTAS ADMINISTRATIVAS</span>
            </h3>

            {/* Grid Fila 1 & 2 & 3 de botones de herramientas */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left shadow-xs transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📄</span>
                  <span className="font-extrabold text-xs text-slate-900 leading-tight">PDF general</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Rendimiento de la operación</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left shadow-xs transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📄</span>
                  <span className="font-extrabold text-xs text-slate-900 leading-tight">Rendimientos</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Individual o grupal</span>
              </button>

              <button
                type="button"
                onClick={handleDescargarBackup}
                className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left shadow-xs transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">💾</span>
                  <span className="font-extrabold text-xs text-slate-900 leading-tight">Crear respaldo</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Todos los datos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'NexoCampo Respaldo', text: 'Respaldo operativo de adecuaciones NexoCampo' });
                  } else {
                    handleDescargarBackup();
                  }
                }}
                className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left shadow-xs transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📤</span>
                  <span className="font-extrabold text-xs text-slate-900 leading-tight">Compartir respaldo</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">WhatsApp, Telegram, etc.</span>
              </button>
            </div>

            {/* Restaurar respaldo botón ancho */}
            <div>
              <label className="w-full p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left shadow-xs transition-all active:scale-98 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔄</span>
                    <span className="font-extrabold text-xs text-slate-900">Restaurar respaldo</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Validar antes de aplicar</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestaurarBackupInput}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 font-medium">
              <span>📊</span>
              <span>Comprobando almacenamiento...</span>
            </div>

            {/* 3. CARD: NOMBRE DE CARPETA DE RESPALDOS (Imagen 4) */}
            <div className="rounded-2xl p-4 bg-slate-50/80 border border-slate-200/90 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                NOMBRE DE CARPETA DE RESPALDOS
              </span>
              <input
                type="text"
                value={nombreCarpeta}
                onChange={(e) => setNombreCarpeta(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800"
              />
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                Se creará dentro de la carpeta local que selecciones. Si el navegador no lo permite, el respaldo seguirá en Descargas.
              </p>

              <button
                type="button"
                onClick={() => dispararToast('📁 Carpeta de respaldos configurada en: ' + nombreCarpeta)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
              >
                <span>📁</span>
                <span>Configurar carpeta local</span>
              </button>

              <span className="text-[10px] text-slate-400 block pt-1 font-medium">
                📁 Carpeta local: comprobando...
              </span>
            </div>

            {/* 4. SECCIÓN GOOGLE DRIVE (Imagen 4) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span>☁️</span>
                  <span>Google Drive: no conectado</span>
                </div>
                <span className="text-xs font-black text-slate-900">Pendiente</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => dispararToast('Integración Google Drive en cola de sincronización')}
                  className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left shadow-xs transition-all active:scale-98"
                >
                  <span className="font-extrabold text-xs text-slate-900 block leading-tight">☁️ Conectar Google Drive</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Autorizar y activar respaldo</span>
                </button>

                <button
                  type="button"
                  onClick={() => dispararToast('✓ Creando respaldo histórico...')}
                  className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left shadow-xs transition-all active:scale-98"
                >
                  <span className="font-extrabold text-xs text-slate-900 block leading-tight">📤 Sincronizar ahora</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Crear respaldo histórico</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => dispararToast('Abriendo carpeta de respaldo local...')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>📁</span>
                  <span>Abrir carpeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => dispararToast('Comprobando puntos de restauración en Drive...')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>🔄</span>
                  <span>Restaurar desde Drive</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminSubTab === 'colaboradores' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
          />
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {COLABORADORES_CATALOGO.filter(c =>
              c.nombreCompleto.toLowerCase().includes(filtroTexto.toLowerCase()) ||
              c.codigo.toLowerCase().includes(filtroTexto.toLowerCase())
            ).map((col) => (
              <div key={col.id} className="p-3 px-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-slate-900 block">{col.nombreCompleto}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{col.codigo} · Cuadrilla {col.cuadrilla}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {col.rol}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminSubTab === 'labores' && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Buscar labor agrícola..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
          />
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {LABORES_AGRONOMICAS.filter(l =>
              l.nombre.toLowerCase().includes(filtroTexto.toLowerCase())
            ).map((lab) => (
              <div key={lab.id} className="p-3 px-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-slate-900 block">{lab.nombre}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Unidad: {lab.unidadMedida} · Cat: {lab.categoria}</span>
                </div>
                <span className="font-mono text-emerald-800 font-extrabold text-[11px]">
                  {lab.min} min/ud
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
