'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        // Set initial status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            logger.log('[OnlineStatus] Connection restored');
            setIsOnline(true);
            setWasOffline(true);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('ordo-todo:online'));

            // Reset wasOffline after a delay
            setTimeout(() => setWasOffline(false), 5000);
        };

        const handleOffline = () => {
            logger.log('[OnlineStatus] Connection lost');
            setIsOnline(false);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('ordo-todo:offline'));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const checkConnection = useCallback(async () => {
        try {
            // Try to fetch a small resource to verify connection
            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch {
            return false;
        }
    }, []);

    return {
        isOnline,
        wasOffline,
        checkConnection
    };
}
