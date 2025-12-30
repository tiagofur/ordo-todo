import { test, expect } from '@playwright/test';

test.describe('Habit Management', () => {
    const timestamp = Date.now();
    const username = `habituser_${timestamp}`;
    const email = `habit_${timestamp}@example.com`;
    const password = 'Password@123';

    test('can register and track a habit', async ({ page }) => {
        // --- 1. Registration ---
        await page.goto('/es/register');
        await expect(page.locator('form')).toBeVisible({ timeout: 15000 });

        await page.locator('#name').fill('Habit User');
        await page.getByPlaceholder('usuario123').fill(username);
        await page.waitForTimeout(1000);
        await page.locator('#email').fill(email);
        await page.locator('#password').fill(password);
        await page.locator('#confirmPassword').fill(password);
        await page.getByRole('button', { name: 'Crear Cuenta' }).click();
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 20000 });

        // --- 2. Navigation to Habits ---
        await page.getByRole('link', { name: 'Hábitos' }).click();
        await expect(page).toHaveURL(/.*\/habits/);

        // --- 3. Create Habit ---
        // Click New Habit Button
        await page.getByRole('button', { name: 'Nuevo Hábito' }).first().click();

        // Wait for Dialog
        await expect(page.getByRole('dialog')).toBeVisible();

        // Fill Habit Name
        const habitName = `Drink Water ${timestamp}`;
        await page.getByLabel('Nombre del hábito').fill(habitName);

        // Submit
        await page.getByRole('button', { name: 'Crear Hábito' }).click();

        // --- 4. Verify Habit Creation ---
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(page.getByText(habitName)).toBeVisible();

        // --- 5. Verify Stats Interaction (Optional smoke test) ---
        // Check initial streak is 0
        await expect(page.getByText('0', { exact: true }).first()).toBeVisible();
    });
});
