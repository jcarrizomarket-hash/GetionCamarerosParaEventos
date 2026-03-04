import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Especialidad, ESPECIALIDADES } from '../components/camareros/types';

export interface UseEspecialidadesResult {
  especialidades: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Obtiene las especialidades activas desde la tabla `especialidades` de Supabase.
 * Falls back to the static ESPECIALIDADES constant when Supabase is
 * unavailable (offline / missing env vars) so the form always renders.
 */
export function useEspecialidades(): UseEspecialidadesResult {
  const [especialidades, setEspecialidades] = useState<string[]>(ESPECIALIDADES);
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
      .from('especialidades')
      .select('id, nombre, sort_order, is_active, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error: sbError }) => {
        if (cancelled) return;

        if (sbError) {
          // Real DB error: keep static fallback and surface the message
          setError(sbError.message);
        } else if (data && data.length > 0) {
          setEspecialidades((data as Especialidad[]).map((row) => row.nombre));
          setError(null);
        }
        // Empty result (all especialidades inactive, or table not seeded yet):
        // silently keep the static fallback without setting an error.
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { especialidades, loading, error };
}

export default useEspecialidades;
