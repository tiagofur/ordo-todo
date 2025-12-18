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
export declare const PROJECT_COLORS: readonly ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#78716c"];
/**
 * Tag color options with name, Tailwind class and hex value
 * For use in color pickers and UI components
 */
export declare const TAG_COLORS: readonly [{
    readonly name: "Red";
    readonly bg: "bg-red-500";
    readonly hex: "#ef4444";
}, {
    readonly name: "Orange";
    readonly bg: "bg-orange-500";
    readonly hex: "#f97316";
}, {
    readonly name: "Amber";
    readonly bg: "bg-amber-500";
    readonly hex: "#f59e0b";
}, {
    readonly name: "Yellow";
    readonly bg: "bg-yellow-500";
    readonly hex: "#eab308";
}, {
    readonly name: "Lime";
    readonly bg: "bg-lime-500";
    readonly hex: "#84cc16";
}, {
    readonly name: "Green";
    readonly bg: "bg-green-500";
    readonly hex: "#22c55e";
}, {
    readonly name: "Emerald";
    readonly bg: "bg-emerald-500";
    readonly hex: "#10b981";
}, {
    readonly name: "Teal";
    readonly bg: "bg-teal-500";
    readonly hex: "#14b8a6";
}, {
    readonly name: "Cyan";
    readonly bg: "bg-cyan-500";
    readonly hex: "#06b6d4";
}, {
    readonly name: "Sky";
    readonly bg: "bg-sky-500";
    readonly hex: "#0ea5e9";
}, {
    readonly name: "Blue";
    readonly bg: "bg-blue-500";
    readonly hex: "#3b82f6";
}, {
    readonly name: "Indigo";
    readonly bg: "bg-indigo-500";
    readonly hex: "#6366f1";
}, {
    readonly name: "Violet";
    readonly bg: "bg-violet-500";
    readonly hex: "#8b5cf6";
}, {
    readonly name: "Purple";
    readonly bg: "bg-purple-500";
    readonly hex: "#a855f7";
}, {
    readonly name: "Fuchsia";
    readonly bg: "bg-fuchsia-500";
    readonly hex: "#d946ef";
}, {
    readonly name: "Pink";
    readonly bg: "bg-pink-500";
    readonly hex: "#ec4899";
}, {
    readonly name: "Rose";
    readonly bg: "bg-rose-500";
    readonly hex: "#f43f5e";
}, {
    readonly name: "Gray";
    readonly bg: "bg-gray-500";
    readonly hex: "#6b7280";
}];
/**
 * Priority colors for tasks
 */
export declare const PRIORITY_COLORS: {
    readonly LOW: {
        readonly bg: "bg-slate-100 dark:bg-slate-800";
        readonly text: "text-slate-600 dark:text-slate-400";
        readonly border: "border-slate-300 dark:border-slate-600";
        readonly hex: "#94a3b8";
    };
    readonly MEDIUM: {
        readonly bg: "bg-blue-100 dark:bg-blue-900";
        readonly text: "text-blue-600 dark:text-blue-400";
        readonly border: "border-blue-300 dark:border-blue-600";
        readonly hex: "#3b82f6";
    };
    readonly HIGH: {
        readonly bg: "bg-orange-100 dark:bg-orange-900";
        readonly text: "text-orange-600 dark:text-orange-400";
        readonly border: "border-orange-300 dark:border-orange-600";
        readonly hex: "#f97316";
    };
    readonly URGENT: {
        readonly bg: "bg-red-100 dark:bg-red-900";
        readonly text: "text-red-600 dark:text-red-400";
        readonly border: "border-red-300 dark:border-red-600";
        readonly hex: "#ef4444";
    };
};
/**
 * Status colors for tasks
 */
export declare const STATUS_COLORS: {
    readonly TODO: {
        readonly bg: "bg-slate-100 dark:bg-slate-800";
        readonly text: "text-slate-600 dark:text-slate-400";
        readonly hex: "#94a3b8";
    };
    readonly IN_PROGRESS: {
        readonly bg: "bg-blue-100 dark:bg-blue-900";
        readonly text: "text-blue-600 dark:text-blue-400";
        readonly hex: "#3b82f6";
    };
    readonly COMPLETED: {
        readonly bg: "bg-green-100 dark:bg-green-900";
        readonly text: "text-green-600 dark:text-green-400";
        readonly hex: "#22c55e";
    };
    readonly CANCELLED: {
        readonly bg: "bg-gray-100 dark:bg-gray-800";
        readonly text: "text-gray-500 dark:text-gray-500";
        readonly hex: "#6b7280";
    };
};
/**
 * Focus score color thresholds
 */
export declare function getFocusScoreColor(score: number): {
    text: string;
    bg: string;
    hex: string;
};
//# sourceMappingURL=colors.d.ts.map