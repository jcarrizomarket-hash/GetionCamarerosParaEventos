import { test, expect } from '@playwright/test';

test.describe('Data Exposure Prevention', () => {
  test('should not expose error stack traces to users', async ({ page }) => {
    const errorMessages: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorMessages.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Stack traces should not appear in rendered content
    const content = await page.content();
    expect(content).not.toMatch(/at\s+\w+\s+\(/); // Stack trace pattern
  });

  test('should not expose environment variables in client bundle', async ({ page }) => {
    await page.goto('/');
    const content = await page.content();
    
    // Common sensitive patterns should not appear
    expect(content).not.toMatch(/process\.env\.[A-Z_]+/);
    expect(content).not.toMatch(/SUPABASE_SERVICE_ROLE/i);
  });

  test('page should load successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });
});
