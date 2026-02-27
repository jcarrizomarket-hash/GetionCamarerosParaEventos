/**
 * Manejo centralizado de errores para la aplicación
 * Normaliza diferentes tipos de errores a una estructura consistente
 */

import type { ApiError } from '../types';
import logger from './logger';

export type ErrorCategory = 'frontend' | 'api' | 'validation' | 'network' | 'unknown';

export interface ErrorContext {
  errorId: string;
  category: ErrorCategory;
  component?: string;
  timestamp: string;
  extra?: Record<string, unknown>;
}

/**
 * Genera un ID único para un error
 */
export function generateErrorId(): string {
  return `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Categoriza un error según su tipo
 */
export function categorizeError(error: unknown): ErrorCategory {
  if (isNetworkError(error)) return 'network';
  if (error instanceof Error) {
    if (error.name === 'ValidationError' || error.message.toLowerCase().includes('validation')) return 'validation';
    if (error.name === 'ApiError' || error.message.includes('API') || error.message.includes('fetch')) return 'api';
    return 'frontend';
  }
  return 'unknown';
}

/**
 * Registra un error con contexto completo (ID único, categoría, componente, timestamp)
 */
export function logErrorWithContext(
  error: unknown,
  component?: string,
  extra?: Record<string, unknown>
): ErrorContext {
  const errorId = generateErrorId();
  const category = categorizeError(error);
  const timestamp = new Date().toISOString();
  const ctx: ErrorContext = { errorId, category, component, timestamp, extra };

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(`[${errorId}] Error en ${component ?? 'app'} [${category}]: ${message}`, {
    errorId,
    category,
    component,
    timestamp,
    stack,
    ...extra,
  });

  return ctx;
}

/**
 * Convierte un error desconocido en un ApiError estructurado
 */
export function toApiError(error: unknown, defaultCode: string = 'UNKNOWN_ERROR'): ApiError {
  if (error instanceof Error) {
    const code = error.name === 'AbortError' ? 'TIMEOUT_ERROR' : defaultCode;
    const message = error.name === 'AbortError'
      ? 'La petición superó el tiempo límite'
      : error.message;
    return { code, message };
  }

  if (typeof error === 'string') {
    return { code: defaultCode, message: error };
  }

  return { code: defaultCode, message: 'Error desconocido' };
}

/**
 * Registra un error y devuelve un ApiError estructurado
 */
export function handleError(
  error: unknown,
  context: string,
  defaultCode: string = 'UNKNOWN_ERROR'
): ApiError {
  const apiError = toApiError(error, defaultCode);
  logger.error(`Error en ${context}`, { code: apiError.code, message: apiError.message });
  return apiError;
}

/**
 * Obtiene un mensaje de error amigable para mostrar al usuario
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return 'La conexión tardó demasiado. Por favor, inténtalo de nuevo.';
    }
    if (error.message.includes('fetch')) {
      return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.';
}

/**
 * Verifica si un error es un error de red o conectividad
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'AbortError' ||
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}
