/**
 * Sync Store - Manages sync state across platforms
 *
 * This is a platform-agnostic store that can be extended
 * for specific platforms (web, desktop, mobile).
 */
import type { SyncStore, SyncStoreState } from './types.js';
/**
 * Create a sync store with optional initial state
 */
export declare function createSyncStore(overrides?: Partial<SyncStoreState>): import("zustand").UseBoundStore<import("zustand").StoreApi<SyncStore>>;
/**
 * Default sync store instance
 * Can be used directly or replaced with a platform-specific store
 */
export declare const useSyncStore: import("zustand").UseBoundStore<import("zustand").StoreApi<SyncStore>>;
/**
 * Hook to get formatted last sync time
 */
export declare function formatLastSyncTime(lastSyncTime: number | null): string;
//# sourceMappingURL=sync-store.d.ts.map