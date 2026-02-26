/**
 * Formato estándar para TODAS las respuestas de la API
 * Re-exporta y amplía los helpers de response-helpers.ts
 */

export type {
  StandardApiResponse,
} from './response-helpers.ts';

export {
  successResponse,
  errorResponse,
  jsonSuccess,
  jsonError,
} from './response-helpers.ts';

import type { Context } from 'npm:hono';
import { jsonSuccess, jsonError } from './response-helpers.ts';

/**
 * Respuesta 404 estandarizada
 */
export function jsonNotFound(c: Context, resource: string = 'Recurso') {
  return jsonError(c, `${resource} no encontrado`, 404);
}

/**
 * Respuesta 400 estandarizada para datos de entrada inválidos
 */
export function jsonBadRequest(c: Context, message: string = 'Datos de entrada inválidos') {
  return jsonError(c, message, 400);
}

/**
 * Respuesta 201 estandarizada para recursos creados
 */
export function jsonCreated<T>(c: Context, data: T, message?: string) {
  return jsonSuccess(c, data, message, 201);
}
