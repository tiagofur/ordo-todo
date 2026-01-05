import { test, expect } from '@playwright/test';

test.describe('Notes Feature', () => {
    const timestamp = Date.now();
    const username = `notesuser_${timestamp}`;
    const email = `notes_${timestamp}@example.com`;
    const password = 'Password@123';

    test('can create and manage notes in a workspace', async ({ page }) => {
        // --- 1. Registration ---
        await page.goto('/es/register');
        await expect(page.locator('form')).toBeVisible({ timeout: 15000 });

        await page.locator('#name').fill('Notes User');
        await page.getByPlaceholder('usuario123').fill(username);
        await page.waitForTimeout(1000);
        await page.locator('#email').fill(email);
        await page.locator('#password').fill(password);
        await page.locator('#confirmPassword').fill(password);
        await page.getByRole('button', { name: 'Crear Cuenta' }).click();
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });

        // --- 2. Create Workspace ---
        // Go to Workspaces page
        await page.getByRole('link', { name: 'Espacios de trabajo' }).click();
        await expect(page).toHaveURL(/.*\/workspaces/);

        // Open Create Dialog
        // Note: The button might be "Nuevo Espacio" or English "Create Workspace" if component is not localized?
        // WorkspaceSelector in Sidebar has "Create Workspace..." or something.
        // But we are on /workspaces page (WorkspaceDashboard?). No, /workspaces list.
        // apps/web/src/app/[locale]/(pages)/(internal)/workspaces/page.tsx?
        // Let's assume there is a button. "Nuevo Espacio" in Spanish usually.
        // In previous session Step 272 (WorkspaceDashboard), there is CreateProject.
        // But /workspaces page?
        // If I can't be sure, I'll use the Sidebar's WorkspaceSelector to create one.
        // Click the selector dropdown.
        // Selector is usually at top of sidebar.

        // Let's try to assume /workspaces has a create button.
        // Or use URL to create if possible? No.

        // Strategy: Use the Sidebar "Nuevo..." if available or find the button on page.
        // If /workspaces lists workspaces, it likely has a create button.
        // Let's assume "Nuevo Espacio" (from es.json). 
        // If fail, I'll debug.

        // Actually, Sidebar has a create workspace option in the selector.
        // But simpler: The user lands on a Personal workspace or empty state?
        // New user has 0 workspaces? Or maybe a default?
        // If 0, they might be prompted to create one.

        // Let's try to create one via dialog found on page if visible.
        // Or try the button "Create Workspace" (English default in Sidebar dialog if accessed there).

        // Wait, if I am on /workspaces, I see the list.
        // Let's try locating the button by icon or text "Crear".

        // Workaround: The previous test `projects.spec.ts` assumes `await page.getByRole('button', { name: 'Nuevo Proyecto' }).click()`.
        // So translations work there.

        await page.getByRole('button', { name: 'Nuevo Espacio' }).click();

        // Dialog opens. It uses DEFAULT_LABELS (English) because Sidebar didn't pass props?
        // Wait, is this the Sidebar dialog or Page dialog?
        // If Page dialog, it might be localized.
        // Let's assume English for safety as seen in code.
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.locator('div[role="dialog"] #name').fill('Notes WS');

        // Select type if needed (defaults to PERSONAL).

        // Click Create (English default)
        await page.getByRole('button', { name: 'Create Workspace' }).click();

        // Wait for creation and navigation or appearance.
        // Assuming it redirects to /workspaces/[slug]
        await expect(page).toHaveURL(/.*\/workspaces\/notes-ws/);

        // --- 3. Navigate to Notes ---
        // Sidebar link "Notas"
        await expect(page.getByRole('link', { name: 'Notas' })).toBeVisible();
        await page.getByRole('link', { name: 'Notas' }).click();
        await expect(page).toHaveURL(/.*\/notes/);

        // --- 4. Create Note ---
        // "Agregar" (from es.json)
        await page.getByRole('button', { name: 'Agregar' }).click();

        // Expect note
        await expect(page.getByPlaceholder('Write something...')).toBeVisible();

        // Edit
        await page.getByPlaceholder('Write something...').fill('Test Note Content');
        // Wait for debounce (500ms)
        await page.waitForTimeout(600);

        // Refresh page to verify persistence
        await page.reload();
        await expect(page.getByText('Test Note Content')).toBeVisible();

        // --- 5. Delete Note ---
        const note = page.locator('textarea:has-text("Test Note Content")').locator('..');
        // NoteItem structure: div > div(header) + textarea.
        // parent of textarea is the note div.

        await note.hover();
        // Click delete button (X)
        await note.locator('button').click();

        // Verify deletion
        await expect(page.getByText('Test Note Content')).toBeHidden();
    });
});
