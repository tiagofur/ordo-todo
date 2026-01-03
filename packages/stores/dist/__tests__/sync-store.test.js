import { describe, it, expect } from 'vitest';
import { createSyncStore, formatLastSyncTime } from '../sync-store.js';
describe('sync-store utilities', () => {
    it('should format last sync time correctly', () => {
        const now = Date.now();
        expect(formatLastSyncTime(null)).toBe('Never synced');
        expect(formatLastSyncTime(now - 10000)).toBe('Just now');
        expect(formatLastSyncTime(now - 120000)).toBe('2m ago');
        expect(formatLastSyncTime(now - 7200000)).toBe('2h ago');
    });
});
describe('createSyncStore', () => {
    it('should create a store with default state', () => {
        const store = createSyncStore();
        const state = store.getState();
        expect(state.status).toBe('idle');
        expect(state.isOnline).toBe(true);
        expect(state.pendingCount).toBe(0);
    });
    it('should handle state updates', () => {
        const store = createSyncStore();
        store.getState().setOnline(false);
        expect(store.getState().isOnline).toBe(false);
        expect(store.getState().status).toBe('offline');
        store.getState().setSyncing(true, 'Uploading data');
        expect(store.getState().isSyncing).toBe(true);
        expect(store.getState().currentAction).toBe('Uploading data');
        expect(store.getState().status).toBe('syncing');
        store.getState().setError('Network error');
        expect(store.getState().error).toBe('Network error');
        expect(store.getState().status).toBe('error');
    });
    it('should apply overrides', () => {
        const store = createSyncStore({ isOnline: false, status: 'offline' });
        expect(store.getState().isOnline).toBe(false);
        expect(store.getState().status).toBe('offline');
    });
});
