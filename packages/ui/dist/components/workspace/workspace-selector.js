'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Plus, Search, Briefcase, User, Users, FolderKanban, ListTodo, } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, } from '../ui/dropdown-menu.js';
import { Input } from '../ui/input.js';
import { cn } from '../../utils/index.js';
const DEFAULT_LABELS = {
    create: 'Create Workspace',
    search: 'Search workspaces...',
    defaultName: 'My Workspace',
    noResults: 'No workspaces found',
    types: {
        personal: 'Personal',
        work: 'Work',
        team: 'Team',
    },
    stats: {
        projects: 'projects',
        tasks: 'tasks',
    },
};
export function WorkspaceSelector({ workspaces = [], selectedWorkspaceId, isLoading = false, onSelect, onCreateClick, labels = {}, }) {
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        types: { ...DEFAULT_LABELS.types, ...labels.types },
        stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    // Filter workspaces by search query
    const filteredWorkspaces = useMemo(() => {
        if (!workspaces)
            return [];
        if (!searchQuery)
            return workspaces;
        return workspaces.filter((w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [workspaces, searchQuery]);
    // Group workspaces by type
    const groupedWorkspaces = useMemo(() => {
        const groups = {
            PERSONAL: [],
            WORK: [],
            TEAM: [],
        };
        if (!filteredWorkspaces)
            return groups;
        filteredWorkspaces.forEach((workspace) => {
            if (groups[workspace.type]) {
                groups[workspace.type].push(workspace);
            }
            else {
                groups.PERSONAL.push(workspace);
            }
        });
        return groups;
    }, [filteredWorkspaces]);
    const selectedWorkspace = workspaces?.find((w) => w.id === selectedWorkspaceId) || workspaces?.[0];
    const getWorkspaceIcon = (type) => {
        switch (type) {
            case 'PERSONAL':
                return User;
            case 'WORK':
                return Briefcase;
            case 'TEAM':
                return Users;
            default:
                return User;
        }
    };
    const getWorkspaceColor = (type) => {
        switch (type) {
            case 'PERSONAL':
                return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
            case 'WORK':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
            case 'TEAM':
                return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
            default:
                return 'bg-primary/10 text-primary border-primary/20';
        }
    };
    const getTypeLabel = (type) => {
        switch (type) {
            case 'PERSONAL':
                return t.types.personal;
            case 'WORK':
                return t.types.work;
            case 'TEAM':
                return t.types.team;
            default:
                return type;
        }
    };
    if (isLoading) {
        return (_jsxs("div", { className: "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm", children: [_jsx("div", { className: "h-8 w-8 animate-pulse rounded-lg bg-muted" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 w-24 animate-pulse rounded bg-muted" }), _jsx("div", { className: "h-3 w-16 animate-pulse rounded bg-muted" })] })] }));
    }
    if (!workspaces || workspaces.length === 0) {
        return (_jsxs("button", { onClick: onCreateClick, className: "flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-sm hover:bg-accent hover:border-solid transition-all", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10", children: _jsx(Plus, { className: "h-4 w-4 text-primary" }) }), _jsx("span", { className: "font-medium", children: t.create })] }));
    }
    const Icon = getWorkspaceIcon(selectedWorkspace?.type || 'PERSONAL');
    return (_jsxs(DropdownMenu, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs("button", { className: "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm hover:bg-accent hover:shadow-sm transition-all group", children: [_jsx("div", { className: cn('flex h-8 w-8 items-center justify-center rounded-lg border transition-all group-hover:scale-105', getWorkspaceColor(selectedWorkspace?.type || 'PERSONAL')), children: _jsx(Icon, { className: "h-4 w-4" }) }), _jsxs("div", { className: "flex-1 text-left min-w-0", children: [_jsx("div", { className: "font-medium truncate", children: selectedWorkspace?.name || t.defaultName }), _jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-2", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(FolderKanban, { className: "h-3 w-3" }), selectedWorkspace?.stats?.projectCount || 0] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(ListTodo, { className: "h-3 w-3" }), selectedWorkspace?.stats?.taskCount || 0] })] })] }), _jsx(ChevronsUpDown, { className: "h-4 w-4 opacity-50 flex-shrink-0" })] }) }), _jsxs(DropdownMenuContent, { align: "start", className: "w-80 p-0", children: [_jsx("div", { className: "p-3 border-b", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: t.search, value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9 h-9" })] }) }), _jsxs("div", { className: "max-h-[400px] overflow-y-auto p-2", children: [Object.entries(groupedWorkspaces).map(([type, wsItems]) => {
                                if (wsItems.length === 0)
                                    return null;
                                return (_jsxs("div", { className: "mb-3 last:mb-0", children: [_jsx("div", { className: "px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: getTypeLabel(type) }), _jsx("div", { className: "space-y-1", children: wsItems.map((workspace) => {
                                                const WorkspaceIcon = getWorkspaceIcon(workspace.type);
                                                const isSelected = selectedWorkspace?.id === workspace.id;
                                                return (_jsxs("button", { onClick: () => {
                                                        onSelect?.(workspace);
                                                        setIsOpen(false);
                                                    }, className: cn('flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-all', isSelected
                                                        ? 'bg-accent shadow-sm'
                                                        : 'hover:bg-accent/50'), children: [_jsx("div", { className: cn('flex h-10 w-10 items-center justify-center rounded-lg border flex-shrink-0', getWorkspaceColor(workspace.type)), children: _jsx(WorkspaceIcon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex-1 text-left min-w-0", children: [_jsx("div", { className: "font-medium truncate", children: workspace.name }), _jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-3", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(FolderKanban, { className: "h-3 w-3" }), workspace.stats?.projectCount || 0, " ", t.stats.projects] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(ListTodo, { className: "h-3 w-3" }), workspace.stats?.taskCount || 0, " ", t.stats.tasks] })] })] }), isSelected && (_jsx(Check, { className: "h-4 w-4 text-primary flex-shrink-0" }))] }, workspace.id));
                                            }) })] }, type));
                            }), filteredWorkspaces.length === 0 && (_jsx("div", { className: "py-8 text-center text-sm text-muted-foreground", children: t.noResults }))] }), _jsx("div", { className: "border-t p-2", children: _jsxs("button", { onClick: () => {
                                onCreateClick?.();
                                setIsOpen(false);
                            }, className: "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-accent transition-all", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20", children: _jsx(Plus, { className: "h-5 w-5 text-primary" }) }), _jsx("span", { className: "font-medium", children: t.create })] }) })] })] }));
}
