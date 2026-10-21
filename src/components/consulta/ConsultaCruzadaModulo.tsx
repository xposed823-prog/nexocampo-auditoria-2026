import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  HardHat,
  UserX,
  RefreshCw,
  Info,
  Calendar
} from 'lucide-react';
import {
  consultarColaboradorFecha,
  ResultadoConsultaCruzada,
  suscribirMutacionDatos
} from '../../domain/consultaDominioService';

export interface ColaboradorItem {
  id: string;
  codigo: string;
  nombreCompleto?: string;
  alias: string;
  rol: string;
  cuadrilla: string;
}

export interface ConsultaCruzadaModuloProps {
  modoSol: boolean;
  colaboradoresMock: ColaboradorItem[];
  consultaColaborador: string;
  setConsultaColaborador: (val: string) => void;
  consultaFecha: string;
  setConsultaFecha: (val: string) => void;
}

export const ConsultaCruzadaModulo: React.FC<ConsultaCruzadaModuloProps> = ({
  modoSol,
  colaboradoresMock,
  consultaColaborador,
  setConsultaColaborador,
  consultaFecha,
  setConsultaFecha
}) => {
  const [resultado, setResultado] = useState<ResultadoConsultaCruzada | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const ejecutarConsulta = useCallback(async () => {
    if (!consultaColaborador || !consultaFecha) return;
    setCargando(true);
    setErrorCarga(null);
    try {
      const res = await consultarColaboradorFecha(consultaColaborador, consultaFecha);
      setResultado(res);
      if (res.estadoIntegridad === 'ERROR_LECTURA') {
        setErrorCarga(res.mensajeEstado);
      }
    } catch (e: any) {
      setErrorCarga(`Error al consultar IndexedDB: ${e?.message || 'Error de conexión'}`);
    } finally {
      setCargando(false);
    }
  }, [consultaColaborador, consultaFecha]);

  useEffect(() => {
    ejecutarConsulta();

    // Reaccionar a mutaciones en IndexedDB (jornadas, asistencia, ausencias)
    const desuscribir = suscribirMutacionDatos((evento) => {
      if (['jornadas', 'asistencia', 'ausencias'].includes(evento.almacen)) {
        ejecutarConsulta();
      }
    });

    return () => {
      desuscribir();
    };
  }, [ejecutarConsulta]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-400" />
              Módulo de Consulta Cruzada Multidimensional (Datos Vivos IndexedDB)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditoría unificada y reconciliación en tiempo real. Cruza asistencia, jornadas, tramos de labor, ausencias e incidentes directamente de la base canónica.
            </p>
          </div>
          <button
            onClick={() => ejecutarConsulta()}
            disabled={cargando}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            aria-label="Refrescar consulta cruzada"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${cargando ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Filtros de Consulta */}
      <div className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Seleccionar Colaborador</label>
          <select
            value={consultaColaborador}
            onChange={(e) => setConsultaColaborador(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-100"
          >
            {colaboradoresMock.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} · {c.nombreCompleto || c.alias} ({c.cuadrilla})
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
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
          />
        </div>
      </div>

      {/* Estado de Integridad del Registro */}
      {resultado && (
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
          resultado.estadoIntegridad === 'EXITO_COMPLETO'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : resultado.estadoIntegridad === 'SIN_REGISTROS'
            ? 'bg-slate-800/60 border-slate-700 text-slate-300'
            : resultado.estadoIntegridad === 'DATOS_INCOMPLETOS'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {resultado.estadoIntegridad === 'EXITO_COMPLETO' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : resultado.estadoIntegridad === 'ERROR_LECTURA' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {resultado.estadoIntegridad === 'EXITO_COMPLETO' && 'Datos Completos Persistidos'}
                {resultado.estadoIntegridad === 'SIN_REGISTROS' && 'Sin Registros para la Fecha'}
                {resultado.estadoIntegridad === 'DATOS_INCOMPLETOS' && 'Registros Parciales Detectados'}
                {resultado.estadoIntegridad === 'ERROR_LECTURA' && 'Error al Consultar IndexedDB'}
              </span>
              <p className="text-[11px] opacity-80 mt-0.5">{resultado.mensajeEstado}</p>
            </div>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-current">
            {resultado.clasificacionDato}
          </span>
        </div>
      )}

      {/* Spinner de Carga */}
      {cargando && (
        <div className="p-8 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-400" />
          <p className="text-xs text-slate-400 font-medium">Consultando almacenes canónicos en IndexedDB...</p>
        </div>
      )}

      {/* Error de lectura */}
      {errorCarga && !cargando && (
        <div className="p-4 rounded-xl border bg-rose-950/40 border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error de lectura en IndexedDB</p>
            <p className="mt-0.5">{errorCarga}</p>
          </div>
        </div>
      )}

      {/* Sin registros */}
      {resultado && resultado.estadoIntegridad === 'SIN_REGISTROS' && !cargando && (
        <div className={`p-8 rounded-xl border text-center space-y-2 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/30 border-slate-700/60'}`}>
          <Calendar className="w-8 h-8 mx-auto text-slate-500" />
          <p className="text-xs font-semibold text-slate-300">
            Sin registros de asistencia, jornadas ni ausencias para {resultado.colaborador?.nombre || 'el colaborador'} el día {consultaFecha}.
          </p>
          <p className="text-[11px] text-slate-500">
            Para registrar actividad, diríjase a los módulos de Jornadas, Asistencia o Ausencias.
          </p>
        </div>
      )}

      {/* Resultados Vivos Reconciliados */}
      {resultado && resultado.estadoIntegridad !== 'SIN_REGISTROS' && !cargando && (
        <div className="space-y-6">
          {/* Ficha Resumen del Colaborador */}
          {resultado.colaborador && (
            <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
              modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'
            }`}>
              <div>
                <span className="font-mono text-xs font-bold text-sky-400">{resultado.colaborador.codigo}</span>
                <h3 className="text-sm font-bold text-slate-100">{resultado.colaborador.nombre}</h3>
                <span className="text-xs text-slate-400">{resultado.colaborador.rol} · Cuadrilla {resultado.colaborador.cuadrilla}</span>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-right">
                  <span className="text-[10px] text-slate-400 block">Minutos Netos</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {resultado.jornada.registrado ? `${resultado.jornada.minutosEfectivosNetos} min` : 'Sin registro'}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-right">
                  <span className="text-[10px] text-slate-400 block">Eficiencia Ponderada</span>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {resultado.metricasConsolidadas.rendimientoPonderadoPct !== null
                      ? `${resultado.metricasConsolidadas.rendimientoPonderadoPct}%`
                      : 'No calculable'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Grilla 3 Bloques Normativos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Asistencia & Jornada */}
            <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>1. Asistencia & Jornada</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Pase de Lista:</span>
                  <span className={`font-semibold ${
                    resultado.asistencia.estado === 'presente' ? 'text-emerald-400' :
                    resultado.asistencia.estado === 'retardo' ? 'text-amber-400' :
                    resultado.asistencia.estado === 'ausencia' ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {resultado.asistencia.detalleTexto}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Jornadas en Fecha:</span>
                  <span className={`font-semibold ${
                    resultado.jornada.conteoJornadasDia > 1 ? 'text-sky-400 font-bold' : 'text-slate-200'
                  }`}>
                    {resultado.jornada.conteoJornadasDia > 1
                      ? `${resultado.jornada.conteoJornadasDia} jornadas consolidadas`
                      : (resultado.jornada.registrado ? '1 jornada' : 'Sin registro')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Horario Jornada:</span>
                  <span className="font-mono">
                    {resultado.jornada.horaApertura && resultado.jornada.horaCierre
                      ? `${resultado.jornada.horaApertura} - ${resultado.jornada.horaCierre}`
                      : 'Sin registro'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Tiempo Bruto:</span>
                  <span className="font-mono">
                    {resultado.jornada.registrado ? `${resultado.jornada.minutosBrutos} min` : 'Sin registro'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Minutos Computables:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {resultado.jornada.registrado ? `${resultado.jornada.minutosEfectivosNetos} min` : 'Sin registro'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Labores & Rendimiento */}
            <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <h3 className="font-bold text-xs uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>2. Labores & Rendimiento</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Tramos Registrados:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {resultado.metricasConsolidadas.totalTramos > 0
                      ? `${resultado.metricasConsolidadas.totalTramos} tramo(s)`
                      : 'Sin tramos de labor'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Producción Completada:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {resultado.metricasConsolidadas.produccionCompletadaValida} unidades
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Producción Pendiente:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {resultado.metricasConsolidadas.produccionPendiente > 0
                      ? `${resultado.metricasConsolidadas.produccionPendiente} unidades (saldo)`
                      : '0 unidades'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Cumplimiento Meta:</span>
                  <span className="font-mono font-bold text-sky-300">
                    {resultado.metricasConsolidadas.cumplimientoMetasPct !== null
                      ? `${resultado.metricasConsolidadas.cumplimientoMetasPct}%`
                      : 'No calculable: sin meta'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Rendimiento Técnico:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {resultado.metricasConsolidadas.rendimientoPonderadoPct !== null
                      ? `${resultado.metricasConsolidadas.rendimientoPonderadoPct}% (Ponderado)`
                      : 'No calculable: sin estándar'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. SG-SST, Ausencias & Incidentes */}
            <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5" />
                <span>3. SG-SST & Ausencias</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Incidentes del Día:</span>
                  <span className="font-semibold text-slate-200">
                    {resultado.incidentes.length > 0
                      ? `${resultado.incidentes.length} reporte(s)`
                      : 'Ninguno registrado'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Ausencia en Fecha:</span>
                  <span className={`font-semibold ${
                    resultado.ausencias.length > 0 ? 'text-amber-400' : 'text-slate-300'
                  }`}>
                    {resultado.ausencias.length > 0
                      ? `[${resultado.ausencias[0].tipoCodigo}] ${resultado.ausencias[0].tipo}`
                      : 'Sin registro de ausencia'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40">
                  <span className="text-slate-400">Justificación Formal:</span>
                  <span className="font-semibold text-slate-300">
                    {resultado.ausencias.length > 0
                      ? (resultado.ausencias[0].justificada ? 'Justificada con soporte' : 'No Justificada')
                      : 'No aplica'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Clasificación Auditoría:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {resultado.clasificacionDato === 'observado' ? 'Dato Observado Canónico' : 'Dato Incompleto'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Desglose Detallado de Tramos de Labor Persistidos */}
          {resultado.jornada.tramos.length > 0 && (
            <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Tramos de Labor Auditados (Detalle Cronológico)
              </h4>
              <div className="divide-y divide-slate-700/50">
                {resultado.jornada.tramos.map((tramo) => (
                  <div key={tramo.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{tramo.laborNombre || tramo.titulo}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          tramo.estadoLabor === 'cumple' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                          tramo.estadoLabor === 'pendiente' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {tramo.estadoLabor}
                        </span>
                        {tramo.area && (
                          <span className="text-[10px] text-slate-400">
                            {tramo.area}{tramo.bloque ? ` / ${tramo.bloque}` : ''}{tramo.tunel ? ` (${tramo.tunel})` : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tramo.horaInicio} - {tramo.horaFin} ({tramo.minutosCalculados} min efectivos) · {tramo.unidadesCompletadas || 0} {tramo.unidadMedida}
                        {tramo.meta ? ` (Meta: ${tramo.meta})` : ''}
                      </p>
                      {tramo.mensajeAuditoriaRendimiento && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">
                          {tramo.mensajeAuditoriaRendimiento}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Rendimiento Técnico</span>
                      <span className={`font-mono text-xs font-bold ${
                        tramo.rendimientoTemporalPct !== null ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {tramo.rendimientoTemporalPct !== null ? `${tramo.rendimientoTemporalPct}%` : 'No calculable'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
