/**
 * Constantes centralizadas de la aplicación
 * Sistema de Gestión de Camareros para Eventos
 */

// ==================== API ====================

/** Tiempo máximo de espera para peticiones a la API (ms) */
export const API_TIMEOUT_MS = 5000;

/** Número máximo de reintentos para peticiones fallidas */
export const API_MAX_RETRIES = 3;

/** Tiempo de espera inicial para reintentos con backoff exponencial (ms) */
export const API_RETRY_INITIAL_DELAY_MS = 500;

/** Tiempo máximo de espera entre reintentos (ms) */
export const API_RETRY_MAX_DELAY_MS = 10000;

// ==================== ESTADOS ====================

/** Estados posibles de una asignación de camarero */
export const ESTADOS_ASIGNACION = {
  PENDIENTE: 'pendiente',
  ENVIADO: 'enviado',
  CONFIRMADO: 'confirmado',
  NO_CONFIRMADO: 'no confirmado',
} as const;

// ==================== VESTIMENTA ====================

/** Tipos de camisa disponibles */
export const TIPOS_CAMISA = {
  BLANCA: 'blanca',
  NEGRA: 'negra',
} as const;

// ==================== CATERING ====================

/** Opciones de catering */
export const OPCIONES_CATERING = {
  SI: 'si',
  NO: 'no',
} as const;
