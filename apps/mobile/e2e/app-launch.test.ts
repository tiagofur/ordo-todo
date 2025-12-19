import { device, element, by, expect } from 'detox';

describe('App Launch', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should show login screen when not authenticated', async () => {
        // The app should redirect to login if user is not authenticated
        // Check for login button or login form elements
        await expect(element(by.text('Iniciar Sesión'))).toBeVisible();
    });

    it('should have email input field', async () => {
        await expect(element(by.id('email-input'))).toBeVisible();
    });

    it('should have password input field', async () => {
        await expect(element(by.id('password-input'))).toBeVisible();
    });
});
