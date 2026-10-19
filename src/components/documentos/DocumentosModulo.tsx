import React from 'react';
import { FileText } from 'lucide-react';

export interface DocumentoItem {
  id: string;
  archivo: string;
  titulo: string;
  resumen: string;
}

export interface DocumentosModuloProps {
  modoSol: boolean;
  version: 'tarea2' | 'tarea3';
  documentos: DocumentoItem[];
  docAbierto?: string;
  setDocAbierto?: (id: string) => void;
}

export const DocumentosModulo: React.FC<DocumentosModuloProps> = ({
  modoSol,
  version,
  documentos,
  docAbierto,
  setDocAbierto
}) => {
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${modoSol ? 'bg-slate-50 border-slate-300' : 'bg-slate-800/40 border-slate-700/60'}`}>
        <h2 className="text-sm font-bold flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          {version === 'tarea3'
            ? 'Especificaciones Técnicas de la Tarea 3 (8 Documentos Generados)'
            : 'Especificaciones Técnicas Generadas en la Tarea 2 (7 Documentos)'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {version === 'tarea3'
            ? 'Archivos markdown normativos guardados en la raíz del proyecto para definir reglas de negocio, fórmulas matemáticas y casos de prueba.'
            : 'Documentos creados en la raíz del proyecto para definir el sistema visual, componentes, modelo de datos y pautas de accesibilidad.'}
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${version === 'tarea3' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3`}>
        {documentos.map((doc) => {
          const activo = docAbierto === doc.id;
          return (
            <div
              key={doc.id}
              onClick={() => setDocAbierto && setDocAbierto(doc.id)}
              className={`p-4 rounded-xl border transition-all ${
                activo
                  ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/50'
                  : modoSol
                    ? 'bg-white border-slate-300 hover:border-slate-400'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-xs font-bold text-emerald-400">/{doc.archivo}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">
                  {version === 'tarea3' ? 'Tarea 3' : 'Tarea 2'}
                </span>
              </div>
              <h3 className="font-semibold text-xs text-slate-200 mb-1">{doc.titulo}</h3>
              <p className="text-[11px] text-slate-400 leading-normal">{doc.resumen}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
