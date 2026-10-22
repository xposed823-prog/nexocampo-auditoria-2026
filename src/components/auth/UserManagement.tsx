/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Gestión de Usuarios
 * Componente para que el administrador gestione usuarios
 */

import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Shield, Edit, Trash2, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { authService } from '../../domain/authService';
import { AuthUser, UserRole, SECURITY_CONFIG } from '../../domain/authTypes';

interface UserManagementProps {
  onClose: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Formulario de nuevo usuario
  const [newUser, setNewUser] = useState({
    username: '',
    pin: '',
    role: 'supervisor' as UserRole
  });
  const [showPin, setShowPin] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPinMasked, setShowPinMasked] = useState<Record<string, boolean>>({});

  // Cargar usuarios
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersList = await authService.getAllUsers();
      setUsers(usersList);
      setError(null);
    } catch (e) {
      setError('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePinChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setNewUser(prev => ({ ...prev, pin: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!newUser.username.trim()) {
      setError('El nombre de usuario es obligatorio');
      return;
    }

    if (newUser.pin.length < SECURITY_CONFIG.PIN_MIN_LENGTH) {
      setError(`El PIN debe tener al menos ${SECURITY_CONFIG.PIN_MIN_LENGTH} dígitos`);
      return;
    }

    try {
      if (editUserId) {
        // Actualizar PIN del usuario
        const result = await authService.updatePin(editUserId, newUser.pin);
        if (result.success) {
          await loadUsers();
          resetForm();
        } else {
          setError(result.error || 'Error al actualizar PIN');
        }
      } else {
        // Crear nuevo usuario
        const result = await authService.registerUser(newUser as any);
        if (result.success) {
          await loadUsers();
          resetForm();
        } else {
          setError(result.error || 'Error al crear usuario');
        }
      }
    } catch (e) {
      setError('Error de conexión');
    }
  };

  const resetForm = () => {
    setNewUser({ username: '', pin: '', role: 'supervisor' });
    setEditUserId(null);
    setShowPin(false);
  };

  const handleEdit = (user: AuthUser) => {
    setEditUserId(user.id);
    setNewUser({ username: user.username, pin: '', role: user.role });
  };

  const handleDelete = async (userId: string) => {
    try {
      const result = await authService.deleteUser(userId);
      if (result.success) {
        await loadUsers();
        setShowDeleteConfirm(null);
      } else {
        setError(result.error || 'Error al eliminar usuario');
      }
    } catch (e) {
      setError('Error de conexión');
    }
  };

  const toggleShowPinMasked = (userId: string) => {
    setShowPinMasked(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'administrador': return 'bg-rose-500/20 text-rose-400 border-rose-500';
      case 'supervisor': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500';
      case 'auditor': return 'bg-sky-500/20 text-sky-400 border-sky-500';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      administrador: 'Administrador',
      supervisor: 'Supervisor',
      auditor: 'Auditor'
    };
    return labels[role] || role;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestión de Usuarios
          </h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          {/* Error */}
          {error && (
            <div className="p-3 bg-rose-900/30 border border-rose-500 rounded-lg text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Formulario de usuario */}
          <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white">
              {editUserId ? 'Actualizar PIN de Usuario' : 'Crear Nuevo Usuario'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  placeholder="Nombre de usuario"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm"
                  disabled={!!editUserId}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  PIN ({SECURITY_CONFIG.PIN_MIN_LENGTH}-{SECURITY_CONFIG.PIN_MAX_LENGTH} dígitos)
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    name="pin"
                    value={newUser.pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    placeholder="PIN"
                    maxLength={SECURITY_CONFIG.PIN_MAX_LENGTH}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm pr-10"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!editUserId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Rol
                  </label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                  >
                    <option value="supervisor">Supervisor</option>
                    <option value="administrador">Administrador</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg flex items-center gap-1"
              >
                {editUserId ? (
                  <>
                    <Edit className="w-4 h-4" />
                    Actualizar PIN
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Crear Usuario
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Lista de usuarios */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-3 bg-slate-900/50 border-b border-slate-700">
              <h3 className="text-sm font-semibold text-white">
                Usuarios Existentes ({users.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-slate-400">
                Cargando usuarios...
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No hay usuarios registrados
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {users.map(user => (
                  <div key={user.id} className="p-3 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{user.username}</span>
                          <span className={`text-xs px-2 py-0.5 rounded border ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          ID: {user.id} | Creado: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-400 hover:text-emerald-400"
                          title="Editar PIN"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-400"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-rose-500 rounded-xl p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  ¿Eliminar usuario?
                </h3>
                <p className="text-slate-400 mb-4">
                  Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este usuario?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
