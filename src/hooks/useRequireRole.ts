/**
 * Hook para control de acceso basado en roles.
 * Redirige o devuelve estado de acceso según el rol del usuario.
 */

import { useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

export interface UseRequireRoleReturn {
  /** True if the current user has one of the required roles */
  hasRole: boolean;
  /** The current user's role, or null if unauthenticated */
  role: UserRole | null;
  /** Returns true if the user has at least one of the provided roles */
  checkRole: (...roles: UserRole[]) => boolean;
}

/**
 * Returns role-checking utilities for the authenticated user.
 *
 * @example
 * const { hasRole, checkRole } = useRequireRole('admin');
 * if (!hasRole) return <Redirect to="/" />;
 */
export function useRequireRole(...requiredRoles: UserRole[]): UseRequireRoleReturn {
  const { role } = useAuthContext();

  const checkRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!role) return false;
      return roles.includes(role as UserRole);
    },
    [role]
  );

  const hasRole =
    requiredRoles.length === 0 ? true : checkRole(...requiredRoles);

  return {
    hasRole,
    role: role as UserRole | null,
    checkRole,
  };
}
