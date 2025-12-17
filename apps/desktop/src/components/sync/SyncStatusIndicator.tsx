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
  const { t } = (useTranslation as any)();
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
        offline: t("Sync.offline", "Offline"),
        offlineDesc: t("Sync.offlineDesc", "Changes will sync when online"),
        syncing: t("Sync.syncing", "Syncing..."),
        syncingDesc: t("Sync.syncingDesc", "Syncing your changes"),
        error: t("Sync.error", "Sync Error"),
        errorDesc: t("Sync.errorDesc", "Failed to sync. Click to retry"),
        pending: t("Sync.pending", "Pending"),
        pendingDesc: (count: number) =>
          t("Sync.pendingDesc", "{{count}} changes pending", { count }),
        synced: t("Sync.synced", "Synced"),
        syncedDesc: (time: string) =>
          t("Sync.syncedDesc", "Last sync: {{time}}", { time }),
        unknown: t("Sync.unknown", "Unknown"),
        failedChanges: (count: number) =>
          t("Sync.failedChanges", "{{count}} failed changes", { count }),
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
  const { t } = (useTranslation as any)();
  const { isOnline, pendingChanges } = useSyncStore();

  return (
    <OfflineBannerUI
      isOnline={isOnline}
      pendingChanges={pendingChanges}
      labels={{
        message: t(
          "Sync.offlineBanner",
          "You're offline. Changes will sync when you reconnect."
        ),
        pending: t("Sync.pendingChanges", "pending"),
      }}
    />
  );
}
