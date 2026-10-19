import React from 'react';
import {
  Layers,
  Calendar,
  Briefcase,
  Wrench,
  ShieldAlert,
  ClipboardCheck,
  UserX,
  Search,
  FileBarChart,
  HardHat,
  Database,
  CheckCircle2,
  FileText,
  Wifi
} from 'lucide-react';

export interface NavigationProps {
  tabActual: string;
  setTabActual: (tab: string) => void;
  modoSol: boolean;
}

export const MODULOS_NAVEGACION = [
  { id: 'resumen', label: '1. Resumen', icon: Layers },
  { id: 'pwa_offline', label: '★ PWA & Sync Offline', icon: Wifi },
  { id: 'jornadas', label: '2. Jornadas', icon: Calendar },
  { id: 'labores', label: '3. Labores', icon: Briefcase },
  { id: 'oficios', label: '4. Oficios Varios', icon: Wrench },
  { id: 'polisombra', label: '5. Plástico & Malla', icon: ShieldAlert },
  { id: 'asistencia', label: '6. Asistencia', icon: ClipboardCheck },
  { id: 'ausencias', label: '7. Ausencias', icon: UserX },
  { id: 'consulta', label: '8. Consulta Cruzada', icon: Search },
  { id: 'reportes', label: '9. Reportes', icon: FileBarChart },
  { id: 'incidentes', label: '10. Incidentes', icon: HardHat },
  { id: 'respaldos', label: '11. Respaldos', icon: Database },
  { id: 'casos_matematicos', label: '12. 16 Casos Matemáticos', icon: CheckCircle2 },
  { id: 'docs_tarea3', label: '13. Docs Tarea 3', icon: FileText },
  { id: 'documentos', label: '14. Docs Tarea 2', icon: Layers },
];

export const Navigation: React.FC<NavigationProps> = ({
  tabActual,
  setTabActual,
  modoSol
}) => {
  return (
    <nav
      className={`flex overflow-x-auto px-3 sm:px-4 py-2 gap-1.5 border-t text-xs font-semibold no-scrollbar select-none ${
        modoSol ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-950/80 border-slate-800 backdrop-blur-sm'
      }`}
      aria-label="Navegación de módulos agrícolas"
    >
      {MODULOS_NAVEGACION.map((item) => {
        const Icon = item.icon;
        const activo = tabActual === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTabActual(item.id)}
            className={`min-h-[40px] flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs transition-all duration-150 ${
              activo
                ? modoSol
                  ? 'bg-emerald-700 text-white font-bold shadow-sm'
                  : 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-400/30'
                : modoSol
                  ? 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${activo ? 'text-white' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
