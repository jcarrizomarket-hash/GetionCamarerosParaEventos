import { ErrorInfo } from 'react';

export interface ErrorLog {
  message: string;
  name: string;
  stack?: string;
  componentStack?: string;
  section?: string;
  userAgent: string;
  timestamp: string;
  url: string;
  env: string;
}

/**
 * Logger de errores para enviar a servicio de monitoreo
 */
export async function logErrorToService(
  error: Error,
  errorInfo: ErrorInfo,
  section?: string
): Promise<void> {
  try {
    const errorLog: ErrorLog = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      section,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      env: import.meta.env.MODE || 'unknown',
    };

    // Log localmente
    console.error('Error logged:', errorLog);

    // Enviar a servicio de monitoreo (Sentry, LogRocket, etc)
    await sendErrorToMonitoring(errorLog);

    // Guardar en localStorage para debugging
    saveErrorToLocalStorage(errorLog);
  } catch (err) {
    console.error('Failed to log error:', err);
  }
}

/**
 * Enviar error a servicio de monitoreo (implementar según servicio)
 */
async function sendErrorToMonitoring(_errorLog: ErrorLog): Promise<void> {
  // Implementar según servicio (Sentry, LogRocket, etc)
  // Ejemplo con Sentry:
  // if (window.Sentry) {
  //   window.Sentry.captureException(errorLog);
  // }

  // Por ahora, solo guardar localmente
  console.warn('Error monitoring not configured');
}

/**
 * Guardar error en localStorage para debugging
 */
function saveErrorToLocalStorage(errorLog: ErrorLog): void {
  try {
    const errors = JSON.parse(
      localStorage.getItem('app_errors') || '[]'
    ) as ErrorLog[];

    // Guardar últimos 10 errores
    errors.unshift(errorLog);
    localStorage.setItem(
      'app_errors',
      JSON.stringify(errors.slice(0, 10))
    );
  } catch (err) {
    console.error('Failed to save error to localStorage:', err);
  }
}

/**
 * Obtener errores guardados del localStorage
 */
export function getErrorHistory(): ErrorLog[] {
  try {
    return JSON.parse(
      localStorage.getItem('app_errors') || '[]'
    ) as ErrorLog[];
  } catch (err) {
    console.error('Failed to retrieve error history:', err);
    return [];
  }
}

/**
 * Limpiar historial de errores
 */
export function clearErrorHistory(): void {
  try {
    localStorage.removeItem('app_errors');
  } catch (err) {
    console.error('Failed to clear error history:', err);
  }
}

/**
 * Global error handler para errores no atrapados
 */
export function setupGlobalErrorHandlers(): void {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logErrorToService(
      new Error(event.reason?.message || String(event.reason)),
      { componentStack: 'Unhandled Promise Rejection' },
      'global'
    );
  });

  // Uncaught errors
  window.addEventListener('error', (event) => {
    logErrorToService(
      event.error || new Error(event.message),
      { componentStack: `File: ${event.filename}:${event.lineno}:${event.colno}` },
      'global'
    );
  });
}
