import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Idioma, IDIOMAS } from '../components/camareros/types';

export interface UseIdiomasResult {
  idiomas: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Maps an `idiomas` DB row to the language name string used by the UI.
 */
export function mapIdioma(r: Idioma): string {
  return r.name;
}

/**
 * Fetches active languages from the Supabase `idiomas` table.
 * Falls back to the static `IDIOMAS` constant when Supabase is
 * unavailable (offline / missing env vars) so the form always renders.
 */
export function useIdiomas(): UseIdiomasResult {
  const [idiomas, setIdiomas] = useState<string[]>(IDIOMAS);
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
      .from('idiomas')
      .select('id, name, sort_order, is_active, created_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error: sbError }) => {
        if (cancelled) return;

        if (sbError) {
          // Real DB error: keep static fallback and surface the message
          setError(sbError.message);
        } else if (data && data.length > 0) {
          setIdiomas((data as Idioma[]).map(mapIdioma));
          setError(null);
        }
        // Empty result (all languages inactive, or table not seeded yet):
        // silently keep the static fallback without setting an error.
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { idiomas, loading, error };
}

export default useIdiomas;
