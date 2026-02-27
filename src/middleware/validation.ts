/**
 * validation.ts
 * Middleware de validación con Zod - Schemas reutilizables y manejo de errores
 */

import { z, ZodSchema, ZodError } from 'zod';
import type { Context } from 'hono';

// ============================================================
// SCHEMAS REUTILIZABLES
// ============================================================

export const UUIDSchema = z.string().uuid('ID inválido');

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const CamareroInputSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100).trim(),
  apellido: z.string().min(1, 'El apellido es requerido').max(100).trim(),
  email: z.string().email('Email inválido').toLowerCase(),
  telefono: z.string().max(20).optional(),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
});

export const PedidoInputSchema = z.object({
  numero: z.string().min(1, 'El número es requerido').max(50).trim(),
  cliente: z.string().min(1, 'El cliente es requerido').max(200).trim(),
  lugar: z.string().min(1, 'El lugar es requerido').max(200).trim(),
  fecha: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  cantidadCamareros: z.number().int().min(1).max(500),
  horaEntrada: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  camisa: z.enum(['negra', 'blanca', 'sin_camisa']).optional(),
  observaciones: z.string().max(1000).optional(),
});

export const CoordinadorInputSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100).trim(),
  email: z.string().email('Email inválido').toLowerCase(),
  telefono: z.string().max(20).optional(),
});

export const ClienteInputSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100).trim(),
  apellido: z.string().min(1, 'El apellido es requerido').max(100).trim(),
  email: z.string().email('Email inválido').toLowerCase(),
  telefono: z.string().max(20).optional(),
  empresa: z.string().max(200).optional(),
});

// ============================================================
// MIDDLEWARE DE VALIDACIÓN
// ============================================================

/**
 * Formatea los errores de Zod en un objeto legible
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  return formatted;
}

/**
 * Middleware que valida el body del request contra un schema Zod
 * Adjunta los datos validados en c.set('validatedBody', data)
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: () => Promise<void>) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        { success: false, error: 'El body de la petición no es JSON válido' },
        400
      );
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Datos de entrada inválidos',
          details: formatZodErrors(result.error),
        },
        422
      );
    }

    c.set('validatedBody', result.data);
    return next();
  };
}

/**
 * Middleware que valida los query params del request
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: () => Promise<void>) => {
    const query = Object.fromEntries(new URL(c.req.url).searchParams);
    const result = schema.safeParse(query);
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Parámetros de consulta inválidos',
          details: formatZodErrors(result.error),
        },
        400
      );
    }

    c.set('validatedQuery', result.data);
    return next();
  };
}

/**
 * Middleware que valida el parámetro :id de la ruta
 */
export async function validateIdParam(c: Context, next: () => Promise<void>) {
  const id = c.req.param('id');
  const result = UUIDSchema.safeParse(id);
  if (!result.success) {
    return c.json(
      { success: false, error: 'El ID proporcionado no es válido' },
      400
    );
  }
  return next();
}
