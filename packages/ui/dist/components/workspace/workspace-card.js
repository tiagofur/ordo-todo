import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { MoreVertical, Trash2, Settings as SettingsIcon, FolderKanban, CheckSquare, } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "../ui/dropdown-menu.js";
import { cn } from "../../utils/index.js";
import { motion } from "framer-motion";
const DEFAULT_LABELS = {
    status: {
        active: "Active",
    },
    stats: {
        projects: (count) => `${count} projects`,
        tasks: (count) => `${count} tasks`,
    },
    actions: {
        settings: "Settings",
        delete: "Delete",
        moreOptions: "More options",
    },
};
/**
 * WorkspaceCard - Platform-agnostic workspace display card
 * Simplified to use custom icon and color directly (no tier/type logic)
 */
export function WorkspaceCard({ workspace, index = 0, onWorkspaceClick, onDelete, onOpenSettings, renderSettingsDialog, labels = {}, className = '', }) {
    const t = {
        ...DEFAULT_LABELS,
        status: { ...DEFAULT_LABELS.status, ...labels.status },
        stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
        actions: { ...DEFAULT_LABELS.actions, ...labels.actions },
    };
    const handleCardClick = () => {
        onWorkspaceClick?.(workspace);
    };
    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete?.(workspace.id);
    };
    const handleSettings = (e) => {
        e.stopPropagation();
        onOpenSettings?.(workspace.id);
    };
    const displayColor = workspace.color || '#2563EB';
    const displayBg = workspace.color ? `${workspace.color}26` : '#daedf4';
    return (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: index * 0.05 }, whileHover: { y: -5, scale: 1.02 }, onClick: handleCardClick, className: cn('group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 cursor-pointer shadow-sm', 'hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-900', className), style: {
                    borderLeftWidth: '4px',
                    borderLeftColor: displayColor,
                }, children: _jsxs("div", { className: "relative z-10 flex flex-col h-full", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", style: {
                                                backgroundColor: displayBg,
                                                color: displayColor,
                                            }, children: workspace.icon ? (_jsx("span", { className: "text-2xl leading-none select-none", children: workspace.icon })) : (_jsx(FolderKanban, { className: "h-7 w-7" })) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-xl leading-tight mb-2", children: workspace.name }), _jsx("div", { className: "flex items-center justify-between", children: _jsx("div", { className: "text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground", children: t.status.active }) })] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: _jsx("button", { className: cn('transition-opacity duration-200', 'rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground'), "aria-label": t.actions.moreOptions, children: _jsx(MoreVertical, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48", children: [_jsxs(DropdownMenuItem, { onClick: handleSettings, children: [_jsx(SettingsIcon, { className: "mr-2 h-4 w-4" }), t.actions.settings] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleDelete, className: "text-destructive focus:text-destructive focus:bg-destructive-foreground dark:focus:bg-destructive/10", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), t.actions.delete] })] })] })] }), workspace.description && (_jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 mb-6", children: workspace.description })), _jsx("div", { className: "mt-auto pt-4 border-t border-dashed border-border", children: _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [_jsx(FolderKanban, { className: "h-4 w-4" }), _jsx("span", { children: t.stats.projects(workspace.projectsCount ?? 0) })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [_jsx(CheckSquare, { className: "h-4 w-4" }), _jsx("span", { children: t.stats.tasks(workspace.tasksCount ?? 0) })] })] }) })] }) }), renderSettingsDialog?.()] }));
}
