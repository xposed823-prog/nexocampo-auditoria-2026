import React, { useState, useEffect } from 'react';
import { COLABORADORES_CATALOGO } from '../../domain/catalogoAgronomico';
import { dbGetAll, guardarAusenciaRegistro, AusenciaRegistro } from '../../domain/nexocampoDB';
import { suscribirMutacionDatos } from '../../domain/eventBus';

export interface AusenciasModuloProps {
  modoSol?: boolean;
  dispararToast: (msg: string) => void;
}

const CODIGO_A_NOMBRE: Record<string, string> = {
  I: 'Incapacidad Médica',
  JV: 'Jurado de Votación',
  LP: 'Licencia Paternidad/Maternidad',
  P: 'Permiso Personal',
  V: 'Vacaciones',
  SP: 'Suspensión Disciplinaria',
  C: 'Calamidad Doméstica'
};

export const AusenciasModulo: React.FC<AusenciasModuloProps> = ({ dispararToast }) => {
  const [ausencias, setAusencias] = useState<AusenciaRegistro[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);

  const [colaboradorId, setColaboradorId] = useState(COLABORADORES_CATALOGO[0].id);
  const [tipoCodigo, setTipoCodigo] = useState<'I' | 'JV' | 'LP' | 'P' | 'V' | 'SP' | 'C'>('I');
  const [fechaInicio, setFechaInicio] = useState('2026-10-21');
  const [fechaFin, setFechaFin] = useState('2026-10-21');
  const [motivo, setMotivo] = useState('Incapacidad médica EPS');
  const [guardando, setGuardando] = useState(false);

  const cargarAusencias = async () => {
    try {
      const items = await dbGetAll<AusenciaRegistro>('ausencias');
      setAusencias(items || []);
    } catch (e) {
      console.warn('[AusenciasModulo] Error al cargar de IndexedDB:', e);
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

  const handleRegistrarAusencia = async () => {
    if (!colaboradorId || !fechaInicio || !fechaFin) {
      dispararToast('Complete todos los campos requeridos');
      return;
    }
    setGuardando(true);
    try {
      const nuevaAusencia: AusenciaRegistro = {
        id: `aus_${colaboradorId}_${fechaInicio}_${Date.now()}`,
        colaborador_id: colaboradorId,
        tipo: tipoCodigo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        motivo: motivo || CODIGO_A_NOMBRE[tipoCodigo],
        observacion: 'Registrado formalmente desde módulo de ausencias'
      };

      await guardarAusenciaRegistro(nuevaAusencia);
      dispararToast('✓ Ausencia formal registrada y persistida en IndexedDB');
      await cargarAusencias();
      setModalAbierto(false);
    } catch (e: any) {
      dispararToast(`Error al persistir: ${e?.message || 'Error en IndexedDB'}`);
    } finally {
      setGuardando(false);
    }
  };

  const exportarCSV = () => {
    const encabezados = ['Colaborador_ID', 'Tipo', 'Fecha_Inicio', 'Fecha_Fin', 'Motivo'];
    const filas = ausencias.map(a => [
      a.colaborador_id,
      CODIGO_A_NOMBRE[a.tipo] || a.tipo,
      a.fecha_inicio,
      a.fecha_fin,
      `"${a.motivo}"`
    ]);
    const contenido = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Ausencias_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    dispararToast('✓ Ausencias exportadas en formato CSV');
  };

  return (
    <div className="space-y-4 pb-8 select-none">
      {/* 1. BOTÓN PRINCIPAL VERDE: + Registrar ausencia (Imagen 3) */}
      <button
        type="button"
        onClick={() => setModalAbierto(true)}
        className="w-full min-h-[50px] py-3.5 px-4 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer"
      >
        <span>+</span>
        <span>Registrar ausencia</span>
      </button>

      {/* 2. CARD: REPORTES DE AUSENCIAS (Imagen 3) */}
      <div className="rounded-2xl p-4 bg-white border border-slate-200/90 shadow-xs space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>📄</span>
          <span>REPORTES DE AUSENCIAS</span>
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
          El CSV se guarda en NexoCampo/Ausencia. El PDF se abre para imprimir o guardar desde el navegador.
        </p>
      </div>

      {/* 3. CARD: Sin ausencias registradas (Imagen 3) */}
      {ausencias.length === 0 ? (
        <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-xs text-center">
          <p className="text-xs font-bold text-slate-500">
            Sin ausencias registradas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {ausencias.map(aus => {
            const col = COLABORADORES_CATALOGO.find(c => c.id === aus.colaborador_id);
            return (
              <div key={aus.id} className="p-3.5 px-4 flex items-center justify-between gap-2">
                <div>
                  <span className="font-extrabold text-xs text-slate-900 block">
                    {col?.nombreCompleto || aus.colaborador_id}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    [{aus.tipo}] {CODIGO_A_NOMBRE[aus.tipo] || aus.motivo}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {aus.fecha_inicio} al {aus.fecha_fin}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                  Registrada
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL REGISTRAR AUSENCIA */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">
                Registrar Ausencia de Campo
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Colaborador</label>
                <select
                  value={colaboradorId}
                  onChange={(e) => setColaboradorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  {COLABORADORES_CATALOGO.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombreCompleto || c.alias} ({c.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Tipo de Ausencia (Código Oficial)</label>
                <select
                  value={tipoCodigo}
                  onChange={(e) => setTipoCodigo(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="I">[I] Incapacidad Médica EPS</option>
                  <option value="JV">[JV] Jurado de Votación</option>
                  <option value="LP">[LP] Licencia Paternidad/Maternidad</option>
                  <option value="P">[P] Permiso Personal Remunerado</option>
                  <option value="V">[V] Vacaciones</option>
                  <option value="SP">[SP] Suspensión Disciplinaria</option>
                  <option value="C">[C] Calamidad Doméstica</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Motivo / Soporte</label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Detalle o número de incapacidad..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRegistrarAusencia}
                disabled={guardando}
                className="flex-1 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs shadow-xs"
              >
                {guardando ? 'Guardando...' : 'Guardar Ausencia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
