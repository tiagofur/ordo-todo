/**
 * useMediaQuery Hook
 * 
 * Provides responsive breakpoints for the application based on window dimensions.
 * Follows standard breakpoints:
 * - Tablet: >= 768px
 * - Desktop: >= 1024px
 * - Large Desktop: >= 1280px
 */

import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
    TABLET: 768,
    DESKTOP: 1024,
    LARGE_DESKTOP: 1280,
};

export function useMediaQuery() {
    const { width, height } = useWindowDimensions();

    const isTablet = width >= BREAKPOINTS.TABLET;
    const isDesktop = width >= BREAKPOINTS.DESKTOP;
    const isLargeDesktop = width >= BREAKPOINTS.LARGE_DESKTOP;

    // Specific checks
    const isPortrait = height > width;
    const isLandscape = width > height;

    return {
        width,
        height,
        isTablet,
        isDesktop,
        isLargeDesktop,
        isPortrait,
        isLandscape,
        // Helper to select value based on current breakpoint
        // usage: select({ mobile: 10, tablet: 20, desktop: 30 })
        select: <T>(values: { mobile: T; tablet?: T; desktop?: T }) => {
            if (isDesktop && values.desktop !== undefined) return values.desktop;
            if (isTablet && values.tablet !== undefined) return values.tablet;
            return values.mobile;
        },
    };
}
