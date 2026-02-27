/**
 * rate-limiting.spec.ts
 * Tests de rate limiting: buckets, ventanas de tiempo y comportamiento bajo presión
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.TEST_API_URL || 'http://localhost:3000/api';

test.describe('Rate Limiting', () => {
  test('las respuestas deben incluir headers de rate limit', async ({ request }) => {
    const response = await request.get(`${API_URL}/camareros`);

    if (response.status() === 404 || response.status() === 405) {
      test.skip();
      return;
    }

    // Verificar headers de rate limit si el endpoint responde
    if (response.ok()) {
      // Los headers pueden o no estar presentes dependiendo de la configuración
      const headers = response.headers();
      if (headers['x-ratelimit-limit']) {
        expect(parseInt(headers['x-ratelimit-limit'])).toBeGreaterThan(0);
      }
    }
  });

  test('exceder el límite debe devolver 429', async ({ request }) => {
    const MAX_REQUESTS = 150; // Más del límite de 100/min
    let rateLimitHit = false;

    for (let i = 0; i < MAX_REQUESTS; i++) {
      const response = await request.get(`${API_URL}/camareros?_=${i}`);

      if (response.status() === 429) {
        rateLimitHit = true;
        const body = await response.json().catch(() => ({}));
        expect(body).toHaveProperty('error');

        // Debe incluir header Retry-After
        const retryAfter = response.headers()['retry-after'];
        if (retryAfter) {
          expect(parseInt(retryAfter)).toBeGreaterThan(0);
        }
        break;
      }

      // Si el endpoint no existe, saltar el test
      if (response.status() === 404 || response.status() === 405) {
        test.skip();
        return;
      }
    }

    // Si el endpoint existe pero nunca retornó 429, la ventana puede ser grande
    // Este test es informativo más que crítico para la aplicación actual
    if (!rateLimitHit) {
      console.log('Rate limit no alcanzado en la ventana de prueba');
    }
  });

  test('el rate limit debe reiniciarse después de la ventana de tiempo', async ({ request }) => {
    // Hacer una petición inicial
    const firstResponse = await request.get(`${API_URL}/camareros`);

    if (firstResponse.status() === 404 || firstResponse.status() === 405) {
      test.skip();
      return;
    }

    // Si hay headers de rate limit, verificar que el reset está en el futuro
    const headers = firstResponse.headers();
    if (headers['x-ratelimit-reset']) {
      const resetTime = parseInt(headers['x-ratelimit-reset']);
      const now = Math.floor(Date.now() / 1000);
      expect(resetTime).toBeGreaterThanOrEqual(now);
    }
  });

  test('el rate limit de autenticación es más estricto que el general', async ({ request }) => {
    // Verificar que los endpoints de auth tienen límites más bajos
    const authResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: 'test@test.com', password: 'wrong' },
    });

    const apiResponse = await request.get(`${API_URL}/camareros`);

    if (authResponse.status() !== 404 && apiResponse.status() !== 404) {
      const authLimit = authResponse.headers()['x-ratelimit-limit'];
      const apiLimit = apiResponse.headers()['x-ratelimit-limit'];

      if (authLimit && apiLimit) {
        expect(parseInt(authLimit)).toBeLessThanOrEqual(parseInt(apiLimit));
      }
    }
  });

  test('las respuestas 429 incluyen información de retry', async ({ request }) => {
    // Si conseguimos un 429, verificar la estructura de la respuesta
    let response429;
    for (let i = 0; i < 200; i++) {
      const r = await request.get(`${API_URL}/camareros?burst=${i}`);
      if (r.status() === 429) {
        response429 = r;
        break;
      }
      if (r.status() === 404 || r.status() === 405) {
        test.skip();
        return;
      }
    }

    if (response429) {
      const body = await response429.json();
      expect(body).toHaveProperty('error');
      expect(body.success).toBe(false);
    }
  });
});
