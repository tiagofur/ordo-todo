import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHooks } from '../hooks';

const mockApiClient = {
  getTask: vi.fn(),
  getTaskDetails: vi.fn(),
} as any;

const hooks = createHooks({ apiClient: mockApiClient } as any);

// Default client retries (no test-wide retry:false): a 404 on a deleted
// task must NOT be retried — the browser logs every attempt.
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 3, retryDelay: 1, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const notFound = { response: { status: 404 } };

describe('single-task reads never retry a 404', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useTaskDetails calls the API exactly once on 404', async () => {
    mockApiClient.getTaskDetails.mockRejectedValue(notFound);

    const { result } = renderHook(() => hooks.useTaskDetails('gone'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockApiClient.getTaskDetails).toHaveBeenCalledTimes(1);
  });

  it('useTask calls the API exactly once on 404', async () => {
    mockApiClient.getTask.mockRejectedValue(notFound);

    const { result } = renderHook(() => hooks.useTask('gone'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockApiClient.getTask).toHaveBeenCalledTimes(1);
  });
});
