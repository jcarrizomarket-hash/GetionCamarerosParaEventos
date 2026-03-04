import { useState, useEffect, useMemo } from 'react';
import { IDIOMAS, Idioma } from '../components/camareros/types';
import { logger } from '../utils/logger';

export interface UseIdiomasResult {
  idiomas: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that fetches the list of languages from the `idiomas` Postgres table
 * via the backend API. Falls back to the hardcoded IDIOMAS constant when the
 * query fails or returns an empty result, ensuring the form is always usable.
 *
 * @param baseUrl  - Base URL of the Supabase Edge Function, e.g. https://<id>.supabase.co/functions/v1/make-server-<hash>
 * @param anonKey  - Supabase anon / public key used as Bearer token
 */
export function useIdiomas(baseUrl: string, anonKey: string): UseIdiomasResult {
  const [idiomas, setIdiomas] = useState<string[]>(IDIOMAS);
  const [loading, setLoading] = useState<boolean>(Boolean(baseUrl && anonKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!baseUrl || !anonKey) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${baseUrl}/idiomas`, {
      headers: { Authorization: `Bearer ${anonKey}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json() as Promise<{ success: boolean; data?: Idioma[]; error?: string }>;
      })
      .then((json) => {
        if (cancelled) return;
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const nombres = json.data.map((row) => row.nombre).filter(Boolean);
          setIdiomas(nombres.length > 0 ? nombres : IDIOMAS);
        } else {
          logger.warn('useIdiomas: respuesta vacía o sin éxito, usando valores por defecto');
          setIdiomas(IDIOMAS);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Error al obtener idiomas';
        logger.error('useIdiomas: error al obtener idiomas', err);
        setError(message);
        setIdiomas(IDIOMAS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, anonKey]);

  return useMemo(() => ({ idiomas, loading, error }), [idiomas, loading, error]);
}
