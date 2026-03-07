/**
 * Middleware de seguridad para proteger las Supabase Functions
 * Valida un header secreto para operaciones mutantes (POST, PUT, DELETE)
 */

import type { Context } from 'npm:hono';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.39.3';
import * as kv from './kv_store.tsx';

/** Shared rate limit record shape used by both in-memory and KV rate limiters. */
type RateLimitRecord = { count: number; resetAt: number };

/** Lazily-initialized Supabase client for JWT verification (uses anon key). */
let _authClient: SupabaseClient | null = null;
function getAuthClient(): SupabaseClient {
  if (!_authClient) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    _authClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _authClient;
}

/**
 * Middleware que requiere un header secreto para operaciones mutantes
 * 
 * Uso en el servidor:
 * ```typescript
 * app.post('/pedidos', requireFunctionSecret, async (c) => {
 *   // Tu código aquí - solo se ejecuta si el secret es válido
 * });
 * ```
 * 
 * @param c - Contexto de Hono
 */
export async function requireFunctionSecret(c: Context, next: () => Promise<void>) {
  // Métodos que requieren validación
  const methodsToProtect = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  // Solo validar para métodos mutantes
  if (!methodsToProtect.includes(c.req.method)) {
    return next();
  }

  // Obtener el secret del entorno
  const expectedSecret = Deno.env.get('SUPABASE_FN_SECRET');
  
  // Si no hay secret configurado: fail-closed en producción, permitir solo en desarrollo
  if (!expectedSecret) {
    const isDev = Deno.env.get('SUPABASE_ENV') === 'local' || Deno.env.get('APP_ENV') === 'development';
    if (isDev) {
      console.warn('⚠️ SUPABASE_FN_SECRET not set — allowing in development mode only');
      return next();
    }
    console.error('❌ SUPABASE_FN_SECRET not configured in production — blocking request');
    return c.json({ success: false, error: 'Servicio no disponible.' }, 503);
  }

  // Obtener el secret del header
  const providedSecret = c.req.header('x-fn-secret');

  // Validar que coincidan
  if (providedSecret !== expectedSecret) {
    console.warn(`❌ Intento de acceso no autorizado al endpoint ${c.req.method} ${c.req.url}`);
    return c.json(
      {
        success: false,
        error: 'No autorizado. Header x-fn-secret inválido o ausente.',
      },
      401
    );
  }

  // Secret válido, continuar
  return next();
}

/**
 * Middleware opcional más flexible que solo registra pero no bloquea
 * Útil durante migración gradual
 */
export async function logFunctionAccess(c: Context, next: () => Promise<void>) {
  const method = c.req.method;
  const url = c.req.url;
  const hasSecret = Boolean(c.req.header('x-fn-secret'));
  
  console.log(`📡 ${method} ${url} - Secret: ${hasSecret ? '✅' : '❌'}`);
  
  return next();
}

/**
 * Validates the Supabase JWT Bearer token against Supabase Auth.
 * Rejects any token that is expired, malformed, or not issued by Supabase.
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`❌ Auth requerida: ${c.req.method} ${c.req.url} — no Bearer header`);
    return c.json({ success: false, error: 'No autorizado. Se requiere JWT Bearer.' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_ANON_KEY')) {
      console.error('❌ SUPABASE_URL or SUPABASE_ANON_KEY not configured');
      return c.json({ success: false, error: 'Error de configuración del servidor.' }, 500);
    }

    const { data: { user }, error } = await getAuthClient().auth.getUser(token);

    if (error || !user) {
      console.warn(`❌ Token inválido o expirado: ${c.req.method} ${c.req.url}`, error?.message);
      return c.json({ success: false, error: 'No autorizado. Token inválido o expirado.' }, 401);
    }

    // Attach user to context for downstream handlers
    c.set('user', user);
    return next();
  } catch (err) {
    console.error('❌ Error al verificar token:', err);
    return c.json({ success: false, error: 'Error al verificar autenticación.' }, 500);
  }
}

/**
 * Rate limiting middleware.
 *
 * ⚠️ SERVERLESS LIMITATION: The in-memory Map is reset on every Edge Function
 * cold start. For production-grade rate limiting across invocations, use the
 * KV store (kv_store.tsx) as shown in the kvRateLimit function below.
 *
 * Use kvRateLimit for sensitive endpoints, rateLimit for lightweight protection.
 */
const requestCounts = new Map<string, RateLimitRecord>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return async (c: Context, next: () => Promise<void>) => {
    // Usar IP o un identificador del cliente
    const identifier = c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(identifier);
    
    if (!record || now > record.resetAt) {
      // Nuevo período o primer request
      requestCounts.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return c.json(
        {
          success: false,
          error: 'Demasiadas peticiones. Intenta más tarde.',
        },
        429
      );
    }
    
    record.count++;
    return next();
  };
}

// KV-backed rate limiter (persistent across cold starts — use for sensitive endpoints)
export function kvRateLimit(maxRequests: number = 20, windowMs: number = 60000) {
  return async (c: Context, next: () => Promise<void>) => {
    const identifier = c.req.header('x-forwarded-for') ?? c.req.header('cf-connecting-ip') ?? 'unknown';
    const key = `rate:${identifier}`;

    try {
      const now = Date.now();
      const record: RateLimitRecord | null = await kv.get(key);

      if (!record || now > record.resetAt) {
        await kv.set(key, { count: 1, resetAt: now + windowMs });
        return next();
      }

      if (record.count >= maxRequests) {
        return c.json(
          {
            success: false,
            error: 'Demasiadas peticiones. Intenta más tarde.',
          },
          429
        );
      }

      await kv.set(key, { count: record.count + 1, resetAt: record.resetAt });
      return next();
    } catch (err) {
      // If KV is unavailable, fail open to avoid blocking legitimate requests
      console.error('❌ kvRateLimit: Error al acceder al KV store:', err);
      return next();
    }
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
      },
      500
    );
  }
}

/**
 * Middleware para CORS con opciones configurables
 */
export function corsMiddleware(options?: {
  origin?: string | string[];
  methods?: string[];
  allowHeaders?: string[];
}) {
  const defaultOrigin = '*';
  const defaultMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  const defaultAllowHeaders = ['Content-Type', 'Authorization'];
  
  return async (c: Context, next: () => Promise<void>) => {
    const origin = options?.origin || defaultOrigin;
    const methods = options?.methods || defaultMethods;
    const allowHeaders = options?.allowHeaders || defaultAllowHeaders;
    
    c.header('Access-Control-Allow-Origin', Array.isArray(origin) ? origin.join(',') : origin);
    c.header('Access-Control-Allow-Methods', methods.join(','));
    c.header('Access-Control-Allow-Headers', allowHeaders.join(','));
    
    // Manejar preflight
    if (c.req.method === 'OPTIONS') {
      return c.text('', 204);
    }
    
    return next();
  };
}
