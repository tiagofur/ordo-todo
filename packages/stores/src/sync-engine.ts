/**
 * Portable offline sync queue engine.
 *
 * Framework-free core for the sync-store unification: the state container
 * (`createSyncStore`) stays presentation, while this engine owns the queue
 * semantics mirrored from the web implementation — offline and concurrency
 * guards, sequential execution, per-action retry counting, progress events.
 *
 * Platform specifics arrive injected:
 * - `adapter` persists the queue (IndexedDB on web, Electron store on
 *   desktop, file system on mobile);
 * - `execute` performs one action (the HTTP call with the right transport);
 * - `isOnline` reports connectivity (online-status package, navigator, …).
 *
 * Field names follow the package `PendingAction` contract (`url`, `data`,
 * `createdAt`). Web's store uses `endpoint`/`payload`/`timestamp`; mapping
 * those is the consumer-migration step, not this engine.
 */

import type { PendingAction } from './types.js';

export interface SyncQueueAdapter {
    load(): Promise<PendingAction[]>;
    save(action: PendingAction): Promise<void>;
    remove(actionId: string): Promise<void>;
    updateRetry(actionId: string, retryCount: number, lastError?: string): Promise<void>;
}

export interface SyncEngineResult {
    success: boolean;
    synced: number;
    failed: number;
    errors: Array<{ actionId: string; error: string }>;
}

export interface SyncEngineEvents {
    onProgress?: (done: number, total: number) => void;
    onAction?: (label: string) => void;
}

export interface SyncEngineOptions {
    adapter: SyncQueueAdapter;
    execute: (action: PendingAction) => Promise<unknown>;
    isOnline?: () => boolean;
    maxRetries?: number;
    generateId?: () => string;
    now?: () => number;
    events?: SyncEngineEvents;
}

export type QueueInput = Pick<
    PendingAction,
    'type' | 'url' | 'method' | 'data' | 'entityType'
> &
    Partial<Pick<PendingAction, 'entityId'>>;

const EMPTY_RESULT: SyncEngineResult = {
    success: false,
    synced: 0,
    failed: 0,
    errors: [],
};

export function createSyncEngine(options: SyncEngineOptions) {
    const {
        adapter,
        execute,
        isOnline = () => true,
        maxRetries = 5,
        generateId = () =>
            `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
        now = () => Date.now(),
        events = {},
    } = options;

    let syncing = false;

    return {
        isSyncing: () => syncing,

        async queue(input: QueueInput): Promise<PendingAction> {
            const action: PendingAction = {
                id: generateId(),
                createdAt: now(),
                retryCount: 0,
                ...input,
            };
            await adapter.save(action);
            return action;
        },

        async remove(actionId: string): Promise<void> {
            await adapter.remove(actionId);
        },

        async pending(): Promise<PendingAction[]> {
            return adapter.load();
        },

        async syncAll(): Promise<SyncEngineResult> {
            if (!isOnline() || syncing) {
                return { ...EMPTY_RESULT };
            }
            syncing = true;

            const result: SyncEngineResult = {
                success: true,
                synced: 0,
                failed: 0,
                errors: [],
            };

            try {
                const actions = await adapter.load();
                const total = actions.length;

                for (let i = 0; i < actions.length; i++) {
                    const action = actions[i];
                    if (!action) continue;
                    events.onAction?.(`${action.type} ${action.entityType}`);
                    events.onProgress?.(i, total);

                    try {
                        await execute(action);
                        await adapter.remove(action.id);
                        result.synced++;
                    } catch (err) {
                        const message =
                            err instanceof Error ? err.message : 'Unknown error';
                        const retryCount = action.retryCount + 1;
                        await adapter.updateRetry(action.id, retryCount, message);
                        if (retryCount >= maxRetries) {
                            result.failed++;
                            result.errors.push({ actionId: action.id, error: message });
                        }
                    }
                }

                events.onProgress?.(total, total);
                result.success = result.failed === 0;
                return result;
            } finally {
                syncing = false;
            }
        },
    };
}

export type SyncEngine = ReturnType<typeof createSyncEngine>;
