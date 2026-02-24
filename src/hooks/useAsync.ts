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
 * @param asyncFn - The async function to wrap
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
