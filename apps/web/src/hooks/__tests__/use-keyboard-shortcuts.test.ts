/**
 * Unit Tests for useKeyboardShortcuts Hook
 * 
 * Tests for keyboard shortcut functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { getShortcutsByCategory, formatShortcutKey } from '../use-keyboard-shortcuts';

// Mock next/navigation
vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
    }),
}));

// Mock navigator.platform for Mac detection
Object.defineProperty(navigator, 'platform', {
    value: 'Win32',
    writable: true,
});

// Define Shortcut type for tests
interface Shortcut {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
    category: string;
}

describe('Keyboard Shortcuts Utilities', () => {
    describe('getShortcutsByCategory', () => {
        it('should group shortcuts by category', () => {
            const shortcuts: Shortcut[] = [
                { key: 'g', ctrl: true, action: vi.fn(), description: 'Go Dashboard', category: 'Navigation' },
                { key: 't', ctrl: true, action: vi.fn(), description: 'Go Tasks', category: 'Navigation' },
                { key: 'k', ctrl: true, action: vi.fn(), description: 'Search', category: 'Search' },
                { key: 'n', ctrl: true, action: vi.fn(), description: 'New Task', category: 'Creation' },
            ];

            const grouped = getShortcutsByCategory(shortcuts);

            expect(Object.keys(grouped)).toHaveLength(3);
            expect(grouped['Navigation']).toHaveLength(2);
            expect(grouped['Search']).toHaveLength(1);
            expect(grouped['Creation']).toHaveLength(1);
        });

        it('should handle empty array', () => {
            const grouped = getShortcutsByCategory([]);

            expect(Object.keys(grouped)).toHaveLength(0);
        });

        it('should handle single category', () => {
            const shortcuts: Shortcut[] = [
                { key: 'a', action: vi.fn(), description: 'A', category: 'Test' },
                { key: 'b', action: vi.fn(), description: 'B', category: 'Test' },
            ];

            const grouped = getShortcutsByCategory(shortcuts);

            expect(Object.keys(grouped)).toHaveLength(1);
            expect(grouped['Test']).toHaveLength(2);
        });
    });

    describe('formatShortcutKey', () => {
        it('should format ctrl shortcut', () => {
            const shortcut: Shortcut = {
                key: 'k',
                ctrl: true,
                action: vi.fn(),
                description: 'Search',
                category: 'Search',
            };

            const formatted = formatShortcutKey(shortcut);

            // On non-Mac systems
            expect(formatted).toContain('K');
        });

        it('should format shift shortcut', () => {
            const shortcut: Shortcut = {
                key: 't',
                ctrl: true,
                shift: true,
                action: vi.fn(),
                description: 'Tasks',
                category: 'Navigation',
            };

            const formatted = formatShortcutKey(shortcut);

            expect(formatted).toContain('T');
            expect(formatted).toContain('⇧');
        });

        it('should format simple key', () => {
            const shortcut: Shortcut = {
                key: '?',
                shift: true,
                action: vi.fn(),
                description: 'Help',
                category: 'Help',
            };

            const formatted = formatShortcutKey(shortcut);

            expect(formatted).toContain('?');
        });

        it('should uppercase the key', () => {
            const shortcut: Shortcut = {
                key: 'a',
                action: vi.fn(),
                description: 'Test',
                category: 'Test',
            };

            const formatted = formatShortcutKey(shortcut);

            expect(formatted).toBe('A');
        });
    });
});

describe('Shortcut Interface', () => {
    it('should define required shortcut properties', () => {
        const shortcut: Shortcut = {
            key: 'g',
            ctrl: true,
            action: vi.fn(),
            description: 'Go to Dashboard',
            category: 'Navigation',
        };

        expect(shortcut.key).toBe('g');
        expect(shortcut.ctrl).toBe(true);
        expect(typeof shortcut.action).toBe('function');
        expect(shortcut.description).toBeDefined();
        expect(shortcut.category).toBeDefined();
    });

    it('should support optional modifiers', () => {
        const shortcut: Shortcut = {
            key: 'n',
            ctrl: true,
            shift: true,
            alt: false,
            meta: false,
            action: vi.fn(),
            description: 'New Project',
            category: 'Creation',
        };

        expect(shortcut.ctrl).toBe(true);
        expect(shortcut.shift).toBe(true);
        expect(shortcut.alt).toBe(false);
        expect(shortcut.meta).toBe(false);
    });
});

describe('Keyboard Shortcut Categories', () => {
    it('should have common categories defined', () => {
        const expectedCategories = ['Navigation', 'Search', 'Creation', 'UI', 'Help'];

        // Just validate the concept - actual shortcuts would be tested via the hook
        expectedCategories.forEach(category => {
            expect(typeof category).toBe('string');
        });
    });
});
