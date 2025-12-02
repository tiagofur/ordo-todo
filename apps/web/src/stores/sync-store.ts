import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    getAllPendingActions,
    getPendingActionsCount,
    addPendingAction,
    removePendingAction,
    incrementRetryCount,
    getLastSyncTime,
    setLastSyncTime,
    PendingAction,
    PendingActionType,
} from '@/lib/offline-storage';
import { logger } from '@/lib/logger';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncState {
    // Connection state
    isOnline: boolean;
    wasOffline: boolean;

    // Sync state
    status: SyncStatus;
    pendingCount: number;
    lastSyncTime: number | null;
    lastError: string | null;

    // Sync progress
    isSyncing: boolean;
    currentAction: string | null;
    syncProgress: number; // 0-100

    // Actions
    setOnline: (online: boolean) => void;
    setStatus: (status: SyncStatus) => void;
    setPendingCount: (count: number) => void;
    setLastSyncTime: (time: number | null) => void;
    setLastError: (error: string | null) => void;
    setSyncing: (syncing: boolean, currentAction?: string) => void;
    setSyncProgress: (progress: number) => void;

    // Sync operations
    refreshPendingCount: () => Promise<void>;
    refreshLastSyncTime: () => Promise<void>;

    // Queue management
    queueAction: (
        type: PendingActionType,
        endpoint: string,
        method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        payload: unknown,
        entityType: 'task' | 'project' | 'comment' | 'timer',
        entityId?: string
    ) => Promise<string>;

    removeAction: (id: string) => Promise<void>;

    // Full sync
    syncAll: () => Promise<SyncResult>;
}

export interface SyncResult {
    success: boolean;
    synced: number;
    failed: number;
    errors: Array<{ actionId: string; error: string }>;
}

