import React, { createContext, useContext, ReactNode } from "react";
import { usePushNotifications } from "../hooks/use-push-notifications.hook";
import { useQuickActions } from "../hooks/use-quick-actions.hook";
import { useHaptics } from "../hooks/use-haptics.hook";
import { useOnlineStatus } from "../hooks/use-online-status.hook";

interface MobileFeaturesContextType {
  pushNotifications: ReturnType<typeof usePushNotifications>;
  quickActions: ReturnType<typeof useQuickActions>;
  haptics: ReturnType<typeof useHaptics>;
  onlineStatus: ReturnType<typeof useOnlineStatus>;
}

const MobileFeaturesContext = createContext<MobileFeaturesContextType | null>(
  null
);

export function MobileFeaturesProvider({ children }: { children: ReactNode }) {
  const pushNotifications = usePushNotifications();
  const quickActions = useQuickActions();
  const haptics = useHaptics();
  const onlineStatus = useOnlineStatus();

  // Handle quick action events
  React.useEffect(() => {
    const handleQuickAction = (event: any) => {
      const { action } = event.detail || event;

      switch (action) {
        case "new-task":
          // Trigger haptic feedback
          haptics.trigger("success");
          // Send notification
          pushNotifications.sendNotification({
            title: "New Task",
            body: "Quick action: Create new task",
            data: { action: "new-task" },
          });
          break;
        case "quick-timer":
          haptics.trigger("success");
          pushNotifications.sendNotification({
            title: "Timer Started",
            body: "Pomodoro timer activated via quick action",
            data: { action: "quick-timer" },
          });
          break;
        case "search":
          haptics.trigger("light");
          break;
      }
    };

    // Listen for custom events (you might want to use a proper event system)
    window.addEventListener?.("ordo-todo:quick-action", handleQuickAction);

    return () => {
      window.removeEventListener?.("ordo-todo:quick-action", handleQuickAction);
    };
  }, [haptics, pushNotifications]);

  // Handle online/offline status changes
  React.useEffect(() => {
    if (onlineStatus.wasOffline && onlineStatus.isOnline) {
      // Back online - trigger sync
      haptics.trigger("success");
      pushNotifications.sendNotification({
        title: "Back Online",
        body: "Your data is being synchronized",
        data: { action: "sync" },
      });
    } else if (!onlineStatus.isOnline) {
      // Went offline
      haptics.trigger("warning");
    }
  }, [
    onlineStatus.isOnline,
    onlineStatus.wasOffline,
    haptics,
    pushNotifications,
  ]);

  const value: MobileFeaturesContextType = {
    pushNotifications,
    quickActions,
    haptics,
    onlineStatus,
  };

  return (
    <MobileFeaturesContext.Provider value={value}>
      {children}
    </MobileFeaturesContext.Provider>
  );
}

export function useMobileFeatures() {
  const context = useContext(MobileFeaturesContext);
  if (!context) {
    throw new Error(
      "useMobileFeatures must be used within a MobileFeaturesProvider"
    );
  }
  return context;
}
