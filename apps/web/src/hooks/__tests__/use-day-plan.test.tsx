import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { DayPlanView } from '@ordo-todo/api-client';
import {
  useApplyDayPlan,
  useDayPlan,
  useDayPlanRisks,
  useDismissDayPlan,
  useToggleFreezeDayPlan,
} from '../use-day-plan';

// Mock the API client (only the day-plan surface).
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getDayPlan: vi.fn(),
    getDayPlanRisks: vi.fn(),
    applyDayPlan: vi.fn(),
    dismissDayPlan: vi.fn(),
    freezeDayPlanBlock: vi.fn(),
    unfreezeDayPlanBlock: vi.fn(),
  },
}));

const PLAN: DayPlanView = {
  proposalId: 'prop-1',
  status: 'PROPOSED',
  blocks: [
    { taskId: 'a', start: '09:00', end: '10:00', reason: 'Vence hoy' },
  ],
  frozenTaskIds: [],
  changes: [],
};

describe('use-day-plan hooks (ODD 005 S6)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('useDayPlan returns the plan', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.getDayPlan).mockResolvedValue(PLAN);

    const { result } = renderHook(() => useDayPlan(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(PLAN);
  });

  it('useDayPlanRisks returns null on 404 (graceful degradation pre-T4b)', async () => {
    const { apiClient } = await import('@/lib/api-client');
    const { AxiosError, AxiosHeaders } = await import('axios');
    const notFound = new AxiosError(
      'Not Found', '404', undefined, undefined,
      {
        status: 404, statusText: 'Not Found', headers: {},
        config: { headers: new AxiosHeaders() }, data: {},
      },
    );
    vi.mocked(apiClient.getDayPlanRisks).mockRejectedValue(notFound);

    const { result } = renderHook(() => useDayPlanRisks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toBeNull();
  });

  it('useDayPlanRisks rethrows non-404 errors', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.getDayPlanRisks).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useDayPlanRisks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('useApplyDayPlan applies and invalidates', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.applyDayPlan).mockResolvedValue({ ...PLAN, status: 'APPLIED' });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useApplyDayPlan(), { wrapper });
    result.current.mutate('prop-1');

    await waitFor(() => {
      expect(apiClient.applyDayPlan).toHaveBeenCalledWith('prop-1');
    });
    await waitFor(() => {
      expect(invalidate).toHaveBeenCalled();
    });
  });

  it('useDismissDayPlan dismisses', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.dismissDayPlan).mockResolvedValue({ ...PLAN, status: 'DISMISSED' });

    const { result } = renderHook(() => useDismissDayPlan(), { wrapper });
    result.current.mutate('prop-1');

    await waitFor(() => {
      expect(apiClient.dismissDayPlan).toHaveBeenCalledWith('prop-1');
    });
  });

  it('useToggleFreezeDayPlan freezes and unfreezes', async () => {
    const { apiClient } = await import('@/lib/api-client');
    vi.mocked(apiClient.freezeDayPlanBlock).mockResolvedValue(PLAN);
    vi.mocked(apiClient.unfreezeDayPlanBlock).mockResolvedValue(PLAN);

    const { result } = renderHook(() => useToggleFreezeDayPlan(), { wrapper });
    result.current.mutate({ taskId: 'a', freeze: true });
    await waitFor(() => {
      expect(apiClient.freezeDayPlanBlock).toHaveBeenCalledWith('a');
    });
    result.current.mutate({ taskId: 'a', freeze: false });
    await waitFor(() => {
      expect(apiClient.unfreezeDayPlanBlock).toHaveBeenCalledWith('a');
    });
  });
});
