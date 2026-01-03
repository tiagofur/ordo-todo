import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "../ui/button.js";
import { Plus } from "lucide-react";
import { cn } from "../../utils/index.js";
/**
 * BoardColumn - Platform-agnostic Kanban column layout
 */
export function BoardColumn({ id, title, tasksCount = 0, headerColorClass, onAddTask, children, labels = {}, className = '', style, setNodeRef, }) {
    return (_jsxs("div", { className: cn("flex-shrink-0 w-80 flex flex-col gap-4", className), style: style, children: [_jsxs("div", { className: cn("flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-900", headerColorClass), children: [_jsx("h3", { className: "font-semibold text-sm text-foreground", children: title }), _jsx("span", { className: "text-xs font-medium bg-white dark:bg-black px-2 py-0.5 rounded-full border border-border shadow-sm", children: tasksCount })] }), _jsxs("div", { ref: setNodeRef, className: "flex flex-col gap-3 min-h-[200px] flex-1", children: [children, _jsxs(Button, { variant: "ghost", className: "w-full justify-start text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900", onClick: onAddTask, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), labels.addTask ?? 'Add Task'] })] })] }));
}
