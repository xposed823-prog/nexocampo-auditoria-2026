import React from 'react';
import { ClipboardCheck } from 'lucide-react';

export interface ColaboradorItem {
  id: string;
  codigo: string;
  alias: string;
  rol: string;
  cuadrilla: string;
}

export interface AsistenciaModuloProps {
  modoSol: boolean;
  colaboradoresMock: ColaboradorItem[];
  diasSemana: string[];
  matrizAsistencia: Record<string, 'sin_registrar' | 'presente' | 'retardo' | 'ausencia'>;
  rotarAsistencia: (colId: string, diaIdx: number) => void;
  setMatrizAsistencia: React.Dispatch<React.SetStateAction<Record<string, 'sin_registrar' | 'presente' | 'retardo' | 'ausencia'>>>;
  dispararToast: (msg: string) => void;
}

export const AsistenciaModulo: React.FC<AsistenciaModuloProps> = ({
  modoSol,
  colaboradoresMock,
  diasSemana,
  matrizAsistencia,
  rotarAsistencia,
  setMatrizAsistencia,
  dispararToast
}) => {
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-500" />
              Matriz Semanal de Asistencia de Cuadrilla
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Estado inicial normativo: <code className="text-slate-300">— (sin registrar)</code>. La ausencia de registro no significa falta. Toque en celda para rotar: Sin registrar &rarr; Presente &rarr; Retardo &rarr; Ausencia.
            </p>
          </div>
          <button
            onClick={() => {
              const actualizada = { ...matrizAsistencia };
              colaboradoresMock.forEach(c => {
                actualizada[`${c.id}-0`] = 'presente';
              });
              setMatrizAsistencia(actualizada);
              dispararToast('Pase de lista matutino completado para hoy');
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            Marcar Todos Presentes (Hoy)
          </button>
        </div>
      </div>

      {/* Tabla Matriz Semanal Accesible */}
      <div className={`rounded-xl border overflow-hidden ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" role="grid" aria-label="Matriz semanal de asistencia">
            <thead className={modoSol ? 'bg-slate-100 text-slate-700 font-bold' : 'bg-slate-900/80 text-slate-300'}>
              <tr>
                <th className="p-3 w-40">Colaborador</th>
                <th className="p-3 hidden sm:table-cell">Rol / Cuadrilla</th>
                {diasSemana.map((dia) => (
                  <th key={dia} className="p-3 text-center min-w-[56px] font-mono">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {colaboradoresMock.map((col) => (
                <tr key={col.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-medium">
                    <span className="font-mono font-bold text-emerald-400 block">{col.codigo}</span>
                    <span className="text-[11px] text-slate-300">{col.alias}</span>
                  </td>
                  <td className="p-3 hidden sm:table-cell text-[11px] text-slate-400">
                    {col.rol} · {col.cuadrilla}
                  </td>
                  {diasSemana.map((dia, idx) => {
                    const key = `${col.id}-${idx}`;
                    const est = matrizAsistencia[key] || 'sin_registrar';
                    return (
                      <td key={dia} className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => rotarAsistencia(col.id, idx)}
                          className={`min-w-[44px] min-h-[44px] w-11 h-11 mx-auto rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-transform active:scale-90 border ${
                            est === 'presente'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : est === 'retardo'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : est === 'ausencia'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300'
                          }`}
                          aria-label={`Asistencia ${col.alias} día ${dia}: ${est}`}
                        >
                          {est === 'presente' && 'P'}
                          {est === 'retardo' && 'R'}
                          {est === 'ausencia' && 'A'}
                          {est === 'sin_registrar' && '—'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leyenda Semántica Accesible */}
        <div className="p-3 bg-slate-900/60 border-t border-slate-700/40 flex flex-wrap gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><strong className="text-slate-400 font-mono">—</strong> Sin registrar (estado inicial)</span>
          <span className="flex items-center gap-1.5"><strong className="text-emerald-400 font-mono">P</strong> Presente jornada completa</span>
          <span className="flex items-center gap-1.5"><strong className="text-amber-400 font-mono">R</strong> Retardo (registro horario)</span>
          <span className="flex items-center gap-1.5"><strong className="text-rose-400 font-mono">A</strong> Ausencia formalmente registrada</span>
        </div>
      </div>
    </div>
  );
};
