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
      className={`flex overflow-x-auto px-4 py-1.5 gap-1 border-t text-xs font-semibold no-scrollbar ${
        modoSol ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800'
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
            className={`min-h-[44px] flex items-center gap-1.5 px-3 rounded-lg whitespace-nowrap transition-colors ${
              activo
                ? modoSol
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-emerald-600 text-white font-bold'
                : modoSol
                  ? 'text-slate-700 hover:bg-slate-200'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};
