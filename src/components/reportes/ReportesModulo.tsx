import React, { useState, useEffect, useCallback } from 'react';
import {
  FileBarChart,
  Printer,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers,
  Users,
  CheckCircle2,
  Clock,
  Info,
  Download
} from 'lucide-react';
import {
  consultarReportePeriodo,
  ResultadoReporteConsolidado,
  suscribirMutacionDatos
} from '../../domain/consultaDominioService';

export interface ReportesModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

function fechaLocalDesplazada(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

export const ReportesModulo: React.FC<ReportesModuloProps> = ({ modoSol, dispararToast }) => {
  const [fechaInicio, setFechaInicio] = useState(() => fechaLocalDesplazada(-6));
  const [fechaFin, setFechaFin] = useState(() => fechaLocalDesplazada(0));
  const [cuadrilla, setCuadrilla] = useState('todas');
  const [reporte, setReporte] = useState<ResultadoReporteConsolidado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorLectura, setErrorLectura] = useState<string | null>(null);

  const cargarReporte = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return;
    setCargando(true);
    setErrorLectura(null);
    try {
      const res = await consultarReportePeriodo(fechaInicio, fechaFin, {
        cuadrilla: cuadrilla === 'todas' ? undefined : cuadrilla
      });
      setReporte(res);
      if (res.estadoIntegridad === 'ERROR_LECTURA') {
        setErrorLectura(res.mensajeEstado);
      }
    } catch (e: any) {
      setErrorLectura(`Error al generar reporte: ${e?.message || 'Error en IndexedDB'}`);
    } finally {
      setCargando(false);
    }
  }, [fechaInicio, fechaFin, cuadrilla]);

  useEffect(() => {
    cargarReporte();

    // Actualización reactiva ante mutaciones en base de datos
    const desuscribir = suscribirMutacionDatos((evento) => {
      if (['jornadas', 'asistencia', 'ausencias'].includes(evento.almacen)) {
        cargarReporte();
      }
    });

    return () => {
      desuscribir();
    };
  }, [cargarReporte]);

  const exportarCSV = () => {
    if (!reporte) {
      dispararToast('Primero genera el reporte del periodo seleccionado.');
      return;
    }
    const filas: Array<Array<string | number | null | undefined>> = [
      ['Sección', 'Indicador', 'Valor'],
      ['Periodo', 'Fecha inicial', reporte.periodo.fechaInicio],
      ['Periodo', 'Fecha final', reporte.periodo.fechaFin],
      ['Resumen', 'Estado de integridad', reporte.estadoIntegridad],
      ['Resumen', 'Jornadas únicas', reporte.conteoJornadasUnicas],
      ['Resumen', 'Tramos registrados', reporte.conteoTramosTotales],
      ['Resumen', 'Minutos técnicos computables', reporte.minutosTotalesEfectivos],
      ['Resumen', 'Horas técnicas computables', reporte.horasTotalesEfectivas],
      ['Resumen', 'Rendimiento técnico ponderado (%)', reporte.eficienciaPonderadaGlobalPct],
      ['Resumen', 'Cumplimiento de metas (%)', reporte.cumplimientoMetasGlobalPct],
      ['Resumen', 'Unidades completadas', reporte.totalUnidadesCompletadas],
      ['Resumen', 'Unidades pendientes', reporte.totalUnidadesPendientes],
      ['Resumen', 'Ausencias', reporte.totalAusenciasPeriodo],
      ['Resumen', 'Incidentes', reporte.totalIncidentesPeriodo]
    ];
    if (reporte.oficiosVariosResumen) {
      filas.push(['Oficios Varios', 'Registros', reporte.oficiosVariosResumen.registros]);
      filas.push(['Oficios Varios', 'Tareas asignadas', reporte.oficiosVariosResumen.tareasAsignadas]);
      filas.push(['Oficios Varios', 'Tareas completadas', reporte.oficiosVariosResumen.tareasCompletadas]);
      filas.push(['Oficios Varios', 'Cumplimiento operativo (%)', reporte.oficiosVariosResumen.cumplimientoPct]);
    }
    filas.push([]);
    filas.push(['Detalle de labores', 'Labor', 'Unidad', 'Completadas', 'Pendientes', 'Minutos efectivos', 'Tiempo estándar (min)', 'Cumplimiento meta (%)', 'Rendimiento ponderado (%)']);
    reporte.laboresDesglose.forEach((item) => {
      filas.push([
        'Detalle de labores', item.laborNombre, item.unidad, item.cantidadCompletada,
        item.cantidadPendiente, item.minutosEfectivosTotales, item.tiempoEstandarTotalMinutos,
        item.cumplimientoMetaPct, item.rendimientoPonderadoPct
      ]);
    });

    const escapar = (valor: string | number | null | undefined) =>
      `"${String(valor ?? '').replace(/"/g, '""')}"`;
    const csv = filas.map((fila) => fila.map(escapar).join(';')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexocampo-reporte-${fechaInicio}-${fechaFin}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    dispararToast('Reporte CSV descargado.');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FileBarChart className="w-4 h-4 text-emerald-500" />
              Módulo de Reportes Agrícolas y Rendimiento Ponderado
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidados de campo calculados sobre registros reales persistidos en IndexedDB. Fórmulas oficiales con media ponderada por tiempo efectivo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => cargarReporte()}
              disabled={cargando}
              className="min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              aria-label="Actualizar datos del reporte"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${cargando ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <button
              onClick={exportarCSV}
              disabled={!reporte || cargando}
              className="min-h-[40px] px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              aria-label="Exportar reporte a CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="min-h-[40px] px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              aria-label="Imprimir informe actual"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Informe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controles de Filtro de Periodo y Cuadrilla */}
      <div className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Filtrar por Cuadrilla</label>
          <select
            value={cuadrilla}
            onChange={(e) => setCuadrilla(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-100"
          >
            <option value="todas">Todas las cuadrillas</option>
            <option value="A">Cuadrilla A</option>
            <option value="B">Cuadrilla B</option>
            <option value="C">Cuadrilla C</option>
          </select>
        </div>
      </div>

      {/* Spinner de Carga */}
      {cargando && (
        <div className="p-8 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
          <p className="text-xs text-slate-400">Consolidando registros de jornadas y labores desde IndexedDB...</p>
        </div>
      )}

      {/* Error de lectura */}
      {errorLectura && !cargando && (
        <div className="p-4 rounded-xl border bg-rose-950/40 border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error al procesar el reporte</p>
            <p className="mt-0.5">{errorLectura}</p>
          </div>
        </div>
      )}

      {/* Mensaje de Periodo Sin Registros */}
      {reporte && reporte.conteoJornadasUnicas === 0 && !cargando && (
        <div className={`p-8 rounded-xl border text-center space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/30 border-slate-700/60'}`}>
          <Calendar className="w-8 h-8 mx-auto text-slate-500" />
          <p className="text-xs font-semibold text-slate-300">
            Sin jornadas registradas entre {fechaInicio} y {fechaFin}.
          </p>
          <p className="text-[11px] text-slate-500">
            No se emiten porcentajes ficticios. Registre jornadas en el módulo correspondiente para generar el consolidado.
          </p>
        </div>
      )}

      {/* Indicadores Clave Derivados de Datos Reales */}
      {reporte && reporte.conteoJornadasUnicas > 0 && !cargando && (
        <div className="space-y-6">
          {/* Tarjetas de Indicadores Globales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1. Jornadas Únicas Consolidadas */}
            <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Jornadas Únicas</span>
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                {reporte.conteoJornadasUnicas}
              </p>
              <div className="text-[10px] text-slate-400">
                <span>{reporte.conteoTramosTotales} tramos de labor</span>
                {reporte.conteoTramosTotales > reporte.conteoJornadasUnicas && (
                  <span className="text-emerald-400 block font-medium">✓ Sin duplicidad de jornada</span>
                )}
              </div>
            </div>

            {/* 2. Eficiencia Ponderada Global */}
            <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Eficiencia Ponderada</span>
                <Layers className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-sky-400">
                {reporte.eficienciaPonderadaGlobalPct !== null
                  ? `${reporte.eficienciaPonderadaGlobalPct}%`
                  : 'N/C'}
              </p>
              <span className="text-[10px] text-slate-400 block">
                {reporte.estadoCalculoEficiencia === 'CALCULADO_VALIDO'
                  ? `${reporte.horasTotalesEfectivas} hrs efectivas ponderadas`
                  : reporte.mensajeEficiencia}
              </span>
            </div>

            {/* 3. Cumplimiento de Metas Físicas */}
            <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Cumplimiento Metas</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-amber-400">
                {reporte.cumplimientoMetasGlobalPct !== null
                  ? `${reporte.cumplimientoMetasGlobalPct}%`
                  : 'N/C'}
              </p>
              <span className="text-[10px] text-slate-400 block">
                {reporte.cumplimientoMetasGlobalPct !== null
                  ? `${reporte.totalUnidadesCompletadas} unidades válidas`
                  : 'Sin metas asignadas'}
              </span>
            </div>

            {/* 4. Colaboradores y Ausencias */}
            <div className={`p-4 rounded-xl border space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase">Personal en Campo</span>
                <Users className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-200">
                {reporte.colaboradoresParticipantes}
              </p>
              <span className="text-[10px] text-slate-400 block">
                {reporte.totalAusenciasPeriodo} ausencias · {reporte.totalIncidentesPeriodo} incidentes
              </span>
            </div>

          </div>

          {reporte.oficiosVariosResumen && reporte.oficiosVariosResumen.registros > 0 && (
            <section className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <div>
                <h3 className="text-xs font-bold text-violet-400">Oficios Varios · cumplimiento operativo</h3>
                <p className="text-[11px] mt-1 text-slate-400">
                  Se mide por tareas asignadas/completadas y se mantiene separado del rendimiento técnico temporal.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-900/50 p-3">
                  <p className="text-[10px] text-slate-400">Registros</p>
                  <p className="text-lg font-bold font-mono text-slate-100">{reporte.oficiosVariosResumen.registros}</p>
                </div>
                <div className="rounded-lg bg-slate-900/50 p-3">
                  <p className="text-[10px] text-slate-400">Tareas completadas / asignadas</p>
                  <p className="text-lg font-bold font-mono text-slate-100">
                    {reporte.oficiosVariosResumen.tareasCompletadas} / {reporte.oficiosVariosResumen.tareasAsignadas}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-900/50 p-3">
                  <p className="text-[10px] text-slate-400">Cumplimiento operativo</p>
                  <p className="text-lg font-bold font-mono text-violet-400">
                    {reporte.oficiosVariosResumen.cumplimientoPct !== null
                      ? `${reporte.oficiosVariosResumen.cumplimientoPct}%`
                      : 'N/C'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Detalle de Saldos Pendientes (Invariante de no conteo como completado) */}
          {reporte.totalUnidadesPendientes > 0 && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              modoSol ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}>
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Regla de Integridad de Saldos:</span>
                <p className="mt-0.5">
                  Se detectaron <span className="font-mono font-bold">{reporte.totalUnidadesPendientes}</span> unidades con estado «pendiente». De acuerdo con la norma técnica de auditoría, estas unidades <span className="underline font-bold">no suman</span> a la producción completada ni distorsionan el cumplimiento.
                </p>
              </div>
            </div>
          )}

          {/* Tabla de Consolidación por Labor Agronómica */}
          <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Consolidación por Labor Realizada</span>
            </h3>

            {reporte.laboresDesglose.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Sin desglose de labores disponible.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                      <th className="py-2 pr-3">Labor Agronómica</th>
                      <th className="py-2 px-3 text-right">Completado</th>
                      <th className="py-2 px-3 text-right">Pendiente</th>
                      <th className="py-2 px-3 text-right">Tiempo Efectivo</th>
                      <th className="py-2 px-3 text-right">Cumplimiento Meta</th>
                      <th className="py-2 pl-3 text-right">Rendimiento Técnico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {reporte.laboresDesglose.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 pr-3">
                          <span className="font-medium text-slate-200 block">{item.laborNombre}</span>
                          <span className="text-[10px] text-slate-500">Unidad: {item.unidad}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                          {item.cantidadCompletada} {item.unidad}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                          {item.cantidadPendiente > 0 ? `${item.cantidadPendiente} (saldo)` : '0'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                          {item.minutosEfectivosTotales} min
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {item.cumplimientoMetaPct !== null ? (
                            <span className="text-sky-300 font-semibold">{item.cumplimientoMetaPct}%</span>
                          ) : (
                            <span className="text-slate-500">Sin meta</span>
                          )}
                        </td>
                        <td className="py-2.5 pl-3 text-right font-mono">
                          {item.tieneEstandar && item.rendimientoPonderadoPct !== null ? (
                            <span className="text-emerald-400 font-bold">{item.rendimientoPonderadoPct}%</span>
                          ) : (
                            <span className="text-slate-500 italic">Sin estándar</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
