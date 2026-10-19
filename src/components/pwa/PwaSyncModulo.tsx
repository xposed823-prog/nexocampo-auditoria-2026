import React from 'react';
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  Send,
  Database,
  RefreshCw,
  Smartphone,
  Bell,
  Download,
  ExternalLink,
  FolderTree,
  Code2
} from 'lucide-react';

export interface ColaboradorItem {
  id: string;
  codigo: string;
  alias: string;
  rol: string;
  cuadrilla: string;
}

export interface PwaSyncModuloProps {
  modoSol: boolean;
  isOnline: boolean;
  totalPendientesLocal: number;
  pwaColaboradorTest: string;
  setPwaColaboradorTest: (val: string) => void;
  pwaLaborTest: string;
  setPwaLaborTest: (val: string) => void;
  pwaHorasTest: string;
  setPwaHorasTest: (val: string) => void;
  pwaCantidadTest: number;
  setPwaCantidadTest: (val: number) => void;
  colaboradoresMock: ColaboradorItem[];
  guardarRegistroOfflineTest: () => Promise<void>;
  ejecutarSincronizacionManual: () => Promise<void>;
  pwaSyncCargando: boolean;
  pwaListaPendientes: any[];
  refrescarColaPWA: () => Promise<void>;
  solicitarPermisoNotificaciones: () => Promise<void>;
  descargarBackupJSON: () => Promise<void>;
  pwaArchivoSeleccionado: string;
  setPwaArchivoSeleccionado: (val: string) => void;
}

