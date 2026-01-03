import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from '../ui/command.js';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js';
/**
 * TaskSelector - Platform-agnostic task selection dropdown
 *
 * Tasks are passed via props. Typically used with timer to select which task to track.
 *
 * @example
 * const { data: tasks } = useTasks();
 * const pendingTasks = tasks?.filter(t => t.status !== 'COMPLETED') || [];
 *
 * <TaskSelector
 *   tasks={pendingTasks}
 *   selectedTaskId={selectedTaskId}
 *   onSelect={setSelectedTaskId}
 *   open={open}
 *   setOpen={setOpen}
 *   labels={{ placeholder: t('placeholder') }}
 * />
 */
export function TaskSelector({ selectedTaskId, tasks = [], onSelect, disabled = false, open = false, setOpen, labels = {}, className = '', }) {
    const { placeholder = 'Select a task...', searchPlaceholder = 'Search tasks...', noTasks = 'No tasks found.', groupHeading = 'Tasks', noTaskAssigned = 'No task assigned', } = labels;
    // Filter only pending tasks
    const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
    const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : undefined;
    const handleOpenChange = (newOpen) => {
        setOpen?.(newOpen);
    };
    return (_jsxs(Popover, { open: open, onOpenChange: handleOpenChange, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs("button", { role: "combobox", "aria-expanded": open, disabled: disabled, className: cn('flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-muted-foreground', className), children: [selectedTask ? (_jsx("span", { className: "truncate font-medium", children: selectedTask.title })) : (_jsx("span", { className: "text-muted-foreground", children: placeholder })), _jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 text-muted-foreground" })] }) }), _jsx(PopoverContent, { className: "w-[300px] p-0", align: "start", children: _jsxs(Command, { children: [_jsx(CommandInput, { placeholder: searchPlaceholder }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: noTasks }), _jsxs(CommandGroup, { heading: groupHeading, children: [_jsxs(CommandItem, { value: "no-task", onSelect: () => {
                                                onSelect(null);
                                                setOpen?.(false);
                                            }, className: "text-muted-foreground italic", children: [_jsx(Check, { className: cn('mr-2 h-4 w-4', !selectedTaskId ? 'visible' : 'invisible') }), noTaskAssigned] }), pendingTasks.map((task) => (_jsxs(CommandItem, { value: task.id, keywords: [task.title], onSelect: () => {
                                                onSelect(task.id);
                                                setOpen?.(false);
                                            }, children: [_jsx(Check, { className: cn('mr-2 h-4 w-4', selectedTaskId === task.id ? 'visible' : 'invisible') }), _jsx("div", { className: "flex flex-col overflow-hidden", children: _jsx("span", { className: "truncate", children: task.title }) })] }, task.id)))] })] })] }) })] }));
}
