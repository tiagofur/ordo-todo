import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FolderKanban, MoreVertical, Archive, Trash2, CheckSquare, } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '../ui/dropdown-menu.js';
import { cn } from '../../utils/index.js';
import { Progress } from '../ui/progress.js';
/**
 * ProjectCard - Platform-agnostic component for project summary
 */
export function ProjectCard({ project, onProjectClick, onArchive, onDelete, progressPercent = 0, formattedTasksProgress = "0 / 0", labels = {}, className = '', }) {
    const accentColor = project.color || '#ec4899';
    const moreOptionsLabel = labels.moreOptions || "More options";
    const handleCardClick = () => {
        onProjectClick?.(project);
    };
    const handleArchive = (e) => {
        e.stopPropagation();
        if (project.id && onArchive)
            onArchive(String(project.id));
    };
    const handleDelete = (e) => {
        e.stopPropagation();
        if (project.id && onDelete)
            onDelete(String(project.id));
    };
    return (_jsx("div", { onClick: handleCardClick, className: cn('group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 cursor-pointer shadow-sm', 'hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-900', project.archived && 'opacity-60 grayscale', className), style: {
            borderLeftWidth: '4px',
            borderLeftColor: accentColor,
        }, children: _jsxs("div", { className: "relative z-10 flex flex-col h-full", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", style: {
                                        backgroundColor: '#f3f4f6', // Solid light background
                                        color: accentColor,
                                    }, children: _jsx(FolderKanban, { className: "h-7 w-7" }) }), _jsx("div", { children: _jsx("h3", { className: "font-bold text-xl leading-tight mb-1 truncate max-w-[180px] text-foreground", children: project.name }) })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: _jsx("button", { className: "transition-opacity duration-200 rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground", "aria-label": moreOptionsLabel, children: _jsx(MoreVertical, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48", children: [_jsxs(DropdownMenuItem, { onClick: handleArchive, children: [_jsx(Archive, { className: "mr-2 h-4 w-4" }), project.archived
                                                    ? labels.actions?.unarchive || 'Unarchive'
                                                    : labels.actions?.archive || 'Archive'] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleDelete, className: "text-destructive focus:text-destructive focus:bg-destructive-foreground", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), labels.actions?.delete || 'Delete'] })] })] })] }), project.description && (_jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 mb-6 grow", children: project.description })), _jsxs("div", { className: "mt-auto pt-4 border-t border-dashed border-border space-y-3", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-muted-foreground", children: labels.progressLabel || 'Progress' }), _jsxs("span", { className: "font-medium", style: { color: accentColor }, children: [progressPercent, "%"] })] }), _jsx(Progress, { value: progressPercent, className: "h-1.5", style: {
                                        '--progress-foreground': accentColor,
                                    } })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [_jsx(CheckSquare, { className: "h-4 w-4" }), _jsx("span", { children: formattedTasksProgress })] }), project.archived && (_jsx("div", { className: "text-xs font-medium px-2 py-1 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200", children: labels.archived || 'Archived' }))] })] })] }) }));
}
