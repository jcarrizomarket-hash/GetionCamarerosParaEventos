/**
 * Standard API response helpers for Supabase Edge Functions
 */

import type { Context } from 'npm:hono';

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface StandardPaginatedResponse<T> extends StandardApiResponse<T[]> {
  total?: number;
  page?: number;
  pageSize?: number;
}

function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Sends a successful JSON response (200)
 */
export function successResponse<T>(c: Context, data: T, message?: string) {
  const body: StandardApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: timestamp(),
  };
  return c.json(body, 200);
}

/**
 * Sends a created JSON response (201)
 */
export function createdResponse<T>(c: Context, data: T, message?: string) {
  const body: StandardApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: timestamp(),
  };
  return c.json(body, 201);
}

/**
 * Sends a paginated JSON response (200)
 */
export function paginatedResponse<T>(
  c: Context,
  data: T[],
  meta: { total?: number; page?: number; pageSize?: number }
) {
  const body: StandardPaginatedResponse<T> = {
    success: true,
    data,
    total: meta.total,
    page: meta.page,
    pageSize: meta.pageSize,
    timestamp: timestamp(),
  };
  return c.json(body, 200);
}

/**
 * Sends a bad request error response (400)
 */
export function badRequestResponse(c: Context, error: string) {
  const body: StandardApiResponse = {
    success: false,
    error,
    timestamp: timestamp(),
  };
  return c.json(body, 400);
}

/**
 * Sends an unauthorized error response (401)
 */
export function unauthorizedResponse(c: Context, error = 'No autorizado') {
  const body: StandardApiResponse = {
    success: false,
    error,
    timestamp: timestamp(),
  };
  return c.json(body, 401);
}

/**
 * Sends a not found error response (404)
 */
export function notFoundResponse(c: Context, error = 'Recurso no encontrado') {
  const body: StandardApiResponse = {
    success: false,
    error,
    timestamp: timestamp(),
  };
  return c.json(body, 404);
}

/**
 * Sends an internal server error response (500)
 */
export function serverErrorResponse(c: Context, error = 'Error interno del servidor') {
  const body: StandardApiResponse = {
    success: false,
    error,
    timestamp: timestamp(),
  };
  return c.json(body, 500);
}
