"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePushNotifications } from "@/data/hooks/use-push-notifications.hook";
import {
  useKeyboardShortcuts,
  TASK_SHORTCUTS,
  NAVIGATION_SHORTCUTS,
} from "@/data/hooks/use-keyboard-shortcuts.hook";
import { ConnectionStatus } from "@/components/shared/connection-status";
import { toast } from "sonner";

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: () => void;
  pushNotifications: ReturnType<typeof usePushNotifications>;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const pushNotifications = usePushNotifications();

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA] Before install prompt fired");
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log("[PWA] App installed");
      setIsInstalled(true);
      setIsInstallable(false);
      toast.success("App Installed!", {
        description: "Ordo-Todo has been installed on your device.",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if already installed
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Handle keyboard shortcuts
  useKeyboardShortcuts([
    ...TASK_SHORTCUTS,
    ...NAVIGATION_SHORTCUTS,
    {
      key: "i",
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        if (isInstallable) {
          installPrompt();
        }
      },
      description: "Install PWA",
      preventDefault: true,
    },
  ]);

  // Listen for keyboard shortcut events
  useEffect(() => {
    const handleNewTask = () => {
      toast.info("New Task Shortcut", {
        description: "Ctrl+N pressed - Opening task creation...",
      });
      // Dispatch to your task creation logic
      window.dispatchEvent(new CustomEvent("ordo-todo:create-task"));
    };

    const handleQuickTimer = () => {
      toast.info("Quick Timer Shortcut", {
        description: "Ctrl+Shift+T pressed - Starting timer...",
      });
      window.dispatchEvent(new CustomEvent("ordo-todo:start-timer"));
    };

    const handleSearch = () => {
      toast.info("Search Shortcut", {
        description: "Ctrl+K pressed - Opening search...",
      });
      window.dispatchEvent(new CustomEvent("ordo-todo:open-search"));
    };

    window.addEventListener("ordo-todo:new-task", handleNewTask);
    window.addEventListener("ordo-todo:quick-timer", handleQuickTimer);
    window.addEventListener("ordo-todo:search", handleSearch);

    return () => {
      window.removeEventListener("ordo-todo:new-task", handleNewTask);
      window.removeEventListener("ordo-todo:quick-timer", handleQuickTimer);
      window.removeEventListener("ordo-todo:search", handleSearch);
    };
  }, []);

  const installPrompt = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log("[PWA] Install outcome:", outcome);
    setDeferredPrompt(null);
    setIsInstallable(false);

    if (outcome === "accepted") {
      toast.success("Installing Ordo-Todo...", {
        description: "The app is being installed on your device.",
      });
    }
  };

  const value: PWAContextType = {
    isInstallable,
    isInstalled,
    installPrompt,
    pushNotifications,
  };

  return (
    <PWAContext.Provider value={value}>
      <ConnectionStatus />
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
