import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: any;
    sound?: boolean;
    priority?: 'default' | 'high' | 'low' | 'min' | 'max';
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

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
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
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
                    sound: payload.sound !== false,
                    priority: payload.priority || 'default',
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
        trigger: Notifications.NotificationTrigger
    ) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: payload.title,
                    body: payload.body,
                    data: payload.data || {},
                    sound: payload.sound !== false,
                    priority: payload.priority || 'default',
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

    if (Platform.OS === 'ios') {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
        // For Android and web
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
    }

    return token;
}