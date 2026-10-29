'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import {
    getOnlineStatus,
    subscribeOnlineStatus,
} from '@ordo-todo/online-status';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(() => getOnlineStatus());
    const [wasOffline, setWasOffline] = useState(false);
    const wasOfflineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeOnlineStatus((online) => {
            if (online) {
                logger.log('[OnlineStatus] Connection restored');
                setIsOnline(true);
                setWasOffline(true);

                // Reset wasOffline after a delay
                if (wasOfflineTimerRef.current !== null) {
                    clearTimeout(wasOfflineTimerRef.current);
                }
                wasOfflineTimerRef.current = setTimeout(() => {
                    setWasOffline(false);
                }, 5000);
            } else {
                logger.log('[OnlineStatus] Connection lost');
                setIsOnline(false);
            }
        });

        return () => {
            unsubscribe();
            if (wasOfflineTimerRef.current !== null) {
                clearTimeout(wasOfflineTimerRef.current);
            }
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
