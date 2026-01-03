"use client";

import { useEffect, useState } from "react";
import { SyncStatusIndicator as UISyncStatusIndicator, SyncStatusDot as UISyncStatusDot } from "@ordo-todo/ui";
import { useSyncStore } from "@/stores/sync-store";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("SyncStatus");
  const [mounted, setMounted] = useState(false);

  const {
    isOnline,
    status,
    pendingCount,
    lastSyncTime,
    isSyncing,
    syncProgress,
    syncAll,
    refreshPendingCount,
  } = useSyncStore();

  useEffect(() => {
    setMounted(true);
    refreshPendingCount();
  }, [refreshPendingCount]);

  if (!mounted) {
    return null;
  }

  const getLastSyncText = (): string => {
    if (!lastSyncTime) {
      return t("neverSynced");
    }

    const now = Date.now();
    const diff = now - lastSyncTime;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return t("justNow");
    }
    if (minutes < 60) {
      return t("minutesAgo", { count: minutes });
    }
    if (hours < 24) {
      return t("hoursAgo", { count: hours });
    }

    return new Date(lastSyncTime).toLocaleDateString();
  };

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    await syncAll();
  };

  // Map store status to UI status
  let uiStatus: 'idle' | 'syncing' | 'error' | 'offline' = 'idle';
  if (!isOnline) uiStatus = 'offline';
  else if (isSyncing) uiStatus = 'syncing';
  else if (status === 'error') uiStatus = 'error';
  else uiStatus = 'idle';

  return (
    <UISyncStatusIndicator
      status={uiStatus}
      isOnline={isOnline}
      pendingChanges={pendingCount}
      lastSyncFormatted={getLastSyncText()}
      onForceSync={handleSync}
      className={className}
      showLabel={showLabel}
      size={size}
      labels={{
        offline: t("offline"),
        syncing: t("syncing", { progress: syncProgress }),
        error: t("error"),
        pending: t("pending", { count: pendingCount }),
        synced: t("synced"),
        unknown: t("idle"),
        syncedDesc: (time) => `${t("lastSync")}: ${time}`,
      }}
    />
  );
}

export function SyncStatusDot({ className }: { className?: string }) {
  const { isOnline, status, pendingCount, isSyncing } = useSyncStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  let uiStatus: 'idle' | 'syncing' | 'error' | 'offline' = 'idle';
  if (!isOnline) uiStatus = 'offline';
  else if (isSyncing) uiStatus = 'syncing';
  else if (status === 'error') uiStatus = 'error';
  else uiStatus = 'idle';

  return (
    <UISyncStatusDot
      status={uiStatus}
      isOnline={isOnline}
      pendingChanges={pendingCount}
      className={className}
    />
  );
}
