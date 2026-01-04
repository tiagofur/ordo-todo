import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FolderKanban, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Progress } from '../ui/progress.js';
const DEFAULT_LABELS = {
    title: 'Active Projects',
    viewAll: 'View all',
    empty: 'No active projects',
};
export function ActiveProjectsWidget({ projects, onProjectClick, onViewAll, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const displayProjects = projects.slice(0, 4);
    if (projects.length === 0) {
        return (_jsxs("div", { className: "rounded-2xl border border-border/50 bg-card p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500", children: _jsx(FolderKanban, { className: "h-5 w-5" }) }), _jsx("h3", { className: "text-lg font-semibold", children: t.title })] }), _jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: t.empty })] }));
    }
    return (_jsxs("div", { className: "rounded-2xl border border-border/50 bg-card p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500", children: _jsx(FolderKanban, { className: "h-5 w-5" }) }), _jsx("h3", { className: "text-lg font-semibold", children: t.title })] }), onViewAll && (_jsxs("button", { onClick: onViewAll, className: "text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors", children: [t.viewAll, _jsx(ChevronRight, { className: "h-4 w-4" })] }))] }), _jsx("div", { className: "space-y-4", children: displayProjects.map((project) => {
                    const progress = project.totalTasks > 0
                        ? Math.round((project.completedTasks / project.totalTasks) * 100)
                        : 0;
                    return (_jsxs("div", { className: cn('p-3 rounded-lg border transition-all duration-200', 'hover:bg-accent/50 hover:border-primary/20 cursor-pointer'), onClick: () => onProjectClick?.(project.id), children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("div", { className: "h-3 w-3 rounded-full", style: { backgroundColor: project.color } }), _jsx("span", { className: "font-medium flex-1 truncate", children: project.name }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [project.completedTasks, "/", project.totalTasks] })] }), _jsx(Progress, { value: progress, className: "h-1.5" })] }, project.id));
                }) })] }));
}
