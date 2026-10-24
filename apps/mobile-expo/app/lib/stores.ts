/**
 * Shared Stores for Mobile
 * 
 * Re-exports all Zustand stores from @ordo-todo/stores package.
 * This ensures state management is consistent across Web, Desktop, and Mobile.
 * 
 * @example
 * ```tsx
 * import { useWorkspaceStore, useTimerStore } from '@/lib/stores';
 * 
 * function MyComponent() {
 *   const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
 *   const { isRunning, start } = useTimerStore();
 *   // ...
 * }
 * ```
 */

// Re-export all stores from the shared package
export {
    // Workspace store
    useWorkspaceStore,

    // UI store
    useUIStore,

    // Timer store
    useTimerStore,

    // Sync store
    useSyncStore,
} from '@ordo-todo/stores';

// Re-export types
export type {
    // Workspace types
    WorkspaceStore,
    WorkspaceStoreState,
    WorkspaceStoreActions,

    // UI types
    UIStore,
    UIStoreState,
    UIStoreActions,

    // Timer types
    TimerStore,
    TimerStoreState,
    TimerStoreActions,
    TimerConfig,
    TimerMode,

    // Sync types
    SyncStore,
    SyncStoreState,
    SyncStoreActions,
    SyncStatus,
    PendingAction,
} from '@ordo-todo/stores';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';
import { useUIStore, useWorkspaceStore, useTimerStore } from '@ordo-todo/stores';

/**
 * Initialize stores with Mobile-specific defaults and storage adapter.
 * MUST be called in the root _layout.tsx before using any stores.
 */
export function initializeStores() {
    try {
        const storage = createJSONStorage(() => AsyncStorage) as any;

        // Configure storage for persisted stores
        if (useUIStore && useUIStore.persist) {
            useUIStore.persist.setOptions({
                storage,
                name: 'ordo-ui-store-mobile'
            });
            // Force rehydration
            useUIStore.persist.rehydrate();
        }

        if (useWorkspaceStore && useWorkspaceStore.persist) {
            useWorkspaceStore.persist.setOptions({
                storage,
                name: 'ordo-workspace-store-mobile'
            });
            useWorkspaceStore.persist.rehydrate();
        }

        if (useTimerStore && useTimerStore.persist) {
            useTimerStore.persist.setOptions({
                storage,
                name: 'ordo-timer-store-mobile'
            });
            useTimerStore.persist.rehydrate();
        }

        if (__DEV__) {
            console.log('[Stores] Initialized shared stores with AsyncStorage');
        }
    } catch (e) {
        console.error('[Stores] Failed to initialize stores:', e);
    }
}
