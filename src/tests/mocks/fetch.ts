/**
 * Mock reutilizable para fetch global
 * Centraliza la configuración de respuestas simuladas para tests
 */

import { vi } from 'vitest';

/** Crea una respuesta mock de fetch con status y datos dados */
export function createMockResponse(data: unknown, status: number = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers(),
  } as unknown as Response;
}

/** Configura fetch para devolver una respuesta exitosa */
export function mockFetchSuccess(data: unknown, status: number = 200): void {
  vi.mocked(global.fetch).mockResolvedValueOnce(createMockResponse(data, status));
}

/** Configura fetch para devolver un error de red */
export function mockFetchNetworkError(message: string = 'Network error'): void {
  vi.mocked(global.fetch).mockRejectedValueOnce(new Error(message));
}

/** Configura fetch para devolver una respuesta de error HTTP */
export function mockFetchHttpError(
  errorMessage: string,
  status: number = 400
): void {
  vi.mocked(global.fetch).mockResolvedValueOnce(
    createMockResponse({ error: errorMessage }, status)
  );
}

/** Resetea el mock de fetch */
export function resetFetchMock(): void {
  vi.mocked(global.fetch).mockReset();
}
