/**
 * Hook de autenticación para gestión de sesión en el frontend.
 *
 * Funcionalidades:
 * - Mantiene la sesión activa mediante Supabase auth state listener
 * - Detecta y notifica cuando el token ha expirado
 * - Auto-refresh de token a través del SDK de Supabase
 * - Provee headers de autorización para llamadas a la API
 * - Logout automático al detectar expiración
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import type { UserSession, UserRole } from '../src/types';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

/** Interval (ms) at which expiration is proactively checked client-side */
const EXPIRY_CHECK_INTERVAL_MS = 60_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function buildUserSession(session: Session): UserSession {
  const payload = parseJwtPayload(session.access_token);
  const user = session.user;
  const role: UserRole =
    user.app_metadata?.role ??
    user.user_metadata?.role ??
    payload?.role ??
    'camarero';

  return {
    userId: user.id,
    email: user.email ?? '',
    role,
    expiresAt: session.expires_at ?? 0,
  };
}

function isTokenExpired(session: Session | null): boolean {
  if (!session?.expires_at) return false;
  return Math.floor(Date.now() / 1000) >= session.expires_at;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseAuthReturn {
  /** Raw Supabase session; null when unauthenticated */
  session: Session | null;
  /** Structured session with userId, email, role, expiresAt */
  userSession: UserSession | null;
  /** True while the initial session is being loaded */
  loading: boolean;
  /** True when the current token has expired and the user must re-authenticate */
  isExpired: boolean;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /**
   * Returns HTTP headers for authenticated API calls.
   * Falls back to the public anon key when no user session is active.
   */
  getAuthHeaders: () => Record<string, string>;
  /** The configured Supabase client instance */
  supabase: typeof supabase;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  // ---- session helpers ----

  const applySession = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUserSession(newSession ? buildUserSession(newSession) : null);
    setIsExpired(false);
  }, []);

  const handleExpiry = useCallback(() => {
    setSession(null);
    setUserSession(null);
    setIsExpired(true);
  }, []);

  // ---- bootstrap + auth state subscription ----

  useEffect(() => {
    // Load current session on mount
    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      if (initial && isTokenExpired(initial)) {
        handleExpiry();
      } else {
        applySession(initial);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes (handles auto-refresh internally)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      if (updatedSession && isTokenExpired(updatedSession)) {
        handleExpiry();
      } else {
        applySession(updatedSession);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [applySession, handleExpiry]);

  // ---- periodic expiration check ----

  useEffect(() => {
    if (!session) return;

    const id = setInterval(() => {
      if (isTokenExpired(session)) {
        handleExpiry();
      }
    }, EXPIRY_CHECK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [session, handleExpiry]);

  // ---- public API ----

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserSession(null);
    setIsExpired(false);
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = session?.access_token ?? publicAnonKey;
    return { Authorization: `Bearer ${token}` };
  }, [session]);

  return {
    session,
    userSession,
    loading,
    isExpired,
    signOut,
    getAuthHeaders,
    supabase,
  };
}
