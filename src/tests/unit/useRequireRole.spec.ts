/**
 * Tests for useRequireRole hook
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../utils/authService', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  socialLogin: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock('../../utils/supabase/info', () => ({
  projectId: 'test-project',
  publicAnonKey: 'test-anon-key',
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { AuthProvider } from '../../context/AuthContext';
import { useRequireRole } from '../../hooks/useRequireRole';

// Wrapper with no authenticated user (default state)
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useRequireRole', () => {
  it('hasRole is false for unauthenticated user with required role', async () => {
    const { result } = renderHook(() => useRequireRole('admin'), { wrapper });
    expect(result.current.hasRole).toBe(false);
    expect(result.current.role).toBeNull();
  });

  it('hasRole is true when no roles are required (any authenticated user)', async () => {
    const { result } = renderHook(() => useRequireRole(), { wrapper });
    // No role required → hasRole is always true
    expect(result.current.hasRole).toBe(true);
  });

  it('checkRole returns false when user is not authenticated', () => {
    const { result } = renderHook(() => useRequireRole(), { wrapper });
    expect(result.current.checkRole('admin')).toBe(false);
    expect(result.current.checkRole('coordinador', 'camarero')).toBe(false);
  });
});
