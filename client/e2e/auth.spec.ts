import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check if login form or login button exists
    const loginElement = page.locator('input[type="email"], input[name*="email"], button:has-text("Login"), button:has-text("Sign in")').first();
    await expect(loginElement).toBeVisible({ timeout: 10000 });
  });

  test('login page should have form elements', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for React to render
    await page.waitForTimeout(2000);
    
    // Check for form inputs or login-related elements
    const form = page.locator('form, input, button').first();
    await expect(form).toBeVisible({ timeout: 10000 });
  });
});

