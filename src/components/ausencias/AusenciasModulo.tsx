import React, { useState } from 'react';
import { UserX, Plus, CheckCircle2 } from 'lucide-react';
import { COLABORADORES_CATALOGO } from '../../domain/catalogoAgronomico';

export interface AusenciasModuloProps {
  modoSol: boolean;
  dispararToast: (msg: string) => void;
}

export const AusenciasModulo: React.FC<AusenciasModuloProps> = ({ modoSol, dispararToast }) => {
  const [ausencias, setAusencias] = useState([
    { id: 'aus-1', colaborador: 'COL-001 · Anderson Cortes Mendez', tipo: 'Incapacidad Médica', fecha: '2026-10-19', certificado: true, justificada: true },
    { id: 'aus-2', colaborador: 'COL-006 · Clisman Andres Marin Giraldo', tipo: 'Permiso Personal', fecha: '2026-10-18', certificado: false, justificada: true }
  ]);

  const [colaborador, setColaborador] = useState(`${COLABORADORES_CATALOGO[0].codigo} · ${COLABORADORES_CATALOGO[0].nombreCompleto}`);
  const [tipo, setTipo] = useState('Incapacidad Médica');
  const [fecha, setFecha] = useState('2026-10-20');
  const [justificada, setJustificada] = useState(true);

  const registrarAusencia = () => {
    setAusencias([...ausencias, {
      id: `aus-${Date.now()}`,
      colaborador,
      tipo,
      fecha,
      certificado: true,
      justificada
    }]);
    dispararToast('Ausencia registrada formalmente');
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
              Registro formal de no asistencia. Desacoplado totalmente de las métricas de rendimiento técnico de las labores.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
            Registro Justificado
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Listado */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Ausencias Formalizadas
          </h3>
          <div className="space-y-2">
            {ausencias.map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-xl border flex justify-between items-center ${
                  modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div>
                  <span className="font-mono text-xs font-bold text-slate-200 block">{a.colaborador}</span>
                  <span className="text-[11px] text-slate-400">{a.tipo} · Fecha: {a.fecha}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40">
                  {a.justificada ? 'Justificada' : 'No Justificada'}
                </span>
              </div>
            ))}
          </div>
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
                value={colaborador}
                onChange={(e) => setColaborador(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              >
                {COLABORADORES_CATALOGO.map((c) => (
                  <option key={c.id} value={`${c.codigo} · ${c.nombreCompleto}`}>
                    {c.codigo} · {c.nombreCompleto} ({c.cuadrilla})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tipo de Ausencia</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              >
                <option value="Incapacidad Médica">Incapacidad Médica</option>
                <option value="Permiso Personal">Permiso Personal</option>
                <option value="Calamidad Doméstica">Calamidad Doméstica</option>
                <option value="Falta Injustificada">Falta Injustificada</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
          </div>
          <button
            onClick={registrarAusencia}
            className="w-full min-h-[44px] py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Ausencia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
