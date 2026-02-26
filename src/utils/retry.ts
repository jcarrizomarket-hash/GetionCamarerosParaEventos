/**
 * Retry logic with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry'>> = {
  maxAttempts: 3,
  initialDelayMs: 500,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

function defaultShouldRetry(error: unknown): boolean {
  if (error instanceof Error) {
    // Retry on network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
    // Do not retry on validation/auth errors
    if (error.message.includes('401') || error.message.includes('403')) return false;
  }
  return true;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executes an async function with retry logic using exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.maxAttempts < 1) {
    throw new Error('maxAttempts must be at least 1');
  }

  const shouldRetry = options.shouldRetry ?? defaultShouldRetry;

  let lastError: unknown;
  let delayMs = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts || !shouldRetry(error, attempt)) {
        throw error;
      }

      await delay(Math.min(delayMs, opts.maxDelayMs));
      delayMs = Math.min(delayMs * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  throw lastError;
}
