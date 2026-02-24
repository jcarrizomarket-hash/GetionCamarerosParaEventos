/**
 * Setup para tests unitarios (Vitest)
 */

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup después de cada test
afterEach(() => {
  cleanup();
});

// Mock de fetch global para tests
global.fetch = vi.fn();
