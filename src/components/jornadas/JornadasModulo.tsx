import React, { useState, useEffect } from 'react';
import { COLABORADORES_CATALOGO, LABORES_AGRONOMICAS, AREAS_AGRONOMICAS } from '../../domain/catalogoAgronomico';
import { dbGetAll, guardarJornadaRegistro, JornadaRegistro } from '../../domain/nexocampoDB';

export interface JornadasModuloProps {
  modoSol?: boolean;
  dispararToast: (msg: string) => void;
  onJornadaGuardada?: () => void;
}

export const JornadasModulo: React.FC<JornadasModuloProps> = ({
  dispararToast,
  onJornadaGuardada
}) => {
  const [fecha, setFecha] = useState('2026-10-21');
  const [modoRegistro, setModoRegistro] = useState<'individual' | 'grupal'>('individual');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [jornadasPersistidas, setJornadasPersistidas] = useState<JornadaRegistro[]>([]);

  // Modal de captura de tramo para el colaborador seleccionado
  const [colaboradorActivo, setColaboradorActivo] = useState<string | null>(null);
  const [laborSeleccionada, setLaborSeleccionada] = useState(LABORES_AGRONOMICAS[0].id);
  const [horaInicio, setHoraInicio] = useState('06:30');
  const [horaFin, setHoraFin] = useState('15:30');
  const [unidadesCompletadas, setUnidadesCompletadas] = useState(40);
  const [metaAsignada, setMetaAsignada] = useState(40);
  const [areaSeleccionada, setAreaSeleccionada] = useState(AREAS_AGRONOMICAS[0].nombre);
  const [guardando, setGuardando] = useState(false);

  const cargarJornadas = async () => {
    try {
      const items = await dbGetAll<JornadaRegistro>('jornadas');
      setJornadasPersistidas(items || []);
    } catch (e) {
      console.warn('[JornadasModulo] Error al cargar jornadas:', e);
    }
  };

  useEffect(() => {
    cargarJornadas();
  }, []);

  const toggleSeleccion = (id: string) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(item => item !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const abrirRegistroColaborador = (id: string) => {
    setColaboradorActivo(id);
  };

  const guardarJornada = async () => {
    if (!colaboradorActivo) return;
    setGuardando(true);
    try {
      const laborInfo = LABORES_AGRONOMICAS.find(l => l.id === laborSeleccionada) || LABORES_AGRONOMICAS[0];
      const nuevaJornada: JornadaRegistro = {
        id: `jornada_${fecha}_${colaboradorActivo}_${Date.now()}`,
        fecha,
        colaboradores_ids: [colaboradorActivo],
        tramos: [
          {
            id: `tramo_${Date.now()}`,
            tipo: 'labor',
            titulo: laborInfo.nombre,
            labor_id: laborInfo.id,
            labor_nombre: laborInfo.nombre,
            unidad: laborInfo.unidadMedida,
            estandar_min: (laborInfo as any).min ?? 6,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            area: areaSeleccionada,
            unidades: unidadesCompletadas,
            completados: unidadesCompletadas,
            meta: metaAsignada,
            estado: 'cumple'
          }
        ],
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        sincronizado: false
      };

      await guardarJornadaRegistro(nuevaJornada);
      await cargarJornadas();
      if (onJornadaGuardada) onJornadaGuardada();
      dispararToast('✓ Jornada registrada y guardada en IndexedDB');
      setColaboradorActivo(null);
    } catch (e: any) {
      dispararToast(`Error al guardar: ${e?.message || 'Fallo de persistencia'}`);
    } finally {
      setGuardando(false);
    }
  };

  const colaboradoresRegistradosEnFecha = new Set(
    jornadasPersistidas.filter(j => j.fecha === fecha).flatMap(j => j.colaboradores_ids)
  );

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* 1. CARD PRINCIPAL: REGISTRAR JORNADA (Imagen 5) */}
      <div className="rounded-3xl p-5 bg-white border border-slate-200/90 shadow-xs space-y-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Registrar jornada
        </h2>

        {/* Campo FECHA */}
        <div>
          <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>📅</span>
            <span>FECHA</span>
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Botones TOGGLE: Individual | Grupal */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setModoRegistro('individual')}
            className={`min-h-[48px] py-2.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
              modoRegistro === 'individual'
                ? 'bg-[#047857] text-white shadow-sm'
                : 'bg-[#0f766e]/70 text-white/90 hover:bg-[#0f766e]'
            }`}
          >
            <span>👤</span>
            <span>Individual</span>
          </button>

          <button
            type="button"
            onClick={() => setModoRegistro('grupal')}
            className={`min-h-[48px] py-2.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
              modoRegistro === 'grupal'
                ? 'bg-[#047857] text-white shadow-sm'
                : 'bg-[#0f766e]/70 text-white/90 hover:bg-[#0f766e]'
            }`}
          >
            <span>👥</span>
            <span>Grupal</span>
          </button>
        </div>
      </div>

      {/* 2. SUBSECCIÓN: COLABORADORES (0/36) - Imagen 5 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            COLABORADORES ({colaboradoresRegistradosEnFecha.size}/{COLABORADORES_CATALOGO.length})
          </h3>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {COLABORADORES_CATALOGO.map((col) => {
            const registrado = colaboradoresRegistradosEnFecha.has(col.id);
            const marcado = seleccionados.includes(col.id);

            return (
              <div
                key={col.id}
                className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => toggleSeleccion(col.id)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs text-slate-900 block truncate">
                      {col.nombreCompleto || col.alias}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Cuadrilla {col.cuadrilla} · {col.rol}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => abrirRegistroColaborador(col.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 shrink-0 ${
                    registrado
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-100 text-[#1e40af] border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {registrado ? 'REGISTRADO' : 'REGISTRAR'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Registro de Jornada para el Colaborador */}
      {colaboradorActivo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Registrar Labor de Campo
                </h3>
                <p className="text-xs text-emerald-700 font-bold">
                  {COLABORADORES_CATALOGO.find(c => c.id === colaboradorActivo)?.nombreCompleto}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setColaboradorActivo(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Labor Agronómica</label>
                <select
                  value={laborSeleccionada}
                  onChange={(e) => setLaborSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  {LABORES_AGRONOMICAS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre} ({l.unidadMedida})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Cantidad Realizada</label>
                  <input
                    type="number"
                    value={unidadesCompletadas}
                    onChange={(e) => setUnidadesCompletadas(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Meta Oficial</label>
                  <input
                    type="number"
                    value={metaAsignada}
                    onChange={(e) => setMetaAsignada(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Área Agronómica</label>
                <select
                  value={areaSeleccionada}
                  onChange={(e) => setAreaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  {AREAS_AGRONOMICAS.map((a) => (
                    <option key={a.id} value={a.nombre}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setColaboradorActivo(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarJornada}
                disabled={guardando}
                className="flex-1 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs shadow-xs"
              >
                {guardando ? 'Guardando...' : 'Guardar Jornada'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
