/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Tipos de Autenticación RBAC
 * Definición de roles, permisos y usuarios
 */

/**
 * Roles del sistema NexoCampo
 */
export type UserRole = 'administrador' | 'supervisor' | 'auditor';

/**
 * Permisos disponibles en el sistema
 */
export type Permission = 
  | 'ver_dashboard'
  | 'registrar_jornadas'
  | 'registrar_labores'
  | 'registrar_plastico_polisombra'
  | 'registrar_oficios_varios'
  | 'registrar_asistencia'
  | 'registrar_ausencias'
  | 'registrar_incidentes'
  | 'ver_reportes'
  | 'ver_consulta_cruzada'
  | 'ver_estados'
  | 'ver_respaldos'
  | 'ver_documentos'
  | 'ver_laboratorio'
  | 'ver_configuracion'
  | 'editar_configuracion'
  | 'exportar_datos'
  | 'importar_datos'
  | 'sincronizar_datos'
  | 'gestionar_usuarios';

/**
 * Mapa de permisos por rol
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  administrador: [
    'ver_dashboard',
    'registrar_jornadas',
    'registrar_labores',
    'registrar_plastico_polisombra',
    'registrar_oficios_varios',
    'registrar_asistencia',
    'registrar_ausencias',
    'registrar_incidentes',
    'ver_reportes',
    'ver_consulta_cruzada',
    'ver_estados',
    'ver_respaldos',
    'ver_documentos',
    'ver_laboratorio',
    'ver_configuracion',
    'editar_configuracion',
    'exportar_datos',
    'importar_datos',
    'sincronizar_datos',
    'gestionar_usuarios'
  ],
  supervisor: [
    'ver_dashboard',
    'registrar_jornadas',
    'registrar_labores',
    'registrar_plastico_polisombra',
    'registrar_oficios_varios',
    'registrar_asistencia',
    'registrar_ausencias',
    'registrar_incidentes',
    'ver_reportes',
    'ver_consulta_cruzada',
    'ver_estados',
    'ver_respaldos',
    'sincronizar_datos'
  ],
  auditor: [
    'ver_dashboard',
    'ver_reportes',
    'ver_consulta_cruzada',
    'ver_estados',
    'ver_respaldos',
    'ver_documentos',
    'ver_laboratorio',
    'exportar_datos'
  ]
};

/**
 * Mapa de módulos a permisos requeridos
 */
export const MODULE_PERMISSIONS: Record<string, Permission[]> = {
  'inicio': ['ver_dashboard'],
  'resumen': ['ver_dashboard'],
  'jornadas': ['registrar_jornadas'],
  'labores': ['registrar_labores'],
  'polisombra': ['registrar_plastico_polisombra'],
  'oficios': ['registrar_oficios_varios'],
  'asistencia': ['registrar_asistencia'],
  'ausencias': ['registrar_ausencias'],
  'incidentes': ['registrar_incidentes'],
  'reportes': ['ver_reportes'],
  'consulta': ['ver_consulta_cruzada'],
  'pwa': ['sincronizar_datos'],
  'respaldos': ['ver_respaldos', 'exportar_datos'],
  'documentos': ['ver_documentos'],
  'laboratorio': ['ver_laboratorio'],
  'admin': ['ver_configuracion', 'editar_configuracion', 'gestionar_usuarios']
};

/**
 * Usuario autenticado
 */
export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  pinHash: string; // Hash del PIN (nunca almacenar el PIN en texto claro)
  lastLogin?: string;
  createdAt: string;
}

/**
 * Estado de autenticación
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  username: string;
  pin: string;
}

/**
 * Resultado del login
 */
export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Usuario para registro (solo administrador)
 */
export interface RegisterUserData {
  username: string;
  pin: string;
  role: UserRole;
}

/**
 * Almacenamiento de usuarios en IndexedDB
 */
export const USERS_STORE = 'usuarios' as const;

/**
 * Clave para almacenar el usuario autenticado en sessionStorage
 */
export const AUTH_SESSION_KEY = 'nexocampo_auth_session' as const;

/**
 * Configuración de seguridad
 */
export const SECURITY_CONFIG = {
  PIN_MIN_LENGTH: 4,
  PIN_MAX_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 3,
  SESSION_TIMEOUT_MINUTES: 30, // 30 minutos de inactividad
  LOCKOUT_DURATION_MINUTES: 5 // 5 minutos de bloqueo tras fallos
} as const;
