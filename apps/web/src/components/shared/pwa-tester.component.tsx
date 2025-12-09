"use client";

import { useState } from "react";
import { usePWA } from "@/components/providers/pwa-provider";
import { Button } from "@ordo-todo/ui";
import { toast } from "sonner";
import { Bell, Download, Keyboard, Wifi, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

export function PWATester() {
  const t = useTranslations('PWATester');
  const { isInstallable, isInstalled, installPrompt, pushNotifications } =
    usePWA();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen for online/offline events
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });

  const handleRequestPermission = async () => {
    const granted = await pushNotifications.requestPermission();
    if (granted) {
      toast.success(t('pushNotifications.granted'));
    } else {
      toast.error(t('pushNotifications.denied'));
    }
  };

  const handleSendTestNotification = () => {
    pushNotifications.sendNotification({
      title: "Test Notification",
      body: "This is a test push notification from Ordo-Todo!",
      icon: "/icons/icon-192.png",
      tag: "test-notification",
    });
    toast.success(t('pushNotifications.testSent'));
  };

  const handleSendBackgroundNotification = async () => {
    await pushNotifications.sendBackgroundNotification({
      title: "Background Test",
      body: "This notification was sent via service worker!",
      icon: "/icons/icon-192.png",
      tag: "background-test",
    });
    toast.success(t('pushNotifications.backgroundSent'));
  };

  const handleInstallPWA = () => {
    installPrompt();
  };

  const handleKeyboardShortcut = () => {
    // Dispatch custom event to trigger keyboard shortcut
    window.dispatchEvent(new CustomEvent("ordo-todo:new-task"));
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5" />
          {t('pwaStatus.title')}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t('pwaStatus.description')}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span>{t('pwaStatus.installable')}:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${isInstallable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {isInstallable ? t('yes') : t('no')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('pwaStatus.installed')}:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${isInstalled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {isInstalled ? t('yes') : t('no')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('pwaStatus.onlineStatus')}:</span>
            <span
              className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {isOnline ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              {isOnline ? t('pwaStatus.online') : t('pwaStatus.offline')}
            </span>
          </div>
        </div>

        {isInstallable && (
          <Button onClick={handleInstallPWA} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {t('pwaStatus.installButton')}
          </Button>
        )}
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('pushNotifications.title')}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t('pushNotifications.description')}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span>{t('pushNotifications.supported')}:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${pushNotifications.isSupported ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {pushNotifications.isSupported ? t('yes') : t('no')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('pushNotifications.permission')}:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${
                pushNotifications.permission === "granted"
                  ? "bg-green-100 text-green-800"
                  : pushNotifications.permission === "denied"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {pushNotifications.permission}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('pushNotifications.subscribed')}:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${pushNotifications.isSubscribed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {pushNotifications.isSubscribed ? t('yes') : t('no')}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleRequestPermission}
            disabled={!pushNotifications.isSupported}
            variant="outline"
            className="w-full"
          >
            {t('pushNotifications.requestPermission')}
          </Button>

          <Button
            onClick={handleSendTestNotification}
            disabled={pushNotifications.permission !== "granted"}
            className="w-full"
          >
            {t('pushNotifications.sendBrowser')}
          </Button>

          <Button
            onClick={handleSendBackgroundNotification}
            disabled={!pushNotifications.registration}
            variant="outline"
            className="w-full"
          >
            {t('pushNotifications.sendBackground')}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Keyboard className="h-5 w-5" />
          {t('keyboardShortcuts.title')}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t('keyboardShortcuts.description')}
        </p>

        <div className="text-sm text-muted-foreground mb-4">
          {t('keyboardShortcuts.available')}
          <ul className="mt-2 space-y-1">
            <li>
              •{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+N</kbd>{" "}
              - {t('keyboardShortcuts.newTask')}
            </li>
            <li>
              •{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                Ctrl+Shift+T
              </kbd>{" "}
              - {t('keyboardShortcuts.quickTimer')}
            </li>
            <li>
              •{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd>{" "}
              - {t('keyboardShortcuts.search')}
            </li>
            <li>
              •{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                Ctrl+Shift+I
              </kbd>{" "}
              - {t('keyboardShortcuts.installPwa')}
            </li>
          </ul>
        </div>

        <Button
          onClick={handleKeyboardShortcut}
          variant="outline"
          className="w-full"
        >
          {t('keyboardShortcuts.triggerNewTask')}
        </Button>
      </div>
    </div>
  );
}
