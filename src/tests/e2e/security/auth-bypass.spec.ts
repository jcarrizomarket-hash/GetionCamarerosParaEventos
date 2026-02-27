/**
 * auth-bypass.spec.ts
 * Tests de autenticación: privilege escalation y token manipulation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.TEST_API_URL || `${BASE_URL}/api`;

test.describe('Bypass de Autenticación', () => {
  test('las rutas protegidas deben requerir autenticación', async ({ request }) => {
    const protectedEndpoints = [
      { method: 'GET', path: '/camareros' },
      { method: 'GET', path: '/pedidos' },
      { method: 'GET', path: '/coordinadores' },
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await request.fetch(`${API_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          // Sin Authorization header
        },
      });

      // Debe requerir autenticación (401) o estar detrás de un proxy (404)
      // No debe devolver 200 con datos reales sin autenticación
      if (response.status() !== 404 && response.status() !== 405) {
        expect([401, 403]).toContain(response.status());
      }
    }
  });

  test('tokens manipulados deben ser rechazados', async ({ request }) => {
    const invalidTokens = [
      'invalid_token',
      'Bearer invalid',
      'Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.',
      'Bearer ' + 'A'.repeat(500), // Token muy largo
      '',
      'null',
      'undefined',
    ];

    for (const token of invalidTokens) {
      const response = await request.get(`${API_URL}/camareros`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status() !== 404 && response.status() !== 405) {
        expect([401, 403]).toContain(response.status());
      }
    }
  });

  test('no se puede acceder a rutas de admin sin rol admin', async ({ request }) => {
    // Token simulado con rol de usuario normal (en test real usaría un token real)
    const userToken = process.env.TEST_USER_TOKEN || 'test_user_token';

    const response = await request.get(`${API_URL}/admin`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (response.status() !== 404) {
      expect([401, 403]).toContain(response.status());
    }
  });

  test('la elevación de privilegios en el body es ignorada', async ({ request }) => {
    const token = process.env.TEST_USER_TOKEN || 'test_user_token';

    // Intentar auto-asignar rol admin en la creación
    const response = await request.post(`${API_URL}/camareros`, {
      data: {
        nombre: 'Hacker',
        apellido: 'Test',
        email: 'hacker@test.com',
        role: 'admin',        // Intentar auto-asignar admin
        is_admin: true,
        permissions: ['all'],
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Si se crea, el rol admin no debe haberse asignado
    if (response.status() === 201 || response.status() === 200) {
      const body = await response.json();
      if (body.data) {
        expect(body.data.role).not.toBe('admin');
        expect(body.data.is_admin).not.toBe(true);
      }
    }
  });

  test('los tokens JWT no deben poder ser modificados (algorithm none)', async ({ request }) => {
    // JWT con algoritmo 'none' (vulnerabilidad clásica)
    const noneAlgToken =
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.' +
      btoa(JSON.stringify({ sub: 'admin', role: 'admin', exp: 9999999999 })).replace(/=/g, '') +
      '.';

    const response = await request.get(`${API_URL}/camareros`, {
      headers: {
        Authorization: `Bearer ${noneAlgToken}`,
      },
    });

    if (response.status() !== 404 && response.status() !== 405) {
      // Debe rechazar tokens con algoritmo 'none'
      expect([401, 403]).toContain(response.status());
    }
  });

  test('la sesión expira correctamente después del tiempo límite', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Verificar que no hay sesiones con expiración infinita
    const cookies = await page.context().cookies();
    const sessionCookies = cookies.filter(c =>
      c.name.toLowerCase().includes('session') ||
      c.name.toLowerCase().includes('token')
    );

    for (const cookie of sessionCookies) {
      if (cookie.expires !== -1) {
        // La cookie debe expirar (no ser permanente indefinidamente)
        const maxExpiry = Date.now() / 1000 + 30 * 24 * 60 * 60; // 30 días máx
        expect(cookie.expires).toBeLessThan(maxExpiry);
      }
    }
  });
});
