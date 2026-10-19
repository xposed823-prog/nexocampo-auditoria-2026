import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Check,
  Plus
} from 'lucide-react';
import { EstadoVisualNegocio } from '../../domain/formValidators';
import { AREAS_AGRONOMICAS } from '../../domain/catalogoAgronomico';

export interface ColaboradorItem {
  id: string;
  codigo: string;
  alias: string;
  rol: string;
  cuadrilla: string;
}

export interface SubtareaItem {
  id: string;
  nombre: string;
  cant: number;
  unidad: string;
  estado: string;
}

export interface PlasticoModuloProps {
  modoSol: boolean;
  estadoVisualPolisombra: EstadoVisualNegocio;
  polisombraFecha: string;
  setPolisombraFecha: (val: string) => void;
  polisombraInicio: string;
  setPolisombraInicio: (val: string) => void;
  polisombraFin: string;
  setPolisombraFin: (val: string) => void;
  polisombraArea: string;
  setPolisombraArea: (val: string) => void;
  polisombraBloque: string;
  setPolisombraBloque: (val: string) => void;
  polisombraTunel: string;
  setPolisombraTunel: (val: string) => void;
  polisombraIntegrantes: string[];
  setPolisombraIntegrantes: (val: string[]) => void;
  colaboradoresMock: ColaboradorItem[];
  polisombraCantTotal: number;
  setPolisombraCantTotal: (val: number) => void;
  polisombraCantComp: number;
  setPolisombraCantComp: (val: number) => void;
  justificacionConfirmada: boolean;
  setJustificacionConfirmada: (val: boolean) => void;
  motivosJustificacion: string[];
  setModalJustificacionAbierto: (val: boolean) => void;
  polisombraCondiciones: string[];
  setPolisombraCondiciones: (val: string[]) => void;
  subtareasCobertura: SubtareaItem[];
  setSubtareasCobertura: (val: SubtareaItem[]) => void;
  dispararToast: (msg: string) => void;
  esValido: boolean;
}

