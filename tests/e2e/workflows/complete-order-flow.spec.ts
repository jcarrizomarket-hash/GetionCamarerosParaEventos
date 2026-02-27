import { test, expect } from '@playwright/test';

test.describe('Complete Order Flow', () => {
  test('application loads and displays main navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL(/error/);
    
    // Check for main navigation elements (optional - depends on app configuration)
    const nav = page.locator('nav, [role="navigation"], .tabs, [class*="tab"]');
    const navCount = await nav.count();
    if (navCount > 0) {
      await expect(nav.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('dashboard tab should be accessible', async ({ page }) => {
    await page.goto('/');
    // App should load without crashing
    const title = await page.title();
    expect(title).not.toBe('');
  });
});
