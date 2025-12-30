import { test, expect } from '@playwright/test';

test('redirects to login when unauthenticated', async ({ page }) => {
    // Go to root
    await page.goto('/');

    // Wait for URL to change to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });

    // Verify heading
    await expect(page.getByText('Bienvenido de nuevo')).toBeVisible({ timeout: 10000 });
});

test('login page has inputs', async ({ page }) => {
    await page.goto('/es/login');

    // Wait for the form to be visible
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

    // Check inputs using IDs
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
});
