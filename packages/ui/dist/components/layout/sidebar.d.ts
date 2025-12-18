import { type ReactNode, type ElementType } from 'react';
export interface NavItem {
    name: string;
    href: string;
    icon: ElementType;
    color?: 'cyan' | 'purple' | 'pink' | 'orange' | 'green' | 'blue' | 'yellow' | 'red';
}
interface SidebarProps {
    /** Current pathname to determine active state */
    pathname?: string;
    /** Navigation items */
    navItems?: NavItem[];
    /** Render a Link component (for Next.js or React Router) */
    renderLink: (props: {
        href: string;
        className: string;
        children: ReactNode;
    }) => ReactNode;
    /** Workspace selector component */
    renderWorkspaceSelector?: () => ReactNode;
    /** Timer widget component */
    renderTimerWidget?: () => ReactNode;
    /** Install PWA button renderer */
    renderInstallButton?: () => ReactNode;
    /** Called when user clicks settings */
    onSettingsClick?: () => void;
    /** Logo click handler or href */
    logoHref?: string;
    /** Whether to show the settings button (default: false) */
    showSettingsButton?: boolean;
    labels?: {
        appName?: string;
        settings?: string;
        today?: string;
        tasks?: string;
        calendar?: string;
        projects?: string;
        workspaces?: string;
        tags?: string;
        analytics?: string;
    };
}
export declare function Sidebar({ pathname, navItems, renderLink, renderWorkspaceSelector, renderTimerWidget, renderInstallButton, logoHref, showSettingsButton, labels, }: SidebarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=sidebar.d.ts.map