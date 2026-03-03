/**
 * Middleware de seguridad para proteger las Supabase Functions
 * Autenticación mediante Authorization Bearer JWT (Supabase anon key)
 */

import type { Context } from 'npm:hono';

/**
 * Middleware que requiere un header secreto para operaciones mutantes
 *
 * @deprecated Use `requireAuth` (Bearer JWT) instead.
 * This middleware is kept for server-to-server calls only and must
 * NEVER be activated by setting SUPABASE_FN_SECRET on the frontend.
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
 * Middleware opcional que registra cada request
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

  // Aquí podrías validar el token con Supabase si es necesario
  // const token = authHeader.split(' ')[1];
  // const { data, error } = await supabase.auth.getUser(token);
  
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
  const defaultOrigin = 'https://appservice.jcarrizo.com';
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
