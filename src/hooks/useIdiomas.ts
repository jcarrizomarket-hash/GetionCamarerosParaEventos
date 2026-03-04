/**
 * Hook: useIdiomas
 *
 * Fetches the list of active languages (idiomas) from the Supabase
 * `public.idiomas` table on mount.  Falls back to the hardcoded IDIOMAS
 * constant when the network request fails so the form remains usable in
 * offline / demo environments.
 */

import { useState, useEffect } from 'react';
import { supabaseClient } from '../utils/supabaseClient';
import { IDIOMAS } from '../components/camareros/types';

export interface Idioma {
  id: string;
  code: string;
  name: string;
  native_name?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface UseIdiomasResult {
  idiomas: string[];
  loading: boolean;
  error: string | null;
}

export function useIdiomas(): UseIdiomasResult {
  const [idiomas, setIdiomas] = useState<string[]>(IDIOMAS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchIdiomas = async () => {
      try {
        const { data, error: sbError } = await supabaseClient
          .from('idiomas')
          .select('name, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (cancelled) return;

        if (sbError) throw sbError;

        if (data && data.length > 0) {
          setIdiomas(data.map((row: { name: string }) => row.name));
          setError(null);
        }
        // If the table exists but is empty, keep the fallback already set in
        // initial state without treating it as an error.
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Error al cargar idiomas');
        // IDIOMAS fallback is already in state from the useState initializer above.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchIdiomas();

    return () => {
      cancelled = true;
    };
  }, []);

  return { idiomas, loading, error };
}
