/**
 * audit.ts
 * Logging de cambios mutantes con tracking de usuario/IP y trail completo
 */

import type { Context } from 'hono';

// ============================================================
// TIPOS
// ============================================================

export type AuditOperation = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT' | 'EXPORT';

export interface AuditEntry {
  operation: AuditOperation;
  resource: string;
  resourceId?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ============================================================
// HELPERS INTERNOS
// ============================================================

function extractClientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function extractUserAgent(c: Context): string {
  return c.req.header('user-agent') || 'unknown';
}

async function persistAuditEntry(entry: AuditEntry): Promise<void> {
  // En producción esto enviaría a Supabase audit_trail table
  // La función fn_audit_trail() SQL maneja inserciones automáticas vía triggers
  // Este log captura operaciones de la capa de aplicación
  console.log(
    JSON.stringify({
      level: 'audit',
      ...entry,
    })
  );
}

// ============================================================
// MIDDLEWARE PRINCIPAL
// ============================================================

/**
 * Registra operaciones mutantes (POST, PUT, PATCH, DELETE) automáticamente
 */
export async function auditMiddleware(c: Context, next: () => Promise<void>) {
  const method = c.req.method;
  const mutantMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!mutantMethods.includes(method)) {
    return next();
  }

  const startTime = Date.now();
  const url = new URL(c.req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const resource = pathParts[pathParts.length - 2] || pathParts[pathParts.length - 1] || 'unknown';
  const resourceId = pathParts[pathParts.length - 1];

  const operationMap: Record<string, AuditOperation> = {
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE',
  };

  const entry: AuditEntry = {
    operation: operationMap[method] || 'UPDATE',
    resource,
    resourceId: /^[0-9a-f-]{36}$/i.test(resourceId) ? resourceId : undefined,
    userId: c.get('userId') as string | undefined,
    userEmail: c.get('userEmail') as string | undefined,
    ipAddress: extractClientIp(c),
    userAgent: extractUserAgent(c),
    timestamp: new Date().toISOString(),
    metadata: {
      method,
      path: url.pathname,
      durationMs: 0,
    },
  };

  await next();

  entry.metadata = {
    ...entry.metadata,
    durationMs: Date.now() - startTime,
    statusCode: c.res.status,
  };

  await persistAuditEntry(entry);
}

// ============================================================
// HELPER PARA AUDITORÍA MANUAL
// ============================================================

/**
 * Registra manualmente una entrada de auditoría con valores antes/después
 */
export async function logAuditChange(
  c: Context,
  options: {
    operation: AuditOperation;
    resource: string;
    resourceId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const entry: AuditEntry = {
    ...options,
    userId: c.get('userId') as string | undefined,
    userEmail: c.get('userEmail') as string | undefined,
    ipAddress: extractClientIp(c),
    userAgent: extractUserAgent(c),
    timestamp: new Date().toISOString(),
  };

  await persistAuditEntry(entry);
}
