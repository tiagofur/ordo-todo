/**
 * Push Notifications Provider for Mobile
 *
 * Initializes and configures push notifications for the mobile app.
 * Should be placed at the root of the app to ensure notifications
 * are configured early in the app lifecycle.
 *
 * @example
 * ```tsx
 * import { PushNotificationsProvider } from '@/app/providers/push-notifications-provider';
 *
 * export default function App() {
 *   return (
 *     <PushNotificationsProvider>
 *       <AppNavigator />
 *     </PushNotificationsProvider>
 *   );
 * }
 * ```
 */

import React, { useEffect, createContext, useContext } from "react";
import { usePushNotifications } from "../lib/hooks/use-push-notifications.hook";
import { apiClient } from "../lib/api-client";

interface PushNotificationsContextType {
  isSupported: boolean;
  permission: any;
  expoPushToken: string | null;
  requestPermission: () => Promise<boolean>;
}

const PushNotificationsContext =
  createContext<PushNotificationsContextType | null>(null);

export function PushNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSupported, permission, expoPushToken, requestPermission } =
    usePushNotifications();

  // Subscribe to push notifications when token is available
  useEffect(() => {
    const subscribeToBackend = async () => {
      if (!expoPushToken || !permission?.granted) return;

      try {
        // Call backend to register push token
        if ((apiClient as any).registerPushToken) {
          await (apiClient as any).registerPushToken({
            token: expoPushToken,
            platform: "expo",
          });
          console.log("Push token registered on backend:", expoPushToken);
        }
      } catch (error) {
        console.error("Error registering push token:", error);
      }
    };

    subscribeToBackend();
  }, [expoPushToken, permission]);

  const value: PushNotificationsContextType = {
    isSupported,
    permission,
    expoPushToken,
    requestPermission,
  };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

export function usePushNotificationsContext() {
  const context = useContext(PushNotificationsContext);
  if (!context) {
    throw new Error(
      "usePushNotificationsContext must be used within PushNotificationsProvider",
    );
  }
  return context;
}
