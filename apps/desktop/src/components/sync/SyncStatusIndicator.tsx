/**
 * Sync Status Indicator Component
 *
 * Shows the current sync status in the UI with visual feedback
 * Uses @ordo-todo/ui components with desktop store integration
 */

import { useEffect } from "react";
import {
  SyncStatusIndicator as SyncStatusIndicatorUI,
  SyncStatusDot as SyncStatusDotUI,
  OfflineBanner as OfflineBannerUI,
} from "@ordo-todo/ui";
import { useSyncStore, useLastSyncFormatted } from "../../stores/sync-store";
import { useTranslation } from "react-i18next";

interface SyncStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SyncStatusIndicator({
  className,
  showLabel = false,
  size = "md",
}: SyncStatusIndicatorProps) {
  const { t } = useTranslation();
  const { status, pendingChanges, failedChanges, isOnline, initialize, forceSync } =
    useSyncStore();
  const lastSyncFormatted = useLastSyncFormatted();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <SyncStatusIndicatorUI
      status={status}
      isOnline={isOnline}
      pendingChanges={pendingChanges}
      failedChanges={failedChanges}
      lastSyncFormatted={lastSyncFormatted}
      onForceSync={forceSync}
      className={className}
      showLabel={showLabel}
      size={size}
      labels={{
        offline: t("sync.offline", "Offline"),
        offlineDesc: t("sync.offlineDesc", "Changes will sync when online"),
        syncing: t("sync.syncing", "Syncing..."),
        syncingDesc: t("sync.syncingDesc", "Syncing your changes"),
        error: t("sync.error", "Sync Error"),
        errorDesc: t("sync.errorDesc", "Failed to sync. Click to retry"),
        pending: t("sync.pending", "Pending"),
        pendingDesc: (count: number) =>
          t("sync.pendingDesc", "{{count}} changes pending", { count }),
        synced: t("sync.synced", "Synced"),
        syncedDesc: (time: string) =>
          t("sync.syncedDesc", "Last sync: {{time}}", { time }),
        unknown: t("sync.unknown", "Unknown"),
        failedChanges: (count: number) =>
          t("sync.failedChanges", "{{count}} failed changes", { count }),
      }}
    />
  );
}

/**
 * Compact sync status for use in tight spaces (e.g., status bar)
 */
export function SyncStatusDot({ className }: { className?: string }) {
  const { status, pendingChanges, isOnline } = useSyncStore();

  return (
    <SyncStatusDotUI
      status={status}
      isOnline={isOnline}
      pendingChanges={pendingChanges}
      className={className}
    />
  );
}

/**
 * Sync status banner for offline mode
 */
export function OfflineBanner() {
  const { t } = useTranslation();
  const { isOnline, pendingChanges } = useSyncStore();

  return (
    <OfflineBannerUI
      isOnline={isOnline}
      pendingChanges={pendingChanges}
      labels={{
        message: t(
          "sync.offlineBanner",
          "You're offline. Changes will sync when you reconnect."
        ),
        pending: t("sync.pendingChanges", "pending"),
      }}
    />
  );
}
