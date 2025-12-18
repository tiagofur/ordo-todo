'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Filter, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger, } from '../ui/dropdown-menu.js';
/**
 * TaskFilters - Platform-agnostic task filtering dropdown
 *
 * Tags passed via props instead of fetched internally.
 *
 * @example
 * const { data: tags } = useTags(workspaceId);
 * const [filters, setFilters] = useState({ status: [], priority: [], tags: [] });
 *
 * <TaskFilters
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   tags={tags}
 *   labels={{ statusLabel: t('status.label') }}
 * />
 */
export function TaskFilters({ filters, onFiltersChange, tags = [], labels = {}, className = '', }) {
    const { label = 'Filters', clear = 'Clear', statusLabel = 'Status', statusTodo = 'To Do', statusInProgress = 'In Progress', statusCompleted = 'Completed', statusCancelled = 'Cancelled', priorityLabel = 'Priority', priorityLow = 'Low', priorityMedium = 'Medium', priorityHigh = 'High', priorityUrgent = 'Urgent', tagsLabel = 'Tags', } = labels;
    const statusOptions = [
        { value: 'TODO', label: statusTodo },
        { value: 'IN_PROGRESS', label: statusInProgress },
        { value: 'COMPLETED', label: statusCompleted },
        { value: 'CANCELLED', label: statusCancelled },
    ];
    const priorityOptions = [
        { value: 'LOW', label: priorityLow },
        { value: 'MEDIUM', label: priorityMedium },
        { value: 'HIGH', label: priorityHigh },
        { value: 'URGENT', label: priorityUrgent },
    ];
    const toggleStatus = (status) => {
        const newStatuses = filters.status.includes(status)
            ? filters.status.filter((s) => s !== status)
            : [...filters.status, status];
        onFiltersChange({ ...filters, status: newStatuses });
    };
    const togglePriority = (priority) => {
        const newPriorities = filters.priority.includes(priority)
            ? filters.priority.filter((p) => p !== priority)
            : [...filters.priority, priority];
        onFiltersChange({ ...filters, priority: newPriorities });
    };
    const toggleTag = (tagId) => {
        const currentTags = filters.tags || [];
        const newTags = currentTags.includes(tagId)
            ? currentTags.filter((t) => t !== tagId)
            : [...currentTags, tagId];
        onFiltersChange({ ...filters, tags: newTags });
    };
    const clearFilters = () => {
        onFiltersChange({ status: [], priority: [], tags: [] });
    };
    const hasActiveFilters = filters.status.length > 0 || filters.priority.length > 0 || (filters.tags?.length || 0) > 0;
    return (_jsxs("div", { className: `flex items-center gap-2 ${className}`, children: [_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs("button", { className: "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent", children: [_jsx(Filter, { className: "h-4 w-4" }), label, hasActiveFilters && (_jsx("span", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground", children: filters.status.length + filters.priority.length + (filters.tags?.length || 0) }))] }) }), _jsxs(DropdownMenuContent, { align: "start", className: "w-56", children: [_jsx(DropdownMenuLabel, { children: statusLabel }), statusOptions.map((option) => (_jsx(DropdownMenuCheckboxItem, { checked: filters.status.includes(option.value), onCheckedChange: () => toggleStatus(option.value), children: option.label }, option.value))), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuLabel, { children: priorityLabel }), priorityOptions.map((option) => (_jsx(DropdownMenuCheckboxItem, { checked: filters.priority.includes(option.value), onCheckedChange: () => togglePriority(option.value), children: option.label }, option.value))), tags.length > 0 && (_jsxs(_Fragment, { children: [_jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuLabel, { children: tagsLabel }), tags.map((tag) => (_jsx(DropdownMenuCheckboxItem, { checked: filters.tags?.includes(tag.id), onCheckedChange: () => toggleTag(tag.id), children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full", style: { backgroundColor: tag.color } }), tag.name] }) }, tag.id)))] }))] })] }), hasActiveFilters && (_jsxs("button", { onClick: clearFilters, className: "flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground", children: [_jsx(X, { className: "h-4 w-4" }), clear] }))] }));
}
