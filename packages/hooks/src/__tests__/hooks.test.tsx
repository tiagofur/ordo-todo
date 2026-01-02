import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createHooks } from '../hooks';
import { queryKeys } from '../query-keys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('createHooks factory', () => {
  const mockApiClient = {
    getCurrentUser: vi.fn(),
    getWorkspaces: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
  } as any;

  const hooks = createHooks({ apiClient: mockApiClient });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getCurrentUser when useCurrentUser is used', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    mockApiClient.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => hooks.useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
    expect(mockApiClient.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('should call getWorkspaces when useWorkspaces is used', async () => {
    const mockWorkspaces = [{ id: 'ws-1', name: 'WS 1' }];
    mockApiClient.getWorkspaces.mockResolvedValue(mockWorkspaces);

    const { result } = renderHook(() => hooks.useWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockWorkspaces);
    expect(mockApiClient.getWorkspaces).toHaveBeenCalledTimes(1);
  });

  it('should call createTask when useCreateTask mutation is triggered', async () => {
    const mockTask = { id: 'task-1', title: 'New Task', projectId: 'p1' };
    mockApiClient.createTask.mockResolvedValue(mockTask);

    const { result } = renderHook(() => hooks.useCreateTask(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ title: 'New Task', projectId: 'p1' });

    expect(mockApiClient.createTask).toHaveBeenCalledWith({ title: 'New Task', projectId: 'p1' });
  });

  it('should handle optimistic updates in useUpdateTask', async () => {
    const initialTask = { id: 'task-1', title: 'Old Title', status: 'TODO' };
    const updateData = { title: 'New Title' };
    mockApiClient.updateTask.mockImplementation(() => new Promise(() => {})); // Never resolves to test optimistic state

    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.task('task-1'), initialTask);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => hooks.useUpdateTask(), { wrapper });

    await act(async () => {
        result.current.mutate({ taskId: 'task-1', data: updateData });
    });

    // OnMutate should have updated the cache optimistically
    const cachedTask = queryClient.getQueryData(queryKeys.task('task-1'));
    expect(cachedTask).toMatchObject(updateData);
    expect((cachedTask as any).title).toBe('New Title');
    
    expect(mockApiClient.updateTask).toHaveBeenCalledWith('task-1', updateData);
  });
});
