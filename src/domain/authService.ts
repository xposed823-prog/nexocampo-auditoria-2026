/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Servicio de Autenticación RBAC
 * Implementación de autenticación con PIN y control de acceso
 */

import { 
  AuthUser, 
  AuthState, 
  LoginCredentials, 
  LoginResult,
  RegisterUserData,
  UserRole,
  USERS_STORE,
  AUTH_SESSION_KEY,
  SECURITY_CONFIG,
  ROLE_PERMISSIONS,
  MODULE_PERMISSIONS,
  Permission
} from './authTypes';
import { dbGet, dbPut, dbGetAll, dbDelete } from './nexocampoDB';
import { clearEncryptionKey, deleteEncryptionKey, initCrypto, setUserEncryptionKey, clearUserEncryptionKey } from './cryptoUtils';

/**
 * Hash simple para PIN (en producción usar bcrypt o similar)
 * Para este prototipo usamos SHA-256
 */
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica un PIN contra su hash
 */
async function verifyPin(pin: string, hash: string): Promise<boolean> {
  const pinHash = await hashPin(pin);
  return pinHash === hash;
}

/**
 * Genera un ID único para usuarios
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Inicializa el almacenamiento de usuarios con un usuario administrador por defecto
 */
export async function initializeUsers(): Promise<void> {
  try {
    const users = await dbGetAll<AuthUser>(USERS_STORE);
    if (users.length === 0) {
      // Crear usuario administrador por defecto
      const adminUser: AuthUser = {
        id: generateUserId(),
        username: 'admin',
        role: 'administrador',
        pinHash: await hashPin('admin123'), // PIN por defecto: admin123
        createdAt: new Date().toISOString()
      };
      await dbPut(USERS_STORE, adminUser);
      console.log('[NexoCampo Auth] Usuario administrador creado por defecto');
    }
  } catch (e) {
    console.error('[NexoCampo Auth] Error al inicializar usuarios:', e);
  }
}

/**
 * Servicio de autenticación
 */
export class AuthService {
  private static instance: AuthService;
  private state: AuthState;
  private loginAttempts: Map<string, { attempts: number; lockedUntil: Date | null }> = new Map();
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.state = {
      isAuthenticated: false,
      user: null,
      isLoading: true,
      error: null
    };
    this.loadSession();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Carga la sesión desde sessionStorage
   */
  private loadSession(): void {
    try {
      const sessionData = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (sessionData) {
        const { user, expiresAt } = JSON.parse(sessionData);
        if (new Date(expiresAt) > new Date()) {
          this.state = {
            isAuthenticated: true,
            user,
            isLoading: false,
            error: null
          };
          this.startSessionTimer();
        } else {
          this.clearSession();
        }
      } else {
        this.state = {
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        };
      }
    } catch (e) {
      this.state = {
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Error al cargar la sesión'
      };
    }
  }

