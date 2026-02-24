import { ApiError } from '../types';

/**
 * Normalizes any caught error into a structured ApiError object.
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      code: 'TIMEOUT',
      message: 'La solicitud tardó demasiado tiempo',
      status: 408,
    };
  }

  if (error instanceof TypeError) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Error de conectividad',
      status: 0,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      status: 500,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Error desconocido',
    status: 500,
  };
}

/**
 * Type guard to check if a value is an ApiError.
 */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'status' in value
  );
}

/**
 * Returns a user-friendly message for a given ApiError.
 */
export function getUserFriendlyMessage(error: ApiError): string {
  switch (error.code) {
    case 'TIMEOUT':
      return 'La operación tardó demasiado. Por favor, inténtalo de nuevo.';
    case 'NETWORK_ERROR':
      return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    case 'HTTP_401':
      return 'No tienes autorización. Por favor, vuelve a iniciar sesión.';
    case 'HTTP_403':
      return 'No tienes permisos para realizar esta acción.';
    case 'HTTP_404':
      return 'El recurso solicitado no fue encontrado.';
    case 'HTTP_500':
      return 'Error interno del servidor. Por favor, inténtalo más tarde.';
    default:
      return error.message || 'Ha ocurrido un error inesperado.';
  }
}
