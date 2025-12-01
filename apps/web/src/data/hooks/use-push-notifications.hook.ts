'use client';

import { useEffect, useState, useCallback } from 'react';

export interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
}

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: NotificationAction[];
}

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    // Check if push notifications are supported
    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    // Register service worker - DISABLED for now to avoid issues
    /*
    useEffect(() => {
        if (!isSupported) return;

        const registerSW = async () => {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js');
                setRegistration(reg);
                console.log('Service Worker registered:', reg);
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        };

        registerSW();
    }, [isSupported]);
    */

    // Request permission for notifications
    const requestPermission = useCallback(async () => {
        if (!isSupported) return false;

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }, [isSupported]);

    // Subscribe to push notifications
    const subscribe = useCallback(async (vapidKey?: string) => {
        if (!registration || permission !== 'granted') return null;

        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined
            });

            setIsSubscribed(true);
            console.log('Push subscription successful:', subscription);
            return subscription;
        } catch (error) {
            console.error('Push subscription failed:', error);
            return null;
        }
    }, [registration, permission]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        if (!registration) return;

        try {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                setIsSubscribed(false);
                console.log('Push unsubscription successful');
            }
        } catch (error) {
            console.error('Push unsubscription failed:', error);
        }
    }, [registration]);

    // Send a test notification
    const sendNotification = useCallback((payload: PushNotificationPayload) => {
        if (permission !== 'granted') return;

        const notification = new Notification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/icons/icon-192.png',
            badge: payload.badge || '/icons/icon-192.png',
            tag: payload.tag,
            data: payload.data,
            requireInteraction: false
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        return notification;
    }, [permission]);

    // Send notification through service worker (for background notifications)
    const sendBackgroundNotification = useCallback(async (payload: PushNotificationPayload) => {
        if (!registration) return;

        try {
            await registration.showNotification(payload.title, {
                body: payload.body,
                icon: payload.icon || '/icons/icon-192.png',
                badge: payload.badge || '/icons/icon-192.png',
                tag: payload.tag,
                data: payload.data,
                // Note: vibrate is only available in service worker notifications, not browser notifications
            });
        } catch (error) {
            console.error('Background notification failed:', error);
        }
    }, [registration]);

    return {
        isSupported,
        isSubscribed,
        permission,
        registration,
        requestPermission,
        subscribe,
        unsubscribe,
        sendNotification,
        sendBackgroundNotification
    };
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}