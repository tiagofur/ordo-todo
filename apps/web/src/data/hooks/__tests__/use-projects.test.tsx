import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects } from '../../../lib/api-hooks';
import type { ReactNode } from 'react';

// Mock the API client
vi.mock('../../../lib/api-client', () => ({
  apiClient: {
    getProjects: vi.fn(),
  }
}));

describe('useProjects Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should return projects data when query succeeds', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1', workspaceId: 'workspace-123' },
      { id: '2', name: 'Project 2', workspaceId: 'workspace-123' },
    ];

    // Mock the API client response
    const { apiClient } = await import('../../../lib/api-client');
    vi.mocked(apiClient.getProjects).mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjects('workspace-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProjects);
    expect(apiClient.getProjects).toHaveBeenCalledWith('workspace-123');
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useProjects('workspace-123'), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle error state', async () => {
    const { apiClient } = await import('../../../lib/api-client');
    vi.mocked(apiClient.getProjects).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useProjects('workspace-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should not fetch when no workspace is selected', () => {
    const { result } = renderHook(() => useProjects(''), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
  });
});
