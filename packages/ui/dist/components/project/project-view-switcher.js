import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckSquare, Sparkles, Layers } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.js';
/**
 * ProjectViewSwitcher - Conditional rendering based on project type
 *
 * Renders different views based on ProjectType:
 * - FOCUS/STANDARD/SERIES → Classic To-Do view (checkbox, kanban)
 * - CREATOR → Creator OS view (pipeline, scripting, publishing)
 * - HYBRID → Both views available via tabs
 */
export function ProjectViewSwitcher({ project, FocusViewComponent, CreatorViewComponent, onTaskClick, onTaskStatusChange, onTaskStageChange, onCreateTask, labels = {}, className = '', }) {
    const focusLabel = labels.focus || 'Focus';
    const creatorLabel = labels.creator || 'Creator';
    const bothLabel = labels.both || 'Both';
    // FOCUS, STANDARD, SERIES → Classic To-Do view
    if (project.type === 'FOCUS' || project.type === 'STANDARD' || project.type === 'SERIES') {
        return (_jsxs("div", { className: cn('space-y-4', className), children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800", children: [_jsx(CheckSquare, { className: "h-5 w-5 text-cyan-600 dark:text-cyan-400" }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-foreground", children: [focusLabel, " Mode"] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Classic task management with checklists and boards" })] })] }), _jsx(FocusViewComponent, { project: project, onTaskClick: onTaskClick, onTaskStatusChange: onTaskStatusChange, onCreateTask: onCreateTask, labels: labels.focusView })] }));
    }
    // CREATOR → Creator OS view (pipeline, scripting, publishing)
    if (project.type === 'CREATOR') {
        return (_jsxs("div", { className: cn('space-y-4', className), children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800", children: [_jsx(Sparkles, { className: "h-5 w-5 text-amber-600 dark:text-amber-400" }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-foreground", children: [creatorLabel, " Mode"] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Content pipeline with ideas, scripting, and publishing" })] })] }), _jsx(CreatorViewComponent, { project: project, onTaskClick: onTaskClick, onTaskStageChange: onTaskStageChange, onCreateTask: onCreateTask, labels: labels.creatorView })] }));
    }
    // HYBRID → Both modes available via tabs
    if (project.type === 'HYBRID') {
        return (_jsxs("div", { className: cn('space-y-4', className), children: [_jsxs("div", { className: "flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-50 to-amber-50 dark:from-cyan-950 dark:to-amber-950 border border-cyan-200 dark:border-cyan-800", children: [_jsx(Layers, { className: "h-5 w-5 text-violet-600 dark:text-violet-400" }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-foreground", children: [bothLabel, " Mode"] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Switch between Focus and Creator modes as needed" })] })] }), _jsxs(Tabs, { defaultValue: "focus", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsxs(TabsTrigger, { value: "focus", className: "flex items-center gap-2", children: [_jsx(CheckSquare, { className: "h-4 w-4" }), focusLabel] }), _jsxs(TabsTrigger, { value: "creator", className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "h-4 w-4" }), creatorLabel] })] }), _jsx(TabsContent, { value: "focus", className: "mt-4", children: _jsx(FocusViewComponent, { project: project, onTaskClick: onTaskClick, onTaskStatusChange: onTaskStatusChange, onCreateTask: onCreateTask, labels: labels.focusView }) }), _jsx(TabsContent, { value: "creator", className: "mt-4", children: _jsx(CreatorViewComponent, { project: project, onTaskClick: onTaskClick, onTaskStageChange: onTaskStageChange, onCreateTask: onCreateTask, labels: labels.creatorView }) })] })] }));
    }
    // Fallback for unknown types
    return (_jsx("div", { className: cn('p-4 rounded-xl bg-muted', className), children: _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Unknown project type: ", project.type] }) }));
}
