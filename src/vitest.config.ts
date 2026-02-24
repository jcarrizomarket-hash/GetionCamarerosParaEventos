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
      // Deno-style npm: imports used by supabase/functions/server files
      'npm:hono': path.resolve(__dirname, './node_modules/hono'),
      'npm:@supabase/supabase-js@2.39.3': path.resolve(__dirname, './node_modules/@supabase/supabase-js'),
    },
  },
});
