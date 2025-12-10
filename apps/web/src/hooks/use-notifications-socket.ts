"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { config } from '@/config';
import { getToken } from '@/lib/api-client';
import { toast } from 'sonner';

export function useNotificationsSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Only run in browser
        if (typeof window === 'undefined') return;

        const token = getToken();
        if (!token) return;

        // Extract origin from baseURL (remove /api/v1)
        // If baseURL is relative, we might need a different strategy, but usually it's absolute
        let origin = config.api.baseURL;
        try {
            if (origin.startsWith('http')) {
                origin = new URL(origin).origin;
            } else {
                // Fallback for relative URLs (unlikely for API_URL but possible in mixed setup)
                origin = window.location.origin;
            }
        } catch (e) {
            console.warn("Invalid API URL for socket connection:", origin);
        }

        // Connect to 'notifications' namespace
        const socket = io(`${origin}/notifications`, {
            auth: {
                token: token, // Pass raw token, Gateway expects it in auth.token
            },
            transports: ['websocket', 'polling'], // Prefer websocket
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to real-time notifications');
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        // Handle generic notifications
        socket.on('notification:new', (data: any) => {
            console.log('Notification received:', data);
            toast(data.title || 'Notification', {
                description: data.message,
                duration: 5000,
                action: {
                    label: "View",
                    onClick: () => console.log("Notification clicked", data)
                }
            });
        });

        // Handle task reminders
        socket.on('task:reminder', (data: any) => {
            toast.info(data.taskTitle || 'Task Reminder', {
                description: `Due in ${data.minutesUntilDue} minutes`,
                duration: 10000, // Longer for reminders
            });
        });

        // Handle timer alerts
        socket.on('timer:alert', (data: any) => {
            toast.warning(data.message, {
                description: data.type === 'SESSION_COMPLETE' ? 'Great job!' : 'Take a break?',
            });
        });

        // Handle AI insights
        socket.on('ai:insight', (data: any) => {
            toast.message('AI Insight', {
                description: data.message,
                icon: '🤖', // Use proper icon if possible
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []); // Re-run if token changes? usually token is stable per session. 
    // Should probably listen to token changes if user logs in/out without refresh.
    // But for now [] is okay.
}
