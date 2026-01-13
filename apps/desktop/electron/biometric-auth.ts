/**
 * Biometric Authentication Service for Electron Desktop
 * 
 * Provides Windows Hello and macOS TouchID authentication for desktop apps.
 * Uses Electron's systemPreferences API for biometric authentication.
 * 
 * @see {@link https://www.electronjs.org/docs/latest/api/system-preferences | Electron systemPreferences}
 */

import { systemPreferences, safeStorage } from 'electron';
import Store from 'electron-store';

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
    biometricType?: 'touchid' | 'windows-hello' | 'unknown';
}

export interface BiometricCapabilities {
    available: boolean;
    biometricType: 'touchid' | 'windows-hello' | 'none';
    canPrompt: boolean;
}

// Storage for biometric preferences
const store = new Store<{
    biometricEnabled: boolean;
}>();

/**
 * Check if biometric authentication is available on the platform
 */
export function checkBiometricCapabilities(): BiometricCapabilities {
    const platform = process.platform;

    if (platform === 'darwin') {
        // macOS TouchID
        try {
            const canPrompt = systemPreferences.canPromptTouchID();
            return {
                available: canPrompt,
                biometricType: canPrompt ? 'touchid' : 'none',
                canPrompt,
            };
        } catch (error) {
            console.warn('[BiometricAuth] Error checking TouchID:', error);
            return {
                available: false,
                biometricType: 'none',
                canPrompt: false,
            };
        }
    }

    if (platform === 'win32') {
        // Windows Hello - check if credential guard is available
        // Windows Hello support requires electron-windows-native-notifications or similar
        try {
            // Windows doesn't have a direct API in Electron for checking Windows Hello
            // We assume it's available on Windows 10+ and check at prompt time
            const isWindows10OrLater = parseInt(require('os').release().split('.')[0], 10) >= 10;
            return {
                available: isWindows10OrLater,
                biometricType: isWindows10OrLater ? 'windows-hello' : 'none',
                canPrompt: isWindows10OrLater,
            };
        } catch (error) {
            console.warn('[BiometricAuth] Error checking Windows Hello:', error);
            return {
                available: false,
                biometricType: 'none',
                canPrompt: false,
            };
        }
    }

    // Linux and other platforms - no native biometric support
    return {
        available: false,
        biometricType: 'none',
        canPrompt: false,
    };
}

/**
 * Authenticate using biometrics
 */
export async function authenticateWithBiometrics(
    promptMessage: string = 'Confirma tu identidad para acceder a Ordo'
): Promise<BiometricAuthResult> {
    const capabilities = checkBiometricCapabilities();

    if (!capabilities.available) {
        return {
            success: false,
            error: 'Autenticación biométrica no disponible en este dispositivo',
        };
    }

    const platform = process.platform;

    if (platform === 'darwin') {
        // macOS TouchID
        try {
            await systemPreferences.promptTouchID(promptMessage);
            return {
                success: true,
                biometricType: 'touchid',
            };
        } catch (error: any) {
            const errorMessage = error.message || 'Error de autenticación TouchID';

            if (errorMessage.includes('cancel')) {
                return {
                    success: false,
                    error: 'Autenticación cancelada por el usuario',
                };
            }

            if (errorMessage.includes('lockout')) {
                return {
                    success: false,
                    error: 'Demasiados intentos fallidos. Usa tu contraseña del sistema.',
                };
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    if (platform === 'win32') {
        // Windows Hello
        // Note: Full Windows Hello support requires native modules
        // For now, we'll return a placeholder that can be implemented with:
        // - @aspect-apps/electron-windows-hello
        // - electron-native-notifications with credential prompts

        try {
            // Placeholder: In a full implementation, use a native module
            // const windowsHello = require('@aspect-apps/electron-windows-hello');
            // const result = await windowsHello.authenticateAsync(promptMessage);

            return {
                success: false,
                error: 'Windows Hello requiere configuración adicional',
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Error de autenticación Windows Hello',
            };
        }
    }

    return {
        success: false,
        error: 'Plataforma no soportada para autenticación biométrica',
    };
}

/**
 * Check if user has enabled biometric login
 */
export function isBiometricLoginEnabled(): boolean {
    return store.get('biometricEnabled', false);
}

/**
 * Enable biometric login for the current user
 */
export async function enableBiometricLogin(): Promise<boolean> {
    // First verify biometrics work
    const result = await authenticateWithBiometrics(
        'Confirma tu identidad para habilitar inicio de sesión biométrico'
    );

    if (!result.success) {
        return false;
    }

    store.set('biometricEnabled', true);
    return true;
}

/**
 * Disable biometric login
 */
export function disableBiometricLogin(): void {
    store.set('biometricEnabled', false);
}

/**
 * Securely store data using system encryption
 * On macOS, this uses Keychain. On Windows, it uses DPAPI.
 */
export function secureStore(key: string, value: string): boolean {
    try {
        if (!safeStorage.isEncryptionAvailable()) {
            console.warn('[BiometricAuth] Safe storage encryption not available');
            return false;
        }

        const encrypted = safeStorage.encryptString(value);
        store.set(`secure_${key}`, encrypted.toString('base64'));
        return true;
    } catch (error) {
        console.error('[BiometricAuth] Error storing secure data:', error);
        return false;
    }
}

/**
 * Retrieve securely stored data
 */
export function secureRetrieve(key: string): string | null {
    try {
        if (!safeStorage.isEncryptionAvailable()) {
            return null;
        }

        const encrypted = store.get(`secure_${key}`) as string | undefined;
        if (!encrypted) {
            return null;
        }

        const buffer = Buffer.from(encrypted, 'base64');
        return safeStorage.decryptString(buffer);
    } catch (error) {
        console.error('[BiometricAuth] Error retrieving secure data:', error);
        return null;
    }
}

/**
 * Get a human-readable name for the biometric type
 */
export function getBiometricTypeName(type: BiometricCapabilities['biometricType']): string {
    switch (type) {
        case 'touchid':
            return 'Touch ID';
        case 'windows-hello':
            return 'Windows Hello';
        default:
            return 'Biométrico';
    }
}
