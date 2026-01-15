/**
 * Platform detection utilities
 */

/**
 * Check if running in browser
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Check if running in React Native
 */
export const isReactNative =
    typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

/**
 * Check if running on iOS (either web or native)
 */
export const isIOS =
    isBrowser &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/**
 * Check if running on Android (either web or native)
 */
export const isAndroid =
    isBrowser && /Android/.test(navigator.userAgent);

/**
 * Check if running on mobile device
 */
export const isMobile = isIOS || isAndroid || isReactNative;

/**
 * Check if running in Electron
 */
export const isElectron =
    isBrowser &&
    typeof window !== 'undefined' &&
    // @ts-expect-error electron specific
    (window.process?.type === 'renderer' || window.electron !== undefined);

/**
 * Check if touch device
 */
export const isTouchDevice =
    isBrowser && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/**
 * Get current platform
 */
export type Platform = 'web' | 'mobile-web' | 'ios' | 'android' | 'electron';

export function getPlatform(): Platform {
    if (isElectron) return 'electron';
    if (isReactNative) {
        return isIOS ? 'ios' : 'android';
    }
    if (isMobile) return 'mobile-web';
    return 'web';
}

/**
 * Check if we should use web components
 */
export function useWebComponents(): boolean {
    const platform = getPlatform();
    return platform === 'web' || platform === 'mobile-web' || platform === 'electron';
}

/**
 * Check if we should use native components
 */
export function useNativeComponents(): boolean {
    const platform = getPlatform();
    return platform === 'ios' || platform === 'android';
}
