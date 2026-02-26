import { useState, useCallback } from 'react';
import type { ApiResponse } from '../src/types';
import { retry, type RetryOptions } from '../utils/retry';
import { getErrorMessage } from '../utils/error-handler';

interface UseApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiCallReturn<T, Args extends unknown[]> extends UseApiCallState<T> {
  execute: (...args: Args) => Promise<ApiResponse<T>>;
  reset: () => void;
}

/**
 * Hook for making API calls with retry logic and managed loading/error state
 */
export function useApiCall<T, Args extends unknown[] = []>(
  apiFn: (...args: Args) => Promise<ApiResponse<T>>,
  retryOptions?: RetryOptions
): UseApiCallReturn<T, Args> {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<ApiResponse<T>> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await retry(() => apiFn(...args), retryOptions);

        if (response.success) {
          setState({ data: response.data ?? null, loading: false, error: null });
        } else {
          setState(prev => ({ ...prev, loading: false, error: response.error ?? 'Error desconocido' }));
        }

        return response;
      } catch (error) {
        const message = getErrorMessage(error);
        setState(prev => ({ ...prev, loading: false, error: message }));
        return { success: false, error: message };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
