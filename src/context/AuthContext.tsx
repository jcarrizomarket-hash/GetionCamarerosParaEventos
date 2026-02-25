import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, User, LoginCredentials, AuthResponse } from '../types/auth';
import * as authService from '../utils/authService';
import { saveToken, getToken, removeToken, getTokenPayload, isTokenExpired } from '../utils/tokenManager';

const AuthContext = createContext<AuthContextType | null>(null);

function userFromToken(token: string): User | null {
  const payload = getTokenPayload(token);
  if (!payload) return null;
  return {
    id: payload.sub ?? payload.id ?? '',
    email: payload.email ?? '',
    nombre: payload.nombre ?? payload.name ?? '',
    apellido: payload.apellido,
    role: payload.role ?? 'User',
    createdAt: payload.createdAt ?? '',
    updatedAt: payload.updatedAt ?? '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      setUser(userFromToken(token));
    } else if (token) {
      removeToken();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const result = await authService.login(credentials);
    if (result.success && result.token) {
      saveToken(result.token, credentials.rememberMe);
      setUser(result.user ?? userFromToken(result.token));
    }
    return result;
  }, []);

  const socialLogin = useCallback(async (provider: string, idToken: string): Promise<AuthResponse> => {
    const result = await authService.socialLogin(provider, idToken);
    if (result.success && result.token) {
      saveToken(result.token);
      setUser(result.user ?? userFromToken(result.token));
    }
    return result;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    removeToken();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<AuthResponse> => {
    return authService.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (token: string, tempPassword: string, newPassword: string): Promise<AuthResponse> => {
    return authService.resetPassword(token, tempPassword, newPassword);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    return authService.changePassword(currentPassword, newPassword);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    role: user?.role ?? null,
    login,
    socialLogin,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
