/**
 * Middleware de seguridad para proteger las Supabase Functions
 * Valida un header secreto para operaciones mutantes (POST, PUT, DELETE)
 */

import type { Context } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

// Lazily-initialized Supabase client for token validation (reused across requests)
let _authClient: ReturnType<typeof createClient> | null = null;
function getAuthClient(): ReturnType<typeof createClient> | null {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  if (!_authClient) {
    _authClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return _authClient;
}

/**
 * Registra un evento de auditoría con timestamp, usuario y detalle
 */
export function logAudit(
  c: Context,
  userId: string | null,
  event: string,
  details?: string
) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    userId,
    method: c.req.method,
    url: c.req.url,
    details,
  }));
}
§=======
import { createRateLimiter } from './rate-limiter.ts';

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
  
  // Si no hay secret configurado, registrar advertencia pero permitir la petición
  // (útil para desarrollo local)
  if (!expectedSecret) {
    console.warn('⚠️ SUPABASE_FN_SECRET no está configurado. Se recomienda configurarlo en producción.');
    return next();
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
 * Middleware para validar JWT, extraer claims y registrar auditoría.
 * Valida formato, expiración y autenticidad del token Bearer.
 * Almacena userId, email y role en el contexto para uso por requireRole.
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logAudit(c, null, 'AUTH_FAILED', 'Missing or invalid Authorization header');
    return c.json(
      {
        success: false,
        error: 'No autorizado. Header Authorization requerido.',
      },
      401
    );
  }

  const token = authHeader.split(' ')[1];

  // Decode JWT payload (base64url) to extract claims
  let payload: Record<string, any>;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    payload = JSON.parse(atob(base64));
  } catch {
    logAudit(c, null, 'AUTH_FAILED', 'Malformed JWT token');
    return c.json(
      {
        success: false,
        error: 'Token inválido.',
      },
      401
    );
  }

  // Validate token expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    logAudit(c, payload.sub ?? null, 'TOKEN_EXPIRED', `Token expired at ${new Date(payload.exp * 1000).toISOString()}`);
    return c.json(
      {
        success: false,
        error: 'Token expirado. Por favor, inicie sesión nuevamente.',
      },
      401
    );
  }

  // Validate token signature via Supabase auth API
  const authClient = getAuthClient();
  if (authClient) {
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      logAudit(c, payload.sub ?? null, 'AUTH_FAILED', `Token validation error: ${error?.message ?? 'no user'}`);
      return c.json(
        {
          success: false,
          error: 'Token inválido o sesión no encontrada.',
        },
        401
      );
    }
    // Store validated user info in context
    c.set('userId', data.user.id);
    c.set('userEmail', data.user.email ?? null);
    c.set('userRole', data.user.app_metadata?.role ?? data.user.user_metadata?.role ?? payload.role ?? null);
  } else {
    // Fallback: store claims from decoded JWT (development / missing env vars)
    c.set('userId', payload.sub ?? null);
    c.set('userEmail', payload.email ?? null);
    c.set('userRole', payload.app_metadata?.role ?? payload.role ?? null);
  }

  c.set('tokenExp', payload.exp ?? null);
  logAudit(c, c.get('userId'), 'AUTH_SUCCESS', `Access granted to ${c.req.method} ${c.req.url}`);

  return next();
}

/**
 * Middleware para control de acceso basado en roles.
 * Debe usarse después de requireAuth (requiere userId/userRole en contexto).
 *
 * Uso:
 * ```typescript
 * app.delete('/recurso/:id', requireAuth, requireRole('admin', 'coordinador'), handler);
 * ```
 */
export function requireRole(...roles: string[]) {
  return async (c: Context, next: () => Promise<void>) => {
    const userRole: string | null = c.get('userRole');

    if (!userRole || !roles.includes(userRole)) {
      logAudit(
        c,
        c.get('userId') ?? null,
        'ROLE_DENIED',
        `Role '${userRole ?? 'none'}' not in [${roles.join(', ')}]`
      );
      return c.json(
        {
          success: false,
          error: `Acceso denegado. Se requiere uno de los roles: ${roles.join(', ')}.`,
        },
        403
      );
    }

    return next();
  };
}

/**
 * Middleware para rate limiting simple (prevenir abuso)
 * NOTA: En producción, considera usar Redis o similar para un rate limiting más robusto
 * Rate limiters respaldados por KV store (persistentes y distribuidos).
 *
 * globalRateLimiter  – límite alto para todas las rutas (10 000 req/hora)
 * endpointRateLimiter – límite moderado para endpoints de modificación (500 req/min)
 * authRateLimiter     – límite estricto para prevenir fuerza bruta (10 req/min)
 */
export const globalRateLimiter = createRateLimiter({
  maxRequests: 10000,
  windowMs: 3600000, // 1 hora
  softLimitPercent: 80,
});

export const endpointRateLimiter = createRateLimiter({
  maxRequests: 500,
  windowMs: 60000, // 1 minuto
  softLimitPercent: 80,
});

export const authRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minuto
  softLimitPercent: 80,
});

/**
 * @deprecated Usar globalRateLimiter / endpointRateLimiter / authRateLimiter en su lugar.
 * Mantenido por compatibilidad; delega en el nuevo rate limiter KV-backed.
 */
export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return createRateLimiter({ maxRequests, windowMs });
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
  const defaultAllowHeaders = ['Content-Type', 'Authorization', 'x-fn-secret'];
  
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
