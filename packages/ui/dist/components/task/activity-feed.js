'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, Circle, Edit, Trash2, Upload, MessageSquare, User, Calendar, Flag, } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { cn } from '../../utils/index.js';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.js';
const ACTIVITY_CONFIG = {
    TASK_CREATED: { icon: Circle, color: 'text-blue-500' },
    TASK_UPDATED: { icon: Edit, color: 'text-gray-500' },
    TASK_COMPLETED: { icon: CheckCircle2, color: 'text-green-500' },
    TASK_DELETED: { icon: Trash2, color: 'text-red-500' },
    COMMENT_ADDED: { icon: MessageSquare, color: 'text-purple-500' },
    COMMENT_EDITED: { icon: Edit, color: 'text-gray-500' },
    COMMENT_DELETED: { icon: Trash2, color: 'text-red-500' },
    ATTACHMENT_ADDED: { icon: Upload, color: 'text-indigo-500' },
    ATTACHMENT_DELETED: { icon: Trash2, color: 'text-red-500' },
    SUBTASK_ADDED: { icon: Circle, color: 'text-blue-500' },
    SUBTASK_COMPLETED: { icon: CheckCircle2, color: 'text-green-500' },
    STATUS_CHANGED: { icon: Circle, color: 'text-orange-500' },
    PRIORITY_CHANGED: { icon: Flag, color: 'text-yellow-500' },
    ASSIGNEE_CHANGED: { icon: User, color: 'text-cyan-500' },
    DUE_DATE_CHANGED: { icon: Calendar, color: 'text-pink-500' },
};
const DEFAULT_LABELS = {
    title: 'Activity',
    today: 'Today',
    yesterday: 'Yesterday',
    empty: 'No recent activity',
    showing: (current, total) => `Showing ${current} of ${total}`,
    showMore: (count) => `Show ${count} more`,
    actions: {
        TASK_CREATED: 'created this task',
        TASK_UPDATED: 'updated this task',
        TASK_COMPLETED: 'completed this task',
        TASK_DELETED: 'deleted this task',
        COMMENT_ADDED: 'commented',
        COMMENT_EDITED: 'edited a comment',
        COMMENT_DELETED: 'deleted a comment',
        ATTACHMENT_ADDED: 'added an attachment',
        ATTACHMENT_DELETED: 'removed an attachment',
        SUBTASK_ADDED: 'added a subtask',
        SUBTASK_COMPLETED: 'completed a subtask',
        STATUS_CHANGED: 'changed status',
        PRIORITY_CHANGED: 'changed priority',
        ASSIGNEE_CHANGED: 'changed assignee',
        DUE_DATE_CHANGED: 'changed due date',
    },
    details: {
        fromTo: (oldVal, newVal) => `from ${oldVal} to ${newVal}`,
        to: (newVal) => `to ${newVal}`,
        removed: 'removed',
        item: (name) => `: ${name}`,
        mentioned: (users) => `mentioned ${users}`,
    },
};
export function ActivityFeed({ taskId, activities = [], maxItems = 20, locale = 'en', labels = {}, }) {
    // Merge labels shallowly for top-level, deep merge needed for actions/details
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        actions: { ...DEFAULT_LABELS.actions, ...labels.actions },
        details: { ...DEFAULT_LABELS.details, ...labels.details },
    };
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    const formatTimestamp = (date) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const dateLocale = locale === 'es' ? es : enUS;
        return formatDistanceToNow(dateObj, { addSuffix: true, locale: dateLocale });
    };
    const getActivityDescription = (activity) => {
        let description = t.actions[activity.type] || activity.type;
        if (activity.metadata) {
            const { oldValue, newValue, fieldName, itemName } = activity.metadata;
            switch (activity.type) {
                case 'STATUS_CHANGED':
                case 'PRIORITY_CHANGED':
                    description += ` ${t.details.fromTo(String(oldValue || ''), String(newValue || ''))}`;
                    break;
                case 'ASSIGNEE_CHANGED':
                    description += newValue
                        ? ` ${t.details.to(String(newValue))}`
                        : '';
                    break;
                case 'DUE_DATE_CHANGED':
                    description += newValue
                        ? ` ${t.details.to(String(newValue))}`
                        : ` ${t.details.removed}`;
                    break;
                case 'ATTACHMENT_ADDED':
                case 'ATTACHMENT_DELETED':
                    description += itemName ? t.details.item(String(itemName)) : '';
                    break;
                case 'COMMENT_ADDED':
                    description += itemName ? ` ${t.details.mentioned(String(itemName))}` : '';
                    break;
                case 'SUBTASK_ADDED':
                case 'SUBTASK_COMPLETED':
                    description += itemName ? t.details.item(String(itemName)) : '';
                    break;
            }
        }
        return description;
    };
    const groupActivitiesByDate = (activities) => {
        const groups = {};
        activities.forEach((activity) => {
            const date = new Date(activity.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            let key;
            if (date.toDateString() === today.toDateString()) {
                key = t.today || 'Today';
            }
            else if (date.toDateString() === yesterday.toDateString()) {
                key = t.yesterday || 'Yesterday';
            }
            else {
                key = date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
                });
            }
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(activity);
        });
        return groups;
    };
    if (activities.length === 0) {
        return (_jsx("div", { className: "text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg", children: t.empty }));
    }
    const displayActivities = activities.slice(0, maxItems);
    const groupedActivities = groupActivitiesByDate(displayActivities);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-sm font-semibold", children: [t.title, " (", activities.length, ")"] }), activities.length > maxItems && (_jsx("p", { className: "text-xs text-muted-foreground", children: t.showing?.(maxItems, activities.length) }))] }), _jsx("div", { className: "space-y-6", children: Object.entries(groupedActivities).map(([date, dateActivities]) => (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "sticky top-0 bg-background z-10 pb-2", children: _jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: date }) }), _jsx("div", { className: "space-y-3 relative before:absolute before:left-[15px] before:top-0 before:bottom-0 before:w-px before:bg-border", children: dateActivities.map((activity, index) => {
                                const config = ACTIVITY_CONFIG[activity.type] || { icon: Circle, color: 'text-gray-500' };
                                const Icon = config.icon;
                                const isLast = index === dateActivities.length - 1;
                                return (_jsxs("div", { className: cn('relative flex gap-3 pl-10', !isLast && 'pb-3'), children: [_jsx("div", { className: "absolute left-0 top-0.5", children: _jsx("div", { className: cn('flex items-center justify-center w-8 h-8 rounded-full bg-background border-2', config.color), children: _jsx(Icon, { className: "h-3.5 w-3.5" }) }) }), _jsx("div", { className: "flex-1 min-w-0 pt-0.5", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsxs(Avatar, { className: "h-6 w-6 shrink-0", children: [_jsx(AvatarImage, { src: activity.user?.image, alt: activity.user?.name }), _jsx(AvatarFallback, { className: "text-xs", children: getInitials(activity.user?.name || '?') })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: activity.user?.name }), ' ', _jsx("span", { className: "text-muted-foreground", children: getActivityDescription(activity) })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: formatTimestamp(activity.createdAt) })] })] }) })] }, activity.id));
                            }) })] }, date))) }), activities.length > maxItems && (_jsx("div", { className: "text-center pt-2", children: _jsx("button", { className: "text-sm text-primary hover:underline", children: t.showMore?.(activities.length - maxItems) }) }))] }));
}
