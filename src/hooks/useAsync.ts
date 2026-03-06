import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '../utils/logger';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncResult<T> extends UseAsyncState<T> {
  execute: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook para operaciones asincrónicas con estados automáticos
 * Ejecuta la función al montar el componente y permite re-ejecución manual
 *
 * @example
 * const { data, loading, error, execute } = useAsync(() => getPedidos());
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  immediate: boolean = true
): UseAsyncResult<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const asyncFnRef = useRef(asyncFn);
  asyncFnRef.current = asyncFn;

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFnRef.current();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado';
      logger.error('useAsync: excepción capturada', { error: message });
      setState(prev => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const immediateRef = useRef(immediate);

  useEffect(() => {
    if (immediateRef.current) {
      execute();
    }
    // Only run on mount
  }, []);

  return { ...state, execute, reset };
}

export default useAsync;
