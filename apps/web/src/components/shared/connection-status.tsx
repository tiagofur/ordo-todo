"use client";

import { useEffect } from "react";
import { useOnlineStatus } from "@/data/hooks/use-online-status.hook";
import { toast } from "sonner";

export function ConnectionStatus() {
  const { isOnline, wasOffline } = useOnlineStatus();

  useEffect(() => {
    if (wasOffline && isOnline) {
      toast.success("Back Online", {
        description: "Your connection has been restored. Syncing your data...",
        duration: 4000,
      });
    } else if (!isOnline) {
      toast.warning("You're Offline", {
        description:
          "Some features may be limited. Your data will sync when you're back online.",
        duration: 5000,
      });
    }
  }, [isOnline, wasOffline]);

  // This component doesn't render anything visible, just handles notifications
  return null;
}
