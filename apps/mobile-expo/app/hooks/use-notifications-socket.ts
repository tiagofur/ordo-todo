
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../lib/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications handler for foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function useNotificationsSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const initSocket = async () => {
            try {
                const token = await AsyncStorage.getItem('ordo_auth_token');
                if (!token) return;

                let origin = API_BASE_URL;
                // Strip /api/v1 from the end if present to get the root URL for socket.io
                origin = origin.replace(/\/api\/v1\/?$/, '');

                // Connect to 'notifications' namespace
                const socket = io(`${origin}/notifications`, {
                    auth: {
                        token: token,
                    },
                    transports: ['websocket', 'polling'],
                });

                socketRef.current = socket;

                socket.on('connect', () => {
                    console.log('[Mobile] Connected to real-time notifications');
                });

                socket.on('notification:new', async (data: any) => {
                    // Show In-App Toast
                    Toast.show({
                        type: 'info',
                        text1: data.title || 'Notification',
                        text2: data.message,
                    });

                    // Show System Notification
                    await schedulePushNotification(data.title || 'Ordo', data.message);
                });

                socket.on('task:reminder', async (data: any) => {
                    Toast.show({
                        type: 'info',
                        text1: data.taskTitle || 'Task Reminder',
                        text2: `Due in ${data.minutesUntilDue} minutes`,
                    });
                    await schedulePushNotification(data.taskTitle || 'Task Reminder', `Due in ${data.minutesUntilDue} minutes`);
                });

                socket.on('timer:alert', (data: any) => {
                    Toast.show({
                        type: 'success', // or custom type
                        text1: 'Timer Alert',
                        text2: data.message
                    });
                });

                socket.on('ai:insight', (data: any) => {
                    Toast.show({
                        type: 'info',
                        text1: 'AI Insight',
                        text2: data.message
                    });
                });

            } catch (err) {
                console.error("Failed to init mobile socket", err);
            }
        };

        initSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);
}

async function schedulePushNotification(title: string, body: string) {
    if (Platform.OS === 'web') return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: null, // show immediately
    });
}
