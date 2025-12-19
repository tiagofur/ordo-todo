import { device, element, by, expect } from 'detox';

describe('Navigation', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
        // Login first
        await element(by.id('email-input')).typeText('test@ordotodo.app');
        await element(by.id('password-input')).typeText('Test123!');
        await element(by.id('login-button')).tap();
        await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should navigate to Tasks screen', async () => {
        await element(by.id('nav-tasks')).tap();
        await expect(element(by.id('tasks-screen'))).toBeVisible();
    });

    it('should navigate to Projects screen', async () => {
        await element(by.id('nav-projects')).tap();
        await expect(element(by.id('projects-screen'))).toBeVisible();
    });

    it('should navigate to Timer/Focus screen', async () => {
        await element(by.id('nav-timer')).tap();
        await expect(element(by.id('timer-screen'))).toBeVisible();
    });

    it('should navigate to Profile screen', async () => {
        await element(by.id('nav-profile')).tap();
        await expect(element(by.id('profile-screen'))).toBeVisible();
    });

    it('should navigate to Settings screen', async () => {
        await element(by.id('nav-settings')).tap();
        await expect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should logout successfully', async () => {
        await element(by.id('nav-profile')).tap();
        await element(by.id('logout-button')).tap();

        // Confirm logout
        await element(by.text('Cerrar Sesión')).tap();

        // Should be back to login screen
        await expect(element(by.id('login-button'))).toBeVisible();
    });
});
