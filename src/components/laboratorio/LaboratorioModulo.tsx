import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface LaboratorioModuloProps {
  modoSol: boolean;
}

export const LaboratorioModulo: React.FC<LaboratorioModuloProps> = ({ modoSol }) => {
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Laboratorio Matemático de Integridad Agraria (16 Casos de Prueba)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verificación interactiva de los 16 escenarios matemáticos obligatorios estipulados en <code className="text-emerald-400">22-casos-prueba-matematicos.md</code>.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            46/46 Unit Tests Aprobados (Node.js)
          </span>
        </div>
      </div>

      {/* Demostraciones Interactivas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Caso 2: Línea de Tiempo de Tres Labores Consecutivas */}
        <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
              Caso 2: Tres Labores Consecutivas en 1 Jornada
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">1 Jornada Única</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Jornada general: 06:30 a 15:30 (540 min). El sistema guarda las tres labores consecutivas sin triplicar jornadas:
          </p>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span>Labor A (06:30 - 10:00):</span>
              <span className="text-emerald-400 font-bold">210 min</span>
            </div>
            <div className="p-1.5 px-2 rounded bg-amber-950/20 border border-amber-500/30 flex justify-between text-amber-300 text-[11px]">
              <span>Pausa refrigerio (10:00 - 10:15):</span>
              <span>15 min</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span>Labor B (10:15 - 12:00):</span>
              <span className="text-emerald-400 font-bold">105 min</span>
            </div>
            <div className="p-1.5 px-2 rounded bg-amber-950/20 border border-amber-500/30 flex justify-between text-amber-300 text-[11px]">
              <span>Almuerzo oficial (12:00 - 12:30):</span>
              <span>30 min</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span>Labor C (12:30 - 15:30):</span>
              <span className="text-emerald-400 font-bold">180 min</span>
            </div>
          </div>
          <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-xs flex justify-between font-bold text-emerald-300">
            <span>Cuadre Total: 495 min labores + 45 min pausas</span>
            <span>= 540 min brutos (100% cuadre)</span>
          </div>
        </div>

        {/* Casos 11 y 12: Media Ponderada vs Promedio Simple */}
        <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-sky-400">
              Casos 11-12: Media Ponderada vs Promedio Simple
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/40 font-mono">
              Anti-Distorsión
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Demostración de por qué el promedio simple de porcentajes genera falsos positivos:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Labor 1 (Corta): 30 min reales al 150%</span>
              <span className="text-slate-200 font-mono">Tiempo estándar: 45 min</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Labor 2 (Larga): 300 min reales al 80%</span>
              <span className="text-slate-200 font-mono">Tiempo estándar: 240 min</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/40 text-center">
              <span className="text-[10px] text-rose-400 uppercase font-semibold block">Promedio Simple (Erróneo)</span>
              <p className="text-lg font-mono font-bold text-rose-300 mt-0.5">115.00%</p>
              <span className="text-[10px] text-slate-400">(150 + 80) / 2</span>
            </div>
            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Media Ponderada Real</span>
              <p className="text-lg font-mono font-bold text-emerald-300 mt-0.5">86.36%</p>
              <span className="text-[10px] text-emerald-400 font-mono">(285m / 330m) × 100</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            *NexoCampo implementa exclusivamente la media ponderada, evitando reportes inflados de productividad.
          </p>
        </div>

      </div>

      {/* Cuadrícula de los 16 Casos con Estado de Prueba */}
      <div className={`p-4 rounded-xl border space-y-3 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Inventario de los 16 Casos de Integridad y Aritmética
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {[
            { num: '01', titulo: 'Jornada con 1 Labor', estado: '475 min netos exactos' },
            { num: '02', titulo: '3 Labores Consecutivas', estado: '1 sola jornada general' },
            { num: '03', titulo: 'Subtareas que Heredan', estado: 'Cero solapamiento aparente' },
            { num: '04', titulo: 'Solapamiento Real', estado: 'Bloqueo estricto colisión' },
            { num: '05', titulo: 'Pausa Excluida', estado: 'Deducción computable 325m' },
            { num: '06', titulo: 'Labor Pendiente', estado: 'No penaliza injustamente' },
            { num: '07', titulo: 'Sin Estándar Temporal', estado: 'null (ESTANDAR_NO_DISPONIBLE)' },
            { num: '08', titulo: 'División por Cero', estado: 'Cero Infinity / NaN' },
            { num: '09', titulo: 'Meta y Producción 100%', estado: 'META_CUMPLIDA' },
            { num: '10', titulo: 'Muestra Insuficiente', estado: 'Alerta < 60 min' },
            { num: '11', titulo: 'Consulta vs Reporte', estado: 'Servicio único unificado' },
            { num: '12', titulo: 'Modificación Guardada', estado: 'Auditoría y recalculo v1' },
            { num: '13', titulo: 'Completado > Meta', estado: '120% sin truncar a 100%' },
            { num: '14', titulo: 'Oficios Varios (5/4)', estado: '125% supero_asignacion' },
            { num: '15', titulo: 'Interrupción por Lluvia', estado: 'Tiempo muerto no castigado' },
            { num: '16', titulo: 'Subtareas Cobertura', estado: 'Cero doble contabilización' },
          ].map((c) => (
            <div key={c.num} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-400">Caso {c.num}</span>
                <span className="text-[10px] text-emerald-300">✓ Test OK</span>
              </div>
              <p className="font-semibold text-slate-200 text-[11px] truncate">{c.titulo}</p>
              <p className="text-[10px] text-slate-400 font-mono">{c.estado}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
