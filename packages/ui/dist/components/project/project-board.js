import { jsx as _jsx } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/index.js';
/**
 * ProjectBoard - Platform-agnostic layout for Kanban board
 *
 * Behavior (DnD) should be implemented by the consuming application
 * by wrapping columns and tasks.
 */
export function ProjectBoard({ isLoading = false, children, className = '', }) {
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary" }) }));
    }
    return (_jsx("div", { className: cn("flex h-full gap-6 overflow-x-auto pb-4", className), children: children }));
}
