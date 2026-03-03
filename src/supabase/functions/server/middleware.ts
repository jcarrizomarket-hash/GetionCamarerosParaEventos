/**
 * Middleware de seguridad para proteger las Supabase Functions
 * Valida un header secreto para operaciones mutantes (POST, PUT, DELETE)
 */

import type { Context } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

// Singleton Supabase client for JWT validation (uses anon key, not service role)
let _authClient: ReturnType<typeof createClient> | null = null;
const getAuthClient = () => {
  if (!_authClient) {
    _authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
  }
  return _authClient;
};

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
  
  // Obtener el secret del header (backward compatibility)
  const providedSecret = c.req.header('x-fn-secret');

  // Accept legacy x-fn-secret if configured and matches
  if (expectedSecret && providedSecret === expectedSecret) {
    return next();
  }

  // Accept valid Supabase user JWT as the primary auth mechanism
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { data: { user } } = await getAuthClient().auth.getUser(token);
      if (user) {
        return next();
      }
    } catch (_e) {
      // JWT validation failed, fall through to secret check
    }
  }

  // If no secret configured, allow (development mode)
  if (!expectedSecret) {
    console.warn('⚠️ SUPABASE_FN_SECRET no está configurado. Se recomienda configurarlo en producción.');
    return next();
  }

  console.warn(`❌ Intento de acceso no autorizado al endpoint ${c.req.method} ${c.req.url}`);
  return c.json(
    {
      success: false,
      error: 'No autorizado. Se requiere JWT de usuario válido o header x-fn-secret.',
    },
    401
  );
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
 * Middleware para validar que el request tenga un token JWT válido de Supabase Auth
 * Requerido para endpoints que exigen un usuario autenticado con email/contraseña.
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        error: 'No autorizado. Header Authorization requerido.',
      },
      401
    );
  }

  const token = authHeader.split(' ')[1];

  // Validate token with Supabase Auth
  const { data: { user }, error } = await getAuthClient().auth.getUser(token);

  if (error || !user) {
    console.warn('❌ Token JWT inválido o expirado:', error?.message);
    return c.json(
      {
        success: false,
        error: 'No autorizado. Token JWT inválido o expirado.',
      },
      401
    );
  }

  // Store user in context for downstream handlers
  c.set('user', user);
  return next();
}

/**
 * Middleware para rate limiting simple (prevenir abuso)
 * NOTA: En producción, considera usar Redis o similar para un rate limiting más robusto
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

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
