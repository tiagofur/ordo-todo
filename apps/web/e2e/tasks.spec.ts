import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
    // Generate unique user for this test suite or use a global setup
    const timestamp = Date.now();
    const username = `testuser_${timestamp}`;
    const email = `test_${timestamp}@example.com`;
    const password = 'Password@123'; // Strong password

    test('can register and create a task', async ({ page }) => {
        // --- 1. Registration ---
        await page.goto('/es/register');

        // Wait for form
        await expect(page.locator('form')).toBeVisible({ timeout: 15000 });

        // Use IDs for stability
        await page.locator('#name').fill('Test User');
        // Username is a custom component, check for input inside it
        // The UsernameInput component likely has an input. Check placeholder or try to find by specific class or role
        // Assuming it has an input field.
        await page.getByPlaceholder('usuario123').fill(username);

        // Wait for potential debounce/validation
        await page.waitForTimeout(1000);

        await page.locator('#email').fill(email);

        await page.locator('#password').fill(password);
        await page.locator('#confirmPassword').fill(password);

        // Click Verify or Submit if needed
        await page.getByRole('button', { name: 'Crear Cuenta' }).click();

        // Wait for redirect to Dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 20000 });

        // --- 2. Navigation to Tasks ---
        // Click on "Tareas" in sidebar
        await page.getByRole('link', { name: 'Tareas' }).click();
        await expect(page).toHaveURL(/.*\/tasks/);

        // --- 3. Create Task ---
        // Click New Task Button
        const newTaskButton = page.getByRole('button', { name: 'Nueva Tarea' }).first();
        if (await newTaskButton.isVisible()) {
            await newTaskButton.click();
        } else {
            await page.keyboard.press('Control+n');
        }

        // Wait for Dialog
        await expect(page.getByRole('dialog')).toBeVisible();

        // Fill Task Title
        const taskTitle = `My E2E Task ${timestamp}`;
        await page.getByPlaceholder('Escribe el título de la tarea...').fill(taskTitle);

        // Submit
        await page.getByRole('button', { name: 'Crear Tarea' }).click();

        // --- 4. Verify Task Creation ---
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(page.getByText(taskTitle)).toBeVisible();
    });
});
