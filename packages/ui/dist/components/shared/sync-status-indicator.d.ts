type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';
interface SyncStatusIndicatorProps {
    status: SyncStatus;
    isOnline?: boolean;
    pendingChanges?: number;
    failedChanges?: number;
    lastSyncFormatted?: string;
    onForceSync?: () => void;
    className?: string;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    labels?: {
        offline?: string;
        offlineDesc?: string;
        syncing?: string;
        syncingDesc?: string;
        error?: string;
        errorDesc?: string;
        pending?: string;
        pendingDesc?: (count: number) => string;
        synced?: string;
        syncedDesc?: (time: string) => string;
        unknown?: string;
        failedChanges?: (count: number) => string;
    };
}
export declare function SyncStatusIndicator({ status, isOnline, pendingChanges, failedChanges, lastSyncFormatted, onForceSync, className, showLabel, size, labels, }: SyncStatusIndicatorProps): import("react/jsx-runtime").JSX.Element;
/**
 * Compact sync status for use in tight spaces (e.g., status bar)
 */
interface SyncStatusDotProps {
    status: SyncStatus;
    isOnline?: boolean;
    pendingChanges?: number;
    className?: string;
}
export declare function SyncStatusDot({ status, isOnline, pendingChanges, className, }: SyncStatusDotProps): import("react/jsx-runtime").JSX.Element;
/**
 * Sync status banner for offline mode
 */
interface OfflineBannerProps {
    isOnline: boolean;
    pendingChanges?: number;
    labels?: {
        message?: string;
        pending?: string;
    };
}
export declare function OfflineBanner({ isOnline, pendingChanges, labels, }: OfflineBannerProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=sync-status-indicator.d.ts.map