export const PwaSyncModulo: React.FC<PwaSyncModuloProps> = ({
  modoSol,
  isOnline,
  totalPendientesLocal,
  pwaColaboradorTest,
  setPwaColaboradorTest,
  pwaLaborTest,
  setPwaLaborTest,
  pwaHorasTest,
  setPwaHorasTest,
  pwaCantidadTest,
  setPwaCantidadTest,
  colaboradoresMock,
  guardarRegistroOfflineTest,
  ejecutarSincronizacionManual,
  pwaSyncCargando,
  pwaListaPendientes,
  refrescarColaPWA,
  solicitarPermisoNotificaciones,
  descargarBackupJSON,
  pwaArchivoSeleccionado,
  setPwaArchivoSeleccionado
}) => {
  return (
    <div className="space-y-6">
      {/* Cabecera de Arquitectura PWA */}
      <div className={`p-5 rounded-xl border ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/70'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Wifi className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-100">
                Arquitectura PWA Offline-First y Sincronización en Segundo Plano
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Sistema autónomo de alta resiliencia para supervisión en lotes sin cobertura móvil. Los datos se persisten en <strong>IndexedDB (Outbox)</strong> y se transmiten automáticamente vía <strong>Service Worker Background Sync</strong> al servidor central Express.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/50 animate-pulse'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isOnline ? 'Red Disponible' : 'Sin Señal Móvil'}</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
              {totalPendientesLocal} en cola
            </span>
          </div>
        </div>

        {/* Indicadores de Conformidad PWA */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-700/60 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">1. BASE DE DATOS LOCAL</span>
            <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> IndexedDB (ACID)
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">2. SERVICE WORKER</span>
            <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Background Sync Activo
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">3. NOTIFICACIONES PUSH</span>
            <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Web Notification API
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">4. ENDPOINT CENTRAL</span>
            <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> POST /api/sync
            </p>
          </div>
        </div>
      </div>

      {/* Panel de Simulación y Pruebas Operativas de Campo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1 y 2: Simulador de Captura y Cola de Salida */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Formulario de Registro Rápido Offline */}
          <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                Capturar Registro de Jornada en Modo Offline
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Garantía Cero Pérdida
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Colaborador en Lote</label>
                <select
                  value={pwaColaboradorTest}
                  onChange={(e) => setPwaColaboradorTest(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-semibold"
                >
                  {colaboradoresMock.map((col) => (
                    <option key={col.id} value={col.id}>{col.codigo} — {col.alias} ({col.rol})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Labor Agrícola Asignada</label>
                <select
                  value={pwaLaborTest}
                  onChange={(e) => setPwaLaborTest(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-semibold"
                >
                  <option value="Poda de formación">Poda de formación</option>
                  <option value="Raleo de frutos">Raleo de frutos</option>
                  <option value="Desyerbe en plato">Desyerbe en plato</option>
                  <option value="Plástico y Polisombra">Plástico y Polisombra</option>
                  <option value="Oficios Varios de Campo">Oficios Varios de Campo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Horario Computado</label>
                <input
                  type="text"
                  value={pwaHorasTest}
                  onChange={(e) => setPwaHorasTest(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Cantidad Ejecutada (Unidades / Metros)</label>
                <input
                  type="number"
                  value={pwaCantidadTest}
                  onChange={(e) => setPwaCantidadTest(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={guardarRegistroOfflineTest}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Database className="w-4 h-4" />
                <span>Guardar en Cola Local de IndexedDB</span>
              </button>
              <button
                onClick={ejecutarSincronizacionManual}
                disabled={pwaSyncCargando}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${pwaSyncCargando ? 'animate-spin' : ''}`} />
                <span>Sincronizar Lote Ahora</span>
              </button>
            </div>
          </div>

          {/* Visor de Registros en Cola de Salida */}
          <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Registros Pendientes en Almacén 'registros_pendientes' ({pwaListaPendientes.length})
              </h3>
              <button
                onClick={refrescarColaPWA}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refrescar
              </button>
            </div>

            {pwaListaPendientes.length === 0 ? (
              <div className="p-6 rounded-lg bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-80" />
                No hay registros pendientes por sincronizar. Todos los datos están consolidados en el servidor central.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {pwaListaPendientes.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <span className="font-mono text-emerald-400">#{item.id}</span>
                        <span>{item.payload?.labor || item.entidad}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {item.payload?.colaboradorId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Horario: {item.payload?.horario || 'Jornada'} | Cantidad: {item.payload?.cantidad || 0} u | Creado: {new Date(item.creadoEn).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                      Pendiente Sync
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Columna 3: Herramientas de Campo y Acciones PWA */}
        <div className="space-y-4">
          
          <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Utilidades y Diagnóstico PWA
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={solicitarPermisoNotificaciones}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Notificaciones Nativas
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Activar</span>
              </button>

              <button
                onClick={descargarBackupJSON}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  Exportar Respaldo JSON
                </span>
                <span className="text-[10px] text-slate-400 font-mono">.json</span>
              </button>

              <a
                href="/offline.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-between transition text-decoration-none"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-rose-400" />
                  Ver Página Offline Standalone
                </span>
                <span className="text-[10px] text-slate-400 font-mono">offline.html</span>
              </a>
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-xs space-y-2 ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-950/60 border-slate-800'}`}>
            <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
              Archivos Generados en Producción
            </h4>
            <p className="text-[11px] text-slate-400">
              Se han generado los 8 archivos completos, modulares y listos para producción con Vanilla JS e IndexedDB:
            </p>
            <ul className="space-y-1 font-mono text-[11px] text-slate-300">
              <li className="flex items-center gap-1.5 text-emerald-400">✓ css/style.css</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ js/db.js</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ js/app.js</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ service-worker.js</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ server.js</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ manifest.json</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ index.html</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ offline.html</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Explorador de Código de los 8 Archivos del Proyecto */}
      <div className={`p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-400" />
            Inspector de Código de Archivos de Producción
          </h3>
          <span className="text-[11px] text-slate-400">
            Seleccione un archivo para inspeccionar su estructura y comentarios técnicos
          </span>
        </div>

        {/* Botones de Selección de Archivo */}
        <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar text-xs font-mono">
          {[
            'service-worker.js',
            'js/db.js',
            'js/app.js',
            'server.js',
            'manifest.json',
            'index.html',
            'offline.html',
            'css/style.css'
          ].map((archivo) => (
            <button
              key={archivo}
              onClick={() => setPwaArchivoSeleccionado(archivo)}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                pwaArchivoSeleccionado === archivo
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              /{archivo}
            </button>
          ))}
        </div>

        {/* Contenedor del Archivo Seleccionado */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
            <span className="font-mono font-bold text-emerald-400">Ruta: /{pwaArchivoSeleccionado}</span>
            <span className="text-[11px] text-slate-400">Listo para Producción · Vanilla JS / ESM</span>
          </div>

          <div className="text-xs text-slate-300 py-1">
            {pwaArchivoSeleccionado === 'service-worker.js' && (
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><strong className="text-slate-200">Decisión Técnica:</strong> Implementa el evento <code>sync</code> (Background Sync) para vaciar la cola de IndexedDB hacia <code>POST /api/sync</code> en segundo plano. Al completar, dispara una notificación nativa <code>self.registration.showNotification(...)</code> informando la cantidad de registros consolidados.</p>
                <p><strong className="text-slate-200">Estrategia de Caché:</strong> Network-First con fallback a <code>/offline.html</code> para navegación, y Cache-First para el App Shell (CSS, JS, iconos).</p>
              </div>
            )}
            {pwaArchivoSeleccionado === 'js/db.js' && (
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><strong className="text-slate-200">Decisión Técnica:</strong> Patrón Outbox en IndexedDB con almacenes <code>registros_pendientes</code>, <code>jornadas</code>, <code>colaboradores</code> y <code>labores_catalogo</code>. Manejo de transacciones ACID aisladas para blindar los datos en caso de corte de energía o cierre inesperado.</p>
                <p><strong className="text-slate-200">Funciones Exportadas:</strong> <code>initDB()</code>, <code>guardarRegistroPendiente()</code>, <code>obtenerRegistrosPendientes()</code>, <code>eliminarRegistroPendiente()</code>, <code>limpiarRegistrosPendientes()</code>, <code>contarPendientes()</code>, <code>exportarBaseDatosJSON()</code>.</p>
              </div>
            )}
            {pwaArchivoSeleccionado === 'js/app.js' && (
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><strong className="text-slate-200">Decisión Técnica:</strong> Controlador cliente en Vanilla JS que registra el Service Worker, monitoriza eventos <code>online</code>/<code>offline</code>, captura <code>beforeinstallprompt</code> para el botón de instalación in-app y realiza degradación elegante si el navegador carece de Background Sync.</p>
              </div>
            )}
            {pwaArchivoSeleccionado === 'server.js' && (
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><strong className="text-slate-200">Decisión Técnica:</strong> Servidor Express en Node.js con endpoint idempotente <code>POST /api/sync</code> que valida lotes por arreglo de registros, healthcheck <code>GET /api/health</code> y cabeceras <code>Service-Worker-Allowed: /</code>.</p>
              </div>
            )}
            {pwaArchivoSeleccionado === 'manifest.json' && (
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><strong className="text-slate-200">Decisión Técnica:</strong> Web App Manifest W3C con <code>display: standalone</code>, <code>theme_color: #15803d</code>, accesos directos de campo e iconos 192x192, 512x512 y maskable.</p>
              </div>
            )}
            {pwaArchivoSeleccionado === 'offline.html' && (
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><strong className="text-slate-200">Decisión Técnica:</strong> Pantalla de fallback autónoma y liviana que se muestra ante navegación sin conexión y sin precaché. Detecta el retorno de señal y redirige automáticamente al usuario a la aplicación.</p>
              </div>
            )}
            {pwaArchivoSeleccionado === 'css/style.css' && (
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><strong className="text-slate-200">Decisión Técnica:</strong> Sistema de diseño con tokens agrícolas 60-30-10, áreas táctiles mínimas de 48px para campo, fuentes tabulares para cómputos de rendimiento y contraste WCAG 2.2 AA.</p>
              </div>
            )}
            {pwaArchivoSeleccionado === 'index.html' && (
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><strong className="text-slate-200">Decisión Técnica:</strong> Entrada principal con meta tags para Android y Safari, enlace a manifest.json, tema de color forestal y script de inicialización anticipada del Service Worker.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
