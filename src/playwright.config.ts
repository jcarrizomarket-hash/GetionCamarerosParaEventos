/**
 * Configuración de Playwright para tests E2E
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  // Timeout por test: 15s en CI (la app es una SPA con backend mock)
  timeout: 15 * 1000,

  expect: {
    timeout: 5000,
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Sin retries en CI para evitar triplicar el tiempo de ejecucion
  retries: 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html'],
    ['list'],
  ],

  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    // Timeout de navegacion: 10s maximo por goto/click/waitFor
    navigationTimeout: 10000,
    actionTimeout: 5000,
  },

  // Solo Chromium en CI - Firefox y Safari en local si se necesita
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
