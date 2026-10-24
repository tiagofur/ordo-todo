/**
 * Push Notifications Hook for Mobile (Expo)
 *
 * Uses expo-notifications for native push notifications on iOS and Android.
 * This hook provides methods to request permissions, subscribe/unsubscribe,
 * and handle incoming notifications.
 *
 * @example
 * ```tsx
 * import { usePushNotifications } from '@/app/lib/hooks/use-push-notifications.hook';
 *
 * function MyComponent() {
 *   const { requestPermission, sendNotification } = usePushNotifications();
 *
 *   const handleEnable = async () => {
 *     const granted = await requestPermission();
 *     if (granted) {
 *       console.log('Permission granted!');
 *     }
 *   };
 *
 *   // ...
 * }
 * ```
 */

import { useState, useEffect, useCallback } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  sound?: string | boolean;
  badge?: number;
  data?: Record<string, unknown>;
  categoryId?: string;
}

/**
 * Configure notification handler for foreground and background notifications
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Hook to manage native push notifications on mobile
 */
export function usePushNotifications() {
  const isSupported = true;
  const [permission, setPermission] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);

  // Check if push notifications are supported
  // replaced with implicit true


  // Get current permission status
  useEffect(() => {
    const getPermission = async () => {
      if (!isSupported) return;

      const status = await Notifications.getPermissionsAsync();
      setPermission(status);
    };

    getPermission();
  }, [isSupported]);

  // Get Expo push token
  useEffect(() => {
    const getToken = async () => {
      if (permission?.granted !== true) return;

      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PROJECT_ID || "",
        });
        setExpoPushToken(token.data);
        console.log("Expo push token:", token.data);
      } catch (error) {
        console.error("Error getting Expo push token:", error);
      }
    };

    getToken();
  }, [permission]);

  // Listen for notification events
  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        setNotification(notification);
      },
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification response received:", response);
        const { notification } = response;
        // Handle notification tap here (e.g., navigate to specific screen)
        if (notification.request.content.data) {
          console.log("Notification data:", notification.request.content.data);
        }
      },
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  // Request permission for notifications
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const settings = await Notifications.getPermissionsAsync();
      let finalStatus = settings.status;

      if (settings.status !== "granted") {
        const newSettings = await Notifications.requestPermissionsAsync();
        finalStatus = newSettings.status;
        setPermission(newSettings);
      } else {
        setPermission(settings);
      }

      if (finalStatus === "granted") {
        console.log("Permission granted");
        return true;
      } else {
        console.log("Permission not granted");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  // Send a local notification (for testing)
  const sendNotification = useCallback(
    async (payload: PushNotificationPayload) => {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: payload.title,
            body: payload.body,
            sound: payload.sound,
            badge: payload.badge,
            data: payload.data,
            categoryIdentifier: payload.categoryId,
          },
          trigger: null, // Send immediately
        });
        console.log("Local notification sent:", payload);
      } catch (error) {
        console.error("Error sending local notification:", error);
      }
    },
    [],
  );

  // Cancel a specific notification
  const cancelNotification = useCallback(async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log("Notification canceled:", notificationId);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications canceled");
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  }, []);

  // Set application badge number
  const setBadgeNumber = useCallback(async (number: number) => {
    if (Platform.OS === "android") {
      console.log("Badge number not supported on Android");
      return;
    }

    try {
      await Notifications.setBadgeCountAsync(number);
      console.log("Badge number set:", number);
    } catch (error) {
      console.error("Error setting badge number:", error);
    }
  }, []);

  // Get application badge number
  const getBadgeNumber = useCallback(async () => {
    if (Platform.OS === "android") return 0;

    try {
      const badge = await Notifications.getBadgeCountAsync();
      console.log("Badge number:", badge);
      return badge;
    } catch (error) {
      console.error("Error getting badge number:", error);
      return 0;
    }
  }, []);

  return {
    // State
    isSupported,
    permission,
    expoPushToken,
    notification,

    // Methods
    requestPermission,
    sendNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeNumber,
    getBadgeNumber,
  };
}