  /**
   * Inicia el temporizador de sesión
   */
  private startSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    this.sessionTimer = setTimeout(() => {
      this.logout('Sesión expirada por inactividad');
    }, SECURITY_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000);
  }

  /**
   * Limpia la sesión
   */
  private clearSession(): void {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    this.state = {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    };
    // Limpiar clave de cifrado
    clearEncryptionKey();
  }

  /**
   * Obtiene el estado de autenticación actual
   */
  public getAuthState(): AuthState {
    return { ...this.state };
  }

  /**
   * Obtiene el usuario autenticado actual
   */
  public getCurrentUser(): AuthUser | null {
    return this.state.user;
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  public hasPermission(permission: Permission): boolean {
    if (!this.state.isAuthenticated || !this.state.user) {
      return false;
    }
    const permissions = ROLE_PERMISSIONS[this.state.user.role];
    return permissions.includes(permission);
  }

  /**
   * Verifica si el usuario tiene acceso a un módulo
   */
  public canAccessModule(module: string): boolean {
    if (!this.state.isAuthenticated || !this.state.user) {
      return false;
    }
    const requiredPermissions = MODULE_PERMISSIONS[module] || [];
    if (requiredPermissions.length === 0) {
      return true; // Módulo público
    }
    return requiredPermissions.every(perm => this.hasPermission(perm));
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  public hasRole(role: UserRole | UserRole[]): boolean {
    if (!this.state.isAuthenticated || !this.state.user) {
      return false;
    }
    if (Array.isArray(role)) {
      return role.includes(this.state.user.role);
    }
    return this.state.user.role === role;
  }

  /**
   * Inicia sesión
   */
  public async login(credentials: LoginCredentials): Promise<LoginResult> {
    // Verificar bloqueo
    const lockInfo = this.loginAttempts.get(credentials.username);
    if (lockInfo && lockInfo.lockedUntil && new Date() < lockInfo.lockedUntil) {
      const remaining = Math.ceil((lockInfo.lockedUntil.getTime() - Date.now()) / 1000 / 60);
      return {
        success: false,
        error: `Cuenta bloqueada. Intente de nuevo en ${remaining} minutos.`
      };
    }

    try {
      this.state = { ...this.state, isLoading: true, error: null };

      // Obtener usuario
      const users = await dbGetAll<AuthUser>(USERS_STORE);
      const user = users.find(u => u.username === credentials.username);

      if (!user) {
        // Registrar intento fallido
        this.recordFailedAttempt(credentials.username);
        return { success: false, error: 'Usuario o PIN incorrectos' };
      }

      // Verificar PIN
      const isValid = await verifyPin(credentials.pin, user.pinHash);
      if (!isValid) {
        this.recordFailedAttempt(credentials.username);
        return { success: false, error: 'Usuario o PIN incorrectos' };
      }

      // Login exitoso
      this.loginAttempts.delete(credentials.username);
      
      // Inicializar cifrado con el PIN del usuario
      await setUserEncryptionKey(credentials.pin);

      // Crear sesión
      const expiresAt = new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000);
      const sessionData = {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          pinHash: user.pinHash,
          createdAt: user.createdAt
        },
        expiresAt: expiresAt.toISOString()
      };
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));

      // Actualizar estado
      this.state = {
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null
      };

      this.startSessionTimer();

      return { success: true, user };
    } catch (e) {
      this.state = {
        ...this.state,
        isLoading: false,
        error: 'Error al iniciar sesión'
      };
      return { success: false, error: 'Error al iniciar sesión' };
    }
  }

  /**
   * Registra un intento fallido de login
   */
  private recordFailedAttempt(username: string): void {
    let lockInfo = this.loginAttempts.get(username);
    if (!lockInfo) {
      lockInfo = { attempts: 0, lockedUntil: null };
    }
    
    lockInfo.attempts++;
    
    if (lockInfo.attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      lockInfo.lockedUntil = new Date(
        Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000
      );
      lockInfo.attempts = 0;
    }
    
    this.loginAttempts.set(username, lockInfo);
  }

  /**
   * Cierra la sesión
   */
  public logout(reason?: string): void {
    this.clearSession();
    clearUserEncryptionKey();
    
    if (reason) {
      console.log(`[NexoCampo Auth] Logout: ${reason}`);
    }
  }

  /**
   * Registra un nuevo usuario (solo administrador)
   */
  public async registerUser(data: RegisterUserData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!this.hasRole('administrador')) {
      return { success: false, error: 'No tiene permisos para crear usuarios' };
    }

    // Validaciones
    if (data.pin.length < SECURITY_CONFIG.PIN_MIN_LENGTH) {
      return { success: false, error: `El PIN debe tener al menos ${SECURITY_CONFIG.PIN_MIN_LENGTH} dígitos` };
    }
    if (data.pin.length > SECURITY_CONFIG.PIN_MAX_LENGTH) {
      return { success: false, error: `El PIN debe tener máximo ${SECURITY_CONFIG.PIN_MAX_LENGTH} dígitos` };
    }

    try {
      // Verificar que el usuario no exista
      const users = await dbGetAll<AuthUser>(USERS_STORE);
      if (users.some(u => u.username === data.username)) {
        return { success: false, error: 'El nombre de usuario ya existe' };
      }

      // Crear usuario
      const user: AuthUser = {
        id: generateUserId(),
        username: data.username,
        role: data.role,
        pinHash: await hashPin(data.pin),
        createdAt: new Date().toISOString()
      };

      await dbPut(USERS_STORE, user);
      return { success: true, user };
    } catch (e) {
      return { success: false, error: 'Error al crear usuario' };
    }
  }

  /**
   * Elimina un usuario (solo administrador)
   */
  public async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.hasRole('administrador')) {
      return { success: false, error: 'No tiene permisos para eliminar usuarios' };
    }

    try {
      // No permitir eliminar el usuario actual
      if (this.state.user?.id === userId) {
        return { success: false, error: 'No puede eliminar su propia cuenta' };
      }

      await dbDelete(USERS_STORE, userId);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Error al eliminar usuario' };
    }
  }

  /**
   * Obtiene todos los usuarios (solo administrador)
   */
  public async getAllUsers(): Promise<AuthUser[]> {
    if (!this.hasRole('administrador')) {
      return [];
    }
    return await dbGetAll<AuthUser>(USERS_STORE);
  }

  /**
   * Actualiza el PIN de un usuario
   */
  public async updatePin(userId: string, newPin: string): Promise<{ success: boolean; error?: string }> {
    if (!this.state.isAuthenticated) {
      return { success: false, error: 'No está autenticado' };
    }

    // Solo administrador puede actualizar cualquier PIN
    // Los usuarios normales solo pueden actualizar su propio PIN
    if (!this.hasRole('administrador') && this.state.user?.id !== userId) {
      return { success: false, error: 'No tiene permisos para actualizar este PIN' };
    }

    // Validaciones
    if (newPin.length < SECURITY_CONFIG.PIN_MIN_LENGTH) {
      return { success: false, error: `El PIN debe tener al menos ${SECURITY_CONFIG.PIN_MIN_LENGTH} dígitos` };
    }
    if (newPin.length > SECURITY_CONFIG.PIN_MAX_LENGTH) {
      return { success: false, error: `El PIN debe tener máximo ${SECURITY_CONFIG.PIN_MAX_LENGTH} dígitos` };
    }

    try {
      const user = await dbGet<AuthUser>(USERS_STORE, userId);
      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      user.pinHash = await hashPin(newPin);
      await dbPut(USERS_STORE, user);
      
      // Si es el usuario actual, actualizar la sesión
      if (this.state.user?.id === userId) {
        this.state.user = user;
        const expiresAt = new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000);
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
          user: { ...user },
          expiresAt: expiresAt.toISOString()
        }));
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Error al actualizar PIN' };
    }
  }

  /**
   * Renueva la sesión (extiende el tiempo de expiración)
   */
  public renewSession(): void {
    if (!this.state.isAuthenticated || !this.state.user) {
      return;
    }

    const expiresAt = new Date(Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT_MINUTES * 60 * 1000);
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
      user: this.state.user,
      expiresAt: expiresAt.toISOString()
    }));
    
    this.startSessionTimer();
  }
}

// Exportar instancia singleton
export const authService = AuthService.getInstance();
