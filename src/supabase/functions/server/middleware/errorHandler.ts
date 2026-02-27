/**
 * Centralized error handling middleware
 * Ensures consistent error responses without leaking sensitive details
 */

import type { Context, Next } from 'npm:hono@4.0.0';

interface ErrorResponse {
  success: false;
  error: string;
  requestId?: string;
}

export function errorHandler() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      const requestId = crypto.randomUUID();
      console.error(`[ERROR] requestId=${requestId}`, err);

      const response: ErrorResponse = {
        success: false,
        error: 'An unexpected error occurred',
        requestId,
      };

      return c.json(response, 500);
    }
  };
}

export function notFound() {
  return (c: Context) => {
    return c.json({ success: false, error: 'Route not found' }, 404);
  };
}
