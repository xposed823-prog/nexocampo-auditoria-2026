/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NexoCampo 2026 - Pantalla de Login
 * Componente de autenticación con PIN
 */

import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../../domain/authService';
import { SECURITY_CONFIG } from '../../domain/authTypes';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onForgotPin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onForgotPin }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLockoutMessage, setShowLockoutMessage] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Inicializar usuarios al montar el componente
  useEffect(() => {
    authService.initializeUsers();
  }, []);

  // Verificar si hay bloqueo
  useEffect(() => {
    const checkLockout = async () => {
      const authState = authService.getAuthState();
      if (authState.error?.includes('bloqueada')) {
        const match = authState.error.match(/\d+/);
        if (match) {
          setLockoutTime(parseInt(match[0], 10));
          setShowLockoutMessage(true);
        }
      }
    };
    checkLockout();
  }, []);

  // Manejar el temporizador de bloqueo
  useEffect(() => {
    if (showLockoutMessage && lockoutTime) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev && prev <= 1) {
            setShowLockoutMessage(false);
            clearInterval(timer);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showLockoutMessage, lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validaciones
    if (!username.trim()) {
      setError('Ingrese el nombre de usuario');
      setIsLoading(false);
      return;
    }

    if (!pin || pin.length < SECURITY_CONFIG.PIN_MIN_LENGTH) {
      setError(`El PIN debe tener al menos ${SECURITY_CONFIG.PIN_MIN_LENGTH} dígitos`);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.login({ username, pin });
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Error al iniciar sesión');
        if (result.error?.includes('bloqueada')) {
          const match = result.error.match(/\d+/);
          if (match) {
            setLockoutTime(parseInt(match[0], 10));
            setShowLockoutMessage(true);
          }
        }
      }
    } catch (e) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    // Solo permitir dígitos
    if (/^\d*$/.test(value)) {
      setPin(value);
    }
  };

  if (showLockoutMessage && lockoutTime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md bg-slate-900 border border-rose-500 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Cuenta Bloqueada</h2>
          <p className="text-slate-400 mb-4">
            Demasiados intentos fallidos. Por favor, espere {lockoutTime} minutos.
          </p>
          <p className="text-xs text-slate-500">
            Si no es su cuenta, contacte al administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-white">NexoCampo PRO</h1>
          <p className="text-slate-400 text-sm">Supervisión Agrícola Offline-First</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6">
          {/* Usuario */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              PIN ({SECURITY_CONFIG.PIN_MIN_LENGTH}-{SECURITY_CONFIG.PIN_MAX_LENGTH} dígitos)
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="Ingrese su PIN"
                maxLength={SECURITY_CONFIG.PIN_MAX_LENGTH}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-12"
                autoComplete="current-password"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-rose-900/30 border border-rose-500 rounded-lg text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Botón de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Olvidé mi PIN */}
          {onForgotPin && (
            <button
              type="button"
              onClick={onForgotPin}
              className="w-full text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              ¿Olvidó su PIN?
            </button>
          )}
        </form>

        {/* Información */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Usuario por defecto: <code className="text-emerald-400">admin</code> / PIN: <code className="text-emerald-400">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
