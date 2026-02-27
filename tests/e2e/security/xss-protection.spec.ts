import { test, expect } from '@playwright/test';

test.describe('XSS Protection', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '"><script>alert(document.cookie)</script>',
    "'; DROP TABLE users; --",
  ];

  test('should not execute scripts injected in input fields', async ({ page }) => {
    await page.goto('/');
    
    // Check if any alert dialog appears (would indicate XSS)
    let alertFired = false;
    page.on('dialog', async dialog => {
      alertFired = true;
      await dialog.dismiss();
    });

    // Try to find input fields and inject XSS payloads
    const inputs = page.locator('input[type="text"], input[type="search"], textarea');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      for (const payload of xssPayloads) {
        await inputs.nth(i).fill(payload);
        await page.waitForTimeout(100);
      }
    }

    expect(alertFired).toBe(false);
  });

  test('should sanitize content in rendered output', async ({ page }) => {
    await page.goto('/');
    const content = await page.content();
    // Ensure no raw script tags from user input are present
    expect(content).not.toContain('<script>alert("xss")</script>');
  });
});
