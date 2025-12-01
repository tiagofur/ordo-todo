'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    action: () => void;
    description?: string;
    preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Validate event.key exists
        if (!event.key) return;

        // Find matching shortcut
        const matchingShortcut = shortcuts.find(shortcut => {
            // Validate shortcut.key exists
            if (!shortcut.key) return false;

            const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
            const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
            const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
            const altMatch = !!shortcut.altKey === event.altKey;
            const metaMatch = !!shortcut.metaKey === event.metaKey;

            return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
        });

        if (matchingShortcut) {
            if (matchingShortcut.preventDefault !== false) {
                event.preventDefault();
            }
            matchingShortcut.action();
        }
    }, [shortcuts]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return {
        shortcuts
    };
}

// Predefined shortcuts for common actions
export const TASK_SHORTCUTS: KeyboardShortcut[] = [
    {
        key: 'n',
        ctrlKey: true,
        action: () => {
            // Dispatch custom event for new task
            window.dispatchEvent(new CustomEvent('ordo-todo:new-task'));
        },
        description: 'Create new task',
        preventDefault: true
    },
    {
        key: 't',
        ctrlKey: true,
        shiftKey: true,
        action: () => {
            window.dispatchEvent(new CustomEvent('ordo-todo:quick-timer'));
        },
        description: 'Start quick timer',
        preventDefault: true
    },
    {
        key: 's',
        ctrlKey: true,
        action: () => {
            window.dispatchEvent(new CustomEvent('ordo-todo:save'));
        },
        description: 'Save current task',
        preventDefault: true
    },
    {
        key: 'k',
        ctrlKey: true,
        action: () => {
            window.dispatchEvent(new CustomEvent('ordo-todo:search'));
        },
        description: 'Open search',
        preventDefault: true
    },
    {
        key: 'Escape',
        action: () => {
            window.dispatchEvent(new CustomEvent('ordo-todo:close-modal'));
        },
        description: 'Close modal/dialog',
        preventDefault: true
    }
];

export const NAVIGATION_SHORTCUTS: KeyboardShortcut[] = [
    {
        key: '1',
        altKey: true,
        action: () => {
            window.dispatchEvent(new CustomEvent('ordo-todo:navigate', { detail: 'tasks' }));
        },
        description: 'Go to Tasks',
        preventDefault: true
    },
    {
        key: '2',
        altKey: true,
        action: () => {
            window.dispatchEvent(new CustomEvent('ordo-todo:navigate', { detail: 'projects' }));
        },
        description: 'Go to Projects',
        preventDefault: true
    },
    {
        key: '3',
        altKey: true,
        action: () => {
            window.dispatchEvent(new CustomEvent('ordo-todo:navigate', { detail: 'profile' }));
        },
        description: 'Go to Profile',
        preventDefault: true
    }
];