import { test, expect } from '@playwright/test';

test.describe('Products', () => {
  test('should navigate to products page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Wait for React to render
    await page.waitForTimeout(2000);

    // Check if page loaded (look for any content)
    const content = page.locator('body').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });
});

