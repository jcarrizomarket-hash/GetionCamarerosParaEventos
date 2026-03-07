/**
 * Helpers para respuestas API consistentes en el servidor
 * Estandariza el formato de todas las respuestas del backend
 */

import type { Context } from 'npm:hono';

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

/**
 * Genera un ID único para el request
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Crea una respuesta exitosa estandarizada
 */
export function successResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): StandardApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId: requestId ?? generateRequestId(),
  };
}

/**
 * Crea una respuesta de error estandarizada
 */
export function errorResponse(
  error: string,
  requestId?: string
): StandardApiResponse<never> {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    requestId: requestId ?? generateRequestId(),
  };
}

/**
 * Envía una respuesta JSON exitosa desde un contexto Hono
 */
export function jsonSuccess<T>(
  c: Context,
  data: T,
  message?: string,
  status: 200 | 201 | 202 | 204 = 200
) {
  return c.json(successResponse(data, message), status);
}

/**
 * Envía una respuesta JSON de error desde un contexto Hono
 */
export function jsonError(
  c: Context,
  error: string,
  status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503 = 500
) {
  return c.json(errorResponse(error), status);
}
