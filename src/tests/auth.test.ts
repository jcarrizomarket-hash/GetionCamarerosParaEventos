/**
 * Comprehensive authentication tests
 * Covers: authValidators, encryptionUtils, tokenManager, usePasswordStrength, usePasswordReset
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { AuthResponse } from '../types/auth';

// ---------------------------------------------------------------------------
// Top-level mocks (hoisted by vitest)
// ---------------------------------------------------------------------------

vi.mock('../utils/authService', () => ({
  forgotPassword: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  socialLogin: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock('../utils/supabase/info', () => ({
  projectId: 'test-project',
  publicAnonKey: 'test-anon-key',
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  validateEmail,
  validatePassword,
  validatePasswordStrength,
  validatePasswordMatch,
  validatePasswordRequirements,
} from '../utils/authValidators';
import { encrypt, decrypt } from '../utils/encryptionUtils';
import { saveToken, getToken, removeToken, isTokenExpired, getTokenPayload } from '../utils/tokenManager';
import { usePasswordStrength } from '../hooks/usePasswordStrength';
import { usePasswordReset } from '../hooks/usePasswordReset';
import * as authService from '../utils/authService';

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

// ============================================================
// GROUP 1: authValidators (8 tests)
// ============================================================

describe('authValidators', () => {
  it('validateEmail returns true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user+tag@domain.co.uk')).toBe(true);
    expect(validateEmail('a@b.io')).toBe(true);
  });

  it('validateEmail returns false for invalid email addresses', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('missing@tld')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('spaces in@email.com')).toBe(false);
  });

  it('validatePassword returns true for non-empty passwords', () => {
    expect(validatePassword('anypassword')).toBe(true);
    expect(validatePassword('a')).toBe(true);
    expect(validatePassword(' ')).toBe(true);
  });

  it('validatePassword returns false for empty string', () => {
    expect(validatePassword('')).toBe(false);
  });

  it('validatePasswordStrength returns 0 for empty password and increases with complexity', () => {
    expect(validatePasswordStrength('')).toBe(0);
    const simple = validatePasswordStrength('abcdefgh');   // lowercase only, 8 chars
    const complex = validatePasswordStrength('Abcdef1!');  // mixed types, 8 chars
    expect(simple).toBeGreaterThan(0);
    expect(complex).toBeGreaterThan(simple);
  });

  it('validatePasswordStrength caps at 100', () => {
    const score = validatePasswordStrength('Abcdefghij12345!@#');
    expect(score).toBeLessThanOrEqual(100);
  });

  it('validatePasswordMatch returns true/false correctly', () => {
    expect(validatePasswordMatch('password123', 'password123')).toBe(true);
    expect(validatePasswordMatch('password123', 'Password123')).toBe(false);
    expect(validatePasswordMatch('', '')).toBe(true);
    expect(validatePasswordMatch('abc', '')).toBe(false);
  });

  it('validatePasswordRequirements returns valid:true and collects error messages', () => {
    const passing = validatePasswordRequirements('Valid1@Password');
    expect(passing.valid).toBe(true);
    expect(passing.errors).toHaveLength(0);

    const failing = validatePasswordRequirements('short');
    expect(failing.valid).toBe(false);
    expect(failing.errors).toContain('Mínimo 8 caracteres');
    expect(failing.errors).toContain('Al menos una letra mayúscula');
    expect(failing.errors).toContain('Al menos un número');
    expect(failing.errors).toContain('Al menos un carácter especial (!@#$%^&*)');
  });
});

// ============================================================
// GROUP 2: encryptionUtils (4 tests)
// ============================================================

describe('encryptionUtils', () => {
  it('encrypt returns a non-empty string different from the input', () => {
    const input = 'hello world secret';
    const result = encrypt(input);
    expect(result).not.toBe(input);
    expect(result.length).toBeGreaterThan(0);
  });

  it('decrypt(encrypt(data)) roundtrips back to original', () => {
    const input = 'my-secret-jwt-token-12345.abc.def';
    expect(decrypt(encrypt(input))).toBe(input);
  });

  it('decrypt with invalid base64 input returns empty string', () => {
    expect(decrypt('!!!not-base64!!!')).toBe('');
    expect(decrypt('\x00\xFF')).toBe('');
  });

  it('encrypt and decrypt handle empty string correctly', () => {
    expect(decrypt(encrypt(''))).toBe('');
  });
});

// ============================================================
// GROUP 3: tokenManager (8 tests)
// ============================================================

describe('tokenManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saveToken stores an encrypted (different) value in localStorage', () => {
    const token = 'raw-token-value';
    saveToken(token);
    const stored = localStorage.getItem('auth_token');
    expect(stored).not.toBeNull();
    expect(stored).not.toBe(token);
  });

  it('getToken returns null when nothing is stored', () => {
    expect(getToken()).toBeNull();
  });

  it('getToken returns the original token after saveToken', () => {
    const token = 'my-auth-token-abc';
    saveToken(token);
    expect(getToken()).toBe(token);
  });

  it('removeToken clears the stored token from localStorage', () => {
    saveToken('some-token');
    removeToken();
    expect(getToken()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('isTokenExpired returns true for an expired token', () => {
    const expired = buildFakeJwt({ sub: 'user', exp: PAST_EXP });
    expect(isTokenExpired(expired)).toBe(true);
  });

  it('isTokenExpired returns false for a future-expiry token', () => {
    const valid = buildFakeJwt({ sub: 'user', exp: FUTURE_EXP });
    expect(isTokenExpired(valid)).toBe(false);
  });

  it('isTokenExpired returns true for malformed or empty token', () => {
    expect(isTokenExpired('not.a.valid')).toBe(true);
    expect(isTokenExpired('')).toBe(true);
    expect(isTokenExpired('onlyone')).toBe(true);
  });

  it('getTokenPayload returns null for invalid tokens', () => {
    expect(getTokenPayload('invalid')).toBeNull();
    expect(getTokenPayload('')).toBeNull();
  });
});

// ============================================================
// GROUP 4: usePasswordStrength hook (5 tests)
// ============================================================

describe('usePasswordStrength hook', () => {
  it('starts with strength 0 and empty requirements', () => {
    const { result } = renderHook(() => usePasswordStrength());
    expect(result.current.strength).toBe(0);
    expect(result.current.requirements.valid).toBe(false);
  });

  it('checkStrength updates strength value', () => {
    const { result } = renderHook(() => usePasswordStrength());
    act(() => {
      result.current.checkStrength('StrongP@ss1');
    });
    expect(result.current.strength).toBeGreaterThan(0);
  });

  it('getStrengthLabel returns correct labels for different strengths', () => {
    const { result } = renderHook(() => usePasswordStrength());
    expect(result.current.getStrengthLabel()).toBe('Muy débil');

    act(() => { result.current.checkStrength('ab'); });
    expect(result.current.getStrengthLabel()).toBe('Muy débil');

    act(() => { result.current.checkStrength('ValidPass1!LongEnough'); });
    expect(['Moderada', 'Fuerte', 'Muy fuerte']).toContain(result.current.getStrengthLabel());
  });

  it('getStrengthColor returns valid CSS class strings', () => {
    const { result } = renderHook(() => usePasswordStrength());
    const validColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    expect(validColors).toContain(result.current.getStrengthColor());

    act(() => { result.current.checkStrength('SuperStr0ng!Password'); });
    expect(validColors).toContain(result.current.getStrengthColor());
  });

  it('requirements are correctly identified after checkStrength', () => {
    const { result } = renderHook(() => usePasswordStrength());
    act(() => {
      result.current.checkStrength('ValidPass1!');
    });
    expect(result.current.requirements.errors).not.toContain('Al menos una letra mayúscula');
    expect(result.current.requirements.errors).not.toContain('Al menos una letra minúscula');
    expect(result.current.requirements.errors).not.toContain('Al menos un número');
    expect(result.current.requirements.errors).not.toContain('Al menos un carácter especial (!@#$%^&*)');
  });
});

// ============================================================
// GROUP 5: usePasswordReset hook (5 tests)
// ============================================================

describe('usePasswordReset hook', () => {
  const mockForgotPassword = vi.mocked(authService.forgotPassword);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with isLoading: false, success: false, error: null', () => {
    const { result } = renderHook(() => usePasswordReset());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.countdown).toBe(0);
  });

  it('requestReset sets isLoading to true while the request is in-flight', async () => {
    let resolveRequest!: (v: AuthResponse) => void;
    const deferred = new Promise<AuthResponse>(resolve => { resolveRequest = resolve; });
    mockForgotPassword.mockReturnValue(deferred);

    const { result } = renderHook(() => usePasswordReset());

    act(() => { result.current.requestReset('test@example.com'); });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveRequest({ success: false, error: 'done' });
      await deferred;
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('requestReset on success sets success: true and isLoading: false', async () => {
    mockForgotPassword.mockResolvedValue({ success: true });

    const { result } = renderHook(() => usePasswordReset());
    await act(async () => {
      await result.current.requestReset('test@example.com');
    });

    expect(result.current.success).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('requestReset on failure sets error message and keeps success: false', async () => {
    mockForgotPassword.mockResolvedValue({ success: false, error: 'User not found' });

    const { result } = renderHook(() => usePasswordReset());
    await act(async () => {
      await result.current.requestReset('unknown@example.com');
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('User not found');
    expect(result.current.isLoading).toBe(false);
  });

  it('reset() clears error, success and countdown state', async () => {
    mockForgotPassword.mockResolvedValue({ success: true });

    const { result } = renderHook(() => usePasswordReset());
    await act(async () => {
      await result.current.requestReset('test@example.com');
    });
    expect(result.current.success).toBe(true);

    act(() => { result.current.reset(); });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.countdown).toBe(0);
  });
});
