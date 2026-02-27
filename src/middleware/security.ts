/**
 * security.ts
 * CORS estricto, headers de seguridad y validación de secretos
 */

import type { Context } from 'hono';

// ============================================================
// CORS
// ============================================================

interface CorsOptions {
  allowedOrigins: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  maxAge?: number;
}

const DEFAULT_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const DEFAULT_ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'x-fn-secret', 'x-request-id'];

/**
 * Middleware CORS estricto - solo permite orígenes explícitamente listados
 */
export function strictCors(options: CorsOptions) {
  return async (c: Context, next: () => Promise<void>) => {
    const origin = c.req.header('origin') || '';
    const methods = options.allowedMethods ?? DEFAULT_ALLOWED_METHODS;
    const headers = options.allowedHeaders ?? DEFAULT_ALLOWED_HEADERS;

    const isAllowed = options.allowedOrigins.includes(origin) || options.allowedOrigins.includes('*');

    if (isAllowed) {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Vary', 'Origin');
    }

    c.header('Access-Control-Allow-Methods', methods.join(', '));
    c.header('Access-Control-Allow-Headers', headers.join(', '));
    c.header('Access-Control-Max-Age', String(options.maxAge ?? 86400));
    c.header('Access-Control-Allow-Credentials', 'true');

    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }

    if (!isAllowed && origin !== '') {
      console.warn(`🚫 CORS: origen no permitido: ${origin}`);
      return c.json({ success: false, error: 'Origen no permitido' }, 403);
    }

    return next();
  };
}

// ============================================================
// SECURITY HEADERS
// ============================================================

/**
 * Middleware que agrega headers de seguridad HTTP estándar
 */
export async function securityHeaders(c: Context, next: () => Promise<void>) {
  await next();

  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  c.header(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; ')
  );
  c.header(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
}

// ============================================================
// VALIDACIÓN DE SECRETOS
// ============================================================

/**
 * Compara dos strings de forma timing-safe para evitar timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Middleware que valida el header x-fn-secret para operaciones mutantes
 */
export async function validateFunctionSecret(c: Context, next: () => Promise<void>) {
  const mutantMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!mutantMethods.includes(c.req.method)) {
    return next();
  }

  const denoGlobal = (globalThis as Record<string, unknown>).Deno as { env: { get: (key: string) => string | undefined } } | undefined;
  const expectedSecret: string | null = (denoGlobal?.env.get('SUPABASE_FN_SECRET') ?? null)
    ?? (typeof process !== 'undefined' ? (process.env.SUPABASE_FN_SECRET ?? null) : null);
  if (!expectedSecret) {
    console.warn('⚠️ SUPABASE_FN_SECRET no configurado - se omite validación');
    return next();
  }

  const providedSecret = c.req.header('x-fn-secret') || '';
  if (!timingSafeEqual(providedSecret, expectedSecret)) {
    console.warn(`❌ Secret inválido: ${c.req.method} ${c.req.url}`);
    return c.json({ success: false, error: 'No autorizado' }, 401);
  }

  return next();
}

/**
 * Middleware que agrega un request ID único para trazabilidad
 */
export async function requestId(c: Context, next: () => Promise<void>) {
  const id = c.req.header('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  c.set('requestId', id);
  c.header('X-Request-ID', id);
  return next();
}
