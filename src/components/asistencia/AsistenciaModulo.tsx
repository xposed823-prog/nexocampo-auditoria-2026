import React, { useState } from 'react';
import { ColaboradorItem } from '../consulta/ConsultaCruzadaModulo';

export interface AsistenciaModuloProps {
  modoSol?: boolean;
  colaboradoresMock: ColaboradorItem[];
  diasSemana: string[];
  matrizAsistencia: Record<string, 'sin_registrar' | 'presente' | 'retardo' | 'ausencia'>;
  rotarAsistencia: (colId: string, diaIdx: number) => void;
  setMatrizAsistencia: React.Dispatch<React.SetStateAction<Record<string, 'sin_registrar' | 'presente' | 'retardo' | 'ausencia'>>>;
  dispararToast: (msg: string) => void;
  onMarcarTodosPresentes?: () => Promise<void> | void;
}

export const AsistenciaModulo: React.FC<AsistenciaModuloProps> = ({
  colaboradoresMock,
  matrizAsistencia,
  rotarAsistencia,
  dispararToast
}) => {
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [filtroCuadrilla, setFiltroCuadrilla] = useState('todos');

  const diasEncabezado = [
    { nombre: 'Lun', fecha: '19/10', idx: 0 },
    { nombre: 'Mar', fecha: '20/10', idx: 1 },
    { nombre: 'Mié', fecha: '21/10', idx: 2 },
    { nombre: 'Jue', fecha: '22/10', idx: 3 },
    { nombre: 'Vie', fecha: '23/10', idx: 4 },
    { nombre: 'Sáb', fecha: '24/10', idx: 5 }
  ];

  const colaboradoresFiltrados = colaboradoresMock.filter(c => {
    if (filtroCuadrilla === 'todos') return true;
    return c.cuadrilla === filtroCuadrilla;
  });

  const exportarCSV = () => {
    const encabezados = ['Codigo', 'Colaborador', 'Cuadrilla', ...diasEncabezado.map(d => `${d.nombre}_${d.fecha}`)];
    const filas = colaboradoresFiltrados.map(c => {
      const estados = diasEncabezado.map(d => matrizAsistencia[`${c.id}-${d.idx}`] || 'sin_registrar');
      return [c.codigo, `"${c.nombreCompleto || c.alias}"`, c.cuadrilla, ...estados];
    });
    const contenido = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Asistencia_Semana_19_25_Oct_2026.csv`;
    link.click();
    dispararToast('✓ Asistencia exportada en formato CSV');
  };

  return (
    <div className="space-y-3.5 pb-8 select-none">
      {/* 1. ENCABEZADO ASISTENCIA (Imagen 6) */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            ASISTENCIA
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Calendario semanal
          </h2>
        </div>

        <button
          type="button"
          onClick={() => dispararToast('Abriendo consulta cruzada de asistencia...')}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
        >
          <span>👤</span>
          <span>Consultar</span>
        </button>
      </div>

      {/* 2. BARRA DE CONTROL DE SEMANA (Imagen 6) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSemanaOffset(prev => prev - 1)}
          className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center font-black text-slate-600 active:scale-95 transition-all"
        >
          ‹
        </button>

        <span className="text-xs font-extrabold text-slate-800 text-center">
          Semana actual · 19 de oct – 25 de oct
        </span>

        <button
          type="button"
          onClick={() => setSemanaOffset(prev => prev + 1)}
          className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center font-black text-slate-600 active:scale-95 transition-all"
        >
          ›
        </button>
      </div>

      {/* 3. SELECTOR DROPDOWN DE COLABORADORES (Imagen 6) */}
      <div>
        <select
          value={filtroCuadrilla}
          onChange={(e) => setFiltroCuadrilla(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:border-emerald-600"
        >
          <option value="todos">Todos los colaboradores</option>
          <option value="A">Cuadrilla A</option>
          <option value="B">Cuadrilla B</option>
          <option value="C">Cuadrilla C</option>
        </select>
      </div>

      {/* 4. CARD INFORMATIVA: ✓ Presente · — Sin reporte (Imagen 6) */}
      <div className="rounded-2xl p-3 bg-white border border-slate-200/90 shadow-xs text-[11px] text-slate-600 leading-relaxed font-medium">
        <strong>✓ Presente</strong> · <strong>— Sin reporte / pendiente</strong>. Las categorías formales de ausencia permanecen en <strong>AUSENCIAS</strong>.
      </div>

      {/* 5. CARD: REPORTES DE ASISTENCIA (Imagen 6) */}
      <div className="rounded-2xl p-4 bg-white border border-slate-200/90 shadow-xs space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>📄</span>
          <span>REPORTES DE ASISTENCIA</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={exportarCSV}
            className="py-2.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
          >
            <span>📥</span>
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="py-2.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
          >
            <span>📄</span>
            <span>PDF / imprimir</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 leading-tight">
          El CSV se guarda en NexoCampo/Asistencia. El PDF se abre para imprimir o guardar desde el navegador.
        </p>
      </div>

      {/* 6. TABLA MATRIZ SEMANAL (Imagen 6) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" role="grid">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold text-[11px]">
              <tr>
                <th className="py-2.5 px-3.5 sticky left-0 bg-slate-50 z-10 w-36">Colaborador</th>
                {diasEncabezado.map(d => (
                  <th key={d.idx} className="py-2.5 px-2 text-center min-w-[70px]">
                    <span className="block">{d.nombre}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{d.fecha}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colaboradoresFiltrados.map((col) => (
                <tr key={col.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3.5 sticky left-0 bg-white z-10 font-extrabold text-xs text-slate-900 border-r border-slate-100">
                    <span className="block truncate max-w-[130px]">{col.nombreCompleto || col.alias}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">C-{col.cuadrilla}</span>
                  </td>
                  {diasEncabezado.map(d => {
                    const clave = `${col.id}-${d.idx}`;
                    const estado = matrizAsistencia[clave] || 'sin_registrar';

                    return (
                      <td key={d.idx} className="py-2 px-1 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => rotarAsistencia(col.id, d.idx)}
                            className={`w-9 h-7 rounded-lg font-black text-xs flex items-center justify-center border transition-all active:scale-90 ${
                              estado === 'presente'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : estado === 'retardo'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : estado === 'ausencia'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            {estado === 'presente' ? '✓' : estado === 'retardo' ? 'R' : estado === 'ausencia' ? 'A' : '—'}
                          </button>
                          <button
                            type="button"
                            onClick={() => rotarAsistencia(col.id, d.idx)}
                            className="text-slate-300 hover:text-slate-600 text-[10px] p-0.5"
                            title="Cambiar estado"
                          >
                            ···
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
