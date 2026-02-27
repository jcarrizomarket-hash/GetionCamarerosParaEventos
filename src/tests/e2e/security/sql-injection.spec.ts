/**
 * sql-injection.spec.ts
 * Tests contra SQL injection, parametrización de queries y edge cases
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.TEST_API_URL || `${BASE_URL}/api`;

const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1--",
  "'; DROP TABLE camareros;--",
  "1' AND SLEEP(5)--",
  "' UNION SELECT * FROM auth.users--",
  "1; SELECT * FROM information_schema.tables--",
  "' OR 'x'='x",
  "admin'--",
  "1' ORDER BY 1--",
  "' AND 1=CONVERT(int,@@version)--",
];

test.describe('Protección SQL Injection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('los inputs de búsqueda no deben ejecutar SQL injection', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first();

    if (!(await searchInput.isVisible())) {
      test.skip();
      return;
    }

    for (const payload of SQL_INJECTION_PAYLOADS) {
      await searchInput.fill(payload);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // No deben aparecer errores de SQL en la UI
      const errorText = await page.locator('text=/sql|syntax|ORA-|pg_|mysql/i').count();
      expect(errorText).toBe(0);

      // La aplicación no debe haberse crasheado
      const isVisible = await searchInput.isVisible();
      expect(isVisible).toBe(true);

      await searchInput.clear();
    }
  });

  test('las APIs no deben exponer errores de base de datos', async ({ request }) => {
    for (const payload of SQL_INJECTION_PAYLOADS.slice(0, 3)) {
      const response = await request.get(`${API_URL}/camareros?search=${encodeURIComponent(payload)}`);

      if (!response.ok()) {
        const body = await response.text();
        // No deben aparecer detalles de SQL en las respuestas de error
        expect(body).not.toMatch(/sql|syntax error|pg_|ORA-|mysql_/i);
        expect(body).not.toMatch(/SELECT|INSERT|UPDATE|DELETE|DROP/i);
      }
    }
  });

  test('los IDs de recursos deben validarse como UUID', async ({ request }) => {
    const sqlPayload = "' OR '1'='1";
    const response = await request.get(
      `${API_URL}/camareros/${encodeURIComponent(sqlPayload)}`
    );

    // Debe rechazar con 400 o 404, nunca 500 con detalles de SQL
    expect(response.status()).not.toBe(500);
    if (response.status() === 400 || response.status() === 422) {
      const body = await response.json().catch(() => ({}));
      expect(body).not.toHaveProperty('stack');
      expect(JSON.stringify(body)).not.toMatch(/sql|SELECT|DROP/i);
    }
  });

  test('los formularios de creación no permiten SQL injection', async ({ page }) => {
    // Navegar a un formulario de creación
    const createButton = page.locator('button:has-text("Nuevo"), button:has-text("Agregar")').first();

    if (!(await createButton.isVisible())) {
      test.skip();
      return;
    }

    await createButton.click();
    await page.waitForTimeout(300);

    const nameInput = page.locator('input[name="nombre"], input[placeholder*="nombre"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill("'; DROP TABLE camareros;--");

      const submitButton = page.locator('button[type="submit"], button:has-text("Guardar")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);

        // No debe mostrar errores de SQL
        const sqlError = await page.locator('text=/sql|syntax|error/i').count();
        expect(sqlError).toBe(0);
      }
    }
  });
});
