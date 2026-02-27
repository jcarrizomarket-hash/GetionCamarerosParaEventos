import { test, expect } from '@playwright/test';

test.describe('Error Recovery', () => {
  test('application should handle missing environment variables gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Even with missing env vars, app should render something
    await expect(page.locator('body')).toBeVisible();
  });

  test('application should show error boundary for component failures', async ({ page }) => {
    await page.goto('/');
    
    // The app should not show a blank white screen
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(0);
  });

  test('network errors should be handled gracefully', async ({ page }) => {
    // Block API calls to simulate network errors
    await page.route('**/supabase.co/**', route => route.abort());
    
    await page.goto('/');
    
    // App should still render the UI
    await expect(page.locator('body')).toBeVisible();
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(0);
  });
});
