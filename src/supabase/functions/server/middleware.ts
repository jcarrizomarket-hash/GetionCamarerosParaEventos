/**
 * Middleware de seguridad para proteger las Supabase Functions
 * Autenticación JWT mediante Supabase Auth (email/contraseña).
 * Reemplaza el enfoque de secreto compartido (x-fn-secret) por tokens JWT de usuario.
 */

import type { Context } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

/** Orígenes permitidos para CORS (Option A deployment) */
export const ALLOWED_CORS_ORIGINS = [
  'https://appservice.jcarrizo.com',
  // Desarrollo local (documentado; no llega a producción):
  'http://localhost:5173',
  'http://localhost:3000',
];

/**
 * Middleware JWT: valida el token Bearer usando Supabase Auth.
 * Solo permite acceso a usuarios autenticados con email/contraseña de Supabase.
 *
 * Uso:
 * ```typescript
 * app.post('/pedidos', requireJWT, async (c) => { ... });
 * ```
 */
export async function requireJWT(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      { success: false, error: 'No autorizado. Se requiere Authorization Bearer.' },
      401
    );
  }

  const token = authHeader.split(' ')[1];

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data: { user }, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    console.warn(`❌ JWT inválido o expirado: ${c.req.method} ${c.req.url}`);
    return c.json(
      { success: false, error: 'No autorizado. Token JWT inválido o expirado.' },
      401
    );
  }

  return next();
}

/**
 * Middleware que requiere un header secreto para operaciones mutantes (DEPRECADO).
 * @deprecated Usar requireJWT en su lugar.
 *
 * @param c - Contexto de Hono
 */
export async function requireFunctionSecret(c: Context, next: () => Promise<void>) {
  const methodsToProtect = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!methodsToProtect.includes(c.req.method)) {
    return next();
  }

  const expectedSecret = Deno.env.get('SUPABASE_FN_SECRET');
  if (!expectedSecret) {
    console.warn('⚠️ SUPABASE_FN_SECRET no está configurado. Se recomienda migrar a requireJWT.');
    return next();
  }

  const providedSecret = c.req.header('x-fn-secret');
  if (providedSecret !== expectedSecret) {
    console.warn(`❌ Intento de acceso no autorizado al endpoint ${c.req.method} ${c.req.url}`);
    return c.json(
      { success: false, error: 'No autorizado. Header x-fn-secret inválido o ausente.' },
      401
    );
  }

  return next();
}

/**
 * Middleware opcional más flexible que solo registra pero no bloquea
 * Útil durante migración gradual
 */
export async function logFunctionAccess(c: Context, next: () => Promise<void>) {
  const method = c.req.method;
  const url = c.req.url;
  const hasAuth = Boolean(c.req.header('Authorization'));

  console.log(`📡 ${method} ${url} - Auth: ${hasAuth ? '✅' : '❌'}`);

  return next();
}

/**
 * Middleware para validar que el request tenga un token de autorización
 * (Bearer token de Supabase)
 * @deprecated Usar requireJWT para validación completa del token.
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      { success: false, error: 'No autorizado. Header Authorization requerido.' },
      401
    );
  }

  return next();
}

/**
 * Middleware para rate limiting simple (prevenir abuso)
 * NOTA: En producción, considera usar Redis o similar para un rate limiting más robusto
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return async (c: Context, next: () => Promise<void>) => {
    const identifier = c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();

    const record = requestCounts.get(identifier);

    if (!record || now > record.resetAt) {
      requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return c.json(
        { success: false, error: 'Demasiadas peticiones. Intenta más tarde.' },
        429
      );
    }

    record.count++;
    return next();
  };
}

/**
 * Middleware para logging de errores con contexto
 */
export async function errorLogger(c: Context, next: () => Promise<void>) {
  try {
    await next();
  } catch (error) {
    console.error('❌ Error en request:', {
      method: c.req.method,
      url: c.req.url,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return c.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      500
    );
  }
}

/**
 * Middleware para CORS restringido a orígenes permitidos (Option A deployment).
 * En producción: solo https://appservice.jcarrizo.com.
 * En desarrollo: también http://localhost:5173 y http://localhost:3000.
 */
export function corsMiddleware(options?: {
  origin?: string | string[];
  methods?: string[];
  allowHeaders?: string[];
}) {
  const defaultMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  const defaultAllowHeaders = ['Content-Type', 'Authorization'];

  return async (c: Context, next: () => Promise<void>) => {
    const requestOrigin = c.req.header('Origin') ?? '';
    const allowedOrigins = options?.origin
      ? (Array.isArray(options.origin) ? options.origin : [options.origin])
      : ALLOWED_CORS_ORIGINS;

    const methods = options?.methods || defaultMethods;
    const allowHeaders = options?.allowHeaders || defaultAllowHeaders;

    if (allowedOrigins.includes(requestOrigin)) {
      c.header('Access-Control-Allow-Origin', requestOrigin);
      c.header('Vary', 'Origin');
    }
    c.header('Access-Control-Allow-Methods', methods.join(','));
    c.header('Access-Control-Allow-Headers', allowHeaders.join(','));
    c.header('Access-Control-Allow-Credentials', 'true');

    if (c.req.method === 'OPTIONS') {
      return c.text('', 204);
    }

    return next();
  };
}

