"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '@/lib/api-client';
import { toast } from 'sonner';

export interface SocketConnectionState {
    connected: boolean;
    connecting: boolean;
    error: string | null;
}

export function useNotificationsSocket() {
    const socketRef = useRef<Socket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [connectionState, setConnectionState] = useState<SocketConnectionState>({
        connected: false,
        connecting: false,
        error: null,
    });

    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const scheduleReconnect = useCallback(async () => {
        clearReconnectTimeout();

        // Exponential backoff: start at 2s, max 30s
        const delay = Math.min(2000 * Math.pow(2, socketRef.current?.io?.reconnectionAttempts() || 0), 30000);

        reconnectTimeoutRef.current = setTimeout(async () => {
            console.log('[Socket] Attempting to reconnect...');
            if (socketRef.current && !socketRef.current.connected) {
                socketRef.current.connect();
            }
        }, delay);
    }, [clearReconnectTimeout]);

    useEffect(() => {
        let isMounted = true;

        const initSocket = async () => {
            try {
                setConnectionState(prev => ({ ...prev, connecting: true, error: null }));

                // Get auth token from Electron store
                const token = await window.electronAPI?.storeGet('ordo_auth_token');

                if (!token) {
                    console.log('[Socket] No auth token found, skipping socket connection');
                    setConnectionState(prev => ({ ...prev, connecting: false }));
                    return;
                }

                const apiUrl = getApiUrl();
                let origin = apiUrl;

                try {
                    if (origin.startsWith('http')) {
                        origin = new URL(origin).origin;
                    }
                } catch (e) {
                    console.warn("[Socket] Invalid API URL for socket connection:", origin);
                    setConnectionState(prev => ({
                        ...prev,
                        connecting: false,
                        error: 'Invalid API URL'
                    }));
                    return;
                }

                console.log('[Socket] Connecting to:', `${origin}/notifications`);

                // Connect to 'notifications' namespace with robust config
                const socket = io(`${origin}/notifications`, {
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionDelay: 2000,
                    reconnectionDelayMax: 10000,
                    reconnectionAttempts: Infinity,
                    timeout: 10000,
                    autoConnect: true,
                });

                socketRef.current = socket;

                // Connection event handlers
                socket.on('connect', () => {
                    console.log('[Socket] ✅ Connected to real-time notifications');
                    if (isMounted) {
                        setConnectionState({
                            connected: true,
                            connecting: false,
                            error: null,
                        });
                    }
                    clearReconnectTimeout();
                });

                socket.on('disconnect', (reason) => {
                    console.log('[Socket] ❌ Disconnected:', reason);

                    if (isMounted) {
                        setConnectionState(prev => ({
                            ...prev,
                            connected: false,
                            error: reason === 'io server disconnect' ? 'Server disconnected' : 'Connection lost',
                        }));
                    }

                    // Schedule reconnection if it wasn't intentional
                    if (reason !== 'io client disconnect') {
                        scheduleReconnect();
                    }
                });

                socket.on('connect_error', (error) => {
                    console.error('[Socket] Connection error:', error.message);

                    if (isMounted) {
                        setConnectionState(prev => ({
                            ...prev,
                            connecting: false,
                            error: error.message,
                        }));
                    }

                    // Schedule reconnection
                    scheduleReconnect();
                });

                socket.on('reconnect', (attemptNumber) => {
                    console.log(`[Socket] ✅ Reconnected after ${attemptNumber} attempts`);
                    toast.success('Reconnected to real-time updates');
                });

                socket.on('reconnect_attempt', (attemptNumber) => {
                    console.log(`[Socket] Reconnection attempt ${attemptNumber}...`);
                });

                socket.on('reconnect_failed', () => {
                    console.error('[Socket] ❌ Reconnection failed');
                    if (isMounted) {
                        setConnectionState(prev => ({
                            ...prev,
                            connecting: false,
                            error: 'Reconnection failed',
                        }));
                    }
                });

                // Notification handlers
                socket.on('notification:new', (data: any) => {
                    console.log('[Socket] New notification:', data);

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
                    console.log('[Socket] Task reminder:', data);

                    toast.info(data.taskTitle || 'Task Reminder', {
                        description: `Due in ${data.minutesUntilDue} minutes`,
                        duration: 10000,
                    });
                    window.electronAPI?.notifyTaskDue?.(data.taskTitle);
                });

                socket.on('timer:alert', (data: any) => {
                    console.log('[Socket] Timer alert:', data);

                    toast.warning(data.message);

                    if (data.type === 'SESSION_COMPLETE') {
                        window.electronAPI?.notifyPomodoroComplete?.();
                    } else {
                        window.electronAPI?.showNotification?.({
                            title: 'Timer Alert',
                            body: data.message
                        });
                    }
                });

                socket.on('ai:insight', (data: any) => {
                    console.log('[Socket] AI insight:', data);
                    toast.message('AI Insight', { description: data.message });
                });

                // Collaborative updates (for real-time task/project changes)
                socket.on('task:updated', (data: any) => {
                    console.log('[Socket] Task updated:', data);
                    // Trigger refetch of tasks
                    window.dispatchEvent(new CustomEvent('task:updated', { detail: data }));
                });

                socket.on('project:updated', (data: any) => {
                    console.log('[Socket] Project updated:', data);
                    // Trigger refetch of projects
                    window.dispatchEvent(new CustomEvent('project:updated', { detail: data }));
                });

                socket.on('workspace:updated', (data: any) => {
                    console.log('[Socket] Workspace updated:', data);
                    // Trigger refetch of workspaces
                    window.dispatchEvent(new CustomEvent('workspace:updated', { detail: data }));
                });

            } catch (err) {
                console.error('[Socket] Failed to initialize:', err);
                if (isMounted) {
                    setConnectionState(prev => ({
                        ...prev,
                        connecting: false,
                        error: err instanceof Error ? err.message : 'Unknown error',
                    }));
                }
            }
        };

        initSocket();

        // Cleanup function
        return () => {
            isMounted = false;
            clearReconnectTimeout();

            if (socketRef.current) {
                console.log('[Socket] Disconnecting...');
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [clearReconnectTimeout, scheduleReconnect]);

    // Manual reconnect function
    const reconnect = useCallback(() => {
        if (socketRef.current && !socketRef.current.connected) {
            console.log('[Socket] Manual reconnect triggered');
            socketRef.current.connect();
        }
    }, []);

    return {
        connectionState,
        reconnect,
        isConnected: connectionState.connected,
    };
}
