/**
 * Validation middleware using Zod schemas
 * Centralizes input validation for all API routes
 */

import { z } from 'npm:zod@3.22.4';
import type { Context, Next } from 'npm:hono@4.0.0';

export type ValidationSchema = z.ZodSchema;

export function validateBody(schema: ValidationSchema) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);
      if (!result.success) {
        return c.json({
          success: false,
          error: 'Validation failed',
          details: result.error.flatten(),
        }, 400);
      }
      c.set('validatedBody', result.data);
      await next();
    } catch {
      return c.json({ success: false, error: 'Invalid JSON body' }, 400);
    }
  };
}

export function validateParams(schema: ValidationSchema) {
  return async (c: Context, next: Next) => {
    const params = c.req.param();
    const result = schema.safeParse(params);
    if (!result.success) {
      return c.json({
        success: false,
        error: 'Invalid parameters',
        details: result.error.flatten(),
      }, 400);
    }
    await next();
  };
}

// Common validation schemas
export const schemas = {
  uuid: z.string().uuid(),
  email: z.string().email().max(255),
  nonEmptyString: z.string().min(1).max(1000),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};
