/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Ruta Protegida
 * Componente para proteger rutas que requieren autenticación
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: import('../../domain/authTypes').UserRole | import('../../domain/authTypes').UserRole[];
  requiredModule?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  requiredModule,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, hasPermission, hasRole, canAccessModule } = useAuth();
  const location = useLocation();

  // Verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verificar permiso
  if (requiredPermission && !hasPermission(requiredPermission as any)) {
    return <Navigate to={redirectTo} state={{ from: location, error: 'No tiene permiso' }} replace />;
  }

  // Verificar rol
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={redirectTo} state={{ from: location, error: 'No tiene el rol requerido' }} replace />;
  }

  // Verificar acceso al módulo
  if (requiredModule && !canAccessModule(requiredModule)) {
    return <Navigate to={redirectTo} state={{ from: location, error: 'No tiene acceso a este módulo' }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
