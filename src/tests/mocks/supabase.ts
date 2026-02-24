/**
 * Mock reutilizable para Supabase client
 * Centraliza la simulación del cliente de Supabase para tests unitarios
 */

import { vi } from 'vitest';

export const mockGetSession = vi.fn();
export const mockOnAuthStateChange = vi.fn();
export const mockSignOut = vi.fn();
export const mockGetUser = vi.fn();
export const mockUnsubscribe = vi.fn();

/** Crea un mock del cliente Supabase con autenticación simulada */
export function createSupabaseMock() {
  return {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
  };
}

/** Configura el mock para devolver sesión activa */
export function mockActiveSession(sessionData: Record<string, unknown> = {}) {
  const defaultSession = {
    access_token: 'mock-access-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: { role: 'admin' },
      user_metadata: {},
    },
    ...sessionData,
  };
  mockGetSession.mockResolvedValueOnce({ data: { session: defaultSession } });
  return defaultSession;
}

/** Configura el mock para devolver sesión nula (sin autenticar) */
export function mockNoSession() {
  mockGetSession.mockResolvedValueOnce({ data: { session: null } });
}

/** Resetea todos los mocks de Supabase */
export function resetSupabaseMocks() {
  vi.clearAllMocks();
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
}
