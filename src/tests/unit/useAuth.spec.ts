/**
 * Tests unitarios para el hook useAuth y utilidades de autenticación
 * Framework: Vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Hoist mock functions so they are available when vi.mock factories execute
// ---------------------------------------------------------------------------

const { mockGetSession, mockOnAuthStateChange, mockSignOut, mockUnsubscribe } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignOut: vi.fn(),
  mockUnsubscribe: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}));

// Mock supabase info so the hook doesn't use real credentials
vi.mock('../../utils/supabase/info', () => ({
  projectId: 'test-project',
  publicAnonKey: 'test-anon-key',
}));

import { useAuth } from '../../hooks/useAuth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal base64url-encoded JWT for testing */
function buildFakeJwt(payload: Record<string, any>): string {
  const toBase64Url = (obj: Record<string, any>) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const header = toBase64Url({ alg: 'HS256', typ: 'JWT' });
  const body = toBase64Url(payload);
  return `${header}.${body}.fakesignature`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600;  // 1 hour ago

function makeFakeSession(overrides: Record<string, any> = {}) {
  const defaults = {
    access_token: buildFakeJwt({ sub: 'user-123', email: 'test@example.com', role: 'admin', exp: FUTURE_EXP }),
    expires_at: FUTURE_EXP,
    user: {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: { role: 'admin' },
      user_metadata: {},
    },
  };
  return { ...defaults, ...overrides };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  // Default: no active session
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: mockUnsubscribe } } });
  mockSignOut.mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllTimers();
});

describe('useAuth – initial state', () => {
  it('starts in loading state with no session', async () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.session).toBeNull();
    expect(result.current.userSession).toBeNull();
    expect(result.current.isExpired).toBe(false);
  });

  it('subscribes to auth state changes on mount', async () => {
    const { unmount } = renderHook(() => useAuth());
    await waitFor(() => expect(mockOnAuthStateChange).toHaveBeenCalledOnce());
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

describe('useAuth – active session', () => {
  it('sets session and userSession when Supabase returns a valid session', async () => {
    const fakeSession = makeFakeSession();
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.session).toEqual(fakeSession);
    expect(result.current.userSession).toMatchObject({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'admin',
      expiresAt: FUTURE_EXP,
    });
    expect(result.current.isExpired).toBe(false);
  });
});

describe('useAuth – expired session', () => {
  it('marks session as expired when expires_at is in the past', async () => {
    const expiredSession = makeFakeSession({ expires_at: PAST_EXP });
    mockGetSession.mockResolvedValue({ data: { session: expiredSession } });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.session).toBeNull();
    expect(result.current.userSession).toBeNull();
    expect(result.current.isExpired).toBe(true);
  });
});

describe('useAuth – getAuthHeaders', () => {
  it('returns anon key header when no session is active', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const headers = result.current.getAuthHeaders();
    expect(headers.Authorization).toBe('Bearer test-anon-key');
  });

  it('returns session access token when a session is active', async () => {
    const fakeSession = makeFakeSession({ access_token: 'session-token-abc' });
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const headers = result.current.getAuthHeaders();
    expect(headers.Authorization).toBe('Bearer session-token-abc');
  });
});

describe('useAuth – signOut', () => {
  it('clears session and userSession on sign out', async () => {
    const fakeSession = makeFakeSession();
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).not.toBeNull();

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.session).toBeNull();
    expect(result.current.userSession).toBeNull();
    expect(result.current.isExpired).toBe(false);
  });
});

describe('useAuth – onAuthStateChange updates', () => {
  it('updates session when auth state changes to a new session', async () => {
    let capturedCallback: (event: string, session: any) => void;
    mockOnAuthStateChange.mockImplementation((callback) => {
      capturedCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const newSession = makeFakeSession({
      user: { id: 'user-456', email: 'new@example.com', app_metadata: { role: 'coordinador' }, user_metadata: {} },
    });

    act(() => {
      capturedCallback!('SIGNED_IN', newSession);
    });

    await waitFor(() => expect(result.current.session).toEqual(newSession));
    expect(result.current.userSession?.email).toBe('new@example.com');
  });

  it('clears session when auth state changes to null', async () => {
    const fakeSession = makeFakeSession();
    mockGetSession.mockResolvedValue({ data: { session: fakeSession } });

    let capturedCallback: (event: string, session: any) => void;
    mockOnAuthStateChange.mockImplementation((callback) => {
      capturedCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.session).not.toBeNull());

    act(() => {
      capturedCallback!('SIGNED_OUT', null);
    });

    await waitFor(() => expect(result.current.session).toBeNull());
    expect(result.current.userSession).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// UserSession type shape
// ---------------------------------------------------------------------------

describe('UserRole type', () => {
  it('accepts the three defined roles', () => {
    const roles: Array<'admin' | 'coordinador' | 'camarero'> = ['admin', 'coordinador', 'camarero'];
    expect(roles).toHaveLength(3);
  });
});
