/**
 * Helper functions for API calls
 */

import type { ApiResponse } from '../src/types';
import { retry, type RetryOptions } from './retry';
import { NetworkError, getErrorMessage } from './error-handler';

/**
 * Wraps a fetch call with error handling and returns an ApiResponse
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data?.error ?? `Error HTTP ${response.status}`,
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Wraps a fetch call with retry logic and error handling
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<ApiResponse<T>> {
  try {
    const userShouldRetry = retryOptions?.shouldRetry;
    return await retry(
      () => fetchWithErrorHandling<T>(url, options),
      {
        ...retryOptions,
        shouldRetry: (error, attempt) => {
          if (userShouldRetry && !userShouldRetry(error, attempt)) return false;
          if (error instanceof NetworkError) return true;
          return false;
        },
      }
    );
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Builds a query string from a params object, omitting undefined/null values
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null
  );

  if (entries.length === 0) return '';

  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `?${query}`;
}

/**
 * Returns common JSON headers for API requests
 */
export function jsonHeaders(extraHeaders?: Record<string, string>): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
}
