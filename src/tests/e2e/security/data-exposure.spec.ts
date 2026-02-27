/**
 * data-exposure.spec.ts
 * Tests de exposición de datos sensibles, endpoint scanning e information disclosure
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.TEST_API_URL || `${BASE_URL}/api`;

test.describe('Exposición de Datos Sensibles', () => {
  test('las respuestas no deben exponer contraseñas o hashes', async ({ request }) => {
    const response = await request.get(`${API_URL}/camareros`);

    if (!response.ok()) return;

    const body = await response.json().catch(() => null);
    if (!body) return;

    const bodyStr = JSON.stringify(body);
    const sensitivePatterns = [
      /password/i,
      /passwd/i,
      /secret/i,
      /\$2[aby]\$\d+\$/,  // bcrypt hash
      /sha256:/i,
      /private_key/i,
    ];

    for (const pattern of sensitivePatterns) {
      expect(bodyStr).not.toMatch(pattern);
    }
  });

  test('los tokens internos no deben aparecer en respuestas públicas', async ({ request }) => {
    const response = await request.get(`${API_URL}/camareros`);

    if (!response.ok()) return;

    const body = await response.json().catch(() => null);
    if (!body) return;

    const bodyStr = JSON.stringify(body);

    // No deben aparecer tokens de servicio o API keys
    expect(bodyStr).not.toMatch(/supabase_service_role/i);
    expect(bodyStr).not.toMatch(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/);
    expect(bodyStr).not.toMatch(/sk_live_/);
    expect(bodyStr).not.toMatch(/pk_live_/);
  });

  test('los stack traces no deben aparecer en respuestas de error', async ({ request }) => {
    // Provocar un error intencionalmente
    const response = await request.get(`${API_URL}/camareros/not-a-valid-uuid-12345`);

    if (response.status() >= 400) {
      const body = await response.json().catch(() => null);
      if (body) {
        const bodyStr = JSON.stringify(body);
        expect(bodyStr).not.toMatch(/at Object\./);
        expect(bodyStr).not.toMatch(/at Module\./);
        expect(bodyStr).not.toMatch(/node_modules/);
        expect(body).not.toHaveProperty('stack');
      }
    }
  });

  test('los endpoints de debugging no deben estar activos en producción', async ({ request }) => {
    const debugEndpoints = [
      '/api/debug',
      '/api/health/full',
      '/api/env',
      '/api/config',
      '/.env',
      '/api/admin/secret',
      '/api/__debug__',
    ];

    for (const endpoint of debugEndpoints) {
      const response = await request.get(`${BASE_URL}${endpoint}`);
      // Deben devolver 404, no exponer información
      expect([404, 405]).toContain(response.status());
    }
  });

  test('los headers de respuesta no deben exponer tecnologías internas', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    if (!response) return;

    const headers = response.headers();

    // No deben exponer versiones de frameworks o servidores
    const sensitiveHeaders = ['x-powered-by', 'server', 'x-aspnet-version'];
    for (const header of sensitiveHeaders) {
      if (headers[header]) {
        // Si el header existe, no debe revelar versión exacta
        expect(headers[header]).not.toMatch(/\d+\.\d+\.\d+/);
      }
    }
  });

  test('los mensajes de error no revelan estructura interna de la BD', async ({ request }) => {
    const invalidId = "00000000-0000-0000-0000-000000000000";
    const response = await request.get(`${API_URL}/camareros/${invalidId}`);

    if (response.status() >= 400) {
      const body = await response.json().catch(() => ({}));
      const bodyStr = JSON.stringify(body);

      // No debe exponer nombres de tablas o columnas de Supabase/PostgreSQL
      expect(bodyStr).not.toMatch(/relation .* does not exist/i);
      expect(bodyStr).not.toMatch(/column .* does not exist/i);
      expect(bodyStr).not.toMatch(/pg_/);
      expect(bodyStr).not.toMatch(/PostgreSQL/i);
    }
  });

  test('los datos del usuario no incluyen información privilegiada', async ({ request }) => {
    const token = process.env.TEST_USER_TOKEN || '';
    if (!token) return;

    const response = await request.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok() || response.status() === 404) return;

    const body = await response.json().catch(() => null);
    if (!body) return;

    // El perfil de usuario no debe incluir tokens internos
    const bodyStr = JSON.stringify(body);
    expect(bodyStr).not.toMatch(/service_role/i);
    expect(bodyStr).not.toMatch(/supabase_admin/i);
  });

  test('la aplicación no expone archivos de configuración', async ({ request }) => {
    const sensitiveFiles = [
      '/.env',
      '/.env.local',
      '/.env.production',
      '/package.json',
      '/tsconfig.json',
      '/.git/config',
    ];

    for (const file of sensitiveFiles) {
      const response = await request.get(`${BASE_URL}${file}`);
      // Deben devolver 404 o estar servidos como assets del SPA (no como JSON sensible)
      if (response.ok()) {
        const contentType = response.headers()['content-type'] || '';
        // Si responde con 200, debe ser HTML del SPA, no el archivo real
        expect(contentType).not.toContain('application/json');
        expect(contentType).not.toContain('text/plain');
      }
    }
  });
});
