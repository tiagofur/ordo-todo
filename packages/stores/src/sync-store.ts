/**
 * Sync Store - Manages sync state across platforms
 *
 * This is a platform-agnostic store that can be extended
 * for specific platforms (web, desktop, mobile).
 */

import { create } from 'zustand';
import type { SyncStatus, SyncStore, SyncStoreState } from './types.js';

const initialState: SyncStoreState = {
    status: 'idle',
    isOnline: true,
    pendingCount: 0,
    lastSyncTime: null,
    error: null,
    isSyncing: false,
    currentAction: null,
    syncProgress: 0,
};

/**
 * Create a sync store with optional initial state
 */
export function createSyncStore(overrides?: Partial<SyncStoreState>) {
    return create<SyncStore>((set) => ({
        ...initialState,
        ...overrides,

        setStatus: (status: SyncStatus) => set({ status }),

        setOnline: (online: boolean) =>
            set({ isOnline: online, status: online ? 'idle' : 'offline' }),

        setPendingCount: (count: number) => set({ pendingCount: count }),

        setLastSyncTime: (time: number | null) => set({ lastSyncTime: time }),

        setError: (error: string | null) =>
            set({ error, status: error ? 'error' : 'idle' }),

        setSyncing: (syncing: boolean, currentAction?: string) =>
            set({
                isSyncing: syncing,
                currentAction: syncing ? currentAction ?? null : null,
                status: syncing ? 'syncing' : 'idle',
            }),

        setSyncProgress: (progress: number) => set({ syncProgress: progress }),
    }));
}

/**
 * Default sync store instance
 * Can be used directly or replaced with a platform-specific store
 */
export const useSyncStore = createSyncStore();

/**
 * Hook to get formatted last sync time
 */
export function formatLastSyncTime(lastSyncTime: number | null): string {
    if (!lastSyncTime) return 'Never synced';

    const now = Date.now();
    const diff = now - lastSyncTime;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(lastSyncTime).toLocaleDateString();
}
