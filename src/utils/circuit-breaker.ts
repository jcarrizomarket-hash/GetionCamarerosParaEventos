/**
 * Patrón Circuit Breaker para dependencias externas
 *
 * Evita que fallos en servicios externos (WhatsApp, Email, etc.)
 * ralenticen toda la aplicación mediante tres estados:
 *   CLOSED  → operación normal
 *   OPEN    → falla rápido sin llamar al servicio
 *   HALF_OPEN → permite un intento de recuperación
 */

import { logger } from './logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Número de fallos consecutivos antes de abrir el circuito */
  failureThreshold?: number;
  /** Número de éxitos consecutivos en HALF_OPEN para cerrar el circuito */
  successThreshold?: number;
  /** Tiempo en ms antes de intentar recuperación desde OPEN */
  timeout?: number;
  /** Nombre del circuito (para logging) */
  name?: string;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      timeout: options.timeout ?? 5000,
      name: options.name ?? 'circuit',
    };
  }

  get currentState(): CircuitState {
    return this.state;
  }

  /**
   * Ejecuta la función protegida respetando el estado del circuito.
   * Lanza un error si el circuito está abierto.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.options.timeout) {
        this.state = 'HALF_OPEN';
        logger.info(`[${this.options.name}] Circuit HALF_OPEN – attempting recovery`);
      } else {
        throw new Error(`Circuit breaker [${this.options.name}] is OPEN. Retry after ${this.options.timeout - elapsed}ms.`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
        logger.info(`[${this.options.name}] Circuit CLOSED – service recovered`);
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
      this.successCount = 0;
      logger.warn(`[${this.options.name}] Circuit OPEN after ${this.failureCount} failures`);
    }
  }

  /** Reinicia el circuito manualmente (útil en tests) */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}
