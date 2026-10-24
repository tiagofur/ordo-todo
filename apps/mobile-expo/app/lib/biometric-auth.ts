/**
 * Biometric Authentication Service for React Native
 * 
 * Provides fingerprint and FaceID authentication for mobile devices.
 * Uses expo-local-authentication for cross-platform biometric support.
 * 
 * @see {@link https://docs.expo.dev/versions/latest/sdk/local-authentication/ | Expo LocalAuthentication}
 */

// Note: expo-local-authentication needs to be installed:
// npx expo install expo-local-authentication

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for biometric authentication
export interface BiometricAuthResult {
    success: boolean;
    error?: string;
    biometricType?: 'fingerprint' | 'facial' | 'iris';
}

export interface BiometricCapabilities {
    available: boolean;
    biometricTypes: ('fingerprint' | 'facial' | 'iris')[];
    enrolled: boolean;
    securityLevel: 'none' | 'weak' | 'strong';
}

// Storage key for biometric preference
const BIOMETRIC_ENABLED_KEY = 'ordo_biometric_enabled';

/**
 * Check if biometric authentication is available on the device
 */
export async function checkBiometricCapabilities(): Promise<BiometricCapabilities> {
    try {
        // Dynamic import to handle case when expo-local-authentication is not installed
        const LocalAuthentication = await import('expo-local-authentication').catch(() => null);

        if (!LocalAuthentication) {
            return {
                available: false,
                biometricTypes: [],
                enrolled: false,
                securityLevel: 'none',
            };
        }

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

        const biometricTypes: ('fingerprint' | 'facial' | 'iris')[] = [];

        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            biometricTypes.push('fingerprint');
        }
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            biometricTypes.push('facial');
        }
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            biometricTypes.push('iris');
        }

        // Determine security level based on available types
        let securityLevel: 'none' | 'weak' | 'strong' = 'none';
        if (hasHardware && isEnrolled) {
            securityLevel = biometricTypes.includes('facial') || biometricTypes.includes('fingerprint')
                ? 'strong'
                : 'weak';
        }

        return {
            available: hasHardware,
            biometricTypes,
            enrolled: isEnrolled,
            securityLevel,
        };
    } catch (error) {
        console.warn('[BiometricAuth] Error checking capabilities:', error);
        return {
            available: false,
            biometricTypes: [],
            enrolled: false,
            securityLevel: 'none',
        };
    }
}

/**
 * Authenticate using biometrics
 */
export async function authenticateWithBiometrics(
    promptMessage: string = 'Confirma tu identidad para acceder a Ordo'
): Promise<BiometricAuthResult> {
    try {
        const LocalAuthentication = await import('expo-local-authentication').catch(() => null);

        if (!LocalAuthentication) {
            return {
                success: false,
                error: 'Autenticación biométrica no disponible',
            };
        }

        const capabilities = await checkBiometricCapabilities();

        if (!capabilities.available) {
            return {
                success: false,
                error: 'Tu dispositivo no soporta autenticación biométrica',
            };
        }

        if (!capabilities.enrolled) {
            return {
                success: false,
                error: 'No hay huellas o rostros registrados en tu dispositivo',
            };
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage,
            cancelLabel: 'Cancelar',
            fallbackLabel: 'Usar contraseña',
            disableDeviceFallback: false, // Allow PIN/password fallback
        });

        if (result.success) {
            return {
                success: true,
                biometricType: capabilities.biometricTypes[0],
            };
        }

        // Map error types
        let errorMessage = 'Autenticación fallida';
        if (result.error === 'user_cancel') {
            errorMessage = 'Autenticación cancelada por el usuario';
        } else if (result.error === 'too_many_attempts' || result.error === 'lockout') {
            errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
        } else if (result.error === 'user_fallback') {
            errorMessage = 'Usuario eligió usar contraseña';
        }

        return {
            success: false,
            error: errorMessage,
        };
    } catch (error) {
        console.error('[BiometricAuth] Authentication error:', error);
        return {
            success: false,
            error: 'Error durante la autenticación biométrica',
        };
    }
}

const BIOMETRIC_TOKEN_KEY = 'ordo_biometric_token';

/**
 * Check if user has enabled biometric login
 */
export async function isBiometricLoginEnabled(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        return value === 'true';
    } catch {
        return false;
    }
}

/**
 * Enable biometric login for the current user
 * Stores the token for future logins
 */
export async function enableBiometricLogin(token: string): Promise<boolean> {
    try {
        // First verify biometrics work
        const result = await authenticateWithBiometrics(
            'Confirma tu identidad para habilitar inicio de sesión biométrico'
        );

        if (!result.success) {
            return false;
        }

        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        await AsyncStorage.setItem(BIOMETRIC_TOKEN_KEY, token);
        return true;
    } catch (error) {
        console.error('[BiometricAuth] Error enabling biometric login:', error);
        return false;
    }
}

/**
 * Disable biometric login
 */
export async function disableBiometricLogin(): Promise<void> {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    await AsyncStorage.removeItem(BIOMETRIC_TOKEN_KEY);
}

/**
 * Login with biometrics
 * Authenticates user and returns stored token
 */
export async function loginWithBiometrics(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
        const enabled = await isBiometricLoginEnabled();
        if (!enabled) {
            return { success: false, error: 'Biometric login not enabled' };
        }

        const result = await authenticateWithBiometrics(
            'Inicia sesión con biometría'
        );

        if (!result.success) {
            return { success: false, error: result.error };
        }

        const token = await AsyncStorage.getItem(BIOMETRIC_TOKEN_KEY);
        if (!token) {
            return { success: false, error: 'Token no encontrado' };
        }

        return { success: true, token };
    } catch (error) {
        console.error('[BiometricAuth] Login error:', error);
        return { success: false, error: 'Error durante el inicio de sesión biométrico' };
    }
}

/**
 * Get a human-readable name for the biometric type
 */
export function getBiometricTypeName(type: 'fingerprint' | 'facial' | 'iris'): string {
    switch (type) {
        case 'fingerprint':
            return 'Huella digital';
        case 'facial':
            return 'Face ID';
        case 'iris':
            return 'Reconocimiento de iris';
        default:
            return 'Biométrico';
    }
}

/**
 * Get the icon name for the biometric type (for react-native-vector-icons)
 */
export function getBiometricIconName(type: 'fingerprint' | 'facial' | 'iris'): string {
    switch (type) {
        case 'fingerprint':
            return 'fingerprint';
        case 'facial':
            return 'face-recognition';
        case 'iris':
            return 'eye-check';
        default:
            return 'lock';
    }
}
