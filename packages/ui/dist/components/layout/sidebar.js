import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Home, CheckSquare, FolderKanban, Tags, BarChart3, Settings, Briefcase, Calendar, } from 'lucide-react';
import { cn } from '../../utils/index.js';
const colorClasses = {
    cyan: 'group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950/40 group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    purple: 'group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40 group-hover:text-purple-600 dark:group-hover:text-purple-400',
    pink: 'group-hover:bg-pink-50 dark:group-hover:bg-pink-950/40 group-hover:text-pink-600 dark:group-hover:text-pink-400',
    orange: 'group-hover:bg-orange-50 dark:group-hover:bg-orange-950/40 group-hover:text-orange-600 dark:group-hover:text-orange-400',
    green: 'group-hover:bg-green-50 dark:group-hover:bg-green-950/40 group-hover:text-green-600 dark:group-hover:text-green-400',
    emerald: 'group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    blue: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-blue-600 dark:group-hover:text-blue-400',
    yellow: 'group-hover:bg-yellow-50 dark:group-hover:bg-yellow-950/40 group-hover:text-yellow-600 dark:group-hover:text-yellow-400',
    red: 'group-hover:bg-red-50 dark:group-hover:bg-red-950/40 group-hover:text-red-600 dark:group-hover:text-red-400',
};
const activeColorClasses = {
    cyan: 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/25 font-semibold',
    purple: 'bg-purple-500 text-white shadow-sm shadow-purple-500/25 font-semibold',
    pink: 'bg-pink-500 text-white shadow-sm shadow-pink-500/25 font-semibold',
    orange: 'bg-orange-500 text-white shadow-sm shadow-orange-500/25 font-semibold',
    green: 'bg-green-500 text-white shadow-sm shadow-green-500/25 font-semibold',
    emerald: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 font-semibold',
    blue: 'bg-blue-500 text-white shadow-sm shadow-blue-500/25 font-semibold',
    yellow: 'bg-yellow-500 text-white shadow-sm shadow-yellow-500/25 font-semibold',
    red: 'bg-red-500 text-white shadow-sm shadow-red-500/25 font-semibold',
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
export function Sidebar({ pathname = '', navItems, navSections, collapsed = false, renderLink, renderWorkspaceSelector, renderTimerWidget, renderInstallButton, logoHref = '/dashboard', showSettingsButton = false, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    // Build sections: prefer navSections, fall back to navItems as a single section
    const sections = navSections || [{
            items: navItems || [
                { name: t.today, href: '/dashboard', icon: Home, color: 'cyan' },
                { name: t.tasks, href: '/tasks', icon: CheckSquare, color: 'purple' },
                { name: t.calendar, href: '/calendar', icon: Calendar, color: 'blue' },
                { name: t.projects, href: '/projects', icon: FolderKanban, color: 'pink' },
                { name: t.workspaces, href: '/workspaces', icon: Briefcase, color: 'orange' },
                { name: t.tags, href: '/tags', icon: Tags, color: 'green' },
                { name: t.analytics, href: '/analytics', icon: BarChart3, color: 'cyan' },
            ],
        }];
    const isActiveRoute = (href) => {
        return pathname === href || pathname?.startsWith(`${href}/`);
    };
    return (_jsx("aside", { className: cn("fixed left-0 top-0 z-40 h-screen border-r border-border bg-background hidden lg:block transition-all duration-300", collapsed ? "w-20" : "w-64"), children: _jsxs("div", { className: "flex h-full flex-col overflow-hidden", children: [_jsx("div", { className: cn("flex h-16 items-center border-b border-border/50 shrink-0", collapsed ? "justify-center px-2" : "px-6"), children: renderLink({
                        href: logoHref,
                        className: 'flex items-center gap-3 group',
                        children: (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500 text-white shadow-sm shadow-purple-500/20 transition-transform duration-300 group-hover:scale-105", children: _jsx(CheckSquare, { className: "h-6 w-6" }) }), !collapsed && (_jsx("span", { className: "text-2xl font-bold text-foreground tracking-tight", children: t.appName }))] })),
                    }) }), _jsxs("div", { className: "flex-1 overflow-y-auto", children: [_jsx("nav", { role: "navigation", "aria-label": "Navegaci\u00F3n principal", className: cn("py-4", collapsed ? "px-2" : "px-3"), children: sections.map((section, sectionIndex) => (_jsxs("div", { className: cn(sectionIndex > 0 && 'mt-4'), children: [section.label && !collapsed && (_jsx("div", { className: "px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70", children: section.label })), _jsx("div", { className: "space-y-1", children: section.items.map((item) => {
                                            const isActive = isActiveRoute(item.href);
                                            const itemColor = item.color || 'cyan';
                                            const activeClass = activeColorClasses[itemColor] || activeColorClasses.cyan;
                                            const hoverClass = colorClasses[itemColor] || colorClasses.cyan;
                                            return (_jsx("div", { children: renderLink({
                                                    href: item.href,
                                                    className: cn('group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200', collapsed ? 'justify-center px-2' : 'px-3', isActive
                                                        ? activeClass
                                                        : cn('text-muted-foreground hover:text-foreground', hoverClass)),
                                                    children: (_jsxs(_Fragment, { children: [_jsx(item.icon, { className: cn('h-5 w-5 shrink-0 transition-transform duration-200', isActive ? 'text-white' : 'text-muted-foreground group-hover:scale-110') }), !collapsed && _jsx("span", { children: item.name })] })),
                                                }) }, item.href));
                                        }) })] }, section.label || sectionIndex))) }), renderTimerWidget && !collapsed && (_jsx("div", { className: "border-t border-border/50 p-3", children: renderTimerWidget() })), renderWorkspaceSelector && !collapsed && (_jsx("div", { className: "border-t border-border/50 p-3", children: renderWorkspaceSelector() })), (showSettingsButton || renderInstallButton) && (_jsxs("div", { className: "border-t border-border/50 p-3 space-y-1", children: [showSettingsButton && renderLink({
                                    href: '/settings',
                                    className: cn('group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200', collapsed ? 'justify-center px-2' : 'px-3', isActiveRoute('/settings')
                                        ? activeColorClasses.blue
                                        : cn('text-muted-foreground hover:text-foreground', colorClasses.blue)),
                                    children: (_jsxs(_Fragment, { children: [_jsx(Settings, { className: cn('h-5 w-5 shrink-0 transition-transform duration-200', isActiveRoute('/settings') ? 'text-white' : 'text-muted-foreground group-hover:scale-110') }), !collapsed && _jsx("span", { children: t.settings })] })),
                                }), !collapsed && renderInstallButton?.()] }))] })] }) }));
}
