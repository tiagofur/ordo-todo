'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Keyboard } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '../ui/dialog.js';
const DEFAULT_SHORTCUTS = [
    // Timer
    { keys: ['Ctrl', 'Space'], description: 'Start/Pause Timer', category: 'Timer' },
    { keys: ['Ctrl', 'Shift', 'S'], description: 'Toggle Timer (Global)', category: 'Timer' },
    { keys: ['Ctrl', 'Shift', 'K'], description: 'Skip to next', category: 'Timer' },
    // Lists
    { keys: ['j'], description: 'Next item', category: 'Lists' },
    { keys: ['k'], description: 'Previous item', category: 'Lists' },
    { keys: ['x'], description: 'Complete selected task', category: 'Lists' },
    { keys: ['Enter'], description: 'Open details', category: 'Lists' },
    // Navigation
    { keys: ['Ctrl', '1'], description: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['Ctrl', '2'], description: 'Go to Tasks', category: 'Navigation' },
    { keys: ['Ctrl', '3'], description: 'Go to Projects', category: 'Navigation' },
    { keys: ['Ctrl', '4'], description: 'Go to Timer', category: 'Navigation' },
    { keys: ['Ctrl', '5'], description: 'Go to Analytics', category: 'Navigation' },
    // Actions
    { keys: ['Ctrl', 'N'], description: 'New Task', category: 'Actions' },
    { keys: ['Ctrl', 'Shift', 'P'], description: 'New Project', category: 'Actions' },
    { keys: ['Ctrl', 'Shift', 'N'], description: 'Quick Task (Global)', category: 'Actions' },
    // Window
    { keys: ['Ctrl', 'Shift', 'O'], description: 'Show/Hide Window (Global)', category: 'Window' },
    { keys: ['Ctrl', 'Shift', 'F'], description: 'Focus Window (Global)', category: 'Window' },
    { keys: ['F11'], description: 'Fullscreen', category: 'Window' },
    // General
    { keys: ['Ctrl', '/'], description: 'Show Shortcuts', category: 'General' },
    { keys: ['Ctrl', ','], description: 'Settings', category: 'General' },
];
const DEFAULT_LABELS = {
    title: 'Keyboard Shortcuts',
    description: 'Use these shortcuts to navigate and control the app faster. Shortcuts marked as "Global" work even when the window is not focused.',
    footer: 'You can customize global shortcuts in Settings → Shortcuts',
};
export function ShortcutsDialog({ open, onOpenChange, shortcuts = DEFAULT_SHORTCUTS, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    // Group shortcuts by category
    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {});
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Keyboard, { className: "h-5 w-5" }), t.title] }), _jsx(DialogDescription, { children: t.description })] }), _jsx("div", { className: "space-y-6 mt-4", children: Object.entries(groupedShortcuts).map(([category, items]) => (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-muted-foreground mb-3", children: category }), _jsx("div", { className: "space-y-2", children: items.map((shortcut, index) => (_jsxs("div", { className: "flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50", children: [_jsx("span", { className: "text-sm", children: shortcut.description }), _jsx("div", { className: "flex items-center gap-1", children: shortcut.keys.map((key, keyIndex) => (_jsxs("span", { children: [_jsx("kbd", { className: "px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded", children: key }), keyIndex < shortcut.keys.length - 1 && (_jsx("span", { className: "mx-1 text-muted-foreground", children: "+" }))] }, keyIndex))) })] }, index))) })] }, category))) }), _jsx("div", { className: "mt-6 pt-4 border-t text-center text-sm text-muted-foreground", children: t.footer })] }) }));
}
