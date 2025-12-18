import { type ReactNode } from 'react';
interface TopBarUser {
    name?: string | null;
    email?: string | null;
    level?: number;
    xp?: number;
    image?: string | null;
}
interface TopBarProps {
    user?: TopBarUser | null;
    onLogout?: () => void;
    onSearchChange?: (query: string) => void;
    /** Click handler for command palette style search */
    onSearchClick?: () => void;
    onAICopilotClick?: () => void;
    onProfileClick?: () => void;
    onSettingsClick?: () => void;
    onMenuClick?: () => void;
    /** Notifications component */
    renderNotifications?: () => ReactNode;
    /** Sync status indicator component */
    renderSyncStatus?: () => ReactNode;
    labels?: {
        searchPlaceholder?: string;
        myAccount?: string;
        profile?: string;
        settings?: string;
        logout?: string;
        aiCopilot?: string;
        level?: string;
        menu?: string;
    };
}
export declare function TopBar({ user, onLogout, onSearchChange, onSearchClick, onAICopilotClick, onProfileClick, onSettingsClick, onMenuClick, renderNotifications, renderSyncStatus, labels, }: TopBarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=topbar.d.ts.map