"use client";

import { useEffect, useState } from "react";
import { useSyncStore, SyncStatus } from "@/stores/sync-store";
import { useTranslations } from "next-intl";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  // Ensure hydration completes before showing dynamic content
  useEffect(() => {
    setMounted(true);
    refreshPendingCount();
  }, [refreshPendingCount]);

  if (!mounted) {
    return null;
  }

  const iconSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;

  const getStatusIcon = () => {
    if (!isOnline) {
      return <CloudOff size={iconSize} className="text-muted-foreground" />;
    }

    if (isSyncing) {
      return <Loader2 size={iconSize} className="text-blue-500 animate-spin" />;
    }

    switch (status) {
      case "error":
        return <AlertCircle size={iconSize} className="text-destructive" />;
      case "idle":
        if (pendingCount > 0) {
          return <RefreshCw size={iconSize} className="text-yellow-500" />;
        }
        return <CheckCircle size={iconSize} className="text-green-500" />;
      default:
        return <Cloud size={iconSize} className="text-muted-foreground" />;
    }
  };

  const getStatusText = (): string => {
    if (!isOnline) {
      return t("offline");
    }

    if (isSyncing) {
      return t("syncing", { progress: syncProgress });
    }

    switch (status) {
      case "error":
        return t("error");
      case "idle":
        if (pendingCount > 0) {
          return t("pending", { count: pendingCount });
        }
        return t("synced");
      default:
        return t("idle");
    }
  };

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          className={cn(
            "relative flex items-center gap-2 px-2",
            !isOnline && "opacity-70",
            className
          )}
          onClick={handleSync}
          disabled={!isOnline || isSyncing}
        >
          {getStatusIcon()}

          {/* Pending count badge */}
          {pendingCount > 0 && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs p-0",
                status === "error"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-yellow-500 text-white"
              )}
            >
              {pendingCount > 99 ? "99+" : pendingCount}
            </Badge>
          )}

          {showLabel && (
            <span className="text-sm text-muted-foreground">
              {getStatusText()}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-64 p-3">
        <div className="flex flex-col gap-1">
          <p className="font-medium">{getStatusText()}</p>
          <p className="text-xs text-muted-foreground">
            {t("lastSync")}: {getLastSyncText()}
          </p>
          {pendingCount > 0 && isOnline && (
            <p className="text-xs text-muted-foreground">{t("clickToSync")}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Minimal sync indicator for compact spaces (e.g., mobile header)
 */
export function SyncStatusDot({ className }: { className?: string }) {
  const { isOnline, status, pendingCount, isSyncing } = useSyncStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getDotColor = () => {
    if (!isOnline) return "bg-gray-400";
    if (isSyncing) return "bg-blue-500 animate-pulse";
    if (status === "error") return "bg-destructive";
    if (pendingCount > 0) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn("w-2 h-2 rounded-full", getDotColor())} />
      {pendingCount > 0 && (
        <span className="absolute -top-2 -right-2 text-[10px] font-bold text-yellow-600">
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      )}
    </div>
  );
}
