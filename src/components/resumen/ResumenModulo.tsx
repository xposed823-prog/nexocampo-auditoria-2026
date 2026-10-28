import React from 'react';

export interface ResumenModuloProps {
  modoSol: boolean;
  setTabActual: (tab: string) => void;
  setModalIncidenteAbierto?: (val: boolean) => void;
}

export const ResumenModulo: React.FC<ResumenModuloProps> = ({
  setTabActual
}) => {
  return (
    <div className="space-y-4 pb-6">
      {/* 1. HERO BANNER VERDE PROFUNDO: CENTRO DE OPERACIONES */}
      <div className="rounded-3xl p-5 bg-gradient-to-b from-[#064e3b] via-[#064e3b] to-[#022c22] text-white shadow-lg space-y-4">
        {/* Chips del Hero */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 font-bold border border-white/10 text-[11px]">
            <span>🚀</span> CENTRO DE OPERACIONES
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 font-medium border border-white/10 text-[11px]">
            <span>📅</span> mié, 21 oct 2026
          </span>
        </div>

        {/* Título Principal y Subtítulo */}
        <div className="space-y-1.5 pt-1">
          <h2 className="text-2xl font-black tracking-tight leading-tight">
            Todo el campo, bajo control.
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
            Registra las jornadas al final del día. El sistema calcula los rendimientos automáticamente.
          </p>
        </div>

        {/* 2 Mini Tarjetas Translúcidas dentro del Hero */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] text-emerald-100">
              <span>Registrados</span>
              <span className="text-emerald-400 font-bold">✓</span>
            </div>
            <p className="text-lg font-black mt-1">
              0 <span className="text-xs font-normal text-emerald-200">de 36</span>
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] text-emerald-100">
              <span>Promedio hoy</span>
              <span>📈</span>
            </div>
            <p className="text-lg font-black mt-1">
              0% <span className="text-xs font-normal text-emerald-200">0</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. FILA DE 3 TARJETAS MÉTRICAS (ACTIVOS, REGISTRADOS, AUSENTES) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-center space-y-0.5">
          <span className="text-2xl font-black text-[#059669] block leading-none">36</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block pt-1">
            ACTIVOS
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-center space-y-0.5">
          <span className="text-2xl font-black text-[#2563eb] block leading-none">0</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block pt-1">
            REGISTRADOS
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-center space-y-0.5">
          <span className="text-2xl font-black text-[#dc2626] block leading-none">0</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block pt-1">
            AUSENTES
          </span>
        </div>
      </div>

      {/* 3. SECCIÓN: RESUMEN DE LOS ÚLTIMOS 7 DÍAS */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
          RESUMEN DE LOS ÚLTIMOS 7 DÍAS
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Jornadas */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-900 leading-none">0</span>
              <span className="text-lg">📋</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">
              JORNADAS
            </span>
            <span className="text-[11px] text-slate-400 block leading-tight">
              registros en el período
            </span>
          </div>

          {/* Card 2: Rendimiento */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-900 leading-none">0%</span>
              <span className="text-lg">📈</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">
              RENDIMIENTO
            </span>
            <span className="text-[11px] text-slate-400 block leading-tight">
              0 jornada(s) con %
            </span>
          </div>

          {/* Card 3: Productivo */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-900 leading-none">0m</span>
              <span className="text-lg">⏱️</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">
              PRODUCTIVO
            </span>
            <span className="text-[11px] text-slate-400 block leading-tight">
              minutos disponibles
            </span>
          </div>

          {/* Card 4: Incidentes */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-900 leading-none">0</span>
              <span className="text-base">🔴</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">
              INCIDENTES
            </span>
            <span className="text-[11px] text-slate-400 block leading-tight">
              registrados en 7 días
            </span>
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN: ACCIONES RÁPIDAS */}
      <div className="space-y-2.5 pt-1">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
          ACCIONES RÁPIDAS
        </h3>

        {/* Botones Grandes Principales: Individual | Grupal */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setTabActual('registrar')}
            className="min-h-[50px] py-3 px-4 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
          >
            <span>👤</span>
            <span>Individual</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActual('registrar')}
            className="min-h-[50px] py-3 px-4 rounded-2xl bg-[#0f766e] hover:bg-[#115e59] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
          >
            <span>👥</span>
            <span>Grupal</span>
          </button>
        </div>

        {/* Botones Secundarios: Ver reportes | Ausencias */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setTabActual('reportes')}
            className="min-h-[46px] py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200/90 shadow-xs active:scale-98 transition-all"
          >
            <span>📊</span>
            <span>Ver reportes</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActual('ausencias')}
            className="min-h-[46px] py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200/90 shadow-xs active:scale-98 transition-all"
          >
            <span>📅</span>
            <span>Ausencias</span>
          </button>
        </div>

        {/* Banner de Advertencia de Colaboradores sin Registrar */}
        <div className="rounded-2xl p-3.5 bg-[#fefce8] border border-[#fef08a] text-[#854d0e] text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 font-extrabold text-[#713f12]">
            <span>⚠️</span>
            <span>36 colaborador(es) sin registrar hoy</span>
          </div>
          <p className="text-[11px] text-[#854d0e] pl-5">
            Toca <strong>Individual</strong> o <strong>Grupal</strong> para registrarlos.
          </p>
        </div>
      </div>
    </div>
  );
};
