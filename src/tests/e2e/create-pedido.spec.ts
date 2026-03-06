/**
 * Tests E2E - Gestión de Camareros para Eventos
 * 
 * Estos tests verifican el comportamiento UI de la SPA.
 * Corren contra la build de producción con VITE_DEMO_MODE=true.
 * NO requieren backend real ni credenciales de Supabase.
 */

import { test, expect } from '@playwright/test';

// Helper: navegar y esperar solo que el DOM cargue (no networkidle — la SPA hace
// llamadas a Supabase que nunca resuelven en CI sin credenciales reales)
async function gotoApp(page: any, path = '/') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  // Esperar que el root de React monte
  await page.waitForSelector('#root', { timeout: 8000 });
}

test.describe('Carga inicial de la aplicación', () => {
  test('debe renderizar la aplicación sin errores JS', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await gotoApp(page);

    // Sin errores JS críticos
    expect(jsErrors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('debe tener título de página', async ({ page }) => {
    await gotoApp(page);
    const titulo = await page.title();
    expect(titulo).toBeTruthy();
    expect(titulo.length).toBeGreaterThan(0);
  });

  test('debe mostrar el encabezado de la aplicación', async ({ page }) => {
    await gotoApp(page);
    // El encabezado con el nombre de la app
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Navegación principal', () => {
  test('debe mostrar la barra de navegación', async ({ page }) => {
    await gotoApp(page);
    // Tabs de navegación siempre visibles
    const nav = page.locator('nav, [role="navigation"], .tab, button').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  test('debe tener elementos de navegacion accesibles', async ({ page }) => {
    await gotoApp(page);
    const headings = page.locator('h1, h2, h3');
    expect(await headings.count()).toBeGreaterThan(0);
  });
});

test.describe('Responsividad', () => {
  test('debe renderizar correctamente en viewport móvil (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoApp(page);
    const body = page.locator('body');
    await expect(body).toBeVisible();
    // Sin overflow horizontal
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test('debe renderizar correctamente en viewport tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoApp(page);
    await expect(page.locator('body')).toBeVisible();
  });

  test('debe renderizar correctamente en viewport desktop (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoApp(page);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Accesibilidad básica', () => {
  test('debe tener estructura semántica con headings', async ({ page }) => {
    await gotoApp(page);
    const headings = page.locator('h1, h2, h3');
    expect(await headings.count()).toBeGreaterThan(0);
  });

  test('los botones deben ser focusables con teclado', async ({ page }) => {
    await gotoApp(page);
    const firstButton = page.locator('button').first();
    if (await firstButton.isVisible()) {
      await firstButton.focus();
      await expect(firstButton).toBeFocused();
    }
  });
});

test.describe('Performance de carga', () => {
  test('debe cargar el HTML inicial en menos de 3 segundos', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });
});
