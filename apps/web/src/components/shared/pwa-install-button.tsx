"use client";

import { usePWA } from "@/components/providers/pwa-provider";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

export function PWAInstallButton() {
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
      Install App
    </Button>
  );
}
