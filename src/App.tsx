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
import { detectarSolapamientoTemporal } from './domain/businessRulesEngine';
import { COLABORADORES_CATALOGO, AREAS_AGRONOMICAS, LABORES_AGRONOMICAS } from './domain/catalogoAgronomico';
import {
  abrirDB,
  dbGetAll,
  guardarAsistenciaAtomica,
  guardarLoteAsistencia,
  cargarMatrizAsistenciaSemana,
  type JornadaRegistro,
  type TramoJornada,
  guardarJornadaRegistro
} from './domain/nexocampoDB';

// Componentes Modulares Desacoplados
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { ResumenModulo } from './components/resumen/ResumenModulo';
import { JornadasModulo } from './components/jornadas/JornadasModulo';
import { LaboresModulo } from './components/labores/LaboresModulo';
import { OficiosVariosModulo } from './components/oficios-varios/OficiosVariosModulo';
import { PlasticoModulo, type SubtareaItem } from './components/plastico/PlasticoModulo';
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
function fechaLocalHoy(): string {
  const hoy = new Date();
  const pad = (valor: number) => String(valor).padStart(2, '0');
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
}

function lunesSemanaActual(): string {
  const hoy = new Date(`${fechaLocalHoy()}T12:00:00`);
  const diasDesdeLunes = (hoy.getDay() + 6) % 7;
  hoy.setDate(hoy.getDate() - diasDesdeLunes);
  const pad = (valor: number) => String(valor).padStart(2, '0');
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
}

