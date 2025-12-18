import { type ReactNode, type ElementType } from 'react';
import type { NavItem } from './sidebar.js';
export type { NavItem };
interface MobileSidebarProps {
    /** Controls sheet open/close state */
    open: boolean;
    /** Called when sheet should close */
    onOpenChange: (open: boolean) => void;
    /** Current pathname to determine active state */
    pathname?: string;
    /** Navigation items */
    navItems?: NavItem[];
    /** Render a Link component (for Next.js or React Router) */
    renderLink: (props: {
        href: string;
        className: string;
        children: ReactNode;
        onClick?: () => void;
    }) => ReactNode;
    /** Workspace selector component */
    renderWorkspaceSelector?: () => ReactNode;
    /** Timer widget component */
    renderTimerWidget?: () => ReactNode;
    /** Install PWA button renderer */
    renderInstallButton?: () => ReactNode;
    /** Logo click handler or href */
    logoHref?: string;
    /** Logo icon component */
    LogoIcon?: ElementType;
    /** Whether to show the settings button (default: false) */
    showSettingsButton?: boolean;
    labels?: {
        appName?: string;
        settings?: string;
    };
}
export declare function MobileSidebar({ open, onOpenChange, pathname, navItems, renderLink, renderWorkspaceSelector, renderTimerWidget, renderInstallButton, logoHref, LogoIcon, showSettingsButton, labels, }: MobileSidebarProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=mobile-sidebar.d.ts.map