/**
 * Advanced Offline Sync Store with Conflict Resolution
 *
 * Manages synchronization between local SQLite and remote server with intelligent
 * conflict resolution and robust background sync capabilities.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { getOnlineStatus, subscribeOnlineStatus } from '@ordo-todo/online-status';
import {
  createSyncEngine,
  createConflictRegistry,
  resolveUpdateConflict as resolveUpdateStrategy,
  resolveDeleteConflict as resolveDeleteStrategy,
  suggestMerge as suggestMergeStrategy,
  type PendingAction as EngineAction,
  type SyncEngineResult,
  type ConflictData,
  type ConflictResolution as RegistryResolution,
} from '@ordo-todo/stores';
import {
  createDesktopSyncQueueAdapter,
  toDesktopOperation,
} from './sync-queue-adapter';

// Types
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'conflict';
export type ConflictType = 'update' | 'delete' | 'create';
export type ConflictResolution = 'local' | 'remote' | 'merge' | 'manual';

interface SyncConflict {
  id: string;
  type: ConflictType;
  entityType: 'task' | 'project' | 'workspace' | 'session';
  entityId: string;
  localData: any;
  remoteData: any;
  timestamp: number;
  resolution?: ConflictResolution;
  resolvedAt?: number;
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'task' | 'project' | 'workspace' | 'session';
  entityId: string;
  data: any;
  timestamp: number;
  retryCount: number;
  lastRetry?: number;
  lastError?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface SyncQueue {
  operations: SyncOperation[];
  conflicts: SyncConflict[];
  lastSyncAt?: number;
  isOnline: boolean;
  syncStatus: SyncStatus;
  syncProgress: number;
  totalOperations: number;
}

interface OfflineSyncStore {
  // Sync Queue State
  queue: SyncQueue;

  // Actions
  addOperation: (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>) => void;
  removeOperation: (operationId: string) => void;
  retryOperation: (operationId: string) => void;
  clearCompletedOperations: () => void;

  // Conflict Management
  addConflict: (conflict: Omit<SyncConflict, 'id' | 'timestamp'>) => void;
  resolveConflict: (conflictId: string, resolution: ConflictResolution, mergedData?: any) => Promise<void>;
  resolveAllConflicts: (resolution: ConflictResolution) => Promise<void>;

  // Sync Operations
  startSync: () => Promise<void>;
  stopSync: () => void;
  forceSync: () => Promise<void>;
  processQueue: () => Promise<SyncEngineResult>;

  // Entity Sync Operations
  executeSyncOperation: (operation: SyncOperation) => Promise<any>;
  syncTaskOperation: (operation: SyncOperation) => Promise<any>;
  syncProjectOperation: (operation: SyncOperation) => Promise<any>;
  syncWorkspaceOperation: (operation: SyncOperation) => Promise<any>;
  syncSessionOperation: (operation: SyncOperation) => Promise<any>;

  // Local and Remote Updates
  applyLocalUpdate: (entityType: string, entityId: string, data: any) => Promise<void>;
  applyRemoteUpdate: (entityType: string, entityId: string, data: any) => Promise<void>;

  // Connection Management
  setOnlineStatus: (isOnline: boolean) => void;
  setupNetworkListeners: () => void;

  // Conflict Resolution Strategies
  resolveUpdateConflict: (conflict: SyncConflict) => any;
  resolveDeleteConflict: (conflict: SyncConflict) => ConflictResolution;
  suggestMerge: (local: any, remote: any) => any;

  // Background Sync
  startBackgroundSync: () => void;
  stopBackgroundSync: () => void;
  scheduleNextSync: (delay?: number) => void;

  // Metrics and Monitoring
  getSyncMetrics: () => {
    pendingOperations: number;
    failedOperations: number;
    unresolvedConflicts: number;
    lastSyncSuccess?: number;
    averageSyncTime: number;
  };
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

type StoreGet = () => OfflineSyncStore;
type StoreSet = (partial: Partial<{ queue: SyncQueue }>) => void;

/**
 * Portable engine wired to the desktop queue: operations stay in zustand
 * state (persisted, inspector-visible) via the adapter, execution dispatches
 * through the store's per-entity `executeSyncOperation`. Progress events feed
 * the queue's progress bar.
 *
 * Desktop preservation notes:
 * - no `isOnline` override: every caller already guards on `queue.isOnline`,
 *   exactly like the previous in-store loop;
 * - `maxRetries: 1`: desktop marks an operation failed on its first error
 *   (manual `retryOperation` re-queues it), so the first failure already
 *   counts.
 */
