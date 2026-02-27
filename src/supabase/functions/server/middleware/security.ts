/**
 * Security headers middleware
 * Adds security headers to all responses
 */

import type { Context, Next } from 'npm:hono@4.0.0';

export function securityHeaders() {
  return async (c: Context, next: Next) => {
    await next();

    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  };
}

export function corsHeaders(allowedOrigins: string[] = ['*']) {
  return async (c: Context, next: Next) => {
    const origin = c.req.header('origin') || '';
    const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);

    if (isAllowed) {
      c.header('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
    }
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (c.req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    await next();
  };
}
