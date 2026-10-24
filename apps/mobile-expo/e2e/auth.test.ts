import { device, element, by, expect } from 'detox';

describe('Authentication Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    describe('Login', () => {
        it('should show error with invalid credentials', async () => {
            await element(by.id('email-input')).typeText('invalid@test.com');
            await element(by.id('password-input')).typeText('wrongpassword');
            await element(by.id('login-button')).tap();

            // Wait for error message
            await expect(element(by.text('Credenciales inválidas'))).toBeVisible();
        });

        it('should login successfully with valid credentials', async () => {
            await element(by.id('email-input')).clearText();
            await element(by.id('email-input')).typeText('test@ordotodo.app');
            await element(by.id('password-input')).clearText();
            await element(by.id('password-input')).typeText('Test123!');
            await element(by.id('login-button')).tap();

            // Should navigate to home/dashboard
            await expect(element(by.id('dashboard-screen'))).toBeVisible();
        });
    });

    describe('Registration', () => {
        beforeEach(async () => {
            await device.reloadReactNative();
        });

        it('should navigate to register screen', async () => {
            await element(by.id('register-link')).tap();
            await expect(element(by.text('Crear Cuenta'))).toBeVisible();
        });

        it('should show validation errors for empty fields', async () => {
            await element(by.id('register-link')).tap();
            await element(by.id('register-button')).tap();

            await expect(element(by.text('El nombre es requerido'))).toBeVisible();
        });
    });
});
