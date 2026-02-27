/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per IP/user
 *
 * NOTE: This implementation uses in-memory storage which is suitable for
 * single-instance deployments only. For multi-instance or serverless
 * edge function deployments, replace the in-memory store with a
 * distributed store such as Redis or Supabase KV.
 */

import type { Context, Next } from 'npm:hono@4.0.0';

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (c: Context) => string;
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    maxRequests = 100,
    keyGenerator = (c: Context) => {
      return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    },
  } = options;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    if (!store[key] || store[key].resetAt < now) {
      store[key] = { count: 1, resetAt: now + windowMs };
    } else {
      store[key].count++;
    }

    const remaining = Math.max(0, maxRequests - store[key].count);
    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(store[key].resetAt / 1000)));

    if (store[key].count > maxRequests) {
      return c.json({ success: false, error: 'Too many requests' }, 429);
    }

    await next();
  };
}
