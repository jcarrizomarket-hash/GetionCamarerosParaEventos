/**
 * Standardized error response helpers
 * Ensures consistent error format across all endpoints
 */

import type { Context } from 'npm:hono@4.0.0';

export const errorResponses = {
  badRequest: (c: Context, message = 'Bad request') =>
    c.json({ success: false, error: message }, 400),

  unauthorized: (c: Context, message = 'Unauthorized') =>
    c.json({ success: false, error: message }, 401),

  forbidden: (c: Context, message = 'Forbidden') =>
    c.json({ success: false, error: message }, 403),

  notFound: (c: Context, message = 'Resource not found') =>
    c.json({ success: false, error: message }, 404),

  conflict: (c: Context, message = 'Resource conflict') =>
    c.json({ success: false, error: message }, 409),

  tooManyRequests: (c: Context, message = 'Too many requests') =>
    c.json({ success: false, error: message }, 429),

  internalError: (c: Context, message = 'Internal server error') =>
    c.json({ success: false, error: message }, 500),
};
