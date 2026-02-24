/**
 * Mocks reutilizables para tests
 */

import { vi } from 'vitest';

/**
 * Crea un mock de fetch que responde con los datos especificados
 */
export function createMockFetch(responses: Array<{ data: any; status?: number; ok?: boolean }>) {
  let callIndex = 0;
  return vi.fn().mockImplementation(() => {
    const response = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    const status = response.status ?? 200;
    const ok = response.ok ?? (status >= 200 && status < 300);
    return Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response.data),
    });
  });
}

/**
 * Crea un mock de fetch que lanza un error de red
 */
export function createMockFetchError(message: string = 'Network error') {
  return vi.fn().mockRejectedValue(new Error(message));
}

/**
 * Crea un mock de KV Store
 */
export function createMockKVStore() {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => { store.set(key, value); }),
    delete: vi.fn(async (key: string) => { store.delete(key); }),
    list: vi.fn(async (options?: { prefix?: string }) => {
      const keys = Array.from(store.keys())
        .filter(k => !options?.prefix || k.startsWith(options.prefix))
        .map(name => ({ name }));
      return { keys };
    }),
    _store: store,
  };
}

/**
 * Crea un mock del cliente Supabase
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Mock: no user' } }),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
}

/**
 * Crea un mock de contexto Hono-like para tests de middleware
 */
export function createMockContext(overrides: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  contextVars?: Record<string, any>;
} = {}) {
  const headers: Record<string, string> = overrides.headers ?? {};
  const contextVars: Record<string, any> = overrides.contextVars ?? {};

  const ctx = {
    req: {
      method: overrides.method ?? 'GET',
      url: overrides.url ?? 'http://test.com/api/test',
      header: vi.fn((name: string) => headers[name] ?? headers[name.toLowerCase()] ?? undefined),
    },
    get: vi.fn((key: string) => contextVars[key]),
    set: vi.fn((key: string, value: any) => { contextVars[key] = value; }),
    json: vi.fn((data: any, status: number = 200) => ({ data, status })),
    text: vi.fn((text: string, status: number = 200) => ({ text, status })),
    header: vi.fn(),
    _vars: contextVars,
  };

  return ctx;
}
