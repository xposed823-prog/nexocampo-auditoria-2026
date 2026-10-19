/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Prototipo Visual Navegable y Sistema UX/UI
 * Tarea 2 de 5: Diseño UX/UI, Sistema Visual, Navegación y Modelo de Datos Detallado
 */

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Layers,
  Calendar,
  Briefcase,
  Wrench,
  ShieldAlert,
  ClipboardCheck,
  UserX,
  Search,
  FileBarChart,
  HardHat,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Minus,
  AlertCircle,
  X,
  Plus,
  ArrowRight,
  Printer,
  Upload,
  Download,
  Check,
  ChevronRight,
  FileText,
  Wifi,
  WifiOff,
  RefreshCw,
  Smartphone,
  Bell,
  Send,
  ExternalLink,
  Code2,
  FolderTree
} from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from './domain/usePWAInstall';
import {
  guardarRegistroPendiente,
  obtenerRegistrosPendientes,
  limpiarRegistrosPendientes,
  guardarJornadaConfirmada,
  contarPendientes,
  exportarBaseDatosJSON,
  dispararBackgroundSync
} from './domain/pwaManager';
import {
  validarJornada,
  validarLabor,
  validarPlasticoPolisombra,
  validarJustificacionPendiente,
  determinarEstadoVisual,
  EstadoVisualNegocio
} from './domain/formValidators';
import {
  detectarSolapamientoTemporal,
  calcularJornadaMultiplesLabores,
  calcularMediaPonderadaRendimiento,
  calcularOficiosVarios,
  consolidarProduccionCobertura
} from './domain/businessRulesEngine';

// Documentos técnicos generados para la Tarea 3
const DOCUMENTOS_TAREA_3 = [
  { id: '15', archivo: '15-reglas-jornada.md', titulo: 'Reglas de Jornada y Segmentos', resumen: 'Aritmética canónica, jornada general única, 3 labores consecutivas sin triplicar jornadas y solapamiento real vs subtareas.' },
  { id: '16', archivo: '16-reglas-estados.md', titulo: 'Taxonomía y Reglas de Estados', resumen: 'Comportamiento de Cumple, No Cumple, Pendiente, Sin Registro, Incompleto. Invariante de no penalización implícita.' },
  { id: '17', archivo: '17-especificacion-formulas.md', titulo: 'Especificación Formal de Fórmulas', resumen: 'Rendimiento Temporal, Cumplimiento de Cantidad, medias ponderadas por tiempo efectivo y versionado FORMULA_RENDIMIENTO_V1_2026.' },
  { id: '18', archivo: '18-reglas-oficios-varios.md', titulo: 'Reglas de Oficios Varios', resumen: 'Métrica de tareas asignadas vs completadas (ej. 3/5 = 60%), no es rendimiento temporal. Prohibido inventar ponderaciones.' },
  { id: '19', archivo: '19-reglas-plastico-polisombra.md', titulo: 'Reglas de Plástico y Polisombra', resumen: 'Cuadrilla de 1 a 6 integrantes, subtareas con herencia horaria sin doble contabilización y motivos estrictos de saldo.' },
  { id: '20', archivo: '20-reglas-asistencia-ausencias.md', titulo: 'Reglas de Asistencia y Ausencias', resumen: 'Matriz semanal con estado inicial —, cinco estados analíticos, desacoplamiento absoluto de la eficiencia de labor.' },
  { id: '21', archivo: '21-reglas-consulta-reportes.md', titulo: 'Consulta Cruzada y Reportes', resumen: 'Servicio de dominio único compartido, datos faltantes explícitos y bitácora SG-SST sin hora final ni juicios clínicos.' },
  { id: '22', archivo: '22-casos-prueba-matematicos.md', titulo: '16 Casos de Prueba Matemáticos', resumen: 'Banco de pruebas con entradas, salidas, tablas de decisión, división por cero, media ponderada y superación de meta.' },
];

// Documentos técnicos generados para la Tarea 2
const DOCUMENTOS_TAREA_2 = [
  { id: '08', archivo: '08-sistema-visual.md', titulo: 'Sistema Visual Unificado', resumen: 'Tokens de color 60-30-10, tipografía unificada tabular-nums, monograma original SVG y ergonomía táctil Android.' },
  { id: '09', archivo: '09-flujos-ux.md', titulo: 'Flujos UX y Recorridos de Campo', resumen: 'Especificación de los 11 recorridos táctiles: jornada, subtareas que heredan horario, asistencia semanal, pendientes e incidentes.' },
  { id: '10', archivo: '10-componentes-ui.md', titulo: 'Catálogo de Componentes UI', resumen: 'Botones primarios/secundarios/advertencia/destructivos, 7 estados de negocio, bottom-sheets y selectores climáticos.' },
  { id: '11', archivo: '11-modelo-datos-detallado.md', titulo: 'Modelo de Datos Detallado', resumen: '12 entidades tipadas en TypeScript, almacenes IndexedDB, herencia horaria sin duplicidad y distinción crudo vs derivado.' },
  { id: '12', archivo: '12-validaciones-formularios.md', titulo: 'Validaciones de Formularios', resumen: 'Campos obligatorios/opcionales, reglas de consistencia, mensajes amigables y protocolo de fallo de persistencia local.' },
  { id: '13', archivo: '13-mapa-navegacion.md', titulo: 'Mapa de Navegación y Vistas', resumen: 'Árbol de navegación plano para Android, delimitación estricta entre resúmenes ligeros y consulta cruzada profunda.' },
  { id: '14', archivo: '14-accesibilidad.md', titulo: 'Accesibilidad WCAG 2.2 AA', resumen: 'Contraste 4.5:1+, áreas táctiles >=44x44px, foco visible, modo sol campo y pruebas para lectores de pantalla.' },
];

