/**
 * csrf-protection.spec.ts
 * Tests de protección CSRF: token validation, same-site cookies, cross-origin requests
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.TEST_API_URL || `${BASE_URL}/api`;

test.describe('Protección CSRF', () => {
  test('las peticiones POST sin x-fn-secret deben ser rechazadas', async ({ request }) => {
    const response = await request.post(`${API_URL}/camareros`, {
      data: { nombre: 'Test', apellido: 'User', email: 'test@test.com' },
      headers: {
        'Content-Type': 'application/json',
        // Sin x-fn-secret
      },
    });

    // La API debe requerir el secret para operaciones mutantes
    // Si no hay autenticación configurada, puede devolver 401 o 403
    expect([401, 403, 405]).toContain(response.status());
  });

  test('las peticiones cross-origin no autorizadas deben ser rechazadas', async ({ request }) => {
    const response = await request.post(`${API_URL}/camareros`, {
      data: { nombre: 'Test', apellido: 'CSRF', email: 'csrf@malicious.com' },
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://malicious-site.evil.com',
      },
    });

    // Orígenes no autorizados deben ser rechazados
    expect([401, 403, 405]).toContain(response.status());
  });

  test('las cookies de sesión no deben ser accesibles via JavaScript', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Verificar que las cookies de sesión tienen HttpOnly
    const cookies = await page.context().cookies();
    const sessionCookies = cookies.filter(c =>
      c.name.toLowerCase().includes('session') ||
      c.name.toLowerCase().includes('token') ||
      c.name.toLowerCase().includes('supabase')
    );

    for (const cookie of sessionCookies) {
      expect(cookie.httpOnly).toBe(true);
    }
  });

  test('las cookies deben tener SameSite configurado', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(c =>
      c.name.toLowerCase().includes('session') ||
      c.name.toLowerCase().includes('token')
    );

    for (const cookie of authCookies) {
      // SameSite debe ser 'Strict' o 'Lax', no 'None' sin Secure
      if (cookie.sameSite === 'None') {
        expect(cookie.secure).toBe(true);
      }
    }
  });

  test('el header Origin es validado en peticiones mutantes', async ({ request }) => {
    // Simular una petición desde un origen externo sin credenciales válidas
    const maliciousOrigins = [
      'https://attacker.com',
      'http://evil.local',
      'null',
    ];

    for (const origin of maliciousOrigins) {
      const response = await request.post(`${API_URL}/pedidos`, {
        data: {},
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json',
        },
      });

      // No debe devolver 200 OK ante peticiones no autorizadas
      expect(response.status()).not.toBe(200);
    }
  });

  test('las peticiones OPTIONS de preflight responden correctamente', async ({ request }) => {
    const response = await request.fetch(`${API_URL}/camareros`, {
      method: 'OPTIONS',
      headers: {
        'Origin': BASE_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    });

    // OPTIONS debe responder con 204 o 200
    expect([200, 204]).toContain(response.status());
  });
});
