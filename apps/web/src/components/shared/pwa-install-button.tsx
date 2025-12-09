"use client";

import { usePWA } from "@/components/providers/pwa-provider";
import { Button } from "@ordo-todo/ui";
import { Download, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

export function PWAInstallButton() {
  const t = useTranslations('PWAInstallButton');
  const { isInstallable, isInstalled, installPrompt } = usePWA();

  if (isInstalled) {
    return null; // Don't show if already installed
  }

  if (!isInstallable) {
    return null; // Don't show if not installable
  }

  return (
    <Button
      onClick={installPrompt}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Smartphone className="h-4 w-4" />
      <Download className="h-4 w-4" />
      {t('install')}
    </Button>
  );
}
