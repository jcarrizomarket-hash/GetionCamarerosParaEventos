/**
 * Configuración de Vitest para tests unitarios
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['tests/e2e/**', 'tests/integration/whatsapp.spec.ts', 'node_modules/**'],
    env: {
      VITE_SUPABASE_PROJECT_ID: 'test-project-id',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_SUPABASE_FN_SECRET: 'test-secret',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/types.ts',
        'supabase/functions/server/kv_store.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
      '@utils': path.resolve(__dirname, './utils'),
    },
  },
});