export const PlasticoModulo: React.FC<PlasticoModuloProps> = ({
  modoSol,
  estadoVisualPolisombra,
  polisombraFecha,
  setPolisombraFecha,
  polisombraInicio,
  setPolisombraInicio,
  polisombraFin,
  setPolisombraFin,
  polisombraArea,
  setPolisombraArea,
  polisombraBloque,
  setPolisombraBloque,
  polisombraTunel,
  setPolisombraTunel,
  polisombraIntegrantes,
  setPolisombraIntegrantes,
  colaboradoresMock,
  polisombraCantTotal,
  setPolisombraCantTotal,
  polisombraCantComp,
  setPolisombraCantComp,
  justificacionConfirmada,
  setJustificacionConfirmada,
  motivosJustificacion,
  setModalJustificacionAbierto,
  polisombraCondiciones,
  setPolisombraCondiciones,
  subtareasCobertura,
  setSubtareasCobertura,
  dispararToast,
  esValido
}) => {
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              Formulario de Plástico y Subtareas de Polisombra
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cuadrilla de hasta 6 integrantes. Las subtareas heredan horario. Selección múltiple de condiciones climáticas y justificación de saldos.
            </p>
          </div>
          {/* Insignia de Estado Normativo */}
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border ${
            estadoVisualPolisombra === 'cumple'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : estadoVisualPolisombra === 'pendiente'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>
            {estadoVisualPolisombra === 'cumple' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {estadoVisualPolisombra === 'pendiente' && <Clock className="w-3.5 h-3.5" />}
            Estado: {estadoVisualPolisombra.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario Principal */}
        <div className={`lg:col-span-2 p-5 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          
          {/* Fecha y Horario Heredado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Fecha</label>
              <input
                type="date"
                value={polisombraFecha}
                onChange={(e) => setPolisombraFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Inicio</label>
              <input
                type="time"
                value={polisombraInicio}
                onChange={(e) => setPolisombraInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hora Fin</label>
              <input
                type="time"
                value={polisombraFin}
                onChange={(e) => setPolisombraFin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono"
              />
            </div>
          </div>

          {/* Ubicación Agronómica Dinámica (Áreas, Bloques y Túneles) */}
          {(() => {
            const areaSeleccionada = AREAS_AGRONOMICAS.find(a => a.nombre.toLowerCase() === polisombraArea.toLowerCase()) || AREAS_AGRONOMICAS[0];
            const bloquesDisponibles = areaSeleccionada ? areaSeleccionada.bloques : [];
            const bloqueSeleccionado = bloquesDisponibles.find(b => b.nombre.toLowerCase() === polisombraBloque.toLowerCase()) || bloquesDisponibles[0];
            const tunelesDisponibles = bloqueSeleccionado ? bloqueSeleccionado.tuneles : ['Túnel 1', 'Túnel 2', 'Túnel 3', 'Túnel 4'];

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Área Agronómica
                  </label>
                  <select
                    value={polisombraArea}
                    onChange={(e) => {
                      const nuevoNombreArea = e.target.value;
                      setPolisombraArea(nuevoNombreArea);
                      const nuevaArea = AREAS_AGRONOMICAS.find(a => a.nombre === nuevoNombreArea);
                      if (nuevaArea && nuevaArea.bloques.length > 0) {
                        setPolisombraBloque(nuevaArea.bloques[0].nombre);
                        if (nuevaArea.bloques[0].tuneles.length > 0) {
                          setPolisombraTunel(nuevaArea.bloques[0].tuneles[0]);
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-medium ${
                      modoSol ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    {AREAS_AGRONOMICAS.map((a) => (
                      <option key={a.id} value={a.nombre}>
                        {a.nombre} ({a.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Bloque
                  </label>
                  <select
                    value={polisombraBloque}
                    onChange={(e) => {
                      const nuevoBloqueNombre = e.target.value;
                      setPolisombraBloque(nuevoBloqueNombre);
                      const bloqueEncontrado = bloquesDisponibles.find(b => b.nombre === nuevoBloqueNombre);
                      if (bloqueEncontrado && bloqueEncontrado.tuneles.length > 0) {
                        setPolisombraTunel(bloqueEncontrado.tuneles[0]);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-medium ${
                      modoSol ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    {bloquesDisponibles.map((b) => (
                      <option key={b.id} value={b.nombre}>
                        {b.nombre} ({b.totalTuneles} túneles)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Túnel ({bloqueSeleccionado ? `${bloqueSeleccionado.totalTuneles} totales` : ''})
                  </label>
                  <select
                    value={polisombraTunel}
                    onChange={(e) => setPolisombraTunel(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-medium ${
                      modoSol ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    {tunelesDisponibles.map((tunelNombre) => (
                      <option key={tunelNombre} value={tunelNombre}>
                        {tunelNombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })()}

          {/* Integrantes de Cuadrilla (Máx 6) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Integrantes de Cuadrilla ({polisombraIntegrantes.length}/6 colaboradores)
              </label>
              {polisombraIntegrantes.length > 6 && (
                <span className="text-xs text-rose-400 font-bold">¡Máximo 6 permitidos!</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colaboradoresMock.map((col) => {
                const seleccionado = polisombraIntegrantes.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      if (seleccionado) {
                        setPolisombraIntegrantes(polisombraIntegrantes.filter(id => id !== col.id));
                      } else {
                        if (polisombraIntegrantes.length < 6) {
                          setPolisombraIntegrantes([...polisombraIntegrantes, col.id]);
                        } else {
                          dispararToast('Límite de 6 integrantes alcanzado');
                        }
                      }
                    }}
                    className={`min-h-[44px] p-2 rounded-lg text-left text-xs border transition-colors flex items-center justify-between ${
                      seleccionado
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold block">{col.codigo}</span>
                      <span className="text-[11px] truncate block">{col.alias}</span>
                    </div>
                    {seleccionado && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cantidades y Saldo */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/40">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Cantidad Total Programada</label>
              <input
                type="number"
                value={polisombraCantTotal}
                onChange={(e) => setPolisombraCantTotal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Cantidad Completada Real</label>
              <input
                type="number"
                value={polisombraCantComp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPolisombraCantComp(val);
                  if (val >= polisombraCantTotal) {
                    setJustificacionConfirmada(true);
                  } else {
                    setJustificacionConfirmada(false);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono font-bold text-emerald-400"
              />
            </div>
          </div>

          {/* Indicador de Saldo Pendiente y Botón de Justificación */}
          {polisombraCantComp < polisombraCantTotal && (
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-200">
                    Saldo Pendiente: {polisombraCantTotal - polisombraCantComp} unidades
                  </p>
                  <p className="text-[11px] text-amber-300/80">
                    {justificacionConfirmada
                      ? `Justificado por: ${motivosJustificacion.join(', ')}`
                      : 'Requiere justificación formal aprobada.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalJustificacionAbierto(true)}
                className="min-h-[44px] px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
              >
                {justificacionConfirmada ? 'Modificar Justificación' : 'Justificar Pendiente'}
              </button>
            </div>
          )}

          {/* Condiciones Ambientales Simultáneas */}
          <div className="pt-2 border-t border-slate-700/40">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Condiciones de Labor en Terreno (Selección Simultánea)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'soleado', label: '☀️ Soleado' },
                { id: 'llovizna_leve', label: '🌦️ Llovizna leve' },
                { id: 'lluvia_moderada_intensa', label: '🌧️ Lluvia moderada/intensa' },
                { id: 'terreno_humedo', label: '💧 Terreno húmedo' },
                { id: 'terreno_lodoso', label: '🚜 Terreno gredoso/lodoso' },
                { id: 'vientos_fuertes', label: '💨 Vientos fuertes' },
              ].map((cond) => {
                const activa = polisombraCondiciones.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => {
                      if (activa) {
                        setPolisombraCondiciones(polisombraCondiciones.filter(c => c !== cond.id));
                      } else {
                        setPolisombraCondiciones([...polisombraCondiciones, cond.id]);
                      }
                    }}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                      activa
                        ? 'bg-sky-950/40 border-sky-400 text-sky-200 font-semibold'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {cond.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón de Guardado */}
          <div className="pt-3">
            <button
              type="button"
              onClick={() => {
                if (!esValido) {
                  dispararToast('Corrija los campos señalados');
                  return;
                }
                dispararToast('Registro de Plástico y Polisombra guardado localmente');
              }}
              className="w-full min-h-[48px] py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md"
            >
              Guardar Registro en IndexedDB
            </button>
          </div>
        </div>

        {/* Subtareas de Cobertura (Herencia Horaria) */}
        <div className={`p-4 rounded-xl border space-y-4 ${modoSol ? 'bg-white border-slate-300' : 'bg-slate-800/50 border-slate-700/60'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Subtareas de Polisombra
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              Heredan Horario ({polisombraInicio} - {polisombraFin})
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Las subtareas no generan nuevos intervalos temporales; comparten la jornada de la labor principal.
          </p>

          <div className="space-y-2.5">
            {subtareasCobertura.map((st) => (
              <div key={st.id} className="p-3 rounded-lg bg-slate-900 border border-slate-700/60 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">{st.nombre}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    st.estado === 'completa' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {st.estado === 'completa' ? 'Completa' : 'Saldo Pendiente'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Cantidad: {st.cant} {st.unidad}</span>
                  <span>Horario: {polisombraInicio} - {polisombraFin}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              const nueva = {
                id: `st_${Date.now()}`,
                nombre: 'Ajuste de templadores laterales',
                cant: 25,
                unidad: 'naves',
                estado: 'completa'
              };
              setSubtareasCobertura([...subtareasCobertura, nueva]);
              dispararToast('Subtarea agregada');
            }}
            className="w-full min-h-[44px] py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            Agregar Subtarea Vinculada
          </button>
        </div>
      </div>
    </div>
  );
};
