import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Role, TIPOS_PERFIL } from '../components/camareros/types';

export interface UseRolesResult {
  roles: { codigo: string; label: string }[];
  loading: boolean;
  error: string | null;
}

/**
 * Maps a `roles` DB row to the `{ codigo, label }` shape used by the UI.
 */
function mapRole(r: Role): { codigo: string; label: string } {
  return { codigo: r.name, label: r.display_name };
}

/**
 * Fetches active waiter-profile roles from the Supabase `roles` table.
 * Falls back to the static `TIPOS_PERFIL` constant when Supabase is
 * unavailable (offline / missing env vars) so the form always renders.
 */
export function useRoles(): UseRolesResult {
  const [roles, setRoles] = useState<{ codigo: string; label: string }[]>(TIPOS_PERFIL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = getSupabaseClient();

    if (!client) {
      // No Supabase config – use static fallback immediately
      setLoading(false);
      return;
    }

    let cancelled = false;

    client
      .from('roles')
      .select('id, name, display_name, sort_order, is_active, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error: sbError }) => {
        if (cancelled) return;

        if (sbError) {
          // Real DB error: keep static fallback and surface the message
          setError(sbError.message);
        } else if (data && data.length > 0) {
          setRoles((data as Role[]).map(mapRole));
          setError(null);
        }
        // Empty result (all roles inactive, or table not seeded yet):
        // silently keep the static fallback without setting an error.
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { roles, loading, error };
}

export default useRoles;
