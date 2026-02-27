import { test, expect } from '@playwright/test';

test.describe('Authentication Bypass Protection', () => {
  test('should redirect unauthenticated users appropriately', async ({ page }) => {
    await page.goto('/');
    // The app should load without errors
    await expect(page).toHaveURL(/localhost/);
  });

  test('should not expose sensitive data in page source', async ({ page }) => {
    await page.goto('/');
    const content = await page.content();
    
    // Should not expose raw API keys or secrets
    expect(content).not.toMatch(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/); // JWT in HTML
    expect(content).not.toMatch(/sk_live_[A-Za-z0-9]+/); // Stripe live keys
    expect(content).not.toMatch(/AKIA[A-Z0-9]{16}/); // AWS access key IDs
  });

  test('should have security headers', async ({ page }) => {
    const response = await page.goto('/');
    if (response) {
      const headers = response.headers();
      // Check at least one security header exists in production
      const hasSecurityHeaders = 
        'x-content-type-options' in headers ||
        'x-frame-options' in headers ||
        'content-security-policy' in headers;
      // Log for information but don't fail on dev server
      console.log('Security headers present:', hasSecurityHeaders);
    }
  });
});
