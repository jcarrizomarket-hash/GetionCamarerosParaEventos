/**
 * Centralized error handling utilities
 */

import logger from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, statusCode?: number) {
    super(message, 'NETWORK_ERROR', statusCode);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Extracts a human-readable message from any error value
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Error desconocido';
}

/**
 * Handles an error by logging it and returning a standardized message
 */
export function handleError(error: unknown, context?: string): string {
  const message = getErrorMessage(error);
  const logContext = context ? { context } : undefined;

  if (error instanceof AppError) {
    logger.error(message, { ...logContext, code: error.code, statusCode: error.statusCode });
  } else {
    logger.error(message, logContext);
  }

  return message;
}

/**
 * Wraps an async function and catches any thrown errors, returning them as a result object
 */
export async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<{ data: T; error: null } | { data: null; error: Error }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(getErrorMessage(err));
    return { data: null, error };
  }
}
