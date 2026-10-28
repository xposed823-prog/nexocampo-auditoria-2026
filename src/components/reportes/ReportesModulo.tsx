import React, { useState, useEffect, useCallback } from 'react';
import {
  consultarReportePeriodo,
  consultarColaboradorFecha,
  ResultadoReporteConsolidado,
  ResultadoConsultaCruzada,
  suscribirMutacionDatos
} from '../../domain/consultaDominioService';
import { COLABORADORES_CATALOGO } from '../../domain/catalogoAgronomico';

export interface ReportesModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

export const ReportesModulo: React.FC<ReportesModuloProps> = ({ dispararToast }) => {
  // Pestañas superiores (Imagen 1)
  const [subPestana, setSubPestana] = useState<'jornadas' | 'rendimientos'>('rendimientos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'hoy' | '7dias' | '30dias' | 'todo'>('hoy');

  // Filtros de fecha dinámicos
  const [fechaInicio, setFechaInicio] = useState('2026-10-21');
  const [fechaFin, setFechaFin] = useState('2026-10-21');

  // Consulta Cruzada integrada (Imagen 1)
  const [consultaColaborador, setConsultaColaborador] = useState<string>('');
  const [consultaFecha, setConsultaFecha] = useState<string>('2026-10-21');
  const [resultadoCruzada, setResultadoCruzada] = useState<ResultadoConsultaCruzada | null>(null);
  const [consultandoCruzada, setConsultandoCruzada] = useState<boolean>(false);

  // Estado del reporte consolidado
  const [reporte, setReporte] = useState<ResultadoReporteConsolidado | null>(null);
  const [cargando, setCargando] = useState(true);

  // Manejo de cambio de filtro de tiempo
  const aplicarFiltroPeriodo = (tipo: 'hoy' | '7dias' | '30dias' | 'todo') => {
    setFiltroPeriodo(tipo);
    const hoy = '2026-10-21';
    if (tipo === 'hoy') {
      setFechaInicio(hoy);
      setFechaFin(hoy);
    } else if (tipo === '7dias') {
      setFechaInicio('2026-10-15');
      setFechaFin(hoy);
    } else if (tipo === '30dias') {
      setFechaInicio('2026-09-21');
      setFechaFin(hoy);
    } else {
      setFechaInicio('2026-01-01');
      setFechaFin('2026-12-31');
    }
  };

  const cargarReporte = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return;
    setCargando(true);
    try {
      const res = await consultarReportePeriodo(fechaInicio, fechaFin);
      setReporte(res);
    } catch (e: any) {
      console.warn('[ReportesModulo] Error al consultar reporte:', e);
    } finally {
      setCargando(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    cargarReporte();

    const desuscribir = suscribirMutacionDatos((evento) => {
      if (['jornadas', 'asistencia', 'ausencias'].includes(evento.almacen)) {
        cargarReporte();
      }
    });

    return () => {
      desuscribir();
    };
  }, [cargarReporte]);

  const ejecutarConsultaCruzada = async () => {
    if (!consultaColaborador) {
      dispararToast('Selecciona un colaborador para consultar');
      return;
    }
    setConsultandoCruzada(true);
    try {
      const res = await consultarColaboradorFecha(consultaColaborador, consultaFecha);
      setResultadoCruzada(res);
    } catch (e: any) {
      dispararToast(`Error al consultar: ${e?.message || 'Error en base de datos'}`);
    } finally {
      setConsultandoCruzada(false);
    }
  };

  const exportarCSV = () => {
    if (!reporte) return;
    const encabezados = ['Labor', 'Completado', 'Pendiente', 'Minutos_Efectivos', 'Rendimiento_Ponderado_Pct'];
    const filas = (reporte.laboresDesglose || []).map(l => [
      `"${l.laborNombre}"`,
      l.cantidadCompletada,
      l.cantidadPendiente,
      l.minutosEfectivosTotales,
      l.rendimientoPonderadoPct !== null ? `${l.rendimientoPonderadoPct}%` : 'N/C'
    ]);
    const contenido = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_NexoCampo_${fechaInicio}_${fechaFin}.csv`;
    link.click();
    dispararToast('✓ Reporte exportado en formato CSV');
  };

  const promedioGeneralStr = reporte?.eficienciaPonderadaGlobalPct !== null && reporte?.eficienciaPonderadaGlobalPct !== undefined
    ? `${reporte.eficienciaPonderadaGlobalPct.toFixed(1)}%`
    : '0.0%';

  const jornadasCount = reporte?.conteoJornadasUnicas || 0;
  const pendientesCount = reporte?.totalUnidadesPendientes || 0;

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* 1. PESTAÑAS SUPERIORES (JORNADAS / RENDIMIENTOS) - Imagen 1 */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setSubPestana('jornadas')}
          className={`p-3 rounded-2xl border text-left transition-all active:scale-98 ${
            subPestana === 'jornadas'
              ? 'bg-white border-emerald-500/50 shadow-sm'
              : 'bg-white/80 border-slate-200/90 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block leading-tight">Jornadas</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Lista general · solo lectura</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSubPestana('rendimientos')}
          className={`p-3 rounded-2xl border text-left transition-all active:scale-98 ${
            subPestana === 'rendimientos'
              ? 'bg-white border-emerald-500/50 shadow-sm'
              : 'bg-white/80 border-slate-200/90 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block leading-tight">Rendimientos</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Resumen general · solo lectura</span>
            </div>
          </div>
        </button>
      </div>

      {/* 2. PASTILLAS DE FILTRO TEMPORAL: Hoy | 7 días | 30 días | Todo - Imagen 1 */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => aplicarFiltroPeriodo('hoy')}
          className={`px-4 py-1.5 rounded-full font-bold transition-all ${
            filtroPeriodo === 'hoy'
              ? 'bg-[#047857] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Hoy
        </button>

        <button
          type="button"
          onClick={() => aplicarFiltroPeriodo('7dias')}
          className={`px-4 py-1.5 rounded-full font-bold transition-all ${
            filtroPeriodo === '7dias'
              ? 'bg-[#047857] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          7 días
        </button>

        <button
          type="button"
          onClick={() => aplicarFiltroPeriodo('30dias')}
          className={`px-4 py-1.5 rounded-full font-bold transition-all ${
            filtroPeriodo === '30dias'
              ? 'bg-[#047857] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          30 días
        </button>

        <button
          type="button"
          onClick={() => aplicarFiltroPeriodo('todo')}
          className={`px-4 py-1.5 rounded-full font-bold transition-all ${
            filtroPeriodo === 'todo'
              ? 'bg-[#047857] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todo
        </button>
      </div>

      {/* 3. HERO CARD PROMEDIO GENERAL (0.0% VERDE OSCURO GRADIENTE) - Imagen 1 */}
      <div className="rounded-3xl p-6 bg-gradient-to-b from-[#064e3b] via-[#064e3b] to-[#022c22] text-white shadow-md text-center space-y-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 block">
          PROMEDIO GENERAL
        </span>
        <div className="text-5xl font-black tracking-tight my-1 text-white">
          {cargando ? '...' : promedioGeneralStr}
        </div>
        <span className="text-xs text-emerald-100/70 font-medium block">
          {jornadasCount} jornada(s) · {pendientesCount} con pendientes excluidas
        </span>
      </div>

      {/* 4. CARD INFORMATIVA: ¿Qué significa el %? - Imagen 1 */}
      <div className="rounded-2xl p-4 bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] space-y-1">
        <div className="flex items-center gap-1.5 font-black text-xs text-[#14532d]">
          <span>💡</span>
          <span>¿Qué significa el %?</span>
        </div>
        <p className="text-xs text-[#166534] leading-relaxed">
          <strong>100%</strong> = cumpliste la meta diaria oficial. Las jornadas con tramos pendientes <strong>no entran</strong> al promedio hasta que se cierren.
        </p>
      </div>

      {/* 5. CARD BLANCA: CONSULTA CRUZADA - Imagen 1 */}
      <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>🔎</span>
            <span>CONSULTA CRUZADA</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Asistencia + jornada + ausencia de un colaborador por fecha.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Colaborador
            </label>
            <select
              value={consultaColaborador}
              onChange={(e) => setConsultaColaborador(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="">Seleccionar colaborador</option>
              {COLABORADORES_CATALOGO.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombreCompleto || c.alias}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={consultaFecha}
              onChange={(e) => setConsultaFecha(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={ejecutarConsultaCruzada}
          disabled={consultandoCruzada}
          className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all disabled:opacity-50"
        >
          <span>🔍</span>
          <span>{consultandoCruzada ? 'Consultando...' : 'Consultar'}</span>
        </button>

        {!resultadoCruzada && (
          <p className="text-xs text-slate-400 text-center pt-1 font-medium">
            Selecciona un colaborador y una fecha.
          </p>
        )}

        {/* Despliegue de Resultados Vivos de la Consulta Cruzada */}
        {resultadoCruzada && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800">
                {resultadoCruzada.colaborador?.nombre || 'Colaborador'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                resultadoCruzada.estadoIntegridad === 'EXITO_COMPLETO'
                  ? 'bg-emerald-100 text-emerald-800'
                  : resultadoCruzada.estadoIntegridad === 'SIN_REGISTROS'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {resultadoCruzada.estadoIntegridad === 'EXITO_COMPLETO' ? 'Registrado' : resultadoCruzada.mensajeEstado}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Asistencia</span>
                <span className="font-semibold text-slate-700">{resultadoCruzada.asistencia.detalleTexto}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Producción Válida</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {resultadoCruzada.metricasConsolidadas.produccionCompletadaValida} uds
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. BOTÓN AZUL OSCURO: EXPORTAR CSV - Imagen 1 */}
      <button
        type="button"
        onClick={exportarCSV}
        className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#1e293b] hover:bg-[#0f172a] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
      >
        <span>📥</span>
        <span>Exportar CSV</span>
      </button>
    </div>
  );
};
