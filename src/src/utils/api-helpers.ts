/**
 * Helpers para llamadas a la API
 * Envuelve fetch con timeout, reintentos y manejo estandarizado de errores
 */

import type { ApiResponse } from '../types';
import { fetchWithRetry } from './retry';
import logger from './logger';

export interface ApiCallOptions {
  timeoutMs?: number;
  maxAttempts?: number;
  requestId?: string;
}

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Realiza una llamada a la API con timeout y reintentos
 * Devuelve un ApiResponse estandarizado
 */
export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  callOptions: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    requestId,
  } = callOptions;

  const logCtx = { url, method: options.method ?? 'GET', requestId };

  try {
    logger.debug('API call iniciada', logCtx);

    const response = await fetchWithRetry(url, options, {
      maxAttempts,
      timeoutMs,
      shouldRetry: (error, attempt) => {
        if (error instanceof Error && error.name === 'AbortError') return false;
        logger.warn(`Reintentando petición (intento ${attempt})`, logCtx);
        return true;
      },
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: `Respuesta no es JSON válido (HTTP ${response.status})`,
      };
    }

    if (!response.ok) {
      const errorMsg = (data as any)?.error ?? `Error HTTP ${response.status}`;
      logger.warn('API call fallida', { ...logCtx, status: response.status, error: errorMsg });
      return { success: false, error: errorMsg };
    }

    logger.debug('API call exitosa', { ...logCtx, status: response.status });
    return data as ApiResponse<T>;
  } catch (error) {
    const message = error instanceof Error
      ? (error.name === 'AbortError' ? 'La petición superó el tiempo límite' : error.message)
      : 'Error desconocido';

    logger.error('API call con excepción', { ...logCtx, error: message });
    return { success: false, error: message };
  }
}
