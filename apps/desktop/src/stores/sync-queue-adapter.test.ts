import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDesktopSyncQueueAdapter } from './sync-queue-adapter';
import type { SyncOperation } from './offline-sync-store';

function makeStore(initial: SyncOperation[] = []) {
  let operations = [...initial];
  return {
    getOperations: vi.fn(() => operations),
    upsertOperation: vi.fn((op: SyncOperation) => {
      operations = operations.some((o) => o.id === op.id)
        ? operations.map((o) => (o.id === op.id ? op : o))
        : [...operations, op];
    }),
    operations: () => operations,
  };
}

const pendingOp: SyncOperation = {
  id: 'op_1',
  type: 'create',
  entityType: 'task',
  entityId: 'task-1',
  data: { title: 't' },
  timestamp: 1700000000000,
  retryCount: 0,
  status: 'pending',
};

describe('createDesktopSyncQueueAdapter', () => {
  it('loads only pending operations mapped to the engine contract', async () => {
    const store = makeStore([
      pendingOp,
      { ...pendingOp, id: 'op_2', status: 'completed' },
      { ...pendingOp, id: 'op_3', status: 'failed' },
    ]);
    const adapter = createDesktopSyncQueueAdapter(store);

    const loaded = await adapter.load();

    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toMatchObject({
      id: 'op_1',
      type: 'create',
      method: 'POST',
      entityType: 'task',
      entityId: 'task-1',
      createdAt: 1700000000000,
      retryCount: 0,
    });
    expect(loaded[0]?.url).toContain('task/task-1');
  });

  it('marks successful actions completed instead of deleting them', async () => {
    const store = makeStore([pendingOp]);
    const adapter = createDesktopSyncQueueAdapter(store);

    await adapter.remove('op_1');

    expect(store.operations()).toHaveLength(1);
    expect(store.operations()[0]).toMatchObject({ id: 'op_1', status: 'completed' });
  });

  it('marks exhausted retries failed with counts for the inspector', async () => {
    const store = makeStore([pendingOp]);
    const adapter = createDesktopSyncQueueAdapter(store);

    await adapter.updateRetry('op_1', 1, 'boom');

    expect(store.operations()[0]).toMatchObject({
      status: 'failed',
      retryCount: 1,
      lastError: 'boom',
    });
    expect(store.operations()[0]?.lastRetry).toEqual(expect.any(Number));
  });

  it('saves engine-built actions back into the desktop shape', async () => {
    const store = makeStore();
    const adapter = createDesktopSyncQueueAdapter(store);

    await adapter.save({
      id: 'op_9',
      type: 'delete',
      url: 'desktop://project/p-1',
      method: 'DELETE',
      data: {},
      entityType: 'project',
      entityId: 'p-1',
      createdAt: 1700000000009,
      retryCount: 0,
    });

    expect(store.operations()).toHaveLength(1);
    expect(store.operations()[0]).toMatchObject({
      id: 'op_9',
      type: 'delete',
      entityType: 'project',
      entityId: 'p-1',
      timestamp: 1700000000009,
      status: 'pending',
    });
  });

  it('ignores remove and retry for unknown ids', async () => {
    const store = makeStore([pendingOp]);
    const adapter = createDesktopSyncQueueAdapter(store);

    await adapter.remove('missing');
    await adapter.updateRetry('missing', 1, 'x');

    expect(store.operations()).toHaveLength(1);
    expect(store.upsertOperation).not.toHaveBeenCalled();
  });
});
