import { ApiResponse, ApiError } from '../types';
import { toApiError } from '../utils/errorHandler';

const DEFAULT_TIMEOUT_MS = 30_000;

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Centralized API client class for Supabase Functions.
 * Provides typed HTTP methods with consistent error handling and timeout support.
 */
class ApiClient {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private getHeaders(extra?: HeadersInit): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authToken}`,
      ...extra,
    };
  }

  async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = DEFAULT_TIMEOUT_MS, headers, ...rest } = options;
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...rest,
        headers: this.getHeaders(headers),
        signal: controller.signal,
      });

      clearTimeout(timerId);

      if (!response.ok) {
        const text = await response.text();
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = { error: text };
        }
        const err: ApiError = {
          code: (parsed.code as string) ?? `HTTP_${response.status}`,
          message:
            (parsed.message as string) ??
            (parsed.error as string) ??
            response.statusText,
          status: response.status,
          details: parsed.details,
        };
        return { success: false, error: err.message, apiError: err };
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error: unknown) {
      clearTimeout(timerId);
      const apiError = toApiError(error);
      return { success: false, error: apiError.message, apiError };
    }
  }

  get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Factory function to create an ApiClient instance.
 */
export function createApiClient(baseUrl: string, authToken: string): ApiClient {
  return new ApiClient(baseUrl, authToken);
}
