import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
    const timestamp = Date.now();
    const username = `projectuser_${timestamp}`;
    const email = `project_${timestamp}@example.com`;
    const password = 'Password@123';

    test('can register and create a project', async ({ page }) => {
        // --- 1. Registration ---
        await page.goto('/es/register');
        await expect(page.locator('form')).toBeVisible({ timeout: 15000 });

        await page.locator('#name').fill('Project User');
        await page.getByPlaceholder('usuario123').fill(username);
        await page.waitForTimeout(1000);
        await page.locator('#email').fill(email);
        await page.locator('#password').fill(password);
        await page.locator('#confirmPassword').fill(password);
        await page.getByRole('button', { name: 'Crear Cuenta' }).click();
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 20000 });

        // --- 2. Navigation to Projects ---
        await page.getByRole('link', { name: 'Proyectos' }).click();
        await expect(page).toHaveURL(/.*\/projects/);

        // --- 3. Create Project ---
        // Click New Project Button
        await page.getByRole('button', { name: 'Nuevo Proyecto' }).first().click();

        // Wait for Dialog
        await expect(page.getByRole('dialog')).toBeVisible();

        // Fill Project Name
        const projectName = `My Project ${timestamp}`;
        // Using getByLabel('Nombre', { exact: false }) is still valid, or use ID if available in dialog
        // In CreateProjectDialog: <input id="name" ...>
        // So I can use locator('#name') inside the dialog. 
        // But the registration form also had #name.
        // Once registered, we are on a new page, so #name in dialog is unique.
        await page.locator('div[role="dialog"] #name').fill(projectName);

        // Submit
        await page.getByRole('button', { name: 'Crear Proyecto' }).click();

        // --- 4. Verify Project Creation ---
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(page.getByText(projectName)).toBeVisible();
    });
});
