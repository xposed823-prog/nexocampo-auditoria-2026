/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Prototipo Visual Navegable y Arquitectura Modular
 * Interfaz Móvil y Componentes Desacoplados (Feature-First Slices)
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Smartphone, AlertTriangle, Check, X, Search, FileBarChart, User, LogOut } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from './domain/usePWAInstall';
import { authService } from './domain/authService';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { LoginScreen } from './components/auth/LoginScreen';
import { UserManagement } from './components/auth/UserManagement';
import {
  guardarRegistroPendiente,
  obtenerRegistrosPendientes,
  contarPendientes,
  exportarBaseDatosJSON,
  dispararBackgroundSync
} from './domain/pwaManager';
import {
  validarPlasticoPolisombra,
  determinarEstadoVisual,
  EstadoVisualNegocio
} from './domain/formValidators';
import { COLABORADORES_CATALOGO, AREAS_AGRONOMICAS, LABORES_AGRONOMICAS } from './domain/catalogoAgronomico';
import {
  abrirDB,
  dbGetAll,
  guardarAsistenciaAtomica,
  guardarLoteAsistencia,
  cargarMatrizAsistenciaSemana,
  JornadaRegistro
} from './domain/nexocampoDB';

// Componentes Modulares Desacoplados
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { ResumenModulo } from './components/resumen/ResumenModulo';
import { JornadasModulo } from './components/jornadas/JornadasModulo';
import { LaboresModulo } from './components/labores/LaboresModulo';
import { OficiosVariosModulo } from './components/oficios-varios/OficiosVariosModulo';
import { PlasticoModulo } from './components/plastico/PlasticoModulo';
import { AsistenciaModulo } from './components/asistencia/AsistenciaModulo';
import { AusenciasModulo } from './components/ausencias/AusenciasModulo';
import { ConsultaCruzadaModulo } from './components/consulta/ConsultaCruzadaModulo';
import { ReportesModulo } from './components/reportes/ReportesModulo';
import { IncidentesModulo, IncidenteItem } from './components/incidentes/IncidentesModulo';
import { RespaldosModulo } from './components/respaldos/RespaldosModulo';
import { LaboratorioModulo } from './components/laboratorio/LaboratorioModulo';
import { DocumentosModulo } from './components/documentos/DocumentosModulo';
import { PwaSyncModulo } from './components/pwa/PwaSyncModulo';
import { AdminModulo } from './components/admin/AdminModulo';

// Documentos técnicos generados para Tarea 3
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

// Documentos técnicos generados para Tarea 2
const DOCUMENTOS_TAREA_2 = [
  { id: '08', archivo: '08-sistema-visual.md', titulo: 'Sistema Visual Unificado', resumen: 'Tokens de color 60-30-10, tipografía unificada tabular-nums, monograma original SVG y ergonomía táctil Android.' },
  { id: '09', archivo: '09-flujos-ux.md', titulo: 'Flujos UX y Recorridos de Campo', resumen: 'Especificación de los 11 recorridos táctiles: jornada, subtareas que heredan horario, asistencia semanal, pendientes e incidentes.' },
  { id: '10', archivo: '10-componentes-ui.md', titulo: 'Catálogo de Componentes UI', resumen: 'Botones primarios/secundarios/advertencia/destructivos, 7 estados de negocio, bottom-sheets y selectores climáticos.' },
  { id: '11', archivo: '11-modelo-datos-detallado.md', titulo: 'Modelo de Datos Detallado', resumen: '12 entidades tipadas en TypeScript, almacenes IndexedDB, herencia horaria sin duplicidad y distinción crudo vs derivado.' },
  { id: '12', archivo: '12-validaciones-formularios.md', titulo: 'Validaciones de Formularios', resumen: 'Campos obligatorios/opcionales, reglas de consistencia, mensajes amigables y protocolo de fallo de persistencia local.' },
  { id: '13', archivo: '13-mapa-navegacion.md', titulo: 'Mapa de Navegación y Vistas', resumen: 'Árbol de navegación plano para Android, delimitación estricta entre resúmenes ligeros y consulta cruzada profunda.' },
  { id: '14', archivo: '14-accesibilidad.md', titulo: 'Accesibilidad WCAG 2.2 AA', resumen: 'Contraste 4.5:1+, áreas táctiles >=44x44px, foco visible, modo sol campo y pruebas para lectores de pantalla.' },
];

