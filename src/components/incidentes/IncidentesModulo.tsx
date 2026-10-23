import React from 'react';
import { HardHat, Plus, X } from 'lucide-react';
import { AREAS_AGRONOMICAS, COLABORADORES_CATALOGO } from '../../domain/catalogoAgronomico';

export interface IncidenteItem {
  id: string;
  fecha: string;
  hora: string;
  colaboradorId?: string;
  severidad: 'leve' | 'moderado' | 'grave' | string;
  tipo: string;
  area: string;
  descripcion: string;
  primerosAuxilios: boolean;
}

export interface IncidentesModuloProps {
  modoSol: boolean;
  incidentesLista: IncidenteItem[];
  setIncidentesLista: React.Dispatch<React.SetStateAction<IncidenteItem[]>>;
  modalIncidenteAbierto: boolean;
  setModalIncidenteAbierto: (val: boolean) => void;
  incidenteFecha: string;
  setIncidenteFecha: (val: string) => void;
  incidenteHora: string;
  setIncidenteHora: (val: string) => void;
  incidenteColaboradorId: string;
  setIncidenteColaboradorId: (val: string) => void;
  onGuardarIncidente: (incidente: IncidenteItem) => Promise<void>;
  incidenteSeveridad: 'leve' | 'moderado' | 'grave';
  setIncidenteSeveridad: (val: 'leve' | 'moderado' | 'grave') => void;
  incidenteArea: string;
  setIncidenteArea: (val: string) => void;
  incidenteDescripcion: string;
  setIncidenteDescripcion: (val: string) => void;
  incidenteAuxilios: boolean;
  setIncidenteAuxilios: (val: boolean) => void;
  dispararToast: (msg: string) => void;
}

export const IncidentesModulo: React.FC<IncidentesModuloProps> = ({
  modoSol,
  incidentesLista,
  setIncidentesLista,
  modalIncidenteAbierto,
  setModalIncidenteAbierto,
  incidenteFecha,
  setIncidenteFecha,
  incidenteHora,
  setIncidenteHora,
  incidenteColaboradorId,
  setIncidenteColaboradorId,
  onGuardarIncidente,
  incidenteSeveridad,
  setIncidenteSeveridad,
  incidenteArea,
  setIncidenteArea,
  incidenteDescripcion,
  setIncidenteDescripcion,
  incidenteAuxilios,
  setIncidenteAuxilios,
  dispararToast
}) => {
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-400" />
              Bitácora de Incidentes y Primeros Auxilios (SG-SST)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro de eventos de seguridad en campo. Solo requiere fecha y hora del evento; no exige hora final ni diagnósticos médicos.
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
                <span className="font-mono text-xs font-bold text-amber-400">{inc.fecha} · {inc.hora}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                  Severidad: {inc.severidad}
                </span>
                <span className="text-xs text-slate-400 font-medium">{inc.area}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">{inc.tipo}</p>
              <p className="text-xs text-slate-400 mt-0.5">{inc.descripcion}</p>
              {inc.colaboradorId && <p className="text-[11px] text-slate-500 mt-1">Relacionado con: {COLABORADORES_CATALOGO.find((c) => c.id === inc.colaboradorId)?.nombreCompleto || inc.colaboradorId}</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[11px] px-2.5 py-1 rounded border ${inc.primerosAuxilios ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                {inc.primerosAuxilios ? '✓ Primeros auxilios aplicados' : 'Primeros auxilios no reportados'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Incidente */}
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
                <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha del evento</label>
                <input type="date" required value={incidenteFecha} onChange={(e) => setIncidenteFecha(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs" />
              </div>
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
              <label className="block text-xs font-semibold text-slate-400 mb-1">Colaborador relacionado (opcional)</label>
              <select value={incidenteColaboradorId} onChange={(e) => setIncidenteColaboradorId(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs">
                <option value="">Sin atribución individual</option>
                {COLABORADORES_CATALOGO.map((colaborador) => <option key={colaborador.id} value={colaborador.id}>{colaborador.nombreCompleto}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Área y Ubicación Agronómica</label>
              <select
                value={incidenteArea}
                onChange={(e) => setIncidenteArea(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-medium text-slate-100"
              >
                <option value="">Seleccione área y bloque</option>
                {AREAS_AGRONOMICAS.map((a) => (
                  <optgroup key={a.id} label={`Área ${a.nombre} (${a.codigo})`}>
                    {a.bloques.map((b) => (
                      <option key={`${a.id}-${b.id}`} value={`Área ${a.nombre} - ${b.nombre}`}>
                        Área {a.nombre} · Bloque {b.nombre} ({b.totalTuneles} túneles)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción del Hecho</label>
              <textarea
                required
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
                onClick={async () => {
                  if (!incidenteFecha || !incidenteHora || !incidenteArea || !incidenteDescripcion.trim()) {
                    dispararToast('Complete fecha, hora, área y descripción del incidente.');
                    return;
                  }
                  const nuevo: IncidenteItem = {
                    id: `inc_${Date.now()}`,
                    fecha: incidenteFecha,
                    hora: incidenteHora,
                    colaboradorId: incidenteColaboradorId || undefined,
                    severidad: incidenteSeveridad,
                    tipo: 'Incidente de seguridad',
                    area: incidenteArea,
                    descripcion: incidenteDescripcion.trim(),
                    primerosAuxilios: incidenteAuxilios
                  };
                  try {
                    await onGuardarIncidente(nuevo);
                    setModalIncidenteAbierto(false);
                    setIncidenteDescripcion('');
                    setIncidenteHora('');
                    setIncidenteColaboradorId('');
                    setIncidenteAuxilios(false);
                  } catch (error: any) {
                    dispararToast(`No se pudo guardar el incidente: ${error?.message || 'error de IndexedDB'}`);
                  }
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
};
