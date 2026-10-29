'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

// Wi-Fi roaming, ISP renewals or wake-from-sleep fire online/offline events in
// quick succession even though the app never lost real connectivity. Only
// confirm the offline state once it persists, so micro-flaps stay silent.
const OFFLINE_CONFIRMATION_DELAY_MS = 5000;

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);
    const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const confirmedOfflineRef = useRef(false);

    useEffect(() => {
        // Coerce: some environments (jsdom) leave navigator.onLine undefined.
        const online = Boolean(navigator.onLine);
        setIsOnline(online);
        // A page loaded while already offline never receives an offline event;
        // treat it as confirmed so its recovery still gets the back-online toast.
        confirmedOfflineRef.current = !online;

        const clearOfflineTimer = () => {
            if (offlineTimerRef.current !== null) {
                clearTimeout(offlineTimerRef.current);
                offlineTimerRef.current = null;
            }
        };

        const handleOnline = () => {
            clearOfflineTimer();
            setIsOnline(true);

            // Offline never persisted long enough to be surfaced: stay silent.
            if (!confirmedOfflineRef.current) return;

            logger.log('[OnlineStatus] Connection restored');
            confirmedOfflineRef.current = false;
            setWasOffline(true);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('ordo-todo:online'));

            // Reset wasOffline after a delay
            setTimeout(() => setWasOffline(false), 5000);
        };

        const handleOffline = () => {
            if (offlineTimerRef.current !== null) return;
            logger.log('[OnlineStatus] Connection lost, confirming if it persists');
            offlineTimerRef.current = setTimeout(() => {
                offlineTimerRef.current = null;
                confirmedOfflineRef.current = true;
                setIsOnline(false);

                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('ordo-todo:offline'));
            }, OFFLINE_CONFIRMATION_DELAY_MS);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearOfflineTimer();
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
