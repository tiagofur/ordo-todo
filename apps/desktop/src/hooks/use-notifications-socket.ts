"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '@/lib/api-client'; // Desktop specific
import { apiClient } from '@/lib/api-client'; // To get token
import { toast } from 'sonner';

export function useNotificationsSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Only run if we have a token (user logged in)
        // We need to resolve the token from apiClient or storage
        const initSocket = async () => {
            try {
                // Electron storage is async, so we might need a way to get token.
                // However, apiClient handles interceptors. 
                // We can try to get the token from the apiClient's storage directly if exposed, 
                // or just rely on the fact that if we are in this hook, we are likely auth'd?
                // Actually, `apiClient` in desktop uses `ElectronStoreTokenStorage`.
                // We might need to manually get the token from store.

                // HACK: for now, let's assume if we are mounted, we are valid.
                // But socket.io needs the token in auth.
                // We can peek into localStorage/store. But ElectronStore is in main process?
                // The `ElectronStoreTokenStorage` uses IPC.

                const token = await window.electronAPI?.storeGet('ordo_auth_token');
                if (!token) return;

                const apiUrl = getApiUrl();
                let origin = apiUrl;
                try {
                    if (origin.startsWith('http')) {
                        origin = new URL(origin).origin;
                    }
                } catch (e) {
                    console.warn("Invalid API URL for socket connection:", origin);
                }

                // Connect to 'notifications' namespace
                const socket = io(`${origin}/notifications`, {
                    auth: {
                        token: token,
                    },
                    transports: ['websocket', 'polling'],
                });

                socketRef.current = socket;

                socket.on('connect', () => {
                    console.log('Connected to real-time notifications');
                });

                socket.on('notification:new', (data: any) => {
                    // Show in-app toast
                    toast(data.title || 'Notification', {
                        description: data.message,
                    });

                    // Show native notification
                    window.electronAPI?.showNotification({
                        title: data.title || 'Ordo',
                        body: data.message
                    });
                });

                socket.on('task:reminder', (data: any) => {
                    toast.info(data.taskTitle || 'Task Reminder', {
                        description: `Due in ${data.minutesUntilDue} minutes`,
                        duration: 10000,
                    });
                    window.electronAPI?.notifyTaskDue(data.taskTitle);
                });

                socket.on('timer:alert', (data: any) => {
                    toast.warning(data.message);
                    // Assuming notifyPomodoroComplete handles generic timer alerts or creates a specialized one
                    if (data.type === 'SESSION_COMPLETE') {
                        window.electronAPI?.notifyPomodoroComplete();
                    } else {
                        window.electronAPI?.showNotification({
                            title: 'Timer Alert',
                            body: data.message
                        });
                    }
                });

                socket.on('ai:insight', (data: any) => {
                    toast.message('AI Insight', { description: data.message });
                });
            } catch (err) {
                console.error("Failed to init socket", err);
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
