/**
 * Desktop queue adapter: bridges the offline-sync store's operation list to
 * the portable `SyncQueueAdapter` contract from `@ordo-todo/stores`.
 *
 * Desktop preservation rules (the devtools inspector and the persisted
 * queue rely on them):
 * - `load` returns pending operations only; failed ones wait for a manual
 *   `retryOperation`, exactly like the previous in-store loop.
 * - `remove` marks the operation completed instead of deleting it, so the
 *   inspector keeps showing it until `clearCompletedOperations` runs.
 * - `updateRetry` marks the operation failed immediately (desktop has no
 *   multi-retry threshold: one failed attempt already means failed).
 *
 * The engine contract requires `url`/`method`; desktop execution dispatches
 * on entity type + operation type through the apiClient methods, so the url
 * is an opaque locator (`desktop://<entity>/<id>`) and the method follows
 * the operation type. Type-only import of the store shape: no runtime cycle.
 */
import type {
  SyncQueueAdapter,
  PendingAction,
} from '@ordo-todo/stores';
import type { SyncOperation } from './offline-sync-store';

export interface DesktopOperationStore {
  getOperations: () => SyncOperation[];
  upsertOperation: (operation: SyncOperation) => void;
}

const METHOD_BY_TYPE = {
  create: 'POST',
  update: 'PATCH',
  delete: 'DELETE',
} as const;

function toEngine(operation: SyncOperation): PendingAction {
  return {
    id: operation.id,
    type: operation.type,
    url: `desktop://${operation.entityType}/${operation.entityId}`,
    method: METHOD_BY_TYPE[operation.type],
    data: (operation.data ?? {}) as Record<string, unknown>,
    entityType: operation.entityType,
    entityId: operation.entityId,
    createdAt: operation.timestamp,
    retryCount: operation.retryCount,
  };
}

/**
 * Maps one engine action back to the desktop operation shape for execution
 * through the store's per-entity `executeSyncOperation`.
 */
export function toDesktopOperation(action: PendingAction): SyncOperation {
  return {
    id: action.id,
    type: action.type as SyncOperation['type'],
    entityType: action.entityType as SyncOperation['entityType'],
    entityId: action.entityId ?? '',
    data: action.data,
    timestamp: action.createdAt,
    retryCount: action.retryCount,
    status: 'pending',
  };
}

export function createDesktopSyncQueueAdapter(
  store: DesktopOperationStore,
): SyncQueueAdapter {
  return {
    async load() {
      return store
        .getOperations()
        .filter((op) => op.status === 'pending')
        .map(toEngine);
    },
    async save(action) {
      store.upsertOperation(toDesktopOperation(action));
    },
    async remove(actionId) {
      const operation = store
        .getOperations()
        .find((op) => op.id === actionId);
      if (operation) {
        store.upsertOperation({ ...operation, status: 'completed' });
      }
    },
    async updateRetry(actionId, retryCount, lastError) {
      const operation = store
        .getOperations()
        .find((op) => op.id === actionId);
      if (operation) {
        store.upsertOperation({
          ...operation,
          status: 'failed',
          retryCount,
          lastRetry: Date.now(),
          lastError,
        });
      }
    },
  };
}
