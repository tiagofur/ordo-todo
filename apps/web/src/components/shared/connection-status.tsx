"use client";

import { useEffect } from "react";
import { useOnlineStatus } from "@/data/hooks/use-online-status.hook";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function ConnectionStatus() {
  const t = useTranslations('ConnectionStatus');
  const { isOnline, wasOffline } = useOnlineStatus();

  useEffect(() => {
    if (wasOffline && isOnline) {
      toast.success(t('backOnline.title'), {
        description: t('backOnline.description'),
        duration: 4000,
      });
    } else if (!isOnline) {
      toast.warning(t('offline.title'), {
        description: t('offline.description'),
        duration: 5000,
      });
    }
  }, [isOnline, wasOffline, t]);

  // This component doesn't render anything visible, just handles notifications
  return null;
}
