/**
 * Middleware de seguridad para proteger las Supabase Functions
 * Valida un header secreto para operaciones mutantes (POST, PUT, DELETE)
 */

import type { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';

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
 * Extrae la IP real del cliente comprobando primero headers de proxies/CDN de confianza.
 * Orden de prioridad: Cloudflare > X-Real-IP > primer valor de X-Forwarded-For.
 */
function getClientIP(c: Context): string {
  // Cloudflare añade siempre la IP original del cliente en este header
  const cfIP = c.req.header('cf-connecting-ip');
  if (cfIP) return cfIP;

  // Header estándar de proxies que solo añaden una IP
  const realIP = c.req.header('x-real-ip');
  if (realIP) return realIP;

  // Usar sólo el primer valor de la lista; el cliente real es el primero de la cadena
  const forwardedFor = c.req.header('x-forwarded-for');
  if (forwardedFor) {
    const firstIP = forwardedFor.split(',')[0].trim();
    if (firstIP) return firstIP;
  }

  return 'unknown';
}

/**
 * Middleware para rate limiting con persistencia en KV Store.
 *
 * @param maxRequests - Número máximo de peticiones permitidas en la ventana temporal
 * @param windowMs    - Duración de la ventana en milisegundos (por defecto 60 segundos)
 * @param endpointName - Nombre lógico del endpoint para aislar los contadores por ruta
 */
export function rateLimit(maxRequests: number = 100, windowMs: number = 60000, endpointName: string = 'default') {
  return async (c: Context, next: () => Promise<void>) => {
    const identifier = getClientIP(c);

    // IPs en la whitelist (separadas por coma en la variable de entorno) no están limitadas
    const whitelist = (Deno.env.get('RATE_LIMIT_WHITELIST') || '').split(',').map(ip => ip.trim()).filter(Boolean);
    if (whitelist.includes(identifier)) {
      return next();
    }

    const kvKey = `ratelimit:${endpointName}:${identifier}`;
    const now = Date.now();

    try {
      const raw = await kv.get(kvKey);
      const record: { count: number; resetAt: number } | null =
        raw && typeof raw.count === 'number' && typeof raw.resetAt === 'number' ? raw : null;

      let count: number;
      let resetAt: number;

      if (!record || now > record.resetAt) {
        // Nueva ventana temporal
        count = 1;
        resetAt = now + windowMs;
      } else {
        count = record.count + 1;
        resetAt = record.resetAt;
      }

      if (count > maxRequests) {
        const retryAfter = Math.ceil((resetAt - now) / 1000);
        console.warn(`⚠️ Rate limit excedido: IP=${identifier} endpoint=${endpointName} count=${count}/${maxRequests}`);
        c.header('X-RateLimit-Limit', String(maxRequests));
        c.header('X-RateLimit-Remaining', '0');
        c.header('Retry-After', String(retryAfter));
        return c.json(
          {
            success: false,
            error: 'Demasiadas peticiones. Intenta más tarde.',
          },
          429
        );
      }

      // Persistir el contador actualizado
      await kv.set(kvKey, { count, resetAt });

      c.header('X-RateLimit-Limit', String(maxRequests));
      c.header('X-RateLimit-Remaining', String(maxRequests - count));

      return next();
    } catch (error) {
      // Si el KV store falla, se permite la petición para no bloquear el servicio
      console.error('⚠️ Error en KV store del rate limit:', error instanceof Error ? error.message : String(error));
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
