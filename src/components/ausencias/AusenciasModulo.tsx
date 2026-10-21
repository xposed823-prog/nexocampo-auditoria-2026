import React, { useState, useEffect } from 'react';
import { UserX, Plus } from 'lucide-react';
import { COLABORADORES_CATALOGO } from '../../domain/catalogoAgronomico';
import { dbGetAll, guardarAusenciaRegistro, AusenciaRegistro } from '../../domain/nexocampoDB';
import { suscribirMutacionDatos } from '../../domain/eventBus';

export interface AusenciasModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

const TIPO_MAP: Record<string, 'I' | 'JV' | 'LP' | 'P' | 'V' | 'SP' | 'C'> = {
  'Incapacidad Médica': 'I',
  'Jurado de Votación': 'JV',
  'Licencia Paternidad/Maternidad': 'LP',
  'Permiso Personal': 'P',
  'Vacaciones': 'V',
  'Suspensión Disciplinaria': 'SP',
  'Calamidad Doméstica': 'C'
};

const CODIGO_A_NOMBRE: Record<string, string> = {
  I: 'Incapacidad Médica',
  JV: 'Jurado de Votación',
  LP: 'Licencia Paternidad/Maternidad',
  P: 'Permiso Personal',
  V: 'Vacaciones',
  SP: 'Suspensión Disciplinaria',
  C: 'Calamidad Doméstica'
};

export const AusenciasModulo: React.FC<AusenciasModuloProps> = ({ modoSol, dispararToast }) => {
  const [ausencias, setAusencias] = useState<AusenciaRegistro[]>([]);
  const [cargando, setCargando] = useState(true);

  const [colaboradorId, setColaboradorId] = useState(COLABORADORES_CATALOGO[0].id);
  const [tipoEtiqueta, setTipoEtiqueta] = useState('Incapacidad Médica');
  const [fechaInicio, setFechaInicio] = useState('2026-10-19');
  const [fechaFin, setFechaFin] = useState('2026-10-19');
  const [motivo, setMotivo] = useState('Incapacidad EPS por lumbalgia');

  const cargarAusencias = async () => {
    try {
      setCargando(true);
      const items = await dbGetAll<AusenciaRegistro>('ausencias');
      setAusencias(items || []);
    } catch (e) {
      console.warn('[AusenciasModulo] Error al cargar de IndexedDB:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAusencias();
    const desuscribir = suscribirMutacionDatos((ev) => {
      if (ev.almacen === 'ausencias') {
        cargarAusencias();
      }
    });
    return () => desuscribir();
  }, []);

  const registrarAusencia = async () => {
    if (!colaboradorId || !fechaInicio || !fechaFin) {
      dispararToast('Complete todos los campos obligatorios');
      return;
    }

    try {
      const codigoTipo = TIPO_MAP[tipoEtiqueta] || 'P';
      const nuevaAusencia: AusenciaRegistro = {
        id: `aus_${colaboradorId}_${fechaInicio}_${Date.now()}`,
        colaborador_id: colaboradorId,
        tipo: codigoTipo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        motivo: motivo || tipoEtiqueta,
        observacion: 'Registrado formalmente desde módulo de ausencias'
      };

      await guardarAusenciaRegistro(nuevaAusencia);
      dispararToast('✓ Ausencia formalizada y guardada en IndexedDB');
      await cargarAusencias();
    } catch (e: any) {
      dispararToast(`Error al persistir: ${e?.message || 'Error en IndexedDB'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <UserX className="w-4 h-4 text-emerald-500" />
              Módulo de Ausencias e Incapacidades
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro formal de no asistencia persistido en IndexedDB (`store: ausencias`). Desacoplado totalmente de las métricas de rendimiento técnico de las labores.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
            {ausencias.length} Registros en Base Canónica
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Listado */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Ausencias Formalizadas (Persistidas en IndexedDB)
          </h3>
          {cargando ? (
            <div className="p-4 text-xs text-slate-400 text-center">Cargando ausencias...</div>
          ) : ausencias.length === 0 ? (
            <div className={`p-6 rounded-xl border text-center text-xs text-slate-400 ${modoSol ? 'bg-white border-slate-200' : 'bg-slate-800/40 border-slate-700/60'}`}>
              Sin ausencias registradas en IndexedDB.
            </div>
          ) : (
            <div className="space-y-2">
              {ausencias.map((a) => {
                const colInfo = COLABORADORES_CATALOGO.find(c => c.id === a.colaborador_id);
                const nombreCol = colInfo ? `${colInfo.codigo} · ${colInfo.nombreCompleto || colInfo.alias}` : a.colaborador_id;
                const nombreTipo = CODIGO_A_NOMBRE[a.tipo] || a.tipo;
                const esJustificada = a.tipo !== 'SP';

                return (
                  <div
                    key={a.id}
                    className={`p-4 rounded-xl border flex justify-between items-center ${
                      modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-200 block">{nombreCol}</span>
                      <span className="text-[11px] text-slate-400">
                        [{a.tipo}] {nombreTipo} · Del {a.fecha_inicio} al {a.fecha_fin}
                      </span>
                      {a.motivo && (
                        <p className="text-[10px] text-slate-400 mt-0.5 italic">Motivo: {a.motivo}</p>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      esJustificada
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                    }`}>
                      {esJustificada ? 'Justificada' : 'No Justificada'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulario */}
        <div className={`p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Reportar Ausencia
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Colaborador</label>
              <select
                value={colaboradorId}
                onChange={(e) => setColaboradorId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              >
                {COLABORADORES_CATALOGO.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} · {c.nombreCompleto || c.alias} ({c.cuadrilla})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tipo de Ausencia</label>
              <select
                value={tipoEtiqueta}
                onChange={(e) => setTipoEtiqueta(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              >
                {Object.keys(TIPO_MAP).map((k) => (
                  <option key={k} value={k}>
                    {k} [{TIPO_MAP[k]}]
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Motivo / Diagnóstico</label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descripción breve..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              />
            </div>
          </div>
          <button
            onClick={registrarAusencia}
            className="w-full min-h-[44px] py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar y Persistir en IndexedDB</span>
          </button>
        </div>
      </div>
    </div>
  );
};