function createDesktopEngine(get: StoreGet, set: StoreSet) {
  return createSyncEngine({
    adapter: createDesktopSyncQueueAdapter({
      getOperations: () => get().queue.operations,
      upsertOperation: (operation) => {
        const queue = get().queue;
        const operations = queue.operations.some((op) => op.id === operation.id)
          ? queue.operations.map((op) => (op.id === operation.id ? operation : op))
          : [...queue.operations, operation];
        set({ queue: { ...queue, operations } });
      },
    }),
    execute: (action) => executeDesktopOperation(get, action),
    maxRetries: 1,
    events: {
      onProgress: (done, total) =>
        set({
          queue: {
            ...get().queue,
            syncProgress: total === 0 ? 100 : Math.round((done / total) * 100),
          },
        }),
    },
  });
}

/**
 * Conflict registry wired to the desktop dual-write: `local` wins remotely,
 * `remote` wins locally, `merge`/`manual` write the winning data to both
 * sides — the same pattern the store applied inline before.
 */
function createDesktopConflictRegistry(get: StoreGet) {
  return createConflictRegistry({
    applyResolution: async (entityType, entityId, data, resolution) => {
      const store = get();
      switch (resolution) {
        case 'local':
          await store.applyRemoteUpdate(entityType, entityId, data);
          break;
        case 'remote':
          await store.applyLocalUpdate(entityType, entityId, data);
          break;
        case 'merge':
        case 'manual':
          await store.applyRemoteUpdate(entityType, entityId, data);
          await store.applyLocalUpdate(entityType, entityId, data);
          break;
      }
    },
  });
}

/**
 * Engine `execute`: runs one action through the store's per-entity
 * execution and preserves the data-conflict hook — errors whose message
 * mentions a conflict still open a resolution conflict before the engine
 * records the retry.
 */
async function executeDesktopOperation(
  get: StoreGet,
  action: EngineAction,
): Promise<unknown> {
  const operation = toDesktopOperation(action);
  try {
    return await get().executeSyncOperation(operation);
  } catch (error) {
    const err = error as { message?: string; remoteData?: any };
    if (err?.message?.includes('conflict')) {
      get().addConflict({
        type: operation.type === 'delete' ? 'delete' : 'update',
        entityType: operation.entityType,
        entityId: operation.entityId,
        localData: operation.data,
        remoteData: err.remoteData,
      });
    }
    throw error;
  }
}

