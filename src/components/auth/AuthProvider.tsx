/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Proveedor de Contexto de Autenticación
 * Componente para manejar el estado de autenticación globalmente
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, AuthUser, Permission } from '../../domain/authTypes';
import { authService, AuthService } from '../../domain/authService';

interface AuthContextType extends AuthState {
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  canAccessModule: (module: string) => boolean;
  hasRole: (role: import('../../domain/authTypes').UserRole | import('../../domain/authTypes').UserRole[]) => boolean;
  getCurrentUser: () => AuthUser | null;
  renewSession: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(authService.getAuthState());

  // Escuchar cambios en el servicio de autenticación
  useEffect(() => {
    // Por ahora, usamos polling para detectar cambios
    // En una implementación más avanzada, podríamos usar eventos
    const interval = setInterval(() => {
      const currentState = authService.getAuthState();
      if (currentState.isAuthenticated !== state.isAuthenticated) {
        setState({ ...currentState });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  const login = async (username: string, pin: string): Promise<boolean> => {
    const result = await authService.login({ username, pin });
    if (result.success) {
      setState(authService.getAuthState());
    }
    return result.success;
  };

  const logout = () => {
    authService.logout('Logout manual');
    setState(authService.getAuthState());
  };

  const hasPermission = (permission: Permission): boolean => {
    return authService.hasPermission(permission);
  };

  const canAccessModule = (module: string): boolean => {
    return authService.canAccessModule(module);
  };

  const hasRole = (role: import('../../domain/authTypes').UserRole | import('../../domain/authTypes').UserRole[]): boolean => {
    return authService.hasRole(role);
  };

  const getCurrentUser = (): AuthUser | null => {
    return authService.getCurrentUser();
  };

  const renewSession = () => {
    authService.renewSession();
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    hasPermission,
    canAccessModule,
    hasRole,
    getCurrentUser,
    renewSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthProvider;
