/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo - Catálogo Agronómico Oficial (v18.1.9)
 * Fuente única de verdad canónica para:
 * 1. Colaboradores (36 colaboradores oficiales del código base)
 * 2. Labores Agrícolas y Tiempos (23 labores oficiales con unidades, modelo y minutos)
 * 3. Áreas, Bloques y Túneles (Jamaica, Piloto, Púrpura, Naranja con estructura territorial real)
 */

export interface Colaborador {
  id: string;
  codigo: string;
  nombreCompleto: string;
  alias: string;
  rol: string;
  cuadrilla: string;
}

export type ModeloLabor = 'individual' | 'grupal_tiempo' | 'grupal_meta' | 'tiempo' | 'oficios_varios';

export interface LaborAgricola {
  id: string;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  min: number | null;
  personalReferencia: number;
  categoria: 'Adecuaciones' | 'Maquinaria' | 'Oficios Varios';
  modelo: ModeloLabor;
  esPlasticoPolisombra?: boolean;
  medicion?: 'tiempo' | 'cantidad' | 'oficios_varios';
  tipo_registro?: 'oficio_vario';
  activa?: boolean;
  creado?: string;
  actualizado?: string;
}

export interface BloqueAgricola {
  id: string;
  nombre: string;
  totalTuneles: number;
  tuneles: string[];
}

export interface AreaAgricola {
  id: string;
  nombre: string;
  codigo: string;
  bloques: BloqueAgricola[];
}

