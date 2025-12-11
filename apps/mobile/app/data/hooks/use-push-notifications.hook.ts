import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: boolean;
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
    const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
        });

        // Listen for incoming notifications
        notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
            console.log('[PushNotification] Received:', notification);
            setNotification(notification);
        });

        // Listen for notification responses (when user taps notification)
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
            console.log('[PushNotification] Response:', response);
            const { notification: { request: { content: { data } } } } = response;

            // Handle notification tap based on data
            if (data?.action) {
                // Dispatch custom event for the app to handle
                // You might want to use a navigation library or context here
                console.log('[PushNotification] Action:', data.action);
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const sendNotification = async (payload: PushNotificationPayload) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: payload.title,
                    body: payload.body,
                    data: payload.data || {},
                    sound: payload.sound !== false ? 'default' : undefined,
                },
                trigger: null, // Send immediately
            });
            console.log('[PushNotification] Sent:', payload.title);
        } catch (error) {
            console.error('[PushNotification] Send failed:', error);
        }
    };

    const scheduleNotification = async (
        payload: PushNotificationPayload,
        trigger: Notifications.NotificationTriggerInput
    ) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: payload.title,
                    body: payload.body,
                    data: payload.data || {},
                    sound: payload.sound !== false ? 'default' : undefined,
                },
                trigger,
            });
            console.log('[PushNotification] Scheduled:', payload.title);
        } catch (error) {
            console.error('[PushNotification] Schedule failed:', error);
        }
    };

    const cancelAllNotifications = async () => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('[PushNotification] All notifications cancelled');
        } catch (error) {
            console.error('[PushNotification] Cancel failed:', error);
        }
    };

    return {
        expoPushToken,
        notification,
        sendNotification,
        scheduleNotification,
        cancelAllNotifications,
    };
}

async function registerForPushNotificationsAsync() {
    let token: string | undefined;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#4F46E5',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('[PushNotification] Failed to get push token - permission not granted');
        return;
    }

    try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
    } catch (error) {
        console.error('[PushNotification] Error getting push token:', error);
    }

    return token;
}