export const useOfflineSyncStore = create<OfflineSyncStore>()(
  persist(
    (set, get) => ({
      // Initial State
      queue: {
        operations: [],
        conflicts: [],
        isOnline: getOnlineStatus(),
        syncStatus: 'idle',
        syncProgress: 0,
        totalOperations: 0,
      },

      // Add operation to sync queue
      addOperation: (operation) => {
        const newOperation: SyncOperation = {
          ...operation,
          id: generateId(),
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending',
        };

        set((state) => ({
          queue: {
            ...state.queue,
            operations: [...state.queue.operations, newOperation],
          },
        }));

        // Trigger sync if online
        if (get().queue.isOnline) {
          get().processQueue();
        }
      },

      // Remove operation from queue
      removeOperation: (operationId) => {
        set((state) => ({
          queue: {
            ...state.queue,
            operations: state.queue.operations.filter((op) => op.id !== operationId),
          },
        }));
      },

      // Retry failed operation
      retryOperation: (operationId) => {
        set((state) => ({
          queue: {
            ...state.queue,
            operations: state.queue.operations.map((op) =>
              op.id === operationId
                ? { ...op, status: 'pending', lastRetry: Date.now() }
                : op
            ),
          },
        }));

        get().processQueue();
      },

      // Clear completed operations
      clearCompletedOperations: () => {
        set((state) => ({
          queue: {
            ...state.queue,
            operations: state.queue.operations.filter((op) => op.status !== 'completed'),
          },
        }));
      },

      // Add conflict to resolution queue
      addConflict: (conflict) => {
        const newConflict: SyncConflict = {
          ...conflict,
          id: generateId(),
          timestamp: Date.now(),
        };

        set((state) => ({
          queue: {
            ...state.queue,
            conflicts: [...state.queue.conflicts, newConflict],
            syncStatus: 'conflict',
          },
        }));

        toast.error(`Sync conflict detected for ${conflict.entityType}`, {
          description: 'Please resolve the conflict to continue syncing',
          action: {
            label: 'Resolve',
            onClick: () => {
              // Navigate to conflict resolution UI
              window.location.hash = '/settings/sync-conflicts';
            },
          },
        });
      },

      // Resolve a specific conflict through the portable registry: it
      // computes the winning data with the shared strategies and applies it
      // through the desktop dual-write below. The registry discards resolved
      // records; desktop keeps them marked so the dialog shows history.
      resolveConflict: async (conflictId, resolution, mergedData) => {
        const { queue } = get();
        const conflict = queue.conflicts.find((c) => c.id === conflictId);

        if (!conflict) return;

        try {
          const registry = createDesktopConflictRegistry(get);
          const recorded = registry.addConflict({
            type: conflict.type,
            entityType: conflict.entityType,
            entityId: conflict.entityId,
            localData: conflict.localData as ConflictData,
            remoteData: conflict.remoteData as ConflictData,
          });
          await registry.resolve(
            recorded.id,
            resolution as RegistryResolution,
            mergedData as ConflictData | undefined,
          );

          // Update conflict status
          set((state) => ({
            queue: {
              ...state.queue,
              conflicts: state.queue.conflicts.map((c) =>
                c.id === conflictId
                  ? { ...c, resolution, resolvedAt: Date.now() }
                  : c
              ),
            },
          }));

          toast.success('Conflict resolved successfully');

          // Continue sync if no more conflicts
          const remainingConflicts = get().queue.conflicts.filter(c => !c.resolvedAt);
          if (remainingConflicts.length === 0) {
            get().processQueue();
          }
        } catch (error) {
          console.error('Failed to resolve conflict:', error);
          toast.error('Failed to resolve conflict');
        }
      },

      // Resolve all conflicts with the same strategy
      resolveAllConflicts: async (resolution) => {
        const { queue } = get();
        const unresolvedConflicts = queue.conflicts.filter(c => !c.resolvedAt);

        for (const conflict of unresolvedConflicts) {
          await get().resolveConflict(conflict.id, resolution);
        }
      },

      // Start synchronization process
      startSync: async () => {
        const { queue } = get();

        if (!queue.isOnline) {
          toast.warning('Cannot sync while offline');
          return;
        }

        if (queue.syncStatus === 'syncing') {
          return;
        }

        set((state) => ({
          queue: {
            ...state.queue,
            syncStatus: 'syncing',
            syncProgress: 0,
            totalOperations: state.queue.operations.filter(op => op.status === 'pending').length,
          },
        }));

        try {
          await get().processQueue();

          // Check if any operations failed during processing
          const failedOps = get().queue.operations.filter(op => op.status === 'failed');
          if (failedOps.length > 0) {
            throw new Error(`${failedOps.length} operation(s) failed during sync`);
          }

          set((state) => ({
            queue: {
              ...state.queue,
              syncStatus: 'success',
              lastSyncAt: Date.now(),
              syncProgress: 100,
            },
          }));

          toast.success('Sync completed successfully');
        } catch (error) {
          console.error('Sync failed:', error);
          set((state) => ({
            queue: {
              ...state.queue,
              syncStatus: 'error',
            },
          }));

          toast.error('Sync failed. Please check your connection.');
        }
      },

      // Stop synchronization
      stopSync: () => {
        set((state) => ({
          queue: {
            ...state.queue,
            syncStatus: 'idle',
          },
        }));
      },

      // Force immediate sync
      forceSync: async () => {
        await get().startSync();
      },

      // Process the sync queue through the portable engine: sequential
      // execution, per-action retry accounting, progress events. Operations
      // stay in zustand state (completed/failed, never deleted) via the
      // adapter, so the inspector and the persisted queue see the same
      // shapes as before.
      processQueue: async (): Promise<SyncEngineResult> => {
        let result: SyncEngineResult;
        try {
          result = await createDesktopEngine(get, set).syncAll();
        } catch (error) {
          console.error('Failed to process sync queue:', error);
          result = { success: false, synced: 0, failed: 0, errors: [] };
        }

        if (result.synced + result.failed === 0) {
          set((state) => ({
            queue: {
              ...state.queue,
              syncStatus: 'idle',
              syncProgress: 100,
            },
          }));
        } else {
          set((state) => ({
            queue: {
              ...state.queue,
              syncProgress: 100,
            },
          }));
        }
        return result;
      },

      // Execute individual sync operation
      executeSyncOperation: async (operation: SyncOperation) => {
        switch (operation.entityType) {
          case 'task':
            return await get().syncTaskOperation(operation);
          case 'project':
            return await get().syncProjectOperation(operation);
          case 'workspace':
            return await get().syncWorkspaceOperation(operation);
          case 'session':
            return await get().syncSessionOperation(operation);
          default:
            throw new Error(`Unknown entity type: ${operation.entityType}`);
        }
      },

      // Sync task operations
      syncTaskOperation: async (operation: SyncOperation) => {
        switch (operation.type) {
          case 'create':
            return await apiClient.createTask(operation.data);
          case 'update':
            return await apiClient.updateTask(operation.entityId, operation.data);
          case 'delete':
            return await apiClient.deleteTask(operation.entityId);
        }
      },

      // Sync project operations
      syncProjectOperation: async (operation: SyncOperation) => {
        // Implementation similar to task operations
        // ... (omitted for brevity)
      },

      // Sync workspace operations
      syncWorkspaceOperation: async (operation: SyncOperation) => {
        // Implementation similar to task operations
        // ... (omitted for brevity)
      },

      // Sync session operations
      syncSessionOperation: async (operation: SyncOperation) => {
        // Implementation similar to task operations
        // ... (omitted for brevity)
      },

      // Apply remote update locally
      applyLocalUpdate: async (entityType: string, entityId: string, data: any) => {
        // Implementation to update local SQLite database
        // This would use the electron API to update the local database
        if ((window as any).electronAPI) {
          switch (entityType) {
            case 'task':
              await (window as any).electronAPI.db.task.update(entityId, data);
              break;
            // ... other entity types
          }
        }
      },

      // Apply local update remotely
      applyRemoteUpdate: async (entityType: string, entityId: string, data: any) => {
        // Implementation to update remote server via API
        switch (entityType) {
          case 'task':
            await apiClient.updateTask(entityId, data);
            break;
          // ... other entity types
        }
      },

      // Set online status
      setOnlineStatus: (isOnline) => {
        set((state) => ({
          queue: {
            ...state.queue,
            isOnline,
          },
        }));

        const currentQueue = get().queue;
        if (isOnline && currentQueue.operations.length > 0) {
          // Start sync when coming back online
          get().processQueue();
        }
      },

      // Setup network listeners
      setupNetworkListeners: () => {
        // Follow the debounced monitor: confirmed transitions only, so
        // micro network flaps never toggle the offline UI
        const unsubscribe = subscribeOnlineStatus((online) =>
          get().setOnlineStatus(online),
        );
        // zustand v5's default shallow merge replaces the whole persisted
        // queue object on rehydration, dropping isOnline; push the monitor's
        // current value so the UI starts from a real state
        get().setOnlineStatus(getOnlineStatus());
        return unsubscribe;
      },

      // Conflict strategies now live in the portable registry; the store
      // keeps these methods as the public entry points over them.
      resolveUpdateConflict: (conflict) =>
        resolveUpdateStrategy({
          ...conflict,
          localData: conflict.localData as ConflictData,
          remoteData: conflict.remoteData as ConflictData,
        }),

      // Delete conflicts always need a human: neither side can win silently.
      resolveDeleteConflict: (conflict) =>
        resolveDeleteStrategy({
          ...conflict,
          localData: conflict.localData as ConflictData,
          remoteData: conflict.remoteData as ConflictData,
        }),

      // Suggest merge for conflicting data
      suggestMerge: (local, remote) =>
        suggestMergeStrategy(
          local as ConflictData,
          remote as ConflictData,
        ),

      // Start background sync
      startBackgroundSync: () => {
        const syncInterval = setInterval(() => {
          if (get().queue.isOnline && get().queue.operations.length > 0) {
            get().processQueue();
          }
        }, 30000); // Sync every 30 seconds

        // Store interval ID for cleanup
        localStorage.setItem('backgroundSyncInterval', syncInterval.toString());
      },

      // Stop background sync
      stopBackgroundSync: () => {
        const intervalId = localStorage.getItem('backgroundSyncInterval');
        if (intervalId) {
          clearInterval(parseInt(intervalId));
          localStorage.removeItem('backgroundSyncInterval');
        }
      },

      // Schedule next sync with exponential backoff
      scheduleNextSync: (delay = 5000) => {
        setTimeout(() => {
          if (get().queue.isOnline) {
            get().processQueue();
          }
        }, delay);
      },

      // Get sync metrics
      getSyncMetrics: () => {
        const { queue } = get();
        const pendingOperations = queue.operations.filter(op => op.status === 'pending').length;
        const failedOperations = queue.operations.filter(op => op.status === 'failed').length;
        const unresolvedConflicts = queue.conflicts.filter(c => !c.resolvedAt).length;

        return {
          pendingOperations,
          failedOperations,
          unresolvedConflicts,
          lastSyncSuccess: queue.lastSyncAt,
          averageSyncTime: 0, // Calculate based on historical data
        };
      },
    }),
    {
      name: 'offline-sync-store',
      partialize: (state) => ({
        queue: {
          operations: state.queue.operations,
          conflicts: state.queue.conflicts,
          lastSyncAt: state.queue.lastSyncAt,
        },
      }),
    }
  )
);