'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { User, Check, X, UserPlus } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Popover, PopoverContent, PopoverTrigger, } from '../ui/popover.js';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.js';
const DEFAULT_LABELS = {
    assign: 'Assign',
    unassign: 'Unassign',
    membersLabel: 'Workspace Members',
    noMembers: 'No members in this workspace',
    loading: 'Loading...',
    unassigned: 'Unassigned - Click to assign',
    assignedTo: 'Assigned to',
    selectMember: 'Select Member',
};
export function AssigneeSelector({ taskId, currentAssignee, members = [], isLoading = false, onAssign, variant = 'compact', labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const [open, setOpen] = useState(false);
    const handleSelectAssignee = async (userId) => {
        if (onAssign) {
            await onAssign(userId);
            setOpen(false);
        }
    };
    const getInitials = (name) => {
        if (!name)
            return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    if (variant === 'compact') {
        return (_jsxs(Popover, { open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsx("button", { className: cn('flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-200', 'hover:bg-muted/80 border border-transparent hover:border-border/50', currentAssignee
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'), children: currentAssignee ? (_jsxs(_Fragment, { children: [_jsxs(Avatar, { className: "h-5 w-5", children: [_jsx(AvatarImage, { src: currentAssignee.image }), _jsx(AvatarFallback, { className: "text-[10px] bg-primary/10 text-primary", children: getInitials(currentAssignee.name) })] }), _jsx("span", { className: "max-w-[100px] truncate", children: currentAssignee.name })] })) : (_jsxs(_Fragment, { children: [_jsx(UserPlus, { className: "h-4 w-4" }), _jsx("span", { children: t.assign })] })) }) }), _jsx(PopoverContent, { className: "w-64 p-2", align: "start", children: _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs font-medium text-muted-foreground px-2 py-1", children: t.membersLabel }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-4", children: _jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-primary" }) })) : members.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: t.noMembers })) : (_jsxs("div", { className: "space-y-1", children: [currentAssignee && (_jsxs("button", { onClick: () => handleSelectAssignee(null), className: "w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/80 transition-colors text-left group", children: [_jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground", children: _jsx(X, { className: "h-4 w-4" }) }), _jsx("span", { className: "text-sm text-muted-foreground group-hover:text-foreground", children: t.unassign })] })), members.map((member) => (_jsxs("button", { onClick: () => handleSelectAssignee(member.user.id), className: cn('w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left', currentAssignee?.id === member.user.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-muted/80'), children: [_jsxs(Avatar, { className: "h-7 w-7", children: [_jsx(AvatarImage, { src: member.user.image }), _jsx(AvatarFallback, { className: cn('text-xs', currentAssignee?.id === member.user.id
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted'), children: getInitials(member.user.name) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: member.user.name || member.user.email }), member.user.name && (_jsx("p", { className: "text-xs text-muted-foreground truncate", children: member.user.email }))] }), currentAssignee?.id === member.user.id && (_jsx(Check, { className: "h-4 w-4 text-primary shrink-0" }))] }, member.id)))] }))] }) })] }));
    }
    // Full variant (for task detail panel)
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4" }), t.assignedTo] }), _jsxs(Popover, { open: open, onOpenChange: setOpen, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsx("button", { className: cn('w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/30', 'hover:bg-muted/50 hover:border-border transition-all duration-200 text-left'), children: currentAssignee ? (_jsxs(_Fragment, { children: [_jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: currentAssignee.image }), _jsx(AvatarFallback, { className: "bg-primary/10 text-primary text-sm", children: getInitials(currentAssignee.name) })] }), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: "text-sm font-medium truncate", children: currentAssignee.name }) })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-muted", children: _jsx(UserPlus, { className: "h-4 w-4 text-muted-foreground" }) }), _jsx("span", { className: "text-sm text-muted-foreground", children: t.unassigned })] })) }) }), _jsx(PopoverContent, { className: "w-72 p-2", align: "start", children: _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs font-medium text-muted-foreground px-2 py-1", children: t.selectMember }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-6", children: _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-primary" }) })) : members.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: t.noMembers })) : (_jsxs("div", { className: "space-y-1", children: [currentAssignee && (_jsxs("button", { onClick: () => handleSelectAssignee(null), className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-left group", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive", children: _jsx(X, { className: "h-4 w-4" }) }), _jsx("span", { className: "text-sm text-destructive", children: t.unassign })] })), currentAssignee && _jsx("div", { className: "border-t border-border/50 my-1" }), members.map((member) => (_jsxs("button", { onClick: () => handleSelectAssignee(member.user.id), className: cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left', currentAssignee?.id === member.user.id
                                                ? 'bg-primary/10'
                                                : 'hover:bg-muted/80'), children: [_jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: member.user.image }), _jsx(AvatarFallback, { className: cn('text-xs', currentAssignee?.id === member.user.id
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted'), children: getInitials(member.user.name) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: cn('text-sm font-medium truncate', currentAssignee?.id === member.user.id && 'text-primary'), children: member.user.name || member.user.email }), _jsx("p", { className: "text-xs text-muted-foreground truncate", children: member.role })] }), currentAssignee?.id === member.user.id && (_jsx(Check, { className: "h-4 w-4 text-primary shrink-0" }))] }, member.id)))] }))] }) })] })] }));
}
