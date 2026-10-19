import React, { useState } from 'react';
import { Briefcase, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { detectarSolapamientoTemporal } from '../../domain/businessRulesEngine';
import { calcularCumplimientoCantidad, calcularRendimientoTemporal } from '../../domain/rendimientoCalculator';

export interface LaboresModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

export const LaboresModulo: React.FC<LaboresModuloProps> = ({ modoSol, dispararToast }) => {
  const [labores, setLabores] = useState([
    { id: 'lab-1', labor: 'Cosecha Selección', horaInicio: '06:30', horaFin: '10:00', completado: 120, meta: 100 },
    { id: 'lab-2', labor: 'Pesaje e Identificación', horaInicio: '10:15', horaFin: '12:00', completado: 80, meta: 80 },
    { id: 'lab-3', labor: 'Empaque para Transporte', horaInicio: '12:30', horaFin: '15:30', completado: 150, meta: 140 }
  ]);

  const [nuevaInicio, setNuevaInicio] = useState('15:30');
  const [nuevaFin, setNuevaFin] = useState('16:30');
  const [nuevaLabor, setNuevaLabor] = useState('Limpieza de Mesa');
  const [nuevaMeta, setNuevaMeta] = useState(50);
  const [nuevaComp, setNuevaComp] = useState(50);

  const agregarLabor = () => {
    // Validar solapamiento con las labores existentes
    const intervalosExistentes = labores.map(l => ({
      id: l.id,
      colaboradorId: 'col-1',
      horaInicio: l.horaInicio,
      horaFin: l.horaFin
    }));

    const nuevoIntervalo = {
      id: `lab-${Date.now()}`,
      colaboradorId: 'col-1',
      horaInicio: nuevaInicio,
      horaFin: nuevaFin
    };

    const conflicto = detectarSolapamientoTemporal(intervalosExistentes, nuevoIntervalo);
    if (conflicto.haySolapamiento) {
      dispararToast(conflicto.mensajeError || 'Conflicto de horario: se solapa con una labor previa');
      return;
    }

    setLabores([...labores, {
      id: nuevoIntervalo.id,
      labor: nuevaLabor,
      horaInicio: nuevaInicio,
      horaFin: nuevaFin,
      completado: nuevaComp,
      meta: nuevaMeta
    }]);
    dispararToast('✓ Labor consecutiva agregada sin solapamiento');
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-500" />
              Módulo de Labores Agrícolas y Subtareas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestión de segmentos horarios por labor. Detección estricta de solapamientos reales y aceptación de labores contiguas.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
            Anti-Solapamiento Activo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listado de Labores Registradas */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Labores en Línea de Tiempo del Operario
          </h3>
          <div className="space-y-2.5">
            {labores.map((lab) => {
              const cumplimiento = calcularCumplimientoCantidad(lab.completado, lab.meta);
              return (
                <div
                  key={lab.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {lab.horaInicio} - {lab.horaFin}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {lab.labor}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Ejecutado: <strong className="text-slate-200">{lab.completado}</strong> / Meta: <strong className="text-slate-200">{lab.meta}</strong> u
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                      cumplimiento.cumplimientoCantidadPct >= 100
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    }`}>
                      {cumplimiento.cumplimientoCantidadPct}% Cumplimiento
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulario de Nueva Labor */}
        <div className={`p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Registrar Labor Consecutiva
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Nombre de Labor</label>
              <input
                type="text"
                value={nuevaLabor}
                onChange={(e) => setNuevaLabor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Hora Inicio</label>
                <input
                  type="time"
                  value={nuevaInicio}
                  onChange={(e) => setNuevaInicio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Hora Fin</label>
                <input
                  type="time"
                  value={nuevaFin}
                  onChange={(e) => setNuevaFin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Meta</label>
                <input
                  type="number"
                  value={nuevaMeta}
                  onChange={(e) => setNuevaMeta(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Completado</label>
                <input
                  type="number"
                  value={nuevaComp}
                  onChange={(e) => setNuevaComp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-emerald-400"
                />
              </div>
            </div>
          </div>

          <button
            onClick={agregarLabor}
            className="w-full min-h-[44px] py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Labor a Línea de Tiempo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
