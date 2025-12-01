"use client";

import { useState } from "react";
import { usePWA } from "@/components/providers/pwa-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Download, Keyboard, Wifi, WifiOff } from "lucide-react";

export function PWATester() {
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
      toast.success("Notification permission granted!");
    } else {
      toast.error("Notification permission denied");
    }
  };

  const handleSendTestNotification = () => {
    pushNotifications.sendNotification({
      title: "Test Notification",
      body: "This is a test push notification from Ordo-Todo!",
      icon: "/icons/icon-192.png",
      tag: "test-notification",
    });
    toast.success("Test notification sent!");
  };

  const handleSendBackgroundNotification = async () => {
    await pushNotifications.sendBackgroundNotification({
      title: "Background Test",
      body: "This notification was sent via service worker!",
      icon: "/icons/icon-192.png",
      tag: "background-test",
    });
    toast.success("Background notification sent!");
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
          PWA Status
        </h2>
        <p className="text-muted-foreground mb-4">
          Test Progressive Web App features and installation
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span>Installable:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${isInstallable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {isInstallable ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Installed:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${isInstalled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {isInstalled ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Online Status:</span>
            <span
              className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {isOnline ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {isInstallable && (
          <Button onClick={handleInstallPWA} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Install PWA
          </Button>
        )}
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </h2>
        <p className="text-muted-foreground mb-4">
          Test browser and service worker notifications
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span>Supported:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${pushNotifications.isSupported ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {pushNotifications.isSupported ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Permission:</span>
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
            <span>Subscribed:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${pushNotifications.isSubscribed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
            >
              {pushNotifications.isSubscribed ? "Yes" : "No"}
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
            Request Permission
          </Button>

          <Button
            onClick={handleSendTestNotification}
            disabled={pushNotifications.permission !== "granted"}
            className="w-full"
          >
            Send Browser Notification
          </Button>

          <Button
            onClick={handleSendBackgroundNotification}
            disabled={!pushNotifications.registration}
            variant="outline"
            className="w-full"
          >
            Send Background Notification
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Keyboard className="h-5 w-5" />
          Keyboard Shortcuts
        </h2>
        <p className="text-muted-foreground mb-4">
          Test keyboard shortcuts and custom events
        </p>

        <div className="text-sm text-muted-foreground mb-4">
          Available shortcuts:
          <ul className="mt-2 space-y-1">
            <li>
              •{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+N</kbd>{" "}
              - New Task
            </li>
            <li>
              •{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                Ctrl+Shift+T
              </kbd>{" "}
              - Quick Timer
            </li>
            <li>
              •{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd>{" "}
              - Search
            </li>
            <li>
              •{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                Ctrl+Shift+I
              </kbd>{" "}
              - Install PWA
            </li>
          </ul>
        </div>

        <Button
          onClick={handleKeyboardShortcut}
          variant="outline"
          className="w-full"
        >
          Trigger New Task Shortcut
        </Button>
      </div>
    </div>
  );
}
