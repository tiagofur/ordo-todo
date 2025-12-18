import { vi } from 'vitest';
import React from 'react';

// Mock react-native using react-native-web is handled by alias in config
// But we still need to mock some things

// Mock react-native-reanimated
vi.mock('react-native-reanimated', () => {
    const React = require('react');
    const View = ({ children, style }: any) => React.createElement('div', { style }, children);
    return {
        useSharedValue: vi.fn((val: any) => ({ value: val })),
        useAnimatedStyle: vi.fn((cb: any) => ({})),
        useAnimatedProps: vi.fn((cb: any) => ({})),
        withSpring: vi.fn((val: any) => val),
        withTiming: vi.fn((val: any) => val),
        withSequence: vi.fn((...args: any[]) => args[0]),
        withDelay: vi.fn((delay: any, anim: any) => anim),
        withRepeat: vi.fn((anim: any) => anim),
        cancelAnimation: vi.fn(),
        measure: vi.fn(),
        runOnJS: vi.fn((fn: any) => fn),
        runOnUI: vi.fn((fn: any) => fn),
        Easing: {
            bezier: vi.fn(() => ({})),
            out: vi.fn(() => ({})),
            in: vi.fn(() => ({})),
            inOut: vi.fn(() => ({})),
            ease: vi.fn(() => ({})),
            linear: vi.fn(() => ({})),
        },
        View: View,
        default: {
            View: View,
        },
    };
});

// Mock expo-router
vi.mock('expo-router', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useLocalSearchParams: vi.fn(() => ({})),
    useGlobalSearchParams: vi.fn(() => ({})),
}));

// Mock expo-linear-gradient
vi.mock('expo-linear-gradient', () => {
    const React = require('react');
    return {
        LinearGradient: ({ children, style }: any) => React.createElement('div', { style }, children),
    };
});

// Mock expo/vector-icons
vi.mock('@expo/vector-icons', () => {
    const React = require('react');
    return {
        Feather: ({ name, size, color, style }: any) => React.createElement('div', { style, name, size, color }, 'Icon'),
    };
});
