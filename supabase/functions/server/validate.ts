/**
 * validate.ts — Helper de validación Zod para Edge Functions
 *
 * Uso:
 *   const result = validate(CreateClienteSchema, await c.req.json());
 *   if (!result.success) return validationError(c, result.error);
 */
import { z } from 'npm:zod@3';
import type { Context } from 'npm:hono';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

export function validate<T>(
  schema: z.ZodType<T>,
  input: unknown
): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validationError(c: Context, error: z.ZodError) {
  const issues = error.issues.map((i) => ({
    field: i.path.join('.'),
    message: i.message,
  }));
  return c.json(
    { success: false, error: 'Datos inválidos', issues },
    400
  );
}
