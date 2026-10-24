import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [connectionType, setConnectionType] = useState<string>('unknown');
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        // Get initial network state
        const unsubscribe = NetInfo.addEventListener(state => {
            const online = state.isConnected ?? false;
            const type = state.type;

            console.log('[OnlineStatus] Network state changed:', { online, type });

            setIsOnline(online);
            setConnectionType(type);

            if (!online) {
                setWasOffline(true);
            } else if (wasOffline) {
                // Just came back online
                console.log('[OnlineStatus] Back online, triggering sync...');
                // You could trigger data sync here
            }
        });

        return () => {
            unsubscribe();
        };
    }, [wasOffline]);

    const checkConnection = async () => {
        try {
            const state = await NetInfo.fetch();
            return state.isConnected ?? false;
        } catch (error) {
            console.error('[OnlineStatus] Failed to check connection:', error);
            return false;
        }
    };

    return {
        isOnline,
        wasOffline,
        connectionType,
        checkConnection
    };
}