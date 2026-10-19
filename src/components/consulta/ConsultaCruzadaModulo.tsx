import React from 'react';
import { Search } from 'lucide-react';

export interface ColaboradorItem {
  id: string;
  codigo: string;
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
  return (
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
            {colaboradoresMock.map((c) => (
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
          >
          </input>
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
  );
};
