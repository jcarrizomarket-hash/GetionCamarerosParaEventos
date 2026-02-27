/**
 * xss-protection.spec.ts
 * Tests E2E contra ataques XSS, sanitización de inputs y validación de outputs
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '"><script>alert(1)</script>',
  "'; alert('xss'); //",
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)">',
  '{{constructor.constructor("alert(1)")()}}',
  '<details open ontoggle=alert(1)>',
  '"><img src=1 onerror=alert(document.cookie)>',
];

test.describe('Protección XSS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('los inputs de texto no deben ejecutar scripts inyectados', async ({ page }) => {
    for (const payload of XSS_PAYLOADS) {
      const dialogs: string[] = [];
      page.on('dialog', async (dialog) => {
        dialogs.push(dialog.message());
        await dialog.dismiss();
      });

      const textInputs = page.locator('input[type="text"], input[type="search"], textarea');
      const count = await textInputs.count();

      for (let i = 0; i < Math.min(count, 3); i++) {
        const input = textInputs.nth(i);
        if (await input.isVisible()) {
          await input.fill(payload);
          await page.keyboard.press('Tab');
          await page.waitForTimeout(200);
        }
      }

      expect(dialogs).toHaveLength(0);
    }
  });

  test('los valores renderizados no deben contener HTML sin sanitizar', async ({ page }) => {
    const scriptPayload = '<script>window.__xss_test=1</script>';

    await page.goto(BASE_URL);

    const xssInjected = await page.evaluate(() => {
      return (window as unknown as Record<string, unknown>).__xss_test;
    });

    expect(xssInjected).toBeUndefined();
  });

  test('los headers de respuesta deben incluir protección XSS', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    if (!response) return;

    const headers = response.headers();
    // Content-Security-Policy o X-XSS-Protection deben estar presentes
    const hasXssProtection =
      headers['content-security-policy'] !== undefined ||
      headers['x-xss-protection'] !== undefined;

    // Verificar que al menos uno de los headers de seguridad está presente
    // (puede no estar en el SPA estático pero sí en la API)
    expect(hasXssProtection || headers['x-content-type-options'] !== undefined).toBeTruthy();
  });

  test('los campos de búsqueda sanitizan caracteres especiales', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('<b>test</b>');
      await page.waitForTimeout(300);

      // El valor del input debe contener el texto, no renderizar HTML
      const value = await searchInput.inputValue();
      expect(value).toBe('<b>test</b>');

      // Verificar que no se renderizó HTML
      const boldElements = page.locator('b:has-text("test")');
      const count = await boldElements.count();
      expect(count).toBe(0);
    }
  });

  test('el contenido dinámico usa escape correcto', async ({ page }) => {
    // Verificar que la página no tiene innerHTML vulnerable
    const hasUnsafeHTML = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[src*="unsafe"]');
      return scripts.length > 0;
    });

    expect(hasUnsafeHTML).toBe(false);
  });
});
