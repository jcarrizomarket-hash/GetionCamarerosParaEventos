import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse, ApiError } from '../types';
import { toApiError } from '../utils/errorHandler';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseFetchResult<T> extends UseFetchState<T> {
  refetch: () => Promise<void>;
}

/**
 * Custom hook for data fetching with loading/error state management.
 * Automatically fetches on mount and whenever `deps` change.
 *
 * @param fetchFn - Async function that returns an ApiResponse<T>
 * @param deps - Dependency array (like useEffect deps)
 */
export function useFetch<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  deps: unknown[] = []
): UseFetchResult<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Keep a stable ref so refetch always calls the latest fetchFn
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- it's safe to ignore exhaustive-deps here because we only want to keep fetchFnRef in sync with the latest fetchFn implementation
  }, [fetchFn]);

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchFnRef.current();
      if (response.success && response.data !== undefined) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        setState({
          data: null,
          loading: false,
          error: {
            code: 'API_ERROR',
            message: response.error ?? 'Error en la API',
            status: 400,
          },
        });
      }
    } catch (error: unknown) {
      setState({
        data: null,
        loading: false,
        error: toApiError(error),
      });
    }
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refetch };
}
