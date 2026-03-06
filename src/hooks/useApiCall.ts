import { useState, useCallback, useRef } from 'react';
import type { ApiResponse } from '../types';
import { logger } from '../utils/logger';

export interface UseApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiCallResult<T, A extends unknown[]> extends UseApiCallState<T> {
  execute: (...args: A) => Promise<ApiResponse<T>>;
  reset: () => void;
}

/**
 * Hook reutilizable para llamadas a la API con manejo de estados
 * Incluye estados de loading y error, y soporte para limpiar el estado
 *
 * @example
 * const { data, loading, error, execute } = useApiCall(getPedidos);
 *
 * useEffect(() => { execute(); }, []);
 */
export function useApiCall<T, A extends unknown[]>(
  apiFunction: (...args: A) => Promise<ApiResponse<T>>
): UseApiCallResult<T, A> {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);

  const execute = useCallback(
    async (...args: A): Promise<ApiResponse<T>> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...args);

        if (isMountedRef.current) {
          if (result.success) {
            setState({ data: result.data ?? null, loading: false, error: null });
          } else {
            const errorMsg = result.error ?? 'Error desconocido';
            logger.warn('useApiCall: respuesta con error', { error: errorMsg });
            setState(prev => ({ ...prev, loading: false, error: errorMsg }));
          }
        }

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error inesperado';
        logger.error('useApiCall: excepción capturada', { error: message });

        if (isMountedRef.current) {
          setState(prev => ({ ...prev, loading: false, error: message }));
        }

        return { success: false, error: message };
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export default useApiCall;
