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
    },
  },
} as any;

// Mock de fetch global para tests
global.fetch = vi.fn();

// Extender matchers si es necesario
// expect.extend({ ... });
