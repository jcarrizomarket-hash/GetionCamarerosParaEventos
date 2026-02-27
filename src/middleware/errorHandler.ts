/**
 * errorHandler.ts
 * Manejo centralizado de errores con logging estructurado
 * Sin exposición de detalles internos al cliente
 */

import type { Context } from 'hono';

// ============================================================
// TIPOS DE ERROR
// ============================================================

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(422, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} no encontrado`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

// ============================================================
// MIDDLEWARE DE ERROR
// ============================================================

/**
 * Genera un ID único para correlacionar errores en logs
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Registra el error de forma estructurada (sin datos sensibles)
 */
function logError(
  errorId: string,
  error: Error,
  context: { method: string; url: string; statusCode: number }
): void {
  console.error(
    JSON.stringify({
      level: 'error',
      errorId,
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString(),
    })
  );
}

/**
 * Middleware de manejo centralizado de errores
 * Debe ser el ÚLTIMO middleware registrado con app.onError()
 */
export async function errorHandler(error: Error, c: Context): Promise<Response> {
  const errorId = generateErrorId();
  const method = c.req.method;
  const url = c.req.url;

  if (error instanceof AppError) {
    logError(errorId, error, { method, url, statusCode: error.statusCode });

    return c.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        errorId,
        ...(error.details ? { details: error.details } : {}),
      },
      error.statusCode as 400 | 401 | 403 | 404 | 422 | 429 | 500
    );
  }

  // Error inesperado: loguear con stack completo pero NO exponer detalles
  logError(errorId, error, { method, url, statusCode: 500 });

  return c.json(
    {
      success: false,
      error: 'Error interno del servidor',
      errorId,
    },
    500
  );
}

/**
 * Middleware try/catch para rutas individuales
 * Captura errores async y los pasa al errorHandler
 */
export async function errorLogger(c: Context, next: () => Promise<void>) {
  try {
    await next();
  } catch (error) {
    return errorHandler(error instanceof Error ? error : new Error(String(error)), c);
  }
}
