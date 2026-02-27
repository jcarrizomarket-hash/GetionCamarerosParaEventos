/**
 * Audit trail middleware
 * Records all mutating operations for compliance and debugging
 */

import type { Context, Next } from 'npm:hono@4.0.0';

interface AuditEntry {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export function auditLog() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    const method = c.req.method;

    await next();

    if (MUTATING_METHODS.includes(method)) {
      const entry: AuditEntry = {
        method,
        path: new URL(c.req.url).pathname,
        statusCode: c.res.status,
        durationMs: Date.now() - start,
        timestamp: new Date().toISOString(),
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      };

      console.log('[AUDIT]', JSON.stringify(entry));
    }
  };
}
