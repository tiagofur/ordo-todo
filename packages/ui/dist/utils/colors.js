/**
 * Shared UI color constants and utilities for Ordo-Todo
 *
 * Note: Base PROJECT_COLORS and TAG_COLORS are defined in @ordo-todo/core.
 * This package re-exports them and adds UI-specific color utilities
 * with Tailwind CSS classes.
 */
/**
 * Extended project colors for UI with more options
 * (Re-exported from @ordo-todo/core for convenience)
 */
export const PROJECT_COLORS = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#22c55e', // green-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#d946ef', // fuchsia-500
    '#ec4899', // pink-500
    '#f43f5e', // rose-500
    '#78716c', // stone-500
];
/**
 * Tag color options with name, Tailwind class and hex value
 * For use in color pickers and UI components
 */
export const TAG_COLORS = [
    { name: 'Red', bg: 'bg-red-500', hex: '#ef4444' },
    { name: 'Orange', bg: 'bg-orange-500', hex: '#f97316' },
    { name: 'Amber', bg: 'bg-amber-500', hex: '#f59e0b' },
    { name: 'Yellow', bg: 'bg-yellow-500', hex: '#eab308' },
    { name: 'Lime', bg: 'bg-lime-500', hex: '#84cc16' },
    { name: 'Green', bg: 'bg-green-500', hex: '#22c55e' },
    { name: 'Emerald', bg: 'bg-emerald-500', hex: '#10b981' },
    { name: 'Teal', bg: 'bg-teal-500', hex: '#14b8a6' },
    { name: 'Cyan', bg: 'bg-cyan-500', hex: '#06b6d4' },
    { name: 'Sky', bg: 'bg-sky-500', hex: '#0ea5e9' },
    { name: 'Blue', bg: 'bg-blue-500', hex: '#3b82f6' },
    { name: 'Indigo', bg: 'bg-indigo-500', hex: '#6366f1' },
    { name: 'Violet', bg: 'bg-violet-500', hex: '#8b5cf6' },
    { name: 'Purple', bg: 'bg-purple-500', hex: '#a855f7' },
    { name: 'Fuchsia', bg: 'bg-fuchsia-500', hex: '#d946ef' },
    { name: 'Pink', bg: 'bg-pink-500', hex: '#ec4899' },
    { name: 'Rose', bg: 'bg-rose-500', hex: '#f43f5e' },
    { name: 'Gray', bg: 'bg-gray-500', hex: '#6b7280' },
];
/**
 * Priority colors for tasks
 */
export const PRIORITY_COLORS = {
    LOW: {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-300 dark:border-slate-600',
        hex: '#94a3b8',
    },
    MEDIUM: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-600',
        hex: '#3b82f6',
    },
    HIGH: {
        bg: 'bg-orange-100 dark:bg-orange-900',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-600',
        hex: '#f97316',
    },
    URGENT: {
        bg: 'bg-red-100 dark:bg-red-900',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-300 dark:border-red-600',
        hex: '#ef4444',
    },
};
/**
 * Status colors for tasks
 */
export const STATUS_COLORS = {
    TODO: {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        hex: '#94a3b8',
    },
    IN_PROGRESS: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-600 dark:text-blue-400',
        hex: '#3b82f6',
    },
    COMPLETED: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-600 dark:text-green-400',
        hex: '#22c55e',
    },
    CANCELLED: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-500 dark:text-gray-500',
        hex: '#6b7280',
    },
};
/**
 * Focus score color thresholds
 */
export function getFocusScoreColor(score) {
    if (score >= 80) {
        return {
            text: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-100 dark:bg-green-900',
            hex: '#22c55e',
        };
    }
    if (score >= 50) {
        return {
            text: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-100 dark:bg-yellow-900',
            hex: '#eab308',
        };
    }
    return {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900',
        hex: '#ef4444',
    };
}