export const useSyncStore = create<SyncState>()(
    persist(
        (set, get) => ({
            // Initial state
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
            wasOffline: false,
            status: 'idle',
            pendingCount: 0,
            lastSyncTime: null,
            lastError: null,
            isSyncing: false,
            currentAction: null,
            syncProgress: 0,

            // Basic setters
            setOnline: (online) => {
                const wasOffline = !get().isOnline && online;
                set({
                    isOnline: online,
                    wasOffline,
                    status: online ? 'idle' : 'offline',
                });

                // Auto-sync when coming back online
                if (wasOffline && online) {
                    logger.log('[SyncStore] Back online, triggering sync...');
                    get().syncAll().catch((err) => {
                        logger.error('[SyncStore] Auto-sync failed:', err);
                    });
                }
            },

            setStatus: (status) => set({ status }),
            setPendingCount: (count) => set({ pendingCount: count }),
            setLastSyncTime: (time) => set({ lastSyncTime: time }),
            setLastError: (error) => set({ lastError: error, status: error ? 'error' : 'idle' }),
            setSyncing: (syncing, currentAction) => set({
                isSyncing: syncing,
                currentAction: currentAction ?? null,
                status: syncing ? 'syncing' : 'idle',
            }),
            setSyncProgress: (progress) => set({ syncProgress: progress }),

            // Refresh from IndexedDB
            refreshPendingCount: async () => {
                try {
                    const count = await getPendingActionsCount();
                    set({ pendingCount: count });
                } catch (err) {
                    logger.error('[SyncStore] Failed to refresh pending count:', err);
                }
            },

            refreshLastSyncTime: async () => {
                try {
                    const time = await getLastSyncTime();
                    set({ lastSyncTime: time });
                } catch (err) {
                    logger.error('[SyncStore] Failed to refresh last sync time:', err);
                }
            },

            // Queue a new action
            queueAction: async (type, endpoint, method, payload, entityType, entityId) => {
                const id = await addPendingAction({
                    type,
                    endpoint,
                    method,
                    payload,
                    entityType,
                    entityId,
                });

                // Update pending count
                const count = await getPendingActionsCount();
                set({ pendingCount: count });

                logger.log(`[SyncStore] Queued action: ${type} for ${entityType}`, { id, endpoint });

                // Dispatch event for UI updates
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('ordo-todo:action-queued', {
                        detail: { id, type, entityType }
                    }));
                }

                return id;
            },

            // Remove an action
            removeAction: async (id) => {
                await removePendingAction(id);
                const count = await getPendingActionsCount();
                set({ pendingCount: count });
            },

            // Sync all pending actions
            syncAll: async (): Promise<SyncResult> => {
                const state = get();

                if (!state.isOnline) {
                    logger.log('[SyncStore] Cannot sync: offline');
                    return { success: false, synced: 0, failed: 0, errors: [] };
                }

                if (state.isSyncing) {
                    logger.log('[SyncStore] Sync already in progress');
                    return { success: false, synced: 0, failed: 0, errors: [] };
                }

                set({ isSyncing: true, status: 'syncing', syncProgress: 0 });

                const result: SyncResult = {
                    success: true,
                    synced: 0,
                    failed: 0,
                    errors: [],
                };

                try {
                    const actions = await getAllPendingActions();
                    const total = actions.length;

                    if (total === 0) {
                        logger.log('[SyncStore] No pending actions to sync');
                        await setLastSyncTime();
                        const time = await getLastSyncTime();
                        set({
                            isSyncing: false,
                            status: 'idle',
                            syncProgress: 100,
                            lastSyncTime: time,
                        });
                        return result;
                    }

                    logger.log(`[SyncStore] Syncing ${total} pending actions...`);

                    for (let i = 0; i < actions.length; i++) {
                        const action = actions[i];
                        set({
                            currentAction: `${action.type} ${action.entityType}`,
                            syncProgress: Math.round((i / total) * 100),
                        });

                        try {
                            await processPendingAction(action);
                            await removePendingAction(action.id);
                            result.synced++;
                            logger.log(`[SyncStore] Synced action: ${action.id}`);
                        } catch (err) {
                            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                            logger.error(`[SyncStore] Failed to sync action ${action.id}:`, err);

                            const updated = await incrementRetryCount(action.id, errorMessage);

                            if (updated && updated.retryCount >= updated.maxRetries) {
                                // Max retries exceeded, mark as failed
                                result.failed++;
                                result.errors.push({ actionId: action.id, error: errorMessage });
                                result.success = false;
                            }
                        }
                    }

                    // Update sync time
                    await setLastSyncTime();
                    const time = await getLastSyncTime();
                    const count = await getPendingActionsCount();

                    set({
                        isSyncing: false,
                        currentAction: null,
                        syncProgress: 100,
                        status: result.failed > 0 ? 'error' : 'idle',
                        pendingCount: count,
                        lastSyncTime: time,
                        lastError: result.failed > 0 ? `${result.failed} action(s) failed to sync` : null,
                    });

                    // Dispatch sync complete event
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('ordo-todo:sync-complete', {
                            detail: result
                        }));
                    }

                    logger.log(`[SyncStore] Sync complete: ${result.synced} synced, ${result.failed} failed`);

                } catch (err) {
                    logger.error('[SyncStore] Sync failed:', err);
                    set({
                        isSyncing: false,
                        currentAction: null,
                        status: 'error',
                        lastError: err instanceof Error ? err.message : 'Sync failed',
                    });
                    result.success = false;
                }

                return result;
            },
        }),
        {
            name: 'ordo-sync-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                lastSyncTime: state.lastSyncTime,
                pendingCount: state.pendingCount,
            }),
        }
    )
);

/**
 * Process a single pending action by making the API call
 */
async function processPendingAction(action: PendingAction): Promise<void> {
    const { apiClient } = await import('@/lib/api-client');
    const { getToken } = await import('@/lib/api-client');

    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = await import('@/config');
    const baseURL = config.config.api.baseURL;

    const response = await fetch(`${baseURL}${action.endpoint}`, {
        method: action.method,
        headers,
        body: action.method !== 'DELETE' ? JSON.stringify(action.payload) : undefined,
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json().catch(() => undefined);
}

// Initialize store with data from IndexedDB on load
if (typeof window !== 'undefined') {
    // Listen for online/offline events
    window.addEventListener('online', () => {
        useSyncStore.getState().setOnline(true);
    });

    window.addEventListener('offline', () => {
        useSyncStore.getState().setOnline(false);
    });

    // Initialize pending count on load
    Promise.all([
        useSyncStore.getState().refreshPendingCount(),
        useSyncStore.getState().refreshLastSyncTime(),
    ]).catch((err) => {
        logger.error('[SyncStore] Failed to initialize:', err);
    });
}