// Catálogo de colaboradores reales del sistema
const COLABORADORES_MOCK = COLABORADORES_CATALOGO;

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Componente principal envuelto en AuthProvider
function App() {
  const [tabActual, setTabActual] = useState<string>('inicio');
  const [subTabRegistrar, setSubTabRegistrar] = useState<'labores' | 'polisombra' | 'oficios' | 'jornadas' | 'incidentes'>('labores');
  const [subTabReportes, setSubTabReportes] = useState<'rendimiento' | 'consulta'>('rendimiento');
  const [modoSol, setModoSol] = useState(false);
  const [docAbierto, setDocAbierto] = useState<string>('08');

  // Estado del Formulario de Plástico y Polisombra
  const [polisombraFecha, setPolisombraFecha] = useState('2026-10-19');
  const [polisombraIntegrantes, setPolisombraIntegrantes] = useState<string[]>(['col_3', 'col_4']);
  const [polisombraInicio, setPolisombraInicio] = useState('06:30');
  const [polisombraFin, setPolisombraFin] = useState('11:30');
  const [polisombraArea, setPolisombraArea] = useState('Jamaica');
  const [polisombraBloque, setPolisombraBloque] = useState('T5');
  const [polisombraTunel, setPolisombraTunel] = useState('Túnel 1');
  const [polisombraCantTotal, setPolisombraCantTotal] = useState(100);
  const [polisombraCantComp, setPolisombraCantComp] = useState(75);
  const [polisombraCondiciones, setPolisombraCondiciones] = useState<string[]>(['soleado', 'vientos_fuertes']);
  const [subtareasCobertura, setSubtareasCobertura] = useState([
    { id: 'st_1', nombre: 'Tendido de polietileno', cant: 75, unidad: 'm lineales', estado: 'completa' },
    { id: 'st_2', nombre: 'Costura y grapado de mallas', cant: 40, unidad: 'm costura', estado: 'pendiente_saldo' }
  ]);

  // Modal de Justificación de Saldo Pendiente (ahora manejado en PlasticoModulo)
  const [motivosJustificacion, setMotivosJustificacion] = useState<string[]>(['vientos_fuertes']);
  const [justificacionConfirmada, setJustificacionConfirmada] = useState(true);
  const [notaSupervisorJustificacion, setNotaSupervisorJustificacion] = useState('');

  // Estado interactivo de Asistencia Semanal con persistencia real IndexedDB
  const [matrizAsistencia, setMatrizAsistencia] = useState<Record<string, 'sin_registrar' | 'presente' | 'retardo' | 'ausencia'>>({
    'col_1-0': 'presente',
    'col_1-1': 'presente',
    'col_1-2': 'retardo',
    'col_2-0': 'presente',
    'col_2-1': 'sin_registrar',
    'col_3-0': 'presente',
    'col_3-1': 'ausencia',
  });
  const [jornadasTotales, setJornadasTotales] = useState<JornadaRegistro[]>([]);
  const [dbCargada, setDbCargada] = useState(false);

  // Fase 2: Hidratación inicial reactiva desde IndexedDB
  const hidratarDatosDesdeIndexedDB = async () => {
    try {
      await abrirDB();
      const matrizGuardada = await cargarMatrizAsistenciaSemana('2026-10-19');
      if (Object.keys(matrizGuardada).length > 0) {
        setMatrizAsistencia(prev => ({ ...prev, ...matrizGuardada }));
      }
      const listaJornadas = await dbGetAll<JornadaRegistro>('jornadas');
      setJornadasTotales(listaJornadas || []);
      setDbCargada(true);
    } catch (e) {
      console.warn('[NexoCampo] Advertencia al hidratar desde IndexedDB:', e);
      setDbCargada(true);
    }
  };

  useEffect(() => {
    hidratarDatosDesdeIndexedDB();
  }, []);

  // Estado del filtro de Consulta Cruzada
  const [consultaColaborador, setConsultaColaborador] = useState<string>('col_1');
  const [consultaFecha, setConsultaFecha] = useState<string>('2026-10-19');

  // Estado de Incidentes
  const [modalIncidenteAbierto, setModalIncidenteAbierto] = useState(false);
  const [incidenteHora, setIncidenteHora] = useState('09:15');
  const [incidenteSeveridad, setIncidenteSeveridad] = useState<'leve' | 'moderado' | 'grave'>('leve');
  const [incidenteArea, setIncidenteArea] = useState('Bloque 2 - Túnel 4');
  const [incidenteDescripcion, setIncidenteDescripcion] = useState('Corte superficial en guante de cuero durante templado de guaya.');
  const [incidenteAuxilios, setIncidenteAuxilios] = useState(true);
  const [incidentesLista, setIncidentesLista] = useState<IncidenteItem[]>([
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

  // Toast Feedback
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

  const rotarAsistencia = async (colId: string, diaIdx: number) => {
    const key = `${colId}-${diaIdx}`;
    const estadoActual = matrizAsistencia[key] || 'sin_registrar';
    let siguiente: 'sin_registrar' | 'presente' | 'retardo' | 'ausencia' = 'presente';
    if (estadoActual === 'sin_registrar') siguiente = 'presente';
    else if (estadoActual === 'presente') siguiente = 'retardo';
    else if (estadoActual === 'retardo') siguiente = 'ausencia';
    else if (estadoActual === 'ausencia') siguiente = 'sin_registrar';

    // 1. Actualización reactiva instantánea en memoria
    setMatrizAsistencia(prev => ({ ...prev, [key]: siguiente }));

    // 2. Persistencia atómica en IndexedDB (store: asistencia)
    try {
      const fechaCalculada = `2026-10-${19 + diaIdx}`;
      await guardarAsistenciaAtomica(colId, fechaCalculada, siguiente);
      dispararToast(`✓ Asistencia en IndexedDB (${colId} día ${DIAS_SEMANA[diaIdx]}): ${siguiente}`);
    } catch (e) {
      dispararToast(`Asistencia en memoria (${colId}): ${siguiente}`);
    }
  };

  const marcarTodosPresentesHoy = async () => {
    const actualizada = { ...matrizAsistencia };
    const lote: Array<{ colaborador_id: string; fecha: string; estado: 'presente' }> = [];
    const fechaHoy = '2026-10-19';

    COLABORADORES_MOCK.forEach(c => {
      actualizada[`${c.id}-0`] = 'presente';
      lote.push({ colaborador_id: c.id, fecha: fechaHoy, estado: 'presente' });
    });

    setMatrizAsistencia(actualizada);

    try {
      await guardarLoteAsistencia(lote);
      dispararToast('✓ Pase de lista matutino persistido en IndexedDB (store: asistencia)');
    } catch (e) {
      dispararToast('Pase de lista matutino completado para hoy');
    }
  };

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

  // Estado de autenticación
  const authState = authService.getAuthState();
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Inicializar usuarios al montar
  useEffect(() => {
    authService.initializeUsers();
  }, []);

  // Verificar autenticación
  if (!authState.isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          // Recargar el componente para actualizar el estado de autenticación
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans antialiased">
      <div className="app-shell max-w-[28rem] w-full mx-auto min-h-screen flex flex-col relative shadow-2xl bg-[#f8fafc] pb-28">
        
        {/* 1. ENCABEZADO CANÓNICO */}
        <Header
          modoSol={modoSol}
          setModoSol={setModoSol}
          isOnline={isOnline}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          isIOS={isIOS}
          install={install}
          setShowIOSPrompt={setShowIOSPrompt}
          totalPendientesLocal={totalPendientesLocal}
          setTabActual={setTabActual}
          user={authState.user}
          onLogout={() => {
            authService.logout('Logout manual');
            window.location.reload();
          }}
          onManageUsers={() => setShowUserManagement(true)}
        />

        {/* Modal Guía iOS */}
        {showIOSPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white border border-slate-200 p-5 text-slate-800 space-y-3 shadow-2xl">
              <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Instalar en iPhone / iPad
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                1. Toca el botón <strong>Compartir</strong> en Safari.<br />
                2. Selecciona <strong>«Añadir a la pantalla de inicio»</strong>.<br />
                3. Abre NexoCampo desde tu pantalla de inicio en modo autónomo.
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

        {/* Botón Flotante Canónico de Campana / Alertas (Idéntico a las capturas) */}
        <button
          type="button"
          onClick={() => setTabActual('admin')}
          className="fixed right-4 bottom-20 z-40 w-13 h-13 rounded-full bg-white border border-slate-200 shadow-[0_6px_20px_rgba(0,0,0,0.14)] flex items-center justify-center text-2xl active:scale-95 transition-transform cursor-pointer"
          aria-label="Notificaciones y Administración"
          title="Notificaciones y Administración"
        >
          🔔
          {totalPendientesLocal > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs">
              {totalPendientesLocal}
            </span>
          )}
        </button>

        {/* Feedback Toast */}
        {toastMensaje && (
          <div className="fixed bottom-16 left-4 right-4 max-w-xs mx-auto z-50 bg-emerald-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{toastMensaje}</span>
          </div>
        )}

        {/* ÁREA DE CONTENIDO PRINCIPAL POR VISTAS CANÓNICAS */}
        <main className="flex-1 w-full px-3 py-3 space-y-4">
        {(tabActual === 'resumen' || tabActual === 'inicio') && (
          <ResumenModulo
            modoSol={modoSol}
            setTabActual={setTabActual}
            setModalIncidenteAbierto={setModalIncidenteAbierto}
          />
        )}

        {(tabActual === 'jornadas' || tabActual === 'registrar') && (
          <JornadasModulo
            modoSol={modoSol}
            dispararToast={dispararToast}
            onJornadaGuardada={hidratarDatosDesdeIndexedDB}
          />
        )}

        {tabActual === 'labores' && (
          <LaboresModulo
            modoSol={modoSol}
            dispararToast={dispararToast}
          />
        )}

        {tabActual === 'oficios' && (
          <OficiosVariosModulo
            modoSol={modoSol}
            dispararToast={dispararToast}
          />
        )}

        {tabActual === 'polisombra' && (
          <PlasticoModulo
            modoSol={modoSol}
            estadoVisualPolisombra={estadoVisualPolisombra}
            polisombraFecha={polisombraFecha}
            setPolisombraFecha={setPolisombraFecha}
            polisombraInicio={polisombraInicio}
            setPolisombraInicio={setPolisombraInicio}
            polisombraFin={polisombraFin}
            setPolisombraFin={setPolisombraFin}
            polisombraArea={polisombraArea}
            setPolisombraArea={setPolisombraArea}
            polisombraBloque={polisombraBloque}
            setPolisombraBloque={setPolisombraBloque}
            polisombraTunel={polisombraTunel}
            setPolisombraTunel={setPolisombraTunel}
            polisombraIntegrantes={polisombraIntegrantes}
            setPolisombraIntegrantes={setPolisombraIntegrantes}
            colaboradoresMock={COLABORADORES_MOCK}
            polisombraCantTotal={polisombraCantTotal}
            setPolisombraCantTotal={setPolisombraCantTotal}
            polisombraCantComp={polisombraCantComp}
            setPolisombraCantComp={setPolisombraCantComp}
            justificacionConfirmada={justificacionConfirmada}
            setJustificacionConfirmada={setJustificacionConfirmada}
            motivosJustificacion={motivosJustificacion}
            setMotivosJustificacion={setMotivosJustificacion}
            polisombraCondiciones={polisombraCondiciones}
            setPolisombraCondiciones={setPolisombraCondiciones}
            subtareasCobertura={subtareasCobertura}
            setSubtareasCobertura={setSubtareasCobertura}
            dispararToast={dispararToast}
            esValido={validacionPolisombra.esValido}
            notaSupervisorJustificacion={notaSupervisorJustificacion}
            setNotaSupervisorJustificacion={setNotaSupervisorJustificacion}
          />
        )}

        {tabActual === 'asistencia' && (
          <AsistenciaModulo
            modoSol={modoSol}
            colaboradoresMock={COLABORADORES_MOCK}
            diasSemana={DIAS_SEMANA}
            matrizAsistencia={matrizAsistencia}
            rotarAsistencia={rotarAsistencia}
            setMatrizAsistencia={setMatrizAsistencia}
            dispararToast={dispararToast}
            onMarcarTodosPresentes={marcarTodosPresentesHoy}
          />
        )}

        {tabActual === 'ausencias' && (
          <AusenciasModulo
            modoSol={modoSol}
            dispararToast={dispararToast}
          />
        )}

        {(tabActual === 'reportes' || tabActual === 'consulta') && (
          <ReportesModulo
            modoSol={modoSol}
            dispararToast={dispararToast}
          />
        )}

        {tabActual === 'incidentes' && (
          <IncidentesModulo
            modoSol={modoSol}
            incidentesLista={incidentesLista}
            setIncidentesLista={setIncidentesLista}
            modalIncidenteAbierto={modalIncidenteAbierto}
            setModalIncidenteAbierto={setModalIncidenteAbierto}
            incidenteHora={incidenteHora}
            setIncidenteHora={setIncidenteHora}
            incidenteSeveridad={incidenteSeveridad}
            setIncidenteSeveridad={setIncidenteSeveridad}
            incidenteArea={incidenteArea}
            setIncidenteArea={setIncidenteArea}
            incidenteDescripcion={incidenteDescripcion}
            setIncidenteDescripcion={setIncidenteDescripcion}
            incidenteAuxilios={incidenteAuxilios}
            setIncidenteAuxilios={setIncidenteAuxilios}
            dispararToast={dispararToast}
          />
        )}

        {tabActual === 'respaldos' && (
          <RespaldosModulo
            modoSol={modoSol}
            dispararToast={dispararToast}
          />
        )}

        {tabActual === 'casos_matematicos' && (
          <LaboratorioModulo modoSol={modoSol} />
        )}

        {tabActual === 'docs_tarea3' && (
          <DocumentosModulo
            modoSol={modoSol}
            version="tarea3"
            documentos={DOCUMENTOS_TAREA_3}
          />
        )}

        {tabActual === 'documentos' && (
          <DocumentosModulo
            modoSol={modoSol}
            version="tarea2"
            documentos={DOCUMENTOS_TAREA_2}
            docAbierto={docAbierto}
            setDocAbierto={setDocAbierto}
          />
        )}

        {tabActual === 'pwa_offline' && (
          <PwaSyncModulo
            modoSol={modoSol}
            isOnline={isOnline}
            totalPendientesLocal={totalPendientesLocal}
            pwaColaboradorTest={pwaColaboradorTest}
            setPwaColaboradorTest={setPwaColaboradorTest}
            pwaLaborTest={pwaLaborTest}
            setPwaLaborTest={setPwaLaborTest}
            pwaHorasTest={pwaHorasTest}
            setPwaHorasTest={setPwaHorasTest}
            pwaCantidadTest={pwaCantidadTest}
            setPwaCantidadTest={setPwaCantidadTest}
            colaboradoresMock={COLABORADORES_MOCK}
            guardarRegistroOfflineTest={guardarRegistroOfflineTest}
            ejecutarSincronizacionManual={ejecutarSincronizacionManual}
            pwaSyncCargando={pwaSyncCargando}
            pwaListaPendientes={pwaListaPendientes}
            refrescarColaPWA={refrescarColaPWA}
            solicitarPermisoNotificaciones={solicitarPermisoNotificaciones}
            descargarBackupJSON={descargarBackupJSON}
            pwaArchivoSeleccionado={pwaArchivoSeleccionado}
            setPwaArchivoSeleccionado={setPwaArchivoSeleccionado}
          />
        )}

        {tabActual === 'admin' && (
          <AdminModulo
            modoSol={modoSol}
            dispararToast={dispararToast}
            setTabActual={setTabActual}
            onRestauracionExitosa={hidratarDatosDesdeIndexedDB}
          />
        )}

        {/* Footer Barra de Estado NexoCampo PRO */}
        <footer className={`mt-6 mb-4 p-3 rounded-xl border text-xs space-y-2 ${
          modoSol ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>NexoCampo PRO v18.1.9</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">Motor Offline-First</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/40">
            <span>Áreas: Jamaica · Piloto · Púrpura · Naranja</span>
            <div className="flex items-center gap-2 font-mono font-medium text-emerald-400">
              <span>36 Colaboradores</span>
              <span>·</span>
              <span>23 Labores</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Barra de Navegación Inferior Canónica */}
      <Navigation
        tabActual={tabActual}
        setTabActual={setTabActual}
        modoSol={modoSol}
      />

      {/* Modal de Gestión de Usuarios */}
      {showUserManagement && (
        <UserManagement
          onClose={() => setShowUserManagement(false)}
        />
      )}
    </div>
    </div>
  );
};

export default App;
