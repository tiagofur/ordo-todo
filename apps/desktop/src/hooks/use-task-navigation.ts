import { useState, useEffect, useCallback } from 'react';

interface TaskNavigationOptions {
    onComplete?: (task: any) => void;
    onOpen?: (task: any) => void;
    enabled?: boolean;
}

export function useTaskNavigation(tasks: any[] = [], options: TaskNavigationOptions = {}) {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const { onComplete, onOpen, enabled = true } = options;

    // Reset selection when list length changes significantly
    useEffect(() => {
        if (tasks.length === 0) {
            setSelectedIndex(-1);
        } else if (selectedIndex >= tasks.length) {
            setSelectedIndex(tasks.length - 1);
        }
    }, [tasks.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        // Ignore if typing in input/textarea/select
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
        if ((e.target as HTMLElement).isContentEditable) return;

        // Ignore if modifier keys are pressed (except for specific shortcuts)
        if (e.ctrlKey || e.altKey || e.metaKey) {
            // Allow Cmd+Enter for completion
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                if (selectedIndex >= 0 && selectedIndex < tasks.length) {
                    onComplete?.(tasks[selectedIndex]);
                    e.preventDefault();
                }
            }
            return;
        }

        switch (e.key) {
            case 'j':
            case 'ArrowDown':
                setSelectedIndex((prev) => {
                    const next = Math.min(prev + 1, tasks.length - 1);
                    // Auto-select first if none selected
                    return prev === -1 ? 0 : next;
                });
                break;
            case 'k':
            case 'ArrowUp':
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case 'x':
                if (selectedIndex >= 0 && selectedIndex < tasks.length) {
                    onComplete?.(tasks[selectedIndex]);
                }
                break;
            case 'Enter':
                if (selectedIndex >= 0 && selectedIndex < tasks.length) {
                    onOpen?.(tasks[selectedIndex]);
                }
                break;
            case 'Escape':
                setSelectedIndex(-1);
                break;
        }
    }, [tasks, selectedIndex, onComplete, onOpen, enabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return { selectedIndex, setSelectedIndex };
}
