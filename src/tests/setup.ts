/**
 * Setup para tests unitarios (Vitest)
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup después de cada test
afterEach(() => {
  cleanup();
});

// Mock de variables de entorno globales
global.import = {
  meta: {
    env: {
      VITE_SUPABASE_PROJECT_ID: 'test-project-id',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_SUPABASE_FN_SECRET: 'test-secret',
    },
  },
} as any;

// Mock de fetch global para tests
// Provides a default error response for tests that make HTTP calls without specific mocks
global.fetch = vi
  .fn()
  .mockImplementation(() =>
    Promise.resolve(
      new Response(
        JSON.stringify({ success: false, error: 'Server not available in test environment' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    )
  );

// Extender matchers si es necesario
// expect.extend({ ... });
