import { test, expect } from '@playwright/test';

test.describe('Rate Limiting', () => {
  test('application should handle rapid requests gracefully', async ({ page }) => {
    // Make multiple rapid navigation requests
    for (let i = 0; i < 5; i++) {
      await page.goto('/');
    }
    
    // App should still be accessible
    await expect(page).not.toHaveURL(/error/);
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should handle concurrent API requests without crashing', async ({ page, context }) => {
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
    ]);

    try {
      await Promise.all(pages.map(p => p.goto('/')));
      // All pages should load successfully
      for (const p of pages) {
        await expect(p).not.toHaveURL(/error/);
      }
    } finally {
      await Promise.all(pages.map(p => p.close()));
    }
  });
});
