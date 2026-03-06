/**
 * Utilidad de reintentos con backoff exponencial
 * Para uso en llamadas a la API con manejo de errores robusto
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 500,
  maxDelayMs: 10000,
  backoffFactor: 2,
  shouldRetry: (error: unknown) => {
    if (error instanceof Error && error.name === 'AbortError') return false;
    return true;
  },
};

/**
 * Espera un número de milisegundos
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calcula el delay para el siguiente intento usando backoff exponencial con jitter
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.initialDelayMs * Math.pow(options.backoffFactor, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, options.maxDelayMs);
}

/**
 * Ejecuta una función con reintentos automáticos y backoff exponencial
 * 
 * @example
 * const data = await withRetry(() => fetchData(), { maxAttempts: 3 });
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts || !opts.shouldRetry(error, attempt)) {
        break;
      }

      const waitTime = calculateDelay(attempt, opts);
      console.warn(`⚠️ Intento ${attempt}/${opts.maxAttempts} fallido. Reintentando en ${Math.round(waitTime)}ms...`);
      await delay(waitTime);
    }
  }

  throw lastError;
}

/**
 * Crea un fetch con timeout y opción de señal de aborto
 * 
 * @example
 * const response = await fetchWithTimeout('https://api.example.com/data', {}, 5000);
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal ?? controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Combina retry y timeout para llamadas a la API
 * 
 * @example
 * const response = await fetchWithRetry('https://api.example.com/data', {}, {
 *   maxAttempts: 3,
 *   timeoutMs: 5000,
 * });
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions?: RetryOptions & { timeoutMs?: number }
): Promise<Response> {
  const timeoutMs = retryOptions?.timeoutMs ?? 5000;

  return withRetry(
    () => fetchWithTimeout(url, options, timeoutMs),
    retryOptions
  );
}