function fechaSemanaActual(diaIdx: number): string {
  const fecha = new Date(`${lunesSemanaActual()}T12:00:00`);
  fecha.setDate(fecha.getDate() + diaIdx);
  const pad = (valor: number) => String(valor).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

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

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Componente principal envuelto en AuthProvider
function App() {
  const [tabActual, setTabActual] = useState<string>('inicio');
  const [subTabRegistrar, setSubTabRegistrar] = useState<'labores' | 'polisombra' | 'oficios' | 'jornadas' | 'incidentes'>('labores');
  const [subTabReportes, setSubTabReportes] = useState<'rendimiento' | 'consulta'>('rendimiento');
  const [modoSol, setModoSol] = useState(true);
  const [docAbierto, setDocAbierto] = useState<string>('08');

  // Estado del Formulario de Plástico y Polisombra: sin datos precargados de demostración.
  const [polisombraFecha, setPolisombraFecha] = useState(() => {
    const hoy = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  });
  const [polisombraIntegrantes, setPolisombraIntegrantes] = useState<string[]>([]);
  const [polisombraInicio, setPolisombraInicio] = useState('');
  const [polisombraFin, setPolisombraFin] = useState('');
  const [polisombraArea, setPolisombraArea] = useState('');
  const [polisombraBloque, setPolisombraBloque] = useState('');
  const [polisombraTunel, setPolisombraTunel] = useState('');
  const [polisombraCantTotal, setPolisombraCantTotal] = useState(0);
  const [polisombraCantComp, setPolisombraCantComp] = useState(0);
  const [polisombraCondiciones, setPolisombraCondiciones] = useState<string[]>([]);
  const [subtareasCobertura, setSubtareasCobertura] = useState<SubtareaItem[]>([]);

  // La justificación solo se confirma cuando hay saldo pendiente.
  const [motivosJustificacion, setMotivosJustificacion] = useState<string[]>([]);
  const [justificacionConfirmada, setJustificacionConfirmada] = useState(false);
  const [notaSupervisorJustificacion, setNotaSupervisorJustificacion] = useState('');

  // Estado interactivo de Asistencia Semanal con persistencia real IndexedDB
  const [matrizAsistencia, setMatrizAsistencia] = useState<Record<string, 'sin_registrar' | 'presente' | 'retardo' | 'ausencia'>>({});
  const [jornadasTotales, setJornadasTotales] = useState<JornadaRegistro[]>([]);
  const [dbCargada, setDbCargada] = useState(false);

  // Fase 2: Hidratación inicial reactiva desde IndexedDB
  const hidratarDatosDesdeIndexedDB = async () => {
    try {
      await abrirDB();
      const matrizGuardada = await cargarMatrizAsistenciaSemana(lunesSemanaActual());
      if (Object.keys(matrizGuardada).length > 0) {
        setMatrizAsistencia(prev => ({ ...prev, ...matrizGuardada }));
      }
      const listaJornadas = await dbGetAll<JornadaRegistro>('jornadas');
      setJornadasTotales(listaJornadas || []);
      const incidentesPersistidos: IncidenteItem[] = (listaJornadas || []).flatMap((jornada) =>
        (jornada.tramos || [])
          .filter((tramo) => tramo.tipo === 'incidente')
          .map((tramo) => ({
            id: tramo.id,
            fecha: jornada.fecha,
            hora: tramo.hora_inicio,
            severidad: tramo.severidad || 'leve',
            tipo: tramo.titulo || 'Incidente registrado',
            area: tramo.area || 'Ubicación no especificada',
            descripcion: tramo.observaciones || '',
            primerosAuxilios: Boolean(tramo.primeros_auxilios),
            fotoDataUrl: tramo.foto_data_url,
            colaboradorId: jornada.colaboradores_ids[0]
          }))
      ).sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
      setIncidentesLista(incidentesPersistidos);
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
  const [consultaFecha, setConsultaFecha] = useState<string>(fechaLocalHoy());

  // Estado de Incidentes: formulario vacío y registros cargados desde IndexedDB.
  const [modalIncidenteAbierto, setModalIncidenteAbierto] = useState(false);
  const [incidenteFecha, setIncidenteFecha] = useState(fechaLocalHoy());
  const [incidenteHora, setIncidenteHora] = useState('');
  const [incidenteColaboradorId, setIncidenteColaboradorId] = useState('');
  const [incidenteSeveridad, setIncidenteSeveridad] = useState<'leve' | 'moderado' | 'grave'>('leve');
  const [incidenteArea, setIncidenteArea] = useState('');
  const [incidenteDescripcion, setIncidenteDescripcion] = useState('');
  const [incidenteAuxilios, setIncidenteAuxilios] = useState(false);
  const [incidentesLista, setIncidentesLista] = useState<IncidenteItem[]>([]);

  const guardarIncidentePersistido = async (incidente: IncidenteItem) => {
    const ahora = new Date().toISOString();
    const jornada: JornadaRegistro = {
      id: `jornada_incidente_${incidente.fecha}_${Date.now()}`,
      fecha: incidente.fecha,
      colaboradores_ids: incidente.colaboradorId ? [incidente.colaboradorId] : [],
      tramos: [{
        id: incidente.id,
        tipo: 'incidente',
        titulo: incidente.tipo,
        hora_inicio: incidente.hora,
        hora_fin: incidente.hora,
        area: incidente.area,
        severidad: incidente.severidad as 'leve' | 'moderado' | 'grave',
        primeros_auxilios: incidente.primerosAuxilios,
        ...(incidente.fotoDataUrl ? { foto_data_url: incidente.fotoDataUrl } : {}),
        observaciones: incidente.descripcion,
        estandar_min: null
      }],
      creadoEn: ahora,
      actualizadoEn: ahora,
      sincronizado: false
    };
    await guardarJornadaRegistro(jornada);
    await hidratarDatosDesdeIndexedDB();
    dispararToast('Incidente guardado en IndexedDB.');
  };

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
        fecha: fechaLocalHoy(),
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
      a.download = `nexocampo_db_backup_${fechaLocalHoy()}.json`;
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

    // Confirmar primero la persistencia para no mostrar como guardado un cambio fallido.
    try {
      const fechaCalculada = fechaSemanaActual(diaIdx);
      await guardarAsistenciaAtomica(colId, fechaCalculada, siguiente);
      setMatrizAsistencia(prev => ({ ...prev, [key]: siguiente }));
      dispararToast(`✓ Asistencia guardada (${colId}, ${DIAS_SEMANA[diaIdx]}): ${siguiente}`);
    } catch (e) {
      dispararToast('No se pudo guardar la asistencia. El estado anterior se conserva.');
    }
  };

  const marcarTodosPresentesHoy = async () => {
    const actualizada = { ...matrizAsistencia };
    const lote: Array<{ colaborador_id: string; fecha: string; estado: 'presente' }> = [];
    const fechaHoy = fechaLocalHoy();
    const diaHoyIdx = (new Date(`${fechaHoy}T12:00:00`).getDay() + 6) % 7;

    COLABORADORES_MOCK.forEach(c => {
      actualizada[`${c.id}-${diaHoyIdx}`] = 'presente';
      lote.push({ colaborador_id: c.id, fecha: fechaHoy, estado: 'presente' });
    });

    try {
      await guardarLoteAsistencia(lote);
      setMatrizAsistencia(actualizada);
      dispararToast('✓ Pase de lista matutino guardado.');
    } catch (e) {
      dispararToast('No se pudo guardar el pase de lista. No se modificó la matriz.');
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

  const guardarRegistroPlasticoPolisombra = async () => {
    if (!validacionPolisombra.esValido) {
      throw new Error('Corrige los campos de la labor principal antes de guardar.');
    }
    if (!polisombraArea || !polisombraBloque || !polisombraTunel) {
      throw new Error('Selecciona área, bloque y túnel de la labor principal.');
    }
    if (polisombraCantComp < polisombraCantTotal &&
        (!justificacionConfirmada || motivosJustificacion.length === 0)) {
      throw new Error('Confirma una justificación válida para el saldo pendiente.');
    }
    if (subtareasCobertura.some((st) =>
      !st.nombre.trim() || !st.tipoPolisombra || st.cant < 1 ||
      st.completados < 0 || st.completados > st.cant ||
      !st.area.trim() || !st.bloque.trim() || !st.tunel.trim()
    )) {
      throw new Error('Completa tipo, ubicación y cantidades válidas en todas las subtareas.');
    }
    if (subtareasCobertura.some((st) => st.completados < st.cant) &&
        (!justificacionConfirmada || motivosJustificacion.length === 0)) {
      throw new Error('Confirma la justificación de las subtareas pendientes.');
    }

    const jornadasExistentes = await dbGetAll<JornadaRegistro>('jornadas');
    const jornadaBase = jornadasExistentes.find((jornada) =>
      jornada.fecha === polisombraFecha &&
      (jornada.tramos || []).some((tramo) => tramo.tipo === 'jornada_base') &&
      polisombraIntegrantes.every((id) => jornada.colaboradores_ids.includes(id))
    );
    const tramoBase = jornadaBase?.tramos.find((tramo) => tramo.tipo === 'jornada_base');
    if (!jornadaBase || !tramoBase) {
      throw new Error('Registra primero una jornada base que incluya a los seis integrantes seleccionados.');
    }
    if (polisombraInicio < tramoBase.hora_inicio || polisombraFin > tramoBase.hora_fin) {
      throw new Error(`El horario debe quedar dentro de la jornada base ${tramoBase.hora_inicio}–${tramoBase.hora_fin}.`);
    }

    for (const colaboradorId of polisombraIntegrantes) {
      const delDia = jornadasExistentes.filter((jornada) =>
        jornada.fecha === polisombraFecha && jornada.colaboradores_ids.includes(colaboradorId)
      );
      const intervalos = delDia.flatMap((jornada) => (jornada.tramos || [])
        .filter((tramo) => tramo.tipo === 'labor' && !tramo.es_subtarea && tramo.estado !== 'no_cumple' &&
          Boolean(tramo.hora_inicio) && Boolean(tramo.hora_fin))
        .map((tramo) => ({
          id: tramo.id,
          colaboradorId,
          horaInicio: tramo.hora_inicio,
          horaFin: tramo.hora_fin
        })));
      const conflicto = detectarSolapamientoTemporal(intervalos, {
        id: `validar_plastico_${colaboradorId}_${Date.now()}`,
        colaboradorId,
        horaInicio: polisombraInicio,
        horaFin: polisombraFin
      });
      if (conflicto.haySolapamiento) {
        const nombre = COLABORADORES_CATALOGO.find((c) => c.id === colaboradorId)?.nombreCompleto || colaboradorId;
        throw new Error(`${nombre}: ${conflicto.mensajeError || 'el horario se solapa con otra labor'}`);
      }
    }

    const ahora = new Date().toISOString();
    const marca = Date.now();
    const jornadaId = `jornada_plastico_${polisombraFecha}_${marca}`;
    const idTramoPrincipal = `tramo_plastico_${marca}`;
    const laborPlastico = LABORES_AGRONOMICAS.find((l) => l.nombre === 'Instalar plásticos');
    const laborSombra = LABORES_AGRONOMICAS.find((l) => l.nombre === 'Instalar sombras');
    const avancePrincipal = polisombraCantTotal > 0
      ? Number(((polisombraCantComp / polisombraCantTotal) * 100).toFixed(2))
      : 0;
    const motivoPendiente = motivosJustificacion.join(', ');

    const tramoPrincipal: TramoJornada = {
      id: idTramoPrincipal,
      tipo: 'labor',
      titulo: 'Instalar plásticos',
      labor_id: laborPlastico?.id,
      labor_nombre: laborPlastico?.nombre || 'Instalar plásticos',
      unidad: 'túnel',
      estandar_min: null,
      personal_requerido_tabla: laborPlastico?.personalReferencia || 6,
      personas_reales: polisombraIntegrantes.length,
      modelo: 'grupal_meta',
      hora_inicio: polisombraInicio,
      hora_fin: polisombraFin,
      area: polisombraArea,
      bloque: polisombraBloque,
      tunel: polisombraTunel,
      unidades: polisombraCantTotal,
      meta: polisombraCantTotal,
      completados: polisombraCantComp,
      estado: polisombraCantComp >= polisombraCantTotal ? 'cumple' : 'pendiente',
      ...(polisombraCantComp < polisombraCantTotal ? { motivo_pendiente: motivoPendiente } : {}),
      observaciones: notaSupervisorJustificacion.trim() || undefined,
      especial: 'plastico_polisombra',
      operacion: 'instalar',
      material_tipo: 'plastico',
      modalidad: 'grupal',
      condiciones: [...polisombraCondiciones],
      motivos_pendiente: polisombraCantComp < polisombraCantTotal ? [...motivosJustificacion] : [],
      avance_pct: avancePrincipal,
      ubicaciones: [{ area: polisombraArea, bloque: polisombraBloque, tunel: polisombraTunel }]
    };

    const tramosSubtareas: TramoJornada[] = subtareasCobertura.map((st, index) => ({
      id: `tramo_polisombra_${marca}_${index}`,
      continuidad_id: idTramoPrincipal,
      ejecucion_id: jornadaId,
      tipo: 'labor',
      titulo: st.nombre,
      labor_id: laborSombra?.id,
      labor_nombre: st.nombre,
      unidad: st.unidad || 'túnel',
      estandar_min: null,
      personal_requerido_tabla: laborSombra?.personalReferencia || 6,
      personas_reales: polisombraIntegrantes.length,
      modelo: 'grupal_meta',
      hora_inicio: polisombraInicio,
      hora_fin: polisombraFin,
      area: st.area,
      bloque: st.bloque,
      tunel: st.tunel,
      unidades: st.cant,
      completados: st.completados,
      estado: st.completados >= st.cant ? 'cumple' : 'pendiente',
      ...(st.completados < st.cant ? { motivo_pendiente: motivoPendiente } : {}),
      observaciones: notaSupervisorJustificacion.trim() || undefined,
      especial: 'plastico_polisombra',
      operacion: 'instalar',
      material_tipo: 'polisombra',
      modalidad: 'grupal',
      tipo_polisombra: st.tipoPolisombra,
      es_subtarea: true,
      condiciones: [...polisombraCondiciones],
      motivos_pendiente: st.completados < st.cant ? [...motivosJustificacion] : [],
      avance_pct: st.cant > 0 ? Number(((st.completados / st.cant) * 100).toFixed(2)) : 0,
      ubicaciones: [{ area: st.area, bloque: st.bloque, tunel: st.tunel }]
    }));

    const jornada: JornadaRegistro = {
      id: jornadaId,
      fecha: polisombraFecha,
      jornada_base_id: jornadaBase.jornada_base_id || jornadaBase.id,
      colaboradores_ids: [...polisombraIntegrantes],
      tramos: [tramoPrincipal, ...tramosSubtareas],
      creadoEn: ahora,
      actualizadoEn: ahora,
      sincronizado: false
    };

    await guardarJornadaRegistro(jornada);
    setJornadasTotales((prev) => [...prev, jornada]);
    setPolisombraIntegrantes([]);
    setPolisombraCantTotal(0);
    setPolisombraCantComp(0);
    setPolisombraCondiciones([]);
    setSubtareasCobertura([]);
    setMotivosJustificacion([]);
    setJustificacionConfirmada(false);
    setNotaSupervisorJustificacion('');
    setPolisombraInicio('');
    setPolisombraFin('');
    dispararToast('Registro de Plástico/Polisombra guardado en IndexedDB.');
  };

  return (
    <div className={`min-h-screen transition-colors duration-150 ${modoSol ? 'bg-[#f1f5f9] text-[#334155]' : 'bg-slate-950 text-slate-100'} font-sans`}>
      <div data-theme={modoSol ? "light" : "dark"} className={`app-shell max-w-[28rem] w-full mx-auto min-h-screen flex flex-col relative shadow-2xl ${modoSol ? 'bg-[#f8fafc]' : 'bg-slate-900'} pb-32`}>
        
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
        />

        {/* Modal Guía iOS */}
        {showIOSPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-5 text-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Instalar en iPhone / iPad
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
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

        {/* Botón Flotante Canónico de Notificaciones / Alertas */}
        <button
          type="button"
          onClick={() => setTabActual('admin')}
          className={`fixed right-4 bottom-20 z-40 w-11 h-11 rounded-full border shadow-xl flex items-center justify-center text-lg active:scale-95 transition-transform ${
            modoSol ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-200'
          }`}
          aria-label="Notificaciones y Administración"
          title="Notificaciones y Administración"
        >
          🔔
          {totalPendientesLocal > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
              {totalPendientesLocal}
            </span>
          )}
        </button>

        {/* Feedback Toast */}
        {toastMensaje && (
          <div className="fixed bottom-16 left-4 right-4 max-w-xs mx-auto z-50 bg-emerald-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 shadow-[0_8px_24px_rgba(22,63,43,0.22)]">
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
            onGuardarRegistro={guardarRegistroPlasticoPolisombra}
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
          <div className="space-y-4">
            <div className={`flex rounded-xl p-1 border ${modoSol ? 'bg-slate-200 border-slate-300' : 'bg-slate-800/80 border-slate-700/60'}`}>
              <button
                type="button"
                onClick={() => { setTabActual('reportes'); setSubTabReportes('rendimiento'); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
                  tabActual === 'reportes' && subTabReportes === 'rendimiento'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileBarChart className="w-3.5 h-3.5" />
                <span>Reportes Consolidados</span>
              </button>
              <button
                type="button"
                onClick={() => { setTabActual('reportes'); setSubTabReportes('consulta'); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
                  tabActual === 'consulta' || (tabActual === 'reportes' && subTabReportes === 'consulta')
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Consulta Cruzada</span>
              </button>
            </div>

            {(tabActual === 'consulta' || (tabActual === 'reportes' && subTabReportes === 'consulta')) ? (
              <ConsultaCruzadaModulo
                modoSol={modoSol}
                colaboradoresMock={COLABORADORES_MOCK}
                consultaColaborador={consultaColaborador}
                setConsultaColaborador={setConsultaColaborador}
                consultaFecha={consultaFecha}
                setConsultaFecha={setConsultaFecha}
              />
            ) : (
              <ReportesModulo
                modoSol={modoSol}
                dispararToast={dispararToast}
              />
            )}
          </div>
        )}

        {tabActual === 'incidentes' && (
          <IncidentesModulo
            modoSol={modoSol}
            incidentesLista={incidentesLista}
            setIncidentesLista={setIncidentesLista}
            modalIncidenteAbierto={modalIncidenteAbierto}
            setModalIncidenteAbierto={setModalIncidenteAbierto}
            incidenteFecha={incidenteFecha}
            setIncidenteFecha={setIncidenteFecha}
            incidenteHora={incidenteHora}
            setIncidenteHora={setIncidenteHora}
            incidenteColaboradorId={incidenteColaboradorId}
            setIncidenteColaboradorId={setIncidenteColaboradorId}
            onGuardarIncidente={guardarIncidentePersistido}
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
            onRestauracionExitosa={hidratarDatosDesdeIndexedDB}
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



      </main>

      {/* Barra de Navegación Inferior Canónica */}
      <Navigation
        tabActual={tabActual}
        setTabActual={setTabActual}
        modoSol={modoSol}
      />

    </div>
    </div>
  );
};

export default App;
