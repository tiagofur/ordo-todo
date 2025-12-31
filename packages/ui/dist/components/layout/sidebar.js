'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Home, CheckSquare, FolderKanban, Tags, BarChart3, Settings, Briefcase, Calendar, } from 'lucide-react';
import { cn } from '../../utils/index.js';
const colorClasses = {
    cyan: 'group-hover:bg-cyan-500/10 group-hover:text-cyan-500',
    purple: 'group-hover:bg-purple-500/10 group-hover:text-purple-500',
    pink: 'group-hover:bg-pink-500/10 group-hover:text-pink-500',
    orange: 'group-hover:bg-orange-500/10 group-hover:text-orange-500',
    green: 'group-hover:bg-green-500/10 group-hover:text-green-500',
    blue: 'group-hover:bg-blue-500/10 group-hover:text-blue-500',
    yellow: 'group-hover:bg-yellow-500/10 group-hover:text-yellow-500',
    red: 'group-hover:bg-red-500/10 group-hover:text-red-500',
};
const activeColorClasses = {
    cyan: 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20',
    purple: 'bg-purple-500 text-white shadow-lg shadow-purple-500/20',
    pink: 'bg-pink-500 text-white shadow-lg shadow-pink-500/20',
    orange: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20',
    green: 'bg-green-500 text-white shadow-lg shadow-green-500/20',
    blue: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20',
    yellow: 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20',
    red: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
};
const DEFAULT_LABELS = {
    appName: 'Ordo',
    settings: 'Settings',
    today: 'Today',
    tasks: 'Tasks',
    calendar: 'Calendar',
    projects: 'Projects',
    workspaces: 'Workspaces',
    tags: 'Tags',
    analytics: 'Analytics',
};
export function Sidebar({ pathname = '', navItems, renderLink, renderWorkspaceSelector, renderTimerWidget, renderInstallButton, logoHref = '/dashboard', showSettingsButton = false, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    // Default navigation if not provided
    const navigation = navItems || [
        { name: t.today, href: '/dashboard', icon: Home, color: 'cyan' },
        { name: t.tasks, href: '/tasks', icon: CheckSquare, color: 'purple' },
        { name: t.calendar, href: '/calendar', icon: Calendar, color: 'blue' },
        { name: t.projects, href: '/projects', icon: FolderKanban, color: 'pink' },
        { name: t.workspaces, href: '/workspaces', icon: Briefcase, color: 'orange' },
        { name: t.tags, href: '/tags', icon: Tags, color: 'green' },
        { name: t.analytics, href: '/analytics', icon: BarChart3, color: 'cyan' },
    ];
    const isActiveRoute = (href) => {
        return pathname === href || pathname?.startsWith(`${href}/`);
    };
    return (_jsx("aside", { className: "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background hidden lg:block", children: _jsxs("div", { className: "flex h-full flex-col overflow-hidden", children: [_jsx("div", { className: "flex h-16 items-center border-b border-border/50 px-6 shrink-0", children: renderLink({
                        href: logoHref,
                        className: 'flex items-center gap-3 group',
                        children: (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", children: _jsx(CheckSquare, { className: "h-6 w-6" }) }), _jsx("span", { className: "text-2xl font-bold text-foreground", children: t.appName })] })),
                    }) }), _jsxs("div", { className: "flex-1 overflow-y-auto", children: [_jsx("nav", { role: "navigation", "aria-label": "Navegaci\u00F3n principal", className: "space-y-1 px-3 py-4", children: navigation.map((item) => {
                                const isActive = isActiveRoute(item.href);
                                const color = item.color || 'cyan';
                                return (_jsx("div", { children: renderLink({
                                        href: item.href,
                                        className: cn('group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200', isActive
                                            ? activeColorClasses[color]
                                            : cn('text-muted-foreground hover:text-foreground', colorClasses[color])),
                                        children: (_jsxs(_Fragment, { children: [_jsx(item.icon, { className: cn('h-5 w-5 transition-transform duration-200', isActive ? '' : 'group-hover:scale-110') }), item.name] })),
                                    }) }, item.href));
                            }) }), renderTimerWidget && (_jsx("div", { className: "border-t border-border/50 p-3", children: renderTimerWidget() })), renderWorkspaceSelector && (_jsx("div", { className: "border-t border-border/50 p-3", children: renderWorkspaceSelector() })), (showSettingsButton || renderInstallButton) && (_jsxs("div", { className: "border-t border-border/50 p-3 space-y-1", children: [showSettingsButton && renderLink({
                                    href: '/settings',
                                    className: cn('group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200', isActiveRoute('/settings')
                                        ? activeColorClasses.blue
                                        : cn('text-muted-foreground hover:text-foreground', colorClasses.blue)),
                                    children: (_jsxs(_Fragment, { children: [_jsx(Settings, { className: cn('h-5 w-5 transition-transform duration-200', isActiveRoute('/settings') ? '' : 'group-hover:scale-110') }), t.settings] })),
                                }), renderInstallButton?.()] }))] })] }) }));
}