// ==========================================
// 1. CATÁLOGO OFICIAL DE 36 COLABORADORES
// ==========================================
export const COLABORADORES_CATALOGO: Colaborador[] = [
  { id: 'col_1', codigo: 'COL-001', nombreCompleto: 'Anderson Cortes Mendez', alias: 'A. Cortes', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 1' },
  { id: 'col_2', codigo: 'COL-002', nombreCompleto: 'Arnober Serna Palomino', alias: 'A. Serna', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 1' },
  { id: 'col_3', codigo: 'COL-003', nombreCompleto: 'Aurelio Meza Bojorge', alias: 'A. Meza', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 1' },
  { id: 'col_4', codigo: 'COL-004', nombreCompleto: 'Brandon Stiven Rubio Gutierrez', alias: 'B. Rubio', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 1' },
  { id: 'col_5', codigo: 'COL-005', nombreCompleto: 'Camilo Bobadilla', alias: 'C. Bobadilla', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 1' },
  { id: 'col_6', codigo: 'COL-006', nombreCompleto: 'Clisman Andres Marin Giraldo', alias: 'C. Marin', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 2' },
  { id: 'col_7', codigo: 'COL-007', nombreCompleto: 'Diego Fernando Hernandez', alias: 'D. Hernandez', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 2' },
  { id: 'col_8', codigo: 'COL-008', nombreCompleto: 'Efrain Antonio Castro', alias: 'E. Castro', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 2' },
  { id: 'col_9', codigo: 'COL-009', nombreCompleto: 'Eididier Bobadilla Castro', alias: 'E. Bobadilla', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 2' },
  { id: 'col_10', codigo: 'COL-010', nombreCompleto: 'Gustavo Adolfo Cortez', alias: 'G. Cortez', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 2' },
  { id: 'col_11', codigo: 'COL-011', nombreCompleto: 'Hervin Arlex Franco', alias: 'H. Franco', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 2' },
  { id: 'col_12', codigo: 'COL-012', nombreCompleto: 'Jaider De Jesus Plaza', alias: 'J. Plaza', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 3' },
  { id: 'col_13', codigo: 'COL-013', nombreCompleto: 'Jhoan Andres Osorio Marquez', alias: 'J. Osorio', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 3' },
  { id: 'col_14', codigo: 'COL-014', nombreCompleto: 'Jhoan Armando Tascon', alias: 'J. Tascon', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 3' },
  { id: 'col_15', codigo: 'COL-015', nombreCompleto: 'Jhon Fredy Alvarez', alias: 'J. F. Alvarez', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 3' },
  { id: 'col_16', codigo: 'COL-016', nombreCompleto: 'Jhon Jairo Mondragon Garcia', alias: 'J. Mondragon', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 3' },
  { id: 'col_17', codigo: 'COL-017', nombreCompleto: 'Jorge Daniel Alayon Gallo', alias: 'J. Alayon', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 3' },
  { id: 'col_18', codigo: 'COL-018', nombreCompleto: 'Jose Adrian Gomez Loaiza', alias: 'J. A. Gomez', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 4' },
  { id: 'col_19', codigo: 'COL-019', nombreCompleto: 'Jose Albeiro Aguirre Mesa', alias: 'J. Aguirre', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 4' },
  { id: 'col_20', codigo: 'COL-020', nombreCompleto: 'Jose Edison Ortiz', alias: 'J. Ortiz', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 4' },
  { id: 'col_21', codigo: 'COL-021', nombreCompleto: 'Jose Ferney Loaiza', alias: 'J. Loaiza', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 4' },
  { id: 'col_22', codigo: 'COL-022', nombreCompleto: 'Jose Norberto Tobon', alias: 'J. Tobon', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 4' },
  { id: 'col_23', codigo: 'COL-023', nombreCompleto: 'Juan Camilo Toro Sanchez', alias: 'J. Toro', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 4' },
  { id: 'col_24', codigo: 'COL-024', nombreCompleto: 'Juan David Giraldo Escobar', alias: 'J. D. Giraldo', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 5' },
  { id: 'col_25', codigo: 'COL-025', nombreCompleto: 'Juan David Molina', alias: 'J. Molina', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 5' },
  { id: 'col_26', codigo: 'COL-026', nombreCompleto: 'Juan David Uribe Palacio', alias: 'J. Uribe', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 5' },
  { id: 'col_27', codigo: 'COL-027', nombreCompleto: 'Julian Andres Hernandez', alias: 'J. Hernandez', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 5' },
  { id: 'col_28', codigo: 'COL-028', nombreCompleto: 'Luis Carlos Castillo Posso', alias: 'L. Castillo', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 5' },
  { id: 'col_29', codigo: 'COL-029', nombreCompleto: 'Luis Uriel Vergara', alias: 'L. Vergara', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 5' },
  { id: 'col_30', codigo: 'COL-030', nombreCompleto: 'Oscar Mauricio Dominguez', alias: 'O. Dominguez', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 6' },
  { id: 'col_31', codigo: 'COL-031', nombreCompleto: 'Pabel Andres Aguirre', alias: 'P. Aguirre', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 6' },
  { id: 'col_32', codigo: 'COL-032', nombreCompleto: 'Santiago Andres Cardona', alias: 'S. Cardona', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 6' },
  { id: 'col_33', codigo: 'COL-033', nombreCompleto: 'Victor Alfonso Alvarez', alias: 'V. Alvarez', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 6' },
  { id: 'col_34', codigo: 'COL-034', nombreCompleto: 'Victor Alfonso Murillo Alzate', alias: 'V. Murillo', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 6' },
  { id: 'col_35', codigo: 'COL-035', nombreCompleto: 'Wilder Fernando Roa Ortega', alias: 'W. Roa', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 6' },
  { id: 'col_36', codigo: 'COL-036', nombreCompleto: 'Yesilver Alexander Arango', alias: 'Y. Arango', rol: 'Operario de Campo', cuadrilla: 'Cuadrilla 6' }
];

// ==========================================
// 2. CATÁLOGO OFICIAL DE 23 LABORES Y TIEMPOS
// ==========================================
export const LABORES_AGRONOMICAS: LaborAgricola[] = [
  { id: 'lab_1', codigo: 'LAB-01', nombre: 'Arreglo camas', unidadMedida: 'túnel', min: 420, personalReferencia: 1, categoria: 'Adecuaciones', modelo: 'individual' },
  { id: 'lab_2', codigo: 'LAB-02', nombre: 'Mallas y Lapiceros', unidadMedida: 'túnel', min: 150, personalReferencia: 2, categoria: 'Adecuaciones', modelo: 'grupal_tiempo' },
  { id: 'lab_3', codigo: 'LAB-03', nombre: 'Erradicar', unidadMedida: 'túnel', min: 90, personalReferencia: 2, categoria: 'Adecuaciones', modelo: 'grupal_tiempo' },
  { id: 'lab_4', codigo: 'LAB-04', nombre: 'Apli. compost', unidadMedida: 'túnel', min: 50, personalReferencia: 2, categoria: 'Maquinaria', modelo: 'grupal_tiempo' },
  { id: 'lab_5', codigo: 'LAB-05', nombre: 'Empacar compost', unidadMedida: 'estopa', min: 1.71, personalReferencia: 1, categoria: 'Adecuaciones', modelo: 'individual' },
  { id: 'lab_6', codigo: 'LAB-06', nombre: 'Trampas Amarillas', unidadMedida: 'lateral', min: 40, personalReferencia: 2, categoria: 'Adecuaciones', modelo: 'grupal_tiempo' },
  { id: 'lab_7', codigo: 'LAB-07', nombre: 'Aplic. polvos', unidadMedida: 'túnel', min: 60, personalReferencia: 1, categoria: 'Adecuaciones', modelo: 'individual' },
  { id: 'lab_8', codigo: 'LAB-08', nombre: 'Man. drenajes', unidadMedida: 'drenaje', min: 450, personalReferencia: 1, categoria: 'Adecuaciones', modelo: 'individual' },
  { id: 'lab_9', codigo: 'LAB-09', nombre: 'Entrar bordes laterales', unidadMedida: 'túnel', min: 20, personalReferencia: 1, categoria: 'Adecuaciones', modelo: 'individual' },
  { id: 'lab_10', codigo: 'LAB-10', nombre: 'Mantenimiento Drenajes frontales', unidadMedida: 'bloque', min: 30, personalReferencia: 1, categoria: 'Adecuaciones', modelo: 'individual' },
  { id: 'lab_11', codigo: 'LAB-11', nombre: 'Instalación de sombra frontales', unidadMedida: 'frontal', min: 50, personalReferencia: 2, categoria: 'Adecuaciones', modelo: 'grupal_tiempo' },
  { id: 'lab_12', codigo: 'LAB-12', nombre: 'Instalar plásticos', unidadMedida: 'túnel', min: 40, personalReferencia: 6, categoria: 'Adecuaciones', modelo: 'grupal_meta', esPlasticoPolisombra: true },
  { id: 'lab_13', codigo: 'LAB-13', nombre: 'Instalar sombras', unidadMedida: 'túnel', min: 15, personalReferencia: 4, categoria: 'Adecuaciones', modelo: 'grupal_meta', esPlasticoPolisombra: true },
  { id: 'lab_14', codigo: 'LAB-14', nombre: 'Retirar y doblar plástico', unidadMedida: 'túnel', min: 20, personalReferencia: 6, categoria: 'Adecuaciones', modelo: 'grupal_meta', esPlasticoPolisombra: true },
  { id: 'lab_15', codigo: 'LAB-15', nombre: 'Retirar y doblar sombras', unidadMedida: 'túnel', min: 20, personalReferencia: 6, categoria: 'Adecuaciones', modelo: 'grupal_meta', esPlasticoPolisombra: true },
  { id: 'lab_16', codigo: 'LAB-16', nombre: 'Montaje combinado plástico + polisombra', unidadMedida: 'túnel', min: null, personalReferencia: 6, categoria: 'Adecuaciones', modelo: 'grupal_meta', esPlasticoPolisombra: true },
  { id: 'lab_17', codigo: 'LAB-17', nombre: 'Fumigación', unidadMedida: 'tiempo', min: null, personalReferencia: 1, categoria: 'Adecuaciones', modelo: 'tiempo' },
  { id: 'lab_18', codigo: 'LAB-18', nombre: 'Encamadora', unidadMedida: 'tiempo', min: null, personalReferencia: 1, categoria: 'Maquinaria', modelo: 'tiempo' },
  { id: 'lab_19', codigo: 'LAB-19', nombre: 'Rastra', unidadMedida: 'tiempo', min: null, personalReferencia: 1, categoria: 'Maquinaria', modelo: 'tiempo' },
  { id: 'lab_20', codigo: 'LAB-20', nombre: 'Rotavito', unidadMedida: 'tiempo', min: null, personalReferencia: 1, categoria: 'Maquinaria', modelo: 'tiempo' },
  { id: 'lab_21', codigo: 'LAB-21', nombre: 'Paleador', unidadMedida: 'tiempo', min: null, personalReferencia: 1, categoria: 'Maquinaria', modelo: 'tiempo' },
  { id: 'lab_22', codigo: 'LAB-22', nombre: 'Retroexcavadora', unidadMedida: 'tiempo', min: null, personalReferencia: 1, categoria: 'Maquinaria', modelo: 'tiempo' },
  { id: 'lab_23', codigo: 'LAB-23', nombre: 'Mini excavadora', unidadMedida: 'tiempo', min: null, personalReferencia: 1, categoria: 'Maquinaria', modelo: 'tiempo' }
];

// Helper para generar túneles del 1 a N
function generarTuneles(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `Túnel ${i + 1}`);
}

// ==========================================
// 3. ESTRUCTURA TERRITORIAL OFICIAL (4 ÁREAS)
// ==========================================
export const AREAS_AGRONOMICAS: AreaAgricola[] = [
  // 1. ÁREA JAMAICA
  {
    id: 'area_jamaica',
    codigo: 'JAM',
    nombre: 'Jamaica',
    bloques: [
      { id: 'jam_t5', nombre: 'T5', totalTuneles: 3, tuneles: ['Túnel 1', 'Túnel 2', 'Túnel 3'] },
      { id: 'jam_t6', nombre: 'T6', totalTuneles: 7, tuneles: generarTuneles(7) },
      { id: 'jam_t7', nombre: 'T7', totalTuneles: 5, tuneles: generarTuneles(5) },
      { id: 'jam_t8', nombre: 'T8', totalTuneles: 4, tuneles: generarTuneles(4) },
      { id: 'jam_t9', nombre: 'T9', totalTuneles: 5, tuneles: generarTuneles(5) },
      { id: 'jam_comun', nombre: 'Común', totalTuneles: 1, tuneles: ['Común'] }
    ]
  },

  // 2. ÁREA PILOTO
  {
    id: 'area_piloto',
    codigo: 'PIL',
    nombre: 'Piloto',
    bloques: [
      { id: 'pil_t1', nombre: 'T1', totalTuneles: 6, tuneles: generarTuneles(6) },
      { id: 'pil_t2', nombre: 'T2', totalTuneles: 6, tuneles: generarTuneles(6) },
      { id: 'pil_t3', nombre: 'T3', totalTuneles: 6, tuneles: generarTuneles(6) },
      { id: 'pil_t4', nombre: 'T4', totalTuneles: 6, tuneles: generarTuneles(6) },
      { id: 'pil_comun', nombre: 'Común', totalTuneles: 1, tuneles: ['Común'] }
    ]
  },

  // 3. ÁREA PÚRPURA
  // Bloques: A1-A7, B1-B7, C2-C7, D3-D7, E3-E7, F5-F7, G4-G7, H4-H7, Común. Cada uno túneles 1 al 6.
  {
    id: 'area_purpura',
    codigo: 'PUR',
    nombre: 'Púrpura',
    bloques: [
      // Bloques A (1 al 7)
      ...[1, 2, 3, 4, 5, 6, 7].map(n => ({ id: `pur_a${n}`, nombre: `A${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques B (1 al 7)
      ...[1, 2, 3, 4, 5, 6, 7].map(n => ({ id: `pur_b${n}`, nombre: `B${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques C (2 al 7)
      ...[2, 3, 4, 5, 6, 7].map(n => ({ id: `pur_c${n}`, nombre: `C${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques D (3 al 7)
      ...[3, 4, 5, 6, 7].map(n => ({ id: `pur_d${n}`, nombre: `D${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques E (3 al 7)
      ...[3, 4, 5, 6, 7].map(n => ({ id: `pur_e${n}`, nombre: `E${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques F (5 al 7)
      ...[5, 6, 7].map(n => ({ id: `pur_f${n}`, nombre: `F${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques G (4 al 7)
      ...[4, 5, 6, 7].map(n => ({ id: `pur_g${n}`, nombre: `G${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques H (4 al 7)
      ...[4, 5, 6, 7].map(n => ({ id: `pur_h${n}`, nombre: `H${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Común
      { id: 'pur_comun', nombre: 'Común', totalTuneles: 1, tuneles: ['Común'] }
    ]
  },

  // 4. ÁREA NARANJA
  // Bloques: I1-I8, J1-J9, K1-K11, L2-L11, N10-N11, Común (Sin bloques M). Cada uno túneles 1 al 6.
  {
    id: 'area_naranja',
    codigo: 'NAR',
    nombre: 'Naranja',
    bloques: [
      // Bloques I (1 al 8)
      ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ id: `nar_i${n}`, nombre: `I${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques J (1 al 9)
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ id: `nar_j${n}`, nombre: `J${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques K (1 al 11)
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => ({ id: `nar_k${n}`, nombre: `K${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques L (2 al 11)
      ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => ({ id: `nar_l${n}`, nombre: `L${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Bloques N (10 y 11)
      ...[10, 11].map(n => ({ id: `nar_n${n}`, nombre: `N${n}`, totalTuneles: 6, tuneles: generarTuneles(6) })),
      // Común
      { id: 'nar_comun', nombre: 'Común', totalTuneles: 1, tuneles: ['Común'] }
    ]
  }
];

// ==========================================
// 4. MÉTODOS DE BÚSQUEDA Y NAVEGACIÓN
// ==========================================
export function obtenerAreaPorNombre(nombreArea: string): AreaAgricola | undefined {
  if (!nombreArea) return undefined;
  return AREAS_AGRONOMICAS.find(a => a.nombre.toLowerCase() === nombreArea.trim().toLowerCase());
}

export function obtenerBloque(nombreArea: string, nombreBloque: string): BloqueAgricola | undefined {
  const area = obtenerAreaPorNombre(nombreArea);
  if (!area) return undefined;
  return area.bloques.find(b => b.nombre.toLowerCase() === nombreBloque.trim().toLowerCase());
}

export function obtenerTunelesDisponibles(nombreArea: string, nombreBloque: string): string[] {
  const bloque = obtenerBloque(nombreArea, nombreBloque);
  return bloque ? bloque.tuneles : ['Túnel 1', 'Túnel 2', 'Túnel 3', 'Túnel 4', 'Túnel 5', 'Túnel 6'];
}

/**
 * Tareas iniciales de Oficios Varios.
 * No tienen tiempo estándar y no deben generar rendimiento técnico temporal.
 * Se guardan en el almacén existente "labores"; no requieren un store ni DB_VERSION nuevos.
 */
export const OFICIOS_VARIOS_INICIALES: LaborAgricola[] = [
  {
    id: 'oficio_limpieza_laterales',
    codigo: 'OFV-001',
    nombre: 'Limpieza de laterales',
    unidadMedida: 'tarea',
    min: null,
    personalReferencia: 1,
    categoria: 'Oficios Varios',
    modelo: 'oficios_varios',
    medicion: 'oficios_varios',
    tipo_registro: 'oficio_vario',
    activa: true
  },
  {
    id: 'oficio_recoleccion_residuos',
    codigo: 'OFV-002',
    nombre: 'Recolección y retiro de residuos',
    unidadMedida: 'tarea',
    min: null,
    personalReferencia: 1,
    categoria: 'Oficios Varios',
    modelo: 'oficios_varios',
    medicion: 'oficios_varios',
    tipo_registro: 'oficio_vario',
    activa: true
  },
  {
    id: 'oficio_correcciones_adecuaciones',
    codigo: 'OFV-003',
    nombre: 'Correcciones y adecuaciones menores',
    unidadMedida: 'tarea',
    min: null,
    personalReferencia: 1,
    categoria: 'Oficios Varios',
    modelo: 'oficios_varios',
    medicion: 'oficios_varios',
    tipo_registro: 'oficio_vario',
    activa: true
  }
];
