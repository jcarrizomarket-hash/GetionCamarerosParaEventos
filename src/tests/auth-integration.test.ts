/**
 * Integration-style authentication tests
 * Covers: AuthContext, token management flow, password validation flow, full login flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Top-level mocks (hoisted by vitest)
// ---------------------------------------------------------------------------

vi.mock('../utils/authService', () => ({
  login: vi.fn(),
  socialLogin: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock('../utils/supabase/info', () => ({
  projectId: 'test-project',
  publicAnonKey: 'test-anon-key',
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { AuthProvider, useAuthContext } from '../context/AuthContext';
import * as authService from '../utils/authService';
import { saveToken, getToken, removeToken, isTokenExpired, getTokenPayload } from '../utils/tokenManager';
import { validatePasswordRequirements } from '../utils/authValidators';
import type { User } from '../types/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildFakeJwt(payload: Record<string, unknown>): string {
  const b64url = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.fakesig`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;
const PAST_EXP = Math.floor(Date.now() / 1000) - 3600;

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'test@example.com',
    nombre: 'Test User',
    role: 'User',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

// Wrapper component using React.createElement (no JSX needed in .ts file)
const authWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children);

// ============================================================
// GROUP 1: AuthContext integration (8 tests)
// ============================================================

describe('AuthContext integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(authService.logout).mockResolvedValue({ success: true });
  });

  it('AuthProvider renders children and provides context without crashing', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current).toBeDefined();
    expect(typeof result.current.login).toBe('function');
  });

  it('isAuthenticated is false initially when no token is stored', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('login success updates user and isAuthenticated to true', async () => {
    const fakeUser = makeUser({ email: 'login@test.com' });
    const fakeToken = buildFakeJwt({ sub: 'u1', email: 'login@test.com', role: 'User', exp: FUTURE_EXP });
    vi.mocked(authService.login).mockResolvedValue({ success: true, token: fakeToken, user: fakeUser });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login({ email: 'login@test.com', password: 'Pass1!' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('login@test.com');
  });

  it('login failure keeps isAuthenticated false and returns error', async () => {
    vi.mocked(authService.login).mockResolvedValue({ success: false, error: 'Invalid credentials' });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current.login({ email: 'x@x.com', password: 'wrong' });
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Invalid credentials');
  });

  it('logout clears user and sets isAuthenticated to false', async () => {
    const fakeUser = makeUser();
    const fakeToken = buildFakeJwt({ sub: 'u1', email: 'test@example.com', role: 'User', exp: FUTURE_EXP });
    vi.mocked(authService.login).mockResolvedValue({ success: true, token: fakeToken, user: fakeUser });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.login({ email: 'test@example.com', password: 'pass' }); });
    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => { await result.current.logout(); });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('changePassword calls authService.changePassword with correct arguments', async () => {
    vi.mocked(authService.changePassword).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.changePassword('oldPass123!', 'newPass456!'); });

    expect(authService.changePassword).toHaveBeenCalledWith('oldPass123!', 'newPass456!');
  });

  it('forgotPassword calls authService.forgotPassword with correct email', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.forgotPassword('user@test.com'); });

    expect(authService.forgotPassword).toHaveBeenCalledWith('user@test.com');
  });

  it('role is correctly derived from the logged-in user', async () => {
    const adminUser = makeUser({ id: 'a1', email: 'admin@test.com', nombre: 'Admin', role: 'Admin' });
    const adminToken = buildFakeJwt({ sub: 'a1', email: 'admin@test.com', role: 'Admin', exp: FUTURE_EXP });
    vi.mocked(authService.login).mockResolvedValue({ success: true, token: adminToken, user: adminUser });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.login({ email: 'admin@test.com', password: 'pass' }); });

    expect(result.current.role).toBe('Admin');
  });
});

// ============================================================
// GROUP 2: Token management flow (5 tests)
// ============================================================

describe('Token management flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saving and retrieving a token survives the encrypt/decrypt cycle', () => {
    const token = 'Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig';
    saveToken(token);
    expect(getToken()).toBe(token);
  });

  it('expired token causes isTokenExpired to return true', () => {
    const expired = buildFakeJwt({ sub: 'user', exp: PAST_EXP });
    expect(isTokenExpired(expired)).toBe(true);
  });

  it('valid future token has correct payload accessible via getTokenPayload', () => {
    const token = buildFakeJwt({ sub: 'user-42', email: 'info@test.com', role: 'User', exp: FUTURE_EXP });
    const payload = getTokenPayload(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe('user-42');
    expect(payload?.email).toBe('info@test.com');
    expect(payload?.exp).toBe(FUTURE_EXP);
  });

  it('token removal works correctly and leaves storage empty', () => {
    saveToken('some-token-value');
    expect(getToken()).not.toBeNull();
    removeToken();
    expect(getToken()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('session persistence: AuthProvider loads user from a valid stored token on mount', async () => {
    vi.mocked(authService.logout).mockResolvedValue({ success: true });

    const token = buildFakeJwt({
      sub: 'stored-user',
      email: 'stored@test.com',
      nombre: 'Stored User',
      role: 'User',
      exp: FUTURE_EXP,
    });
    saveToken(token); // store token before AuthProvider mounts

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('stored@test.com');
  });
});

// ============================================================
// GROUP 3: Password validation flow (5 tests)
// ============================================================

describe('Password validation flow', () => {
  it('password meeting all requirements validates successfully', () => {
    const result = validatePasswordRequirements('Valid1@Password');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('password too short fails with the correct length error', () => {
    const result = validatePasswordRequirements('Ab1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Mínimo 8 caracteres');
  });

  it('password missing uppercase letter fails', () => {
    const result = validatePasswordRequirements('alllower1!abcd');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Al menos una letra mayúscula');
    expect(result.errors).not.toContain('Al menos una letra minúscula');
  });

  it('password missing a number fails', () => {
    const result = validatePasswordRequirements('AllLetters!abcde');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Al menos un número');
  });

  it('password missing a special character fails', () => {
    const result = validatePasswordRequirements('AllLetters1abcde');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Al menos un carácter especial (!@#$%^&*)');
  });
});

// ============================================================
// GROUP 4: Full login flow (4 tests)
// ============================================================

describe('Full login flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(authService.logout).mockResolvedValue({ success: true });
  });

  it('successful login stores token in storage and updates context', async () => {
    const fakeUser = makeUser({ email: 'flow@test.com' });
    const fakeToken = buildFakeJwt({ sub: 'u1', email: 'flow@test.com', role: 'User', exp: FUTURE_EXP });
    vi.mocked(authService.login).mockResolvedValue({ success: true, token: fakeToken, user: fakeUser });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.login({ email: 'flow@test.com', password: 'Pass1!' }); });

    expect(result.current.isAuthenticated).toBe(true);
    expect(getToken()).not.toBeNull(); // token persisted to localStorage
  });

  it('failed login returns error response without updating context or storage', async () => {
    vi.mocked(authService.login).mockResolvedValue({ success: false, error: 'Wrong password' });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let res: any;
    await act(async () => { res = await result.current.login({ email: 'x@x.com', password: 'wrong' }); });

    expect(res.success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(getToken()).toBeNull();
  });

  it('social login flow updates context on success', async () => {
    const googleUser = makeUser({ id: 'g1', email: 'google@test.com', nombre: 'Google User' });
    const googleToken = buildFakeJwt({ sub: 'g1', email: 'google@test.com', role: 'User', exp: FUTURE_EXP });
    vi.mocked(authService.socialLogin).mockResolvedValue({ success: true, token: googleToken, user: googleUser });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.socialLogin('google', 'google-id-token-xyz'); });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('google@test.com');
    expect(authService.socialLogin).toHaveBeenCalledWith('google', 'google-id-token-xyz');
  });

  it('logout clears token from storage and resets context', async () => {
    const fakeUser = makeUser();
    const fakeToken = buildFakeJwt({ sub: 'u1', email: 'test@example.com', role: 'User', exp: FUTURE_EXP });
    vi.mocked(authService.login).mockResolvedValue({ success: true, token: fakeToken, user: fakeUser });

    const { result } = renderHook(() => useAuthContext(), { wrapper: authWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.login({ email: 'test@example.com', password: 'pass' }); });
    expect(getToken()).not.toBeNull();

    await act(async () => { await result.current.logout(); });

    expect(getToken()).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
