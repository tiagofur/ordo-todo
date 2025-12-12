import { act, renderHook, waitFor } from '@testing-library/react';
import { useOfflineSyncStore } from './offline-sync-store';
import { createMockTask, createMockProject } from '@/test/setup';

// Mock API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    reportAnalytics: vi.fn(),
  },
}));

describe('useOfflineSyncStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useOfflineSyncStore.setState({
      queue: {
        operations: [],
        conflicts: [],
        isOnline: true,
        syncStatus: 'idle',
        syncProgress: 0,
        totalOperations: 0,
      },
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    expect(result.current.queue.operations).toHaveLength(0);
    expect(result.current.queue.conflicts).toHaveLength(0);
    expect(result.current.queue.isOnline).toBe(true);
    expect(result.current.queue.syncStatus).toBe('idle');
    expect(result.current.queue.syncProgress).toBe(0);
  });

  it('should add operation to queue', () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    const operation = {
      type: 'create' as const,
      entityType: 'task' as const,
      entityId: 'task-1',
      data: { title: 'New Task' },
    };

    act(() => {
      result.current.addOperation(operation);
    });

    expect(result.current.queue.operations).toHaveLength(1);
    const addedOp = result.current.queue.operations[0];
    expect(addedOp.type).toBe('create');
    expect(addedOp.entityType).toBe('task');
    expect(addedOp.entityId).toBe('task-1');
    expect(addedOp.data).toEqual({ title: 'New Task' });
    expect(addedOp.status).toBe('pending');
    expect(addedOp.retryCount).toBe(0);
  });

  it('should remove operation from queue', () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    // Add operation first
    act(() => {
      result.current.addOperation({
        type: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: { title: 'New Task' },
      });
    });

    expect(result.current.queue.operations).toHaveLength(1);

    // Remove operation
    const operationId = result.current.queue.operations[0].id;
    act(() => {
      result.current.removeOperation(operationId);
    });

    expect(result.current.queue.operations).toHaveLength(0);
  });

  it('should retry failed operation', () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    // Add and mark operation as failed
    act(() => {
      result.current.addOperation({
        type: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: { title: 'New Task' },
      });
    });

    const operationId = result.current.queue.operations[0].id;

    // Manually mark as failed for testing
    act(() => {
      result.current.queue.operations = result.current.queue.operations.map(op =>
        op.id === operationId
          ? { ...op, status: 'failed' as const, retryCount: 2, lastRetry: Date.now() }
          : op
      );
    });

    // Retry operation
    act(() => {
      result.current.retryOperation(operationId);
    });

    const retriedOp = result.current.queue.operations.find(op => op.id === operationId);
    expect(retriedOp?.status).toBe('pending');
    expect(retriedOp?.lastRetry).toBeDefined();
  });

  it('should add conflict to resolution queue', () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    const conflict = {
      type: 'update' as const,
      entityType: 'task' as const,
      entityId: 'task-1',
      localData: { title: 'Local Title' },
      remoteData: { title: 'Remote Title' },
    };

    act(() => {
      result.current.addConflict(conflict);
    });

    expect(result.current.queue.conflicts).toHaveLength(1);
    const addedConflict = result.current.queue.conflicts[0];
    expect(addedConflict.type).toBe('update');
    expect(addedConflict.entityType).toBe('task');
    expect(addedConflict.entityId).toBe('task-1');
    expect(addedConflict.localData).toEqual({ title: 'Local Title' });
    expect(addedConflict.remoteData).toEqual({ title: 'Remote Title' });
    expect(addedConflict.resolution).toBeUndefined();
  });

  it('should resolve conflict with local data', async () => {
    const { result } = renderHook(() => useOfflineSyncStore());
    const { apiClient } = await import('@/lib/api-client');

    // Mock successful API call
    vi.mocked(apiClient.updateTask).mockResolvedValue({ id: 'task-1', title: 'Local Title' });

    // Add conflict
    act(() => {
      result.current.addConflict({
        type: 'update',
        entityType: 'task',
        entityId: 'task-1',
        localData: { title: 'Local Title' },
        remoteData: { title: 'Remote Title' },
      });
    });

    const conflictId = result.current.queue.conflicts[0].id;

    // Resolve with local data
    await act(async () => {
      await result.current.resolveConflict(conflictId, 'local');
    });

    const resolvedConflict = result.current.queue.conflicts[0];
    expect(resolvedConflict.resolution).toBe('local');
    expect(resolvedConflict.resolvedAt).toBeDefined();
    expect(apiClient.updateTask).toHaveBeenCalledWith('task-1', { title: 'Local Title' });
  });

  it('should resolve conflict with remote data', async () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    // Mock electron API
    const mockUpdateTask = vi.fn().mockResolvedValue({ id: 'task-1', title: 'Remote Title' });
    Object.defineProperty(window, 'electronAPI', {
      value: {
        ...window.electronAPI,
        db: {
          ...window.electronAPI?.db,
          task: {
            ...window.electronAPI?.db?.task,
            update: mockUpdateTask,
          },
        },
      },
      writable: true,
    });

    // Add conflict
    act(() => {
      result.current.addConflict({
        type: 'update',
        entityType: 'task',
        entityId: 'task-1',
        localData: { title: 'Local Title' },
        remoteData: { title: 'Remote Title' },
      });
    });

    const conflictId = result.current.queue.conflicts[0].id;

    // Resolve with remote data
    await act(async () => {
      await result.current.resolveConflict(conflictId, 'remote');
    });

    const resolvedConflict = result.current.queue.conflicts[0];
    expect(resolvedConflict.resolution).toBe('remote');
    expect(resolvedConflict.resolvedAt).toBeDefined();
    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { title: 'Remote Title' });
  });

  it('should resolve conflict with merge data', async () => {
    const { result } = renderHook(() => useOfflineSyncStore());
    const { apiClient } = await import('@/lib/api-client');

    // Mock successful API calls
    vi.mocked(apiClient.updateTask).mockResolvedValue({ id: 'task-1', title: 'Merged Title' });

    // Mock electron API
    const mockUpdateTask = vi.fn().mockResolvedValue({ id: 'task-1', title: 'Merged Title' });
    Object.defineProperty(window, 'electronAPI', {
      value: {
        ...window.electronAPI,
        db: {
          ...window.electronAPI?.db,
          task: {
            ...window.electronAPI?.db?.task,
            update: mockUpdateTask,
          },
        },
      },
      writable: true,
    });

    // Add conflict
    act(() => {
      result.current.addConflict({
        type: 'update',
        entityType: 'task',
        entityId: 'task-1',
        localData: { title: 'Local Title', description: 'Local Desc' },
        remoteData: { title: 'Remote Title', priority: 'HIGH' },
      });
    });

    const conflictId = result.current.queue.conflicts[0].id;

    // Resolve with merged data
    const mergedData = {
      title: 'Merged Title',
      description: 'Local Desc',
      priority: 'HIGH',
    };

    await act(async () => {
      await result.current.resolveConflict(conflictId, 'merge', mergedData);
    });

    const resolvedConflict = result.current.queue.conflicts[0];
    expect(resolvedConflict.resolution).toBe('merge');
    expect(resolvedConflict.resolvedAt).toBeDefined();
    expect(apiClient.updateTask).toHaveBeenCalledWith('task-1', mergedData);
    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', mergedData);
  });

  it('should resolve all conflicts with same strategy', async () => {
    const { result } = renderHook(() => useOfflineSyncStore());
    const { apiClient } = await import('@/lib/api-client');

    // Mock successful API calls
    vi.mocked(apiClient.updateTask).mockResolvedValue({ id: 'task-1', title: 'Local Title' });

    // Add multiple conflicts
    act(() => {
      result.current.addConflict({
        type: 'update',
        entityType: 'task',
        entityId: 'task-1',
        localData: { title: 'Local Title 1' },
        remoteData: { title: 'Remote Title 1' },
      });
      result.current.addConflict({
        type: 'update',
        entityType: 'task',
        entityId: 'task-2',
        localData: { title: 'Local Title 2' },
        remoteData: { title: 'Remote Title 2' },
      });
    });

    expect(result.current.queue.conflicts).toHaveLength(2);

    // Resolve all with local strategy
    await act(async () => {
      await result.current.resolveAllConflicts('local');
    });

    expect(result.current.queue.conflicts.every(c => c.resolution === 'local')).toBe(true);
    expect(result.current.queue.conflicts.every(c => c.resolvedAt)).toBe(true);
    expect(apiClient.updateTask).toHaveBeenCalledTimes(2);
  });

  it('should sync operations when online', async () => {
    const { result } = renderHook(() => useOfflineSyncStore());
    const { apiClient } = await import('@/lib/api-client');

    // Mock successful API call
    vi.mocked(apiClient.createTask).mockResolvedValue({ id: 'task-1', title: 'New Task' });

    // Add operation
    act(() => {
      result.current.addOperation({
        type: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: { title: 'New Task' },
      });
    });

    expect(result.current.queue.syncStatus).toBe('idle');

    // Start sync
    await act(async () => {
      await result.current.startSync();
    });

    expect(result.current.queue.syncStatus).toBe('success');
    expect(apiClient.createTask).toHaveBeenCalledWith({ title: 'New Task' });
  });

  it('should handle offline status', () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    // Set offline
    act(() => {
      result.current.setOnlineStatus(false);
    });

    expect(result.current.queue.isOnline).toBe(false);

    // Set online
    act(() => {
      result.current.setOnlineStatus(true);
    });

    expect(result.current.queue.isOnline).toBe(true);
  });

  it('should not sync when offline', async () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    // Set offline
    act(() => {
      result.current.setOnlineStatus(false);
    });

    // Add operation
    act(() => {
      result.current.addOperation({
        type: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: { title: 'New Task' },
      });
    });

    // Try to sync
    await act(async () => {
      await result.current.startSync();
    });

    // Should remain idle and not attempt to sync
    expect(result.current.queue.syncStatus).toBe('idle');
  });

  it('should get sync metrics', () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    // Add some test data
    act(() => {
      result.current.addOperation({
        type: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: { title: 'New Task' },
      });
      result.current.addConflict({
        type: 'update',
        entityType: 'task',
        entityId: 'task-1',
        localData: { title: 'Local' },
        remoteData: { title: 'Remote' },
      });
    });

    // Mark one operation as failed
    const operationId = result.current.queue.operations[0].id;
    act(() => {
      result.current.queue.operations = result.current.queue.operations.map(op =>
        op.id === operationId ? { ...op, status: 'failed' as const } : op
      );
    });

    const metrics = result.current.getSyncMetrics();

    expect(metrics.pendingOperations).toBe(0);
    expect(metrics.failedOperations).toBe(1);
    expect(metrics.unresolvedConflicts).toBe(1);
  });

  it('should clear completed operations', () => {
    const { result } = renderHook(() => useOfflineSyncStore());

    // Add multiple operations
    act(() => {
      result.current.addOperation({
        type: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: { title: 'Task 1' },
      });
      result.current.addOperation({
        type: 'create',
        entityType: 'task',
        entityId: 'task-2',
        data: { title: 'Task 2' },
      });
    });

    expect(result.current.queue.operations).toHaveLength(2);

    // Mark one as completed
    act(() => {
      result.current.queue.operations = result.current.queue.operations.map((op, index) =>
        index === 0 ? { ...op, status: 'completed' as const } : op
      );
    });

    // Clear completed
    act(() => {
      result.current.clearCompletedOperations();
    });

    expect(result.current.queue.operations).toHaveLength(1);
    expect(result.current.queue.operations[0].status).toBe('pending');
  });

  it('should handle sync errors gracefully', async () => {
    const { result } = renderHook(() => useOfflineSyncStore());
    const { apiClient } = await import('@/lib/api-client');

    // Mock API error
    vi.mocked(apiClient.createTask).mockRejectedValue(new Error('API Error'));

    // Add operation
    act(() => {
      result.current.addOperation({
        type: 'create',
        entityType: 'task',
        entityId: 'task-1',
        data: { title: 'New Task' },
      });
    });

    // Start sync should handle error
    await act(async () => {
      await result.current.startSync();
    });

    expect(result.current.queue.syncStatus).toBe('error');
    expect(result.current.queue.operations[0].status).toBe('failed');
    expect(result.current.queue.operations[0].retryCount).toBe(1);
  });
});