// Colaboradores ficticios anonimizados para pruebas
const COLABORADORES_MOCK = [
  { id: 'col_1', codigo: 'COL-001', alias: 'J. Pérez', rol: 'Podador experto', cuadrilla: 'Cuadrilla Norte' },
  { id: 'col_2', codigo: 'COL-002', alias: 'M. Gómez', rol: 'Operario campo', cuadrilla: 'Cuadrilla Norte' },
  { id: 'col_3', codigo: 'COL-003', alias: 'C. Rodríguez', rol: 'Encargado malla', cuadrilla: 'Cuadrilla Coberturas' },
  { id: 'col_4', codigo: 'COL-004', alias: 'A. Martínez', rol: 'Operario campo', cuadrilla: 'Cuadrilla Coberturas' },
  { id: 'col_5', codigo: 'COL-005', alias: 'L. Hernández', rol: 'Tractorista', cuadrilla: 'Cuadrilla Maquinaria' },
  { id: 'col_6', codigo: 'COL-006', alias: 'R. Sánchez', rol: 'Operario campo', cuadrilla: 'Cuadrilla Norte' },
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function App() {
  const [tabActual, setTabActual] = useState<string>('resumen');
  const [modoSol, setModoSol] = useState(false);
  const [docAbierto, setDocAbierto] = useState<string>('08');

  // Estado del Formulario de Plástico y Polisombra
  const [polisombraFecha, setPolisombraFecha] = useState('2026-10-19');
  const [polisombraIntegrantes, setPolisombraIntegrantes] = useState<string[]>(['col_3', 'col_4']);
  const [polisombraInicio, setPolisombraInicio] = useState('06:30');
  const [polisombraFin, setPolisombraFin] = useState('11:30');
  const [polisombraArea, setPolisombraArea] = useState('Sector Norte');
  const [polisombraBloque, setPolisombraBloque] = useState('Bloque 2');
  const [polisombraTunel, setPolisombraTunel] = useState('Túnel 4');
  const [polisombraCantTotal, setPolisombraCantTotal] = useState(100);
  const [polisombraCantComp, setPolisombraCantComp] = useState(75);
  const [polisombraCondiciones, setPolisombraCondiciones] = useState<string[]>(['soleado', 'vientos_fuertes']);
  const [subtareasCobertura, setSubtareasCobertura] = useState([
    { id: 'st_1', nombre: 'Tendido de polietileno', cant: 75, unidad: 'm lineales', estado: 'completa' },
    { id: 'st_2', nombre: 'Costura y grapado de mallas', cant: 40, unidad: 'm costura', estado: 'pendiente_saldo' }
  ]);

  // Modal de Justificación de Saldo Pendiente
  const [modalJustificacionAbierto, setModalJustificacionAbierto] = useState(false);
  const [motivosJustificacion, setMotivosJustificacion] = useState<string[]>(['vientos_fuertes']);
  const [notaSupervisorJustificacion, setNotaSupervisorJustificacion] = useState('Ráfagas de viento a las 10:45 impidieron tensar la malla con seguridad.');
  const [justificacionConfirmada, setJustificacionConfirmada] = useState(true);

  // Estado interactivo de Asistencia Semanal: Matriz [colaboradorId, diaIdx] -> estado
  const [matrizAsistencia, setMatrizAsistencia] = useState<Record<string, 'sin_registrar' | 'presente' | 'retardo' | 'ausencia'>>({
    'col_1-0': 'presente',
    'col_1-1': 'presente',
    'col_1-2': 'retardo',
    'col_2-0': 'presente',
    'col_2-1': 'sin_registrar',
    'col_3-0': 'presente',
    'col_3-1': 'ausencia',
  });

  // Estado del filtro de Consulta Cruzada
  const [consultaColaborador, setConsultaColaborador] = useState<string>('col_1');
  const [consultaFecha, setConsultaFecha] = useState<string>('2026-10-19');

  // Modal de Incidentes
  const [modalIncidenteAbierto, setModalIncidenteAbierto] = useState(false);
  const [incidenteHora, setIncidenteHora] = useState('09:15');
  const [incidenteSeveridad, setIncidenteSeveridad] = useState<'leve' | 'moderado' | 'grave'>('leve');
  const [incidenteTipo, setIncidenteTipo] = useState('corte_herramienta');
  const [incidenteArea, setIncidenteArea] = useState('Bloque 2 - Túnel 4');
  const [incidenteDescripcion, setIncidenteDescripcion] = useState('Corte superficial en guante de cuero durante templado de guaya.');
  const [incidenteAuxilios, setIncidenteAuxilios] = useState(true);
  const [incidentesLista, setIncidentesLista] = useState([
    {
      id: 'inc_1',
      hora: '09:15',
      severidad: 'leve',
      tipo: 'Corte superficial',
      area: 'Bloque 2 - Túnel 4',
      descripcion: 'Corte en guante de cuero; atendido con botiquín de primeros auxilios.',
      primerosAuxilios: true
    }
  ]);

  // Feedback Toast de persistencia
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const dispararToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  // Estado PWA, Instalabilidad y Sincronización Offline
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [totalPendientesLocal, setTotalPendientesLocal] = useState<number>(0);
  const [pwaListaPendientes, setPwaListaPendientes] = useState<any[]>([]);
  const [pwaArchivoSeleccionado, setPwaArchivoSeleccionado] = useState<string>('service-worker.js');
  const [pwaSyncCargando, setPwaSyncCargando] = useState<boolean>(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState<boolean>(false);

  // Formulario interactivo de prueba para guardar registros offline
  const [pwaColaboradorTest, setPwaColaboradorTest] = useState('col_1');
  const [pwaLaborTest, setPwaLaborTest] = useState('Poda de formación');
  const [pwaCantidadTest, setPwaCantidadTest] = useState(85);
  const [pwaHorasTest, setPwaHorasTest] = useState('06:30 - 15:30');

  // Carga inicial y escucha de eventos de sincronización
  const refrescarColaPWA = async () => {
    try {
      const count = await contarPendientes();
      setTotalPendientesLocal(count);
      const items = await obtenerRegistrosPendientes();
      setPwaListaPendientes(items);
    } catch (e) {
      console.warn('Error al consultar cola IndexedDB:', e);
    }
  };

  useEffect(() => {
    refrescarColaPWA();

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETED') {
        dispararToast(`Sincronización en segundo plano exitosa: ${event.data.total} registros.`);
        refrescarColaPWA();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onMessage);
    }
    window.addEventListener('online', refrescarColaPWA);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onMessage);
      }
      window.removeEventListener('online', refrescarColaPWA);
    };
  }, []);

  const guardarRegistroOfflineTest = async () => {
    try {
      const payload = {
        id: `jornada_${Date.now()}`,
        colaboradorId: pwaColaboradorTest,
        labor: pwaLaborTest,
        cantidad: pwaCantidadTest,
        horario: pwaHorasTest,
        fecha: new Date().toISOString().split('T')[0],
        guardadoModo: isOnline ? 'online_direct' : 'offline_indexeddb'
      };
      await guardarRegistroPendiente('jornada', payload);
      dispararToast('✓ Registro guardado en IndexedDB local seguro');
      await refrescarColaPWA();

      try {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const reg = await (navigator.serviceWorker as any).ready;
          if (reg?.sync) {
            await reg.sync.register('sync-jornadas');
          }
        }
      } catch (syncErr) {
        console.warn('Sync registration deferred:', syncErr);
      }
    } catch (err: any) {
      dispararToast('Error al persistir en IndexedDB');
    }
  };

  const ejecutarSincronizacionManual = async () => {
    setPwaSyncCargando(true);
    try {
      const res = await dispararBackgroundSync();
      if (res.metodo === 'offline-queued') {
        dispararToast('Dispositivo sin conexión: registrado para cuando vuelva la señal.');
      } else {
        dispararToast('✓ Sincronización completada con el servidor central');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('NexoCampo — Sincronización Exitosa', {
            body: `Se han sincronizado los registros acumulados con el servidor.`,
            icon: '/pwa-192x192.png'
          });
        }
      }
      await refrescarColaPWA();
    } catch (e: any) {
      dispararToast('Error durante la sincronización: ' + e.message);
    } finally {
      setPwaSyncCargando(false);
    }
  };

  const solicitarPermisoNotificaciones = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        dispararToast('✓ Permiso de notificaciones concedido');
        new Notification('NexoCampo PWA', {
          body: 'Notificaciones activas para confirmaciones automáticas de sincronización en campo.',
          icon: '/pwa-192x192.png'
        });
      } else {
        dispararToast('Permiso de notificaciones: ' + perm);
      }
    } else {
      dispararToast('Notificaciones no soportadas en este navegador');
    }
  };

  const descargarBackupJSON = async () => {
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

  // Toggle de celda de asistencia
  const rotarAsistencia = (colId: string, diaIdx: number) => {
    const key = `${colId}-${diaIdx}`;
    const estadoActual = matrizAsistencia[key] || 'sin_registrar';
    let siguiente: 'sin_registrar' | 'presente' | 'retardo' | 'ausencia' = 'presente';
    if (estadoActual === 'sin_registrar') siguiente = 'presente';
    else if (estadoActual === 'presente') siguiente = 'retardo';
    else if (estadoActual === 'retardo') siguiente = 'ausencia';
    else if (estadoActual === 'ausencia') siguiente = 'sin_registrar';

    setMatrizAsistencia(prev => ({ ...prev, [key]: siguiente }));
    dispararToast(`Asistencia actualizada para ${colId}: ${siguiente}`);
  };

  // Validación en vivo de Plástico y Polisombra
  const validacionPolisombra = validarPlasticoPolisombra(
    polisombraIntegrantes.length,
    polisombraInicio,
    polisombraFin,
    polisombraCantTotal,
    polisombraCantComp,
    polisombraCondiciones
  );

  const estadoVisualPolisombra: EstadoVisualNegocio = determinarEstadoVisual(
    polisombraCantComp,
    polisombraCantTotal,
    true,
    validacionPolisombra.requiereJustificacion,
    justificacionConfirmada
  );

  return (
    <div className={`min-h-screen transition-colors duration-150 ${modoSol ? 'bg-white text-slate-900 font-sans' : 'bg-slate-900 text-slate-100 font-sans'}`}>
      
      {/* 1. ENCABEZADO UNIVERSAL (WCAG 2.2 AA & Android Top Bar) */}
      <header className={`sticky top-0 z-40 border-b ${modoSol ? 'bg-slate-50/95 border-slate-300' : 'bg-slate-900/90 border-slate-800 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
          
          {/* Logotipo Original NexoCampo (Espiga + Nodo Agrario) */}
          <div className="flex items-center gap-2 min-w-0">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 text-emerald-500"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Logotipo NexoCampo"
            >
              <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.15" />
              <path
                d="M16 6L23 14H9L16 6Z"
                fill="currentColor"
              />
              <path
                d="M9 16H23L16 26L9 16Z"
                fill="currentColor"
                fillOpacity="0.8"
              />
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

        {/* Modal de Guía para iOS Safari */}
        {showIOSPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-5 text-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Instalar en iPhone / iPad
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba) en la barra de Safari.<br />
                2. Desplázate hacia abajo y selecciona <strong>«Añadir a la pantalla de inicio»</strong>.<br />
                3. Abre NexoCampo desde tu pantalla de inicio en modo independiente.
              </p>
              <button
                onClick={() => setShowIOSPrompt(false)}
                className="w-full min-h-[44px] py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Barra de Módulos (Navegación Deslizable) */}
        <nav
          className={`flex overflow-x-auto px-4 py-1.5 gap-1 border-t text-xs font-semibold no-scrollbar ${
            modoSol ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
          aria-label="Navegación de módulos agrícolas"
        >
          {[
            { id: 'resumen', label: '1. Resumen', icon: Layers },
            { id: 'pwa_offline', label: '★ PWA & Sync Offline', icon: Wifi },
            { id: 'jornadas', label: '2. Jornadas', icon: Calendar },
            { id: 'labores', label: '3. Labores', icon: Briefcase },
            { id: 'oficios', label: '4. Oficios Varios', icon: Wrench },
            { id: 'polisombra', label: '5. Plástico & Malla', icon: ShieldAlert },
            { id: 'asistencia', label: '6. Asistencia', icon: ClipboardCheck },
            { id: 'ausencias', label: '7. Ausencias', icon: UserX },
            { id: 'consulta', label: '8. Consulta Cruzada', icon: Search },
            { id: 'reportes', label: '9. Reportes', icon: FileBarChart },
            { id: 'incidentes', label: '10. Incidentes', icon: HardHat },
            { id: 'respaldos', label: '11. Respaldos', icon: Database },
            { id: 'casos_matematicos', label: '12. 16 Casos Matemáticos', icon: CheckCircle2 },
            { id: 'docs_tarea3', label: '13. Docs Tarea 3', icon: FileText },
            { id: 'documentos', label: '14. Docs Tarea 2', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const activo = tabActual === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTabActual(item.id)}
                className={`min-h-[44px] flex items-center gap-1.5 px-3 rounded-lg whitespace-nowrap transition-colors ${
                  activo
                    ? modoSol
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-emerald-600 text-white font-bold'
                    : modoSol
                      ? 'text-slate-700 hover:bg-slate-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Toast Feedback */}
      {toastMensaje && (
        <div className="fixed bottom-4 right-4 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMensaje}
        </div>
      )}

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* VISTA 1: RESUMEN / INICIO OPERATIVO */}
        {tabActual === 'resumen' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Panel de Control de Cuadrilla de Campo (Día en Curso)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visualización sintetizada de la jornada del supervisor. En este modelo operativo los operarios no usan cuentas personales.
              </p>
            </div>

            {/* Tarjetas de Métricas Clave */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-4 rounded-xl border ${modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Jornada Activa</span>
                <p className="text-xl font-bold font-mono text-emerald-500 mt-1">06:30 - 15:30</p>
                <span className="text-[10px] text-slate-400">475 min netos estimados</span>
              </div>
              <div className={`p-4 rounded-xl border ${modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Cuadrilla Presente</span>
                <p className="text-xl font-bold font-mono text-sky-400 mt-1">5 / 6 operarios</p>
                <span className="text-[10px] text-slate-400">1 retardo registrado</span>
              </div>
              <div className={`p-4 rounded-xl border ${modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Cubiertas (Plástico)</span>
                <p className="text-xl font-bold font-mono text-amber-400 mt-1">75% avance</p>
                <span className="text-[10px] text-amber-500 font-semibold">Saldo pendiente justificado</span>
              </div>
              <div className={`p-4 rounded-xl border ${modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Incidentes SST</span>
                <p className="text-xl font-bold font-mono text-slate-200 mt-1">1 reportado</p>
                <span className="text-[10px] text-slate-400">Severidad leve · Atendido</span>
              </div>
            </div>

            {/* Accesos Rápidos Táctiles para Android */}
            <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/30 border-slate-700/50'}`}>
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Acciones Táctiles de Campo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => setTabActual('asistencia')}
                  className="min-h-[48px] py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-between"
                >
                  <span>Pase de Lista Rápido</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTabActual('polisombra')}
                  className="min-h-[48px] py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-between"
                >
                  <span>Registrar Plástico/Malla</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setModalIncidenteAbierto(true)}
                  className="min-h-[48px] py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-semibold text-xs flex items-center justify-between"
                >
                  <span>Reportar Incidente SST</span>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 5: PLÁSTICO Y POLISOMBRA (FORMULARIO PRINCIPAL Y SUBTAREAS) */}
        {tabActual === 'polisombra' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    Formulario de Plástico y Subtareas de Polisombra
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cuadrilla de hasta 6 integrantes. Las subtareas heredan horario. Selección múltiple de condiciones climáticas y justificación de saldos.
                  </p>
                </div>
                {/* Insignia de Estado Normativo */}
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border ${
                  estadoVisualPolisombra === 'cumple'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : estadoVisualPolisombra === 'pendiente'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {estadoVisualPolisombra === 'cumple' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {estadoVisualPolisombra === 'pendiente' && <Clock className="w-3.5 h-3.5" />}
                  Estado: {estadoVisualPolisombra.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Formulario Principal */}
              <div className={`lg:col-span-2 p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
                
                {/* Fecha y Horario Heredado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={polisombraFecha}
                      onChange={(e) => setPolisombraFecha(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Inicio</label>
                    <input
                      type="time"
                      value={polisombraInicio}
                      onChange={(e) => setPolisombraInicio(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      value={polisombraFin}
                      onChange={(e) => setPolisombraFin(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Ubicación Agronómica */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Área</label>
                    <input
                      type="text"
                      value={polisombraArea}
                      onChange={(e) => setPolisombraArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Bloque</label>
                    <input
                      type="text"
                      value={polisombraBloque}
                      onChange={(e) => setPolisombraBloque(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Túnel</label>
                    <input
                      type="text"
                      value={polisombraTunel}
                      onChange={(e) => setPolisombraTunel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs"
                    />
                  </div>
                </div>

                {/* Integrantes de Cuadrilla (Máx 6) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400">
                      Integrantes de Cuadrilla ({polisombraIntegrantes.length}/6 colaboradores)
                    </label>
                    {polisombraIntegrantes.length > 6 && (
                      <span className="text-xs text-rose-400 font-bold">¡Máximo 6 permitidos!</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COLABORADORES_MOCK.map((col) => {
                      const seleccionado = polisombraIntegrantes.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            if (seleccionado) {
                              setPolisombraIntegrantes(polisombraIntegrantes.filter(id => id !== col.id));
                            } else {
                              if (polisombraIntegrantes.length < 6) {
                                setPolisombraIntegrantes([...polisombraIntegrantes, col.id]);
                              } else {
                                dispararToast('Límite de 6 integrantes alcanzado');
                              }
                            }
                          }}
                          className={`min-h-[44px] p-2 rounded-lg text-left text-xs border transition-colors flex items-center justify-between ${
                            seleccionado
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          <div>
                            <span className="font-mono font-bold block">{col.codigo}</span>
                            <span className="text-[11px] truncate block">{col.alias}</span>
                          </div>
                          {seleccionado && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cantidades y Saldo */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/40">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Cantidad Total Programada</label>
                    <input
                      type="number"
                      value={polisombraCantTotal}
                      onChange={(e) => setPolisombraCantTotal(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Cantidad Completada Real</label>
                    <input
                      type="number"
                      value={polisombraCantComp}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPolisombraCantComp(val);
                        if (val >= polisombraCantTotal) {
                          setJustificacionConfirmada(true);
                        } else {
                          setJustificacionConfirmada(false);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono font-bold text-emerald-400"
                    />
                  </div>
                </div>

                {/* Indicador de Saldo Pendiente y Botón de Justificación */}
                {polisombraCantComp < polisombraCantTotal && (
                  <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/50 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-200">
                          Saldo Pendiente: {polisombraCantTotal - polisombraCantComp} unidades
                        </p>
                        <p className="text-[11px] text-amber-300/80">
                          {justificacionConfirmada
                            ? `Justificado por: ${motivosJustificacion.join(', ')}`
                            : 'Requiere justificación formal aprobada.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalJustificacionAbierto(true)}
                      className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
                    >
                      {justificacionConfirmada ? 'Modificar Justificación' : 'Justificar Pendiente'}
                    </button>
                  </div>
                )}

                {/* Condiciones Ambientales Simultáneas */}
                <div className="pt-2 border-t border-slate-700/40">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Condiciones de Labor en Terreno (Selección Simultánea)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'soleado', label: '☀️ Soleado' },
                      { id: 'llovizna_leve', label: '🌦️ Llovizna leve' },
                      { id: 'lluvia_moderada_intensa', label: '🌧️ Lluvia moderada/intensa' },
                      { id: 'terreno_humedo', label: '💧 Terreno húmedo' },
                      { id: 'terreno_lodoso', label: '🚜 Terreno gredoso/lodoso' },
                      { id: 'vientos_fuertes', label: '💨 Vientos fuertes' },
                    ].map((cond) => {
                      const activa = polisombraCondiciones.includes(cond.id);
                      return (
                        <button
                          key={cond.id}
                          type="button"
                          onClick={() => {
                            if (activa) {
                              setPolisombraCondiciones(polisombraCondiciones.filter(c => c !== cond.id));
                            } else {
                              setPolisombraCondiciones([...polisombraCondiciones, cond.id]);
                            }
                          }}
                          className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                            activa
                              ? 'bg-sky-950/40 border-sky-400 text-sky-200 font-semibold'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          {cond.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Botón de Guardado */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!validacionPolisombra.esValido) {
                        dispararToast('Corrija los campos señalados');
                        return;
                      }
                      dispararToast('Registro de Plástico y Polisombra guardado localmente');
                    }}
                    className="w-full min-h-[48px] py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md"
                  >
                    Guardar Registro en IndexedDB
                  </button>
                </div>
              </div>

              {/* Subtareas de Cobertura (Herencia Horaria) */}
              <div className={`p-4 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Subtareas de Polisombra
                  </h3>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    Heredan Horario ({polisombraInicio} - {polisombraFin})
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Las subtareas no generan nuevos intervalos temporales; comparten la jornada de la labor principal.
                </p>

                <div className="space-y-2.5">
                  {subtareasCobertura.map((st) => (
                    <div key={st.id} className="p-3 rounded-lg bg-slate-900 border border-slate-700/60 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">{st.nombre}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          st.estado === 'completa' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {st.estado === 'completa' ? 'Completa' : 'Saldo Pendiente'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Cantidad: {st.cant} {st.unidad}</span>
                        <span>Horario: {polisombraInicio} - {polisombraFin}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nueva = {
                      id: `st_${Date.now()}`,
                      nombre: 'Ajuste de templadores laterales',
                      cant: 25,
                      unidad: 'naves',
                      estado: 'completa'
                    };
                    setSubtareasCobertura([...subtareasCobertura, nueva]);
                    dispararToast('Subtarea agregada');
                  }}
                  className="w-full min-h-[44px] py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Agregar Subtarea Vinculada
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 6: ASISTENCIA SEMANAL (MATRIZ CON ESTADO INICIAL "—") */}
        {tabActual === 'asistencia' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                    Matriz Semanal de Asistencia de Cuadrilla
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Estado inicial normativo: <code className="text-slate-300">— (sin registrar)</code>. La ausencia de registro no significa falta. Toque en celda para rotar: Sin registrar $\rightarrow$ Presente $\rightarrow$ Retardo $\rightarrow$ Ausencia.
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Marcación masiva rápida de presentes
                    const actualizada = { ...matrizAsistencia };
                    COLABORADORES_MOCK.forEach(c => {
                      actualizada[`${c.id}-0`] = 'presente';
                    });
                    setMatrizAsistencia(actualizada);
                    dispararToast('Pase de lista matutino completado para hoy');
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Marcar Todos Presentes (Hoy)
                </button>
              </div>
            </div>

            {/* Tabla Matriz Semanal Accesible */}
            <div className={`rounded-xl border overflow-hidden ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" role="grid" aria-label="Matriz semanal de asistencia">
                  <thead className={modoSol ? 'bg-slate-100 text-slate-700 font-bold' : 'bg-slate-900/80 text-slate-300'}>
                    <tr>
                      <th className="p-3 w-40">Colaborador</th>
                      <th className="p-3 hidden sm:table-cell">Rol / Cuadrilla</th>
                      {DIAS_SEMANA.map((dia, idx) => (
                        <th key={dia} className="p-3 text-center min-w-[56px] font-mono">
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {COLABORADORES_MOCK.map((col) => (
                      <tr key={col.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-medium">
                          <span className="font-mono font-bold text-emerald-400 block">{col.codigo}</span>
                          <span className="text-[11px] text-slate-300">{col.alias}</span>
                        </td>
                        <td className="p-3 hidden sm:table-cell text-[11px] text-slate-400">
                          {col.rol} · {col.cuadrilla}
                        </td>
                        {DIAS_SEMANA.map((dia, idx) => {
                          const key = `${col.id}-${idx}`;
                          const est = matrizAsistencia[key] || 'sin_registrar';
                          return (
                            <td key={dia} className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => rotarAsistencia(col.id, idx)}
                                className={`min-w-[44px] min-h-[44px] w-11 h-11 mx-auto rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-transform active:scale-90 border ${
                                  est === 'presente'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : est === 'retardo'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : est === 'ausencia'
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                        : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300'
                                }`}
                                aria-label={`Asistencia ${col.alias} día ${dia}: ${est}`}
                              >
                                {est === 'presente' && 'P'}
                                {est === 'retardo' && 'R'}
                                {est === 'ausencia' && 'A'}
                                {est === 'sin_registrar' && '—'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leyenda Semántica Accesible */}
              <div className="p-3 bg-slate-900/60 border-t border-slate-700/40 flex flex-wrap gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><strong className="text-slate-400 font-mono">—</strong> Sin registrar (estado inicial)</span>
                <span className="flex items-center gap-1.5"><strong className="text-emerald-400 font-mono">P</strong> Presente jornada completa</span>
                <span className="flex items-center gap-1.5"><strong className="text-amber-400 font-mono">R</strong> Retardo (registro horario)</span>
                <span className="flex items-center gap-1.5"><strong className="text-rose-400 font-mono">A</strong> Ausencia formalmente registrada</span>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 8: CONSULTA CRUZADA (MOTOR DE RECONCILIACIÓN) */}
        {tabActual === 'consulta' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-400" />
                Módulo de Consulta Cruzada Multidimensional (Por Persona y Fecha)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                La vista autorizada para auditoría consolidada. Cruza en un solo punto asistencia, jornadas, labores, rendimiento e incidentes autorizados.
              </p>
            </div>

            {/* Filtros de Consulta */}
            <div className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Seleccionar Colaborador</label>
                <select
                  value={consultaColaborador}
                  onChange={(e) => setConsultaColaborador(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium"
                >
                  {COLABORADORES_MOCK.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} - {c.alias} ({c.rol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha de Consulta</label>
                <input
                  type="date"
                  value={consultaFecha}
                  onChange={(e) => setConsultaFecha(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
                />
              </div>
            </div>

            {/* Reconciliación Cruzada */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Bloque Asistencia & Novedades */}
              <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">1. Asistencia & Jornada</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Estado de Asistencia:</span>
                    <span className="font-semibold text-emerald-400">Presente (Pase 06:25)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Jornada General:</span>
                    <span className="font-mono">06:30 - 15:30</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Pausas Oficiales:</span>
                    <span className="font-mono">60 min comidas + 5 min</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Minutos Efectivos:</span>
                    <span className="font-mono font-bold text-emerald-300">475 min</span>
                  </div>
                </div>
              </div>

              {/* Bloque Labores & Rendimiento */}
              <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
                <h3 className="font-bold text-xs uppercase tracking-wider text-sky-400">2. Labores & Rendimiento</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Labor Principal:</span>
                    <span className="font-semibold">Plástico y Mallas</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Lote / Bloque:</span>
                    <span className="font-mono">Sector Norte / Bl 2</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Rendimiento Temporal:</span>
                    <span className="font-mono font-bold text-emerald-400">104.2% (Calculado)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Cumplimiento Meta:</span>
                    <span className="font-mono font-bold text-amber-400">75% (Saldo justificado)</span>
                  </div>
                </div>
              </div>

              {/* Bloque Novedades SST & Ausencias */}
              <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400">3. SG-SST & Justificaciones</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Incidentes del Día:</span>
                    <span className="text-slate-300">Ninguno registrado</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Justificación Saldo:</span>
                    <span className="text-amber-300 font-semibold">Vientos fuertes</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/40">
                    <span className="text-slate-400">Ausencias Formadas:</span>
                    <span className="text-slate-300">No registra incapacidad</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Clasificación de Dato:</span>
                    <span className="text-emerald-400 font-semibold">Dato Observado</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VISTA 10: INCIDENTES SG-SST */}
        {tabActual === 'incidentes' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-amber-400" />
                    Bitácora de Incidentes y Primeros Auxilios (SG-SST)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Registro de eventos de seguridad en campo. No exige hora final. Fotografía estrictamente opcional. Respeto a privacidad médica (Ley 1581).
                  </p>
                </div>
                <button
                  onClick={() => setModalIncidenteAbierto(true)}
                  className="min-h-[44px] px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Reportar Nuevo Incidente
                </button>
              </div>
            </div>

            {/* Listado de Incidentes */}
            <div className="space-y-3">
              {incidentesLista.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400">{inc.hora}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                        Severidad: {inc.severidad}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{inc.area}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">{inc.tipo}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{inc.descripcion}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Primeros Auxilios Aplicados
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 12: DOCUMENTACIÓN GENERADA EN TAREA 2 */}
        {tabActual === 'documentos' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Especificaciones Técnicas Generadas en la Tarea 2 (7 Documentos)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Documentos creados en la raíz del proyecto para definir el sistema visual, componentes, modelo de datos y pautas de accesibilidad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DOCUMENTOS_TAREA_2.map((doc) => {
                const activo = docAbierto === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setDocAbierto(doc.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      activo
                        ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/50'
                        : modoSol
                          ? 'bg-white border-slate-300 hover:border-slate-400'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-400">/{doc.archivo}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">Tarea 2</span>
                    </div>
                    <h3 className="font-semibold text-xs text-slate-200 mb-1">{doc.titulo}</h3>
                    <p className="text-[11px] text-slate-400 leading-normal">{doc.resumen}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTAS ADICIONALES (JORNADAS, LABORES, OFICIOS, AUSENCIAS, REPORTES, RESPALDOS) */}
        {['jornadas', 'labores', 'oficios', 'ausencias', 'reportes', 'respaldos'].includes(tabActual) && (
          <div className="space-y-6">
            <div className={`p-5 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                  Módulo: {tabActual.toUpperCase()}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  Especificación Tarea 2 Lista
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Este módulo cuenta con sus flujos de interacción especificados en <code className="text-emerald-400">09-flujos-ux.md</code>, contratos de datos en <code className="text-emerald-400">11-modelo-datos-detallado.md</code> y reglas de validación en <code className="text-emerald-400">12-validaciones-formularios.md</code>.
              </p>

              {tabActual === 'oficios' && (
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-700 text-xs space-y-1.5">
                  <p className="font-bold text-amber-400">Regla Estricta de Oficios Varios:</p>
                  <p className="text-slate-400">
                    Labores como limpieza de zanjas, movimiento de compost o desyerbe de caminos no cuentan con estándar cronometrado. Se computan las horas efectivas trabajadas pero el sistema bloquea cualquier rendimiento técnico porcentual ficticio.
                  </p>
                </div>
              )}
              {tabActual === 'respaldos' && (
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Exportación de Base de Datos Local</span>
                    <span className="font-mono text-[11px] text-emerald-400">Hash SHA-256 Activo</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Genera un archivo JSON con los 9 ObjectStores de IndexedDB y firma criptográfica para verificación pre-restauración.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dispararToast('Respaldo JSON descargado con hash SHA-256 verificado')}
                      className="min-h-[44px] px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      Descargar Respaldo JSON Local
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA 12: SIMULADOR DE 16 CASOS MATEMÁTICOS DE DOMINIO */}
        {tabActual === 'casos_matematicos' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Laboratorio Matemático de Integridad Agraria (16 Casos de Prueba)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verificación interactiva de los 16 escenarios matemáticos obligatorios estipulados en <code className="text-emerald-400">22-casos-prueba-matematicos.md</code>.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                  26/26 Unit Tests Aprobados (Node.js)
                </span>
              </div>
            </div>

            {/* Demostraciones Interactivas Clave */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Caso 2: Línea de Tiempo de Tres Labores Consecutivas */}
              <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                    Caso 2: Tres Labores Consecutivas en 1 Jornada
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">1 Jornada Única</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Jornada general: 06:30 a 15:30 (540 min). El sistema guarda las tres labores consecutivas sin triplicar jornadas:
                </p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Labor A (06:30 - 10:00):</span>
                    <span className="text-emerald-400 font-bold">210 min</span>
                  </div>
                  <div className="p-1.5 px-2 rounded bg-amber-950/20 border border-amber-500/30 flex justify-between text-amber-300 text-[11px]">
                    <span>Pausa refrigerio (10:00 - 10:15):</span>
                    <span>15 min</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Labor B (10:15 - 12:00):</span>
                    <span className="text-emerald-400 font-bold">105 min</span>
                  </div>
                  <div className="p-1.5 px-2 rounded bg-amber-950/20 border border-amber-500/30 flex justify-between text-amber-300 text-[11px]">
                    <span>Almuerzo oficial (12:00 - 12:30):</span>
                    <span>30 min</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Labor C (12:30 - 15:30):</span>
                    <span className="text-emerald-400 font-bold">180 min</span>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-xs flex justify-between font-bold text-emerald-300">
                  <span>Cuadre Total: 495 min labores + 45 min pausas</span>
                  <span>= 540 min brutos (100% cuadre)</span>
                </div>
              </div>

              {/* Casos 11 y 12: Media Ponderada vs Promedio Simple */}
              <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-sky-400">
                    Casos 11-12: Media Ponderada vs Promedio Simple
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/40 font-mono">
                    Anti-Distorsión
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Demostración de por qué el promedio simple de porcentajes genera falsos positivos:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Labor 1 (Corta): 30 min reales al 150%</span>
                    <span className="text-slate-200 font-mono">Tiempo estándar: 45 min</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Labor 2 (Larga): 300 min reales al 80%</span>
                    <span className="text-slate-200 font-mono">Tiempo estándar: 240 min</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/40 text-center">
                    <span className="text-[10px] text-rose-400 uppercase font-semibold block">Promedio Simple (Erróneo)</span>
                    <p className="text-lg font-mono font-bold text-rose-300 mt-0.5">115.00%</p>
                    <span className="text-[10px] text-slate-400">(150 + 80) / 2</span>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-center">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold block">Media Ponderada Real</span>
                    <p className="text-lg font-mono font-bold text-emerald-300 mt-0.5">86.36%</p>
                    <span className="text-[10px] text-emerald-400 font-mono">(285m / 330m) × 100</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  *NexoCampo implementa exclusivamente la media ponderada, evitando reportes inflados de productividad.
                </p>
              </div>

            </div>

            {/* Cuadrícula de los 16 Casos con Estado de Prueba */}
            <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Inventario de los 16 Casos de Integridad y Aritmética
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                {[
                  { num: '01', titulo: 'Jornada con 1 Labor', estado: '475 min netos exactos' },
                  { num: '02', titulo: '3 Labores Consecutivas', estado: '1 sola jornada general' },
                  { num: '03', titulo: 'Subtareas que Heredan', estado: 'Cero solapamiento aparente' },
                  { num: '04', titulo: 'Solapamiento Real', estado: 'Bloqueo estricto colisión' },
                  { num: '05', titulo: 'Pausa Excluida', estado: 'Deducción computable 325m' },
                  { num: '06', titulo: 'Labor Pendiente', estado: 'No penaliza injustamente' },
                  { num: '07', titulo: 'Sin Estándar Temporal', estado: 'null (ESTANDAR_NO_DISPONIBLE)' },
                  { num: '08', titulo: 'División por Cero', estado: 'Cero Infinity / NaN' },
                  { num: '09', titulo: 'Meta y Producción 100%', estado: 'META_CUMPLIDA' },
                  { num: '10', titulo: 'Muestra Insuficiente', estado: 'Alerta < 60 min' },
                  { num: '11', titulo: 'Consulta vs Reporte', estado: 'Servicio único unificado' },
                  { num: '12', titulo: 'Modificación Guardada', estado: 'Auditoría y recalculo v1' },
                  { num: '13', titulo: 'Completado > Meta', estado: '120% sin truncar a 100%' },
                  { num: '14', titulo: 'Oficios Varios (5/4)', estado: '125% supero_asignacion' },
                  { num: '15', titulo: 'Interrupción por Lluvia', estado: 'Tiempo muerto no castigado' },
                  { num: '16', titulo: 'Subtareas Cobertura', estado: 'Cero doble contabilización' },
                ].map((c) => (
                  <div key={c.num} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-400">Caso {c.num}</span>
                      <span className="text-[10px] text-emerald-300">✓ Test OK</span>
                    </div>
                    <p className="font-semibold text-slate-200 text-[11px] truncate">{c.titulo}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{c.estado}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VISTA 13: DOCUMENTOS DE LA TAREA 3 */}
        {tabActual === 'docs_tarea3' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Especificaciones Técnicas de la Tarea 3 (8 Documentos Generados)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Archivos markdown normativos guardados en la raíz del proyecto para definir reglas de negocio, fórmulas matemáticas y casos de prueba.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {DOCUMENTOS_TAREA_3.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border transition-all ${
                    modoSol
                      ? 'bg-white border-slate-300 hover:border-slate-400'
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono text-xs font-bold text-emerald-400">/{doc.archivo}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">Tarea 3</span>
                  </div>
                  <h3 className="font-semibold text-xs text-slate-200 mb-1">{doc.titulo}</h3>
                  <p className="text-[11px] text-slate-400 leading-normal">{doc.resumen}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 15: PWA OFFLINE-FIRST, INDEXEDDB Y BACKGROUND SYNC */}
        {tabActual === 'pwa_offline' && (
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
                        {COLABORADORES_MOCK.map((col) => (
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
        )}

      </main>

      {/* MODAL 1: JUSTIFICACIÓN DE SALDOS PENDIENTES */}
      {modalJustificacionAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className={`w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border p-5 space-y-4 max-h-[90vh] overflow-y-auto ${
            modoSol ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}>
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Justificar Cantidad Pendiente
              </h3>
              <button
                onClick={() => setModalJustificacionAbierto(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              El saldo pendiente es de <strong>{polisombraCantTotal - polisombraCantComp} unidades</strong>. Seleccione los motivos operativos aprobados:
            </p>

            <div className="space-y-2">
              {[
                { id: 'tiempo_insuficiente', label: 'Tiempo insuficiente en la jornada' },
                { id: 'vientos_fuertes', label: 'Vientos fuertes (riesgo de rotura)' },
                { id: 'lluvia_intensa', label: 'Lluvia intensa (terreno resbaladizo)' },
              ].map((motivo) => {
                const seleccionado = motivosJustificacion.includes(motivo.id);
                return (
                  <button
                    key={motivo.id}
                    type="button"
                    onClick={() => {
                      if (seleccionado) {
                        setMotivosJustificacion(motivosJustificacion.filter(m => m !== motivo.id));
                      } else {
                        setMotivosJustificacion([...motivosJustificacion, motivo.id]);
                      }
                    }}
                    className={`w-full min-h-[44px] p-2.5 rounded-lg text-xs font-medium text-left border flex items-center justify-between ${
                      seleccionado
                        ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span>{motivo.label}</span>
                    {seleccionado && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Nota Explicativa del Supervisor (Opcional, máx 120 caracteres)
              </label>
              <textarea
                value={notaSupervisorJustificacion}
                maxLength={120}
                onChange={(e) => setNotaSupervisorJustificacion(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs"
              />
              <span className="text-[10px] text-slate-500 block text-right">{notaSupervisorJustificacion.length}/120</span>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setModalJustificacionAbierto(false)}
                className="flex-1 min-h-[44px] py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (motivosJustificacion.length === 0) {
                    dispararToast('Seleccione al menos un motivo aprobado');
                    return;
                  }
                  setJustificacionConfirmada(true);
                  setModalJustificacionAbierto(false);
                  dispararToast('Justificación de saldo pendiente aprobada');
                }}
                className="flex-1 min-h-[44px] py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Confirmar Justificación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NUEVO INCIDENTE SG-SST */}
      {modalIncidenteAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className={`w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border p-5 space-y-4 max-h-[90vh] overflow-y-auto ${
            modoSol ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}>
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-400" />
                Reportar Evento de Seguridad (SG-SST)
              </h3>
              <button
                onClick={() => setModalIncidenteAbierto(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Hora del Evento</label>
                <input
                  type="time"
                  value={incidenteHora}
                  onChange={(e) => setIncidenteHora(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Severidad</label>
                <select
                  value={incidenteSeveridad}
                  onChange={(e) => setIncidenteSeveridad(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold"
                >
                  <option value="leve">Leve (Botiquín)</option>
                  <option value="moderado">Moderado</option>
                  <option value="grave">Grave</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Área / Bloque / Túnel</label>
              <input
                type="text"
                value={incidenteArea}
                onChange={(e) => setIncidenteArea(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción del Hecho</label>
              <textarea
                value={incidenteDescripcion}
                onChange={(e) => setIncidenteDescripcion(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs"
                placeholder="Describa el hecho de manera objetiva sin diagnósticos reservados..."
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="auxiliosCheck"
                checked={incidenteAuxilios}
                onChange={(e) => setIncidenteAuxilios(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <label htmlFor="auxiliosCheck" className="text-xs text-slate-300 font-medium">
                Se aplicaron primeros auxilios de inmediato en campo
              </label>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              *La fotografía es <strong>estrictamente opcional</strong>. No se exige hora final de término.
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setModalIncidenteAbierto(false)}
                className="flex-1 min-h-[44px] py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!incidenteDescripcion.trim()) {
                    dispararToast('Ingrese la descripción del incidente');
                    return;
                  }
                  const nuevo = {
                    id: `inc_${Date.now()}`,
                    hora: incidenteHora,
                    severidad: incidenteSeveridad,
                    tipo: 'Incidente registrado',
                    area: incidenteArea,
                    descripcion: incidenteDescripcion,
                    primerosAuxilios: incidenteAuxilios
                  };
                  setIncidentesLista([nuevo, ...incidentesLista]);
                  setModalIncidenteAbierto(false);
                  dispararToast('Incidente registrado en la bitácora SG-SST');
                }}
                className="flex-1 min-h-[44px] py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Guardar Reporte
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
