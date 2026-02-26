import { useState, useCallback } from 'react';
import { ApiError } from '../types';
import { toApiError } from '../utils/errorHandler';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseAsyncResult<T, Args extends unknown[]> extends UseAsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for executing async operations imperatively (e.g. form submissions,
 * CRUD mutations). Returns an `execute` function that the caller invokes manually.
 *
 * This hook is a reusable utility for components that trigger async work in
 * response to user interactions (button clicks, form submits). For background
 * data loading, prefer `useFetch`. For global CRUD operations, use the methods
 * provided by `AppContext` (e.g. `crearCamarero`, `crearCoordinador`).
 *
 * @param asyncFn - The async function to wrap. Must be memoized (useCallback) by
 *   the caller to avoid unnecessary re-creation of `execute` on every render.
 *
 * @example
 * ```ts
 * const guardarCamarero = useCallback(
 *   (data: Record<string, string>) => apiClient.post<Camarero>('/camareros', data),
 *   [apiClient]
 * );
 * const { loading, error, execute } = useAsync(guardarCamarero);
 * // then: await execute(formData);
 * ```
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>
): UseAsyncResult<T, Args> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await asyncFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error: unknown) {
        const apiError = toApiError(error);
        setState({ data: null, loading: false, error: apiError });
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
