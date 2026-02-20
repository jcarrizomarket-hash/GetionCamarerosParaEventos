import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export type UserRole = 'admin' | 'coordinador';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  coordinadorId?: string; // solo si role === 'coordinador'
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isCoordinador: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

const SESSION_KEY = 'gce_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Verificar que el token sigue siendo válido
        verifySession(parsed.token, parsed.user).then((valid) => {
          if (valid) {
            setUser(parsed.user);
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const verifySession = async (token: string, userData: AuthUser): Promise<boolean> => {
    try {
      const res = await fetch(`${baseUrl}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'x-session-token': token,
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        return { error: data.error || 'Credenciales incorrectas' };
      }

      const { user: userData, token } = data;
      setUser(userData);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userData, token }));
      return {};
    } catch (e) {
      return { error: 'Error de conexión con el servidor' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === 'admin',
        isCoordinador: user?.role === 'coordinador',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
