import { device, element, by, expect } from 'detox';

describe('Task Management', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
        // Login first
        await element(by.id('email-input')).typeText('test@ordotodo.app');
        await element(by.id('password-input')).typeText('Test123!');
        await element(by.id('login-button')).tap();
        // Wait for dashboard
        await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    describe('Task List', () => {
        it('should display task list', async () => {
            await element(by.id('nav-tasks')).tap();
            await expect(element(by.id('task-list'))).toBeVisible();
        });

        it('should open create task modal', async () => {
            await element(by.id('create-task-fab')).tap();
            await expect(element(by.id('create-task-modal'))).toBeVisible();
        });

        it('should create a new task', async () => {
            const taskTitle = `Test Task ${Date.now()}`;

            await element(by.id('task-title-input')).typeText(taskTitle);
            await element(by.id('save-task-button')).tap();

            // Task should appear in the list
            await expect(element(by.text(taskTitle))).toBeVisible();
        });
    });

    describe('Task Actions', () => {
        it('should complete a task', async () => {
            // Find the first task checkbox and tap it
            await element(by.id('task-checkbox')).atIndex(0).tap();

            // Task should show as completed
            await expect(element(by.id('task-completed')).atIndex(0)).toBeVisible();
        });

        it('should delete a task', async () => {
            // Long press to show options
            await element(by.id('task-item')).atIndex(0).longPress();
            await element(by.id('delete-task-option')).tap();

            // Confirm deletion
            await element(by.text('Eliminar')).tap();
        });
    });
});
