import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        pathname: '/',
        query: {},
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js image
vi.mock('next/image', () => ({
    default: (props: any) => {
        return React.createElement('img', props);
    },
}));

// Mock lucide-react icons - import the actual module and spread it back
// This ensures all exports are available
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('lucide-react')>();
    return {
        ...actual,
    };
});

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'en',
}));




// Mock navigator.clipboard
Object.defineProperty(global, 'navigator', {
    value: {
        clipboard: {
            writeText: vi.fn(() => Promise.resolve()),
        },
    },
    writable: true,
});

// Mock window.Image for avatar components
class MockImage {
    src = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor() {
        setTimeout(() => {
            if (this.onload) this.onload();
        }, 0);
    }
}

global.Image = MockImage as any;
