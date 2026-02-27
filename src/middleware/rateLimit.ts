/**
 * rateLimit.ts
 * Rate limiting por IP/usuario con configuraciones predefinidas y alertas
 */

import type { Context } from 'hono';

// ============================================================
// TIPOS
// ============================================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (c: Context) => string;
  onLimitReached?: (c: Context, key: string) => void;
}

// ============================================================
// CONFIGURACIONES PREDEFINIDAS
// ============================================================

/** API general: 100 peticiones por minuto */
export const API_LIMIT: RateLimitOptions = {
  maxRequests: 100,
  windowMs: 60_000,
};

/** Endpoints de autenticación: 10 intentos por 15 minutos */
export const AUTH_LIMIT: RateLimitOptions = {
  maxRequests: 10,
  windowMs: 15 * 60_000,
  onLimitReached: (_, key) => {
    console.warn(`🚨 Auth rate limit alcanzado para: ${key}`);
  },
};

/** Operaciones mutantes (POST/PUT/DELETE): 30 por minuto */
export const MUTATION_LIMIT: RateLimitOptions = {
  maxRequests: 30,
  windowMs: 60_000,
};

/** Exports y reportes: 5 por minuto (operaciones costosas) */
export const EXPORT_LIMIT: RateLimitOptions = {
  maxRequests: 5,
  windowMs: 60_000,
};

// ============================================================
// IMPLEMENTACIÓN
// ============================================================

const stores = new Map<string, Map<string, RateLimitRecord>>();

function getStore(storeKey: string): Map<string, RateLimitRecord> {
  if (!stores.has(storeKey)) {
    stores.set(storeKey, new Map());
  }
  return stores.get(storeKey)!;
}

/**
 * Extrae el identificador del cliente (IP o user ID)
 */
function defaultKeyGenerator(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userId = c.get('userId') as string | undefined;
  return userId ? `user:${userId}` : `ip:${ip}`;
}

/**
 * Crea un middleware de rate limiting con las opciones dadas
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    maxRequests,
    windowMs,
    keyGenerator = defaultKeyGenerator,
    onLimitReached,
  } = options;

  const storeKey = `${maxRequests}:${windowMs}`;
  const store = getStore(storeKey);

  return async (c: Context, next: () => Promise<void>) => {
    const key = keyGenerator(c);
    const now = Date.now();

    const record = store.get(key);

    if (!record || now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      c.header('X-RateLimit-Limit', String(maxRequests));
      c.header('X-RateLimit-Remaining', String(maxRequests - 1));
      c.header('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);

      if (onLimitReached) {
        onLimitReached(c, key);
      } else {
        console.warn(`⚠️ Rate limit alcanzado: ${key} (${maxRequests}/${windowMs}ms)`);
      }

      c.header('Retry-After', String(retryAfter));
      c.header('X-RateLimit-Limit', String(maxRequests));
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', String(Math.ceil(record.resetAt / 1000)));

      return c.json(
        {
          success: false,
          error: 'Demasiadas peticiones. Por favor intenta más tarde.',
          retryAfter,
        },
        429
      );
    }

    record.count++;
    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(maxRequests - record.count));
    c.header('X-RateLimit-Reset', String(Math.ceil(record.resetAt / 1000)));

    return next();
  };
}

/**
 * Limpia registros expirados del store (llamar periódicamente)
 */
export function cleanExpiredRecords(): void {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }
}
