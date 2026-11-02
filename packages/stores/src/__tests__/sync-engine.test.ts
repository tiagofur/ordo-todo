import { describe, it, expect, vi } from 'vitest';
import { createSyncEngine, type SyncQueueAdapter } from '../sync-engine.js';
import type { PendingAction } from '../types.js';

function memoryAdapter(seed: PendingAction[] = []): SyncQueueAdapter & {
    store: Map<string, PendingAction>;
} {
    const store = new Map(seed.map((a) => [a.id, { ...a }]));
    return {
        store,
        load: async () => [...store.values()],
        save: async (action) => {
            store.set(action.id, { ...action });
        },
        remove: async (id) => {
            store.delete(id);
        },
        updateRetry: async (id, retryCount) => {
            const current = store.get(id);
            if (current) store.set(id, { ...current, retryCount });
        },
    };
}

const action = (overrides: Partial<PendingAction> = {}): PendingAction => ({
    id: `a-${Math.random()}`,
    type: 'create',
    url: '/tasks',
    method: 'POST',
    data: {},
    entityType: 'task',
    createdAt: Date.now(),
    retryCount: 0,
    ...overrides,
});

describe('createSyncEngine', () => {
    it('queues actions through the adapter', async () => {
        const adapter = memoryAdapter();
        const engine = createSyncEngine({ adapter, execute: async () => {} });
        const queued = await engine.queue({
            type: 'create',
            url: '/tasks',
            method: 'POST',
            data: { title: 't' },
            entityType: 'task',
        });
        expect(queued.id).toBeTruthy();
        expect(queued.retryCount).toBe(0);
        expect(await engine.pending()).toHaveLength(1);
    });

    it('syncs everything and reports progress', async () => {
        const adapter = memoryAdapter([action({ id: 'a1' }), action({ id: 'a2' })]);
        const progress: Array<[number, number]> = [];
        const engine = createSyncEngine({
            adapter,
            execute: async () => {},
            events: { onProgress: (done, total) => progress.push([done, total]) },
        });
        const result = await engine.syncAll();
        expect(result).toEqual({ success: true, synced: 2, failed: 0, errors: [] });
        expect(await engine.pending()).toHaveLength(0);
        expect(progress.length).toBeGreaterThan(0);
        expect(progress[progress.length - 1]).toEqual([2, 2]);
    });

    it('keeps failed actions pending below max retries', async () => {
        const adapter = memoryAdapter([action({ id: 'a1', retryCount: 0 })]);
        const engine = createSyncEngine({
            adapter,
            execute: async () => {
                throw new Error('down');
            },
            maxRetries: 3,
        });
        const result = await engine.syncAll();
        expect(result).toEqual({
            success: true,
            synced: 0,
            failed: 0,
            errors: [],
        });
        const pending = await engine.pending();
        expect(pending).toHaveLength(1);
        expect(pending[0]?.retryCount).toBe(1);
    });

    it('marks actions failed at max retries with error entries', async () => {
        const adapter = memoryAdapter([action({ id: 'a1', retryCount: 2 })]);
        const engine = createSyncEngine({
            adapter,
            execute: async () => {
                throw new Error('down');
            },
            maxRetries: 3,
        });
        const result = await engine.syncAll();
        expect(result.success).toBe(false);
        expect(result.failed).toBe(1);
        expect(result.errors).toEqual([{ actionId: 'a1', error: 'down' }]);
    });

    it('refuses to sync while offline', async () => {
        const execute = vi.fn();
        const engine = createSyncEngine({
            adapter: memoryAdapter([action()]),
            execute,
            isOnline: () => false,
        });
        const result = await engine.syncAll();
        expect(result).toEqual({ success: false, synced: 0, failed: 0, errors: [] });
        expect(execute).not.toHaveBeenCalled();
    });

    it('rejects concurrent syncs', async () => {
        let release!: () => void;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        const engine = createSyncEngine({
            adapter: memoryAdapter([action(), action()]),
            execute: async () => gate,
        });
        const first = engine.syncAll();
        const second = await engine.syncAll();
        expect(second).toEqual({ success: false, synced: 0, failed: 0, errors: [] });
        release();
        const result = await first;
        expect(result.synced).toBe(2);
    });
});
