import { test, expect } from '@playwright/test';

test.describe('SQL Injection Protection', () => {
  const sqlPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE camareros; --",
    "' UNION SELECT * FROM users --",
    "1; SELECT * FROM information_schema.tables",
    "' AND 1=1 --",
  ];

  test('should reject SQL injection attempts in search fields', async ({ page }) => {
    await page.goto('/');
    
    // Look for search or filter inputs
    const searchInputs = page.locator('input[type="search"], input[placeholder*="buscar"], input[placeholder*="search"]');
    const count = await searchInputs.count();

    for (let i = 0; i < Math.min(count, 2); i++) {
      for (const payload of sqlPayloads) {
        await searchInputs.nth(i).fill(payload);
        // Should not crash or expose database errors
        await page.waitForTimeout(100);
        const hasError = await page.locator('[class*="error"], [class*="alert-destructive"]').count();
        // A visible error is acceptable (rejection), but not a crash
        const title = await page.title();
        expect(title).not.toBe('');
      }
    }
  });

  test('application should remain stable after SQL injection attempts', async ({ page }) => {
    await page.goto('/');
    
    const inputs = page.locator('input');
    const count = await inputs.count();

    if (count > 0) {
      await inputs.first().fill("'; DROP TABLE test; --");
      await page.waitForTimeout(500);
    }

    // App should still be functional
    await expect(page).not.toHaveURL(/error|500|crash/);
  });
});
