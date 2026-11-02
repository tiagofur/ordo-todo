/**
 * IndexedDB queue adapter: bridges the web offline storage to the portable
 * `SyncQueueAdapter` contract from `@ordo-todo/stores`.
 *
 * Field mapping (web shape → package contract):
 * - `endpoint` → `url`
 * - `payload` → `data`
 * - `timestamp` → `createdAt`
 *
 * New actions saved through the engine get web's `maxRetries: 3` default,
 * matching `addPendingAction`. Engine callers should pass `maxRetries: 3`
 * as well so the failure threshold agrees with the stored default.
 * Type-only import of the package contract: erased at build, no runtime
 * dependency on the stores dist.
 */
import type { SyncQueueAdapter } from "@ordo-todo/stores";
import type { PendingAction as PackageAction } from "@ordo-todo/stores";
import {
  getAllPendingActions,
  updatePendingAction,
  removePendingAction,
  incrementRetryCount,
  type PendingAction as WebAction,
} from "@/lib/offline-storage";

const WEB_MAX_RETRIES = 3;

function toPackage(action: WebAction): PackageAction {
  return {
    id: action.id,
    type: action.type,
    url: action.endpoint,
    method: action.method,
    data: (action.payload ?? {}) as Record<string, unknown>,
    entityType: action.entityType,
    entityId: action.entityId,
    createdAt: action.timestamp,
    retryCount: action.retryCount,
  };
}

function toWeb(action: PackageAction): WebAction {
  return {
    id: action.id,
    type: action.type,
    endpoint: action.url,
    method: action.method,
    payload: action.data,
    entityType: action.entityType,
    entityId: action.entityId,
    timestamp: action.createdAt,
    retryCount: action.retryCount,
    maxRetries: WEB_MAX_RETRIES,
  } as WebAction;
}

export function createWebSyncQueueAdapter(): SyncQueueAdapter {
  return {
    async load() {
      const actions = await getAllPendingActions();
      return actions.map(toPackage);
    },
    async save(action) {
      await updatePendingAction(toWeb(action));
    },
    async remove(actionId) {
      await removePendingAction(actionId);
    },
    async updateRetry(actionId, _retryCount, lastError) {
      await incrementRetryCount(actionId, lastError);
    },
  };
}
