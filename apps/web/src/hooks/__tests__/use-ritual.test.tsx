import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type {
  RitualEveningView,
  RitualMorningView,
  RitualStreak,
  RitualTimeboxBlock,
} from '@ordo-todo/api-client';
import {
  useAcceptTimebox,
  useCompleteEvening,
  useCompleteMorning,
  useEveningRitual,
  useMorningRitual,
  useSaveTimebox,
  useSkipEvening,
  useSkipMorning,
  useStreak,
} from '../use-ritual';

// Mock the API client (only the ritual surface).
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getMorningRitual: vi.fn(),
    completeMorningRitual: vi.fn(),
    skipMorningRitual: vi.fn(),
    getEveningRitual: vi.fn(),
    completeEveningRitual: vi.fn(),
    skipEveningRitual: vi.fn(),
    getRitualStreak: vi.fn(),
    saveTimebox: vi.fn(),
    acceptTimeboxProposal: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api-client';

const MORNING: RitualMorningView = {
  plan: { proposalId: 'p', status: 'PROPOSED', blocks: [], frozenTaskIds: [], changes: [] },
  overdue: [],
  suggestedTop3: ['a'],
  ritual: null,
};

const EVENING: RitualEveningView = {
  summary: null,
  completed: [],
  pending: [{ taskId: 'b', title: 'Llamar' }],
  ritual: null,
};

describe('use-ritual hooks (ODD 006 T5)', () => {
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

  it('useMorningRitual returns the morning view', async () => {
    vi.mocked(apiClient.getMorningRitual).mockResolvedValue(MORNING);
    const { result } = renderHook(() => useMorningRitual(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(MORNING));
  });

  it('useCompleteMorning posts the top-3 and invalidates ritual + tasks', async () => {
    vi.mocked(apiClient.completeMorningRitual).mockResolvedValue({
      morningStatus: 'DONE',
      morningAt: '2026-10-20T12:00:00.000Z',
      morningTop3: ['a'],
      morningPlannedAt: '2026-10-20T12:00:00.000Z',
      eveningStatus: 'PENDING',
      eveningAt: null,
    });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCompleteMorning(), { wrapper });
    result.current.mutate(['a']);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.completeMorningRitual).toHaveBeenCalledWith(['a']);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ritual'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] });
  });

  it('useSkipMorning skips and invalidates ritual + tasks', async () => {
    vi.mocked(apiClient.skipMorningRitual).mockResolvedValue({
      morningStatus: 'SKIPPED',
      morningAt: '2026-10-20T12:00:00.000Z',
      morningTop3: [],
      morningPlannedAt: null,
      eveningStatus: 'PENDING',
      eveningAt: null,
    });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSkipMorning(), { wrapper });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.skipMorningRitual).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ritual'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] });
  });

  it('useEveningRitual returns the evening view', async () => {
    vi.mocked(apiClient.getEveningRitual).mockResolvedValue(EVENING);
    const { result } = renderHook(() => useEveningRitual(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(EVENING));
  });

  it('useCompleteEvening posts moves and invalidates ritual + tasks', async () => {
    vi.mocked(apiClient.completeEveningRitual).mockResolvedValue({
      shutdownComplete: true,
      suggestion: 'Desconecta.',
      unmoved: [],
    });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCompleteEvening(), { wrapper });
    const moves = [{ taskId: 'b', destination: 'tomorrow' as const, reason: 'overran' as const }];
    result.current.mutate(moves);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.completeEveningRitual).toHaveBeenCalledWith(moves);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ritual'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] });
  });

  it('useSkipEvening skips and invalidates ritual + tasks', async () => {
    vi.mocked(apiClient.skipEveningRitual).mockResolvedValue({
      morningStatus: 'PENDING',
      morningAt: null,
      morningTop3: [],
      morningPlannedAt: null,
      eveningStatus: 'SKIPPED',
      eveningAt: '2026-10-20T20:00:00.000Z',
    });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSkipEvening(), { wrapper });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ritual'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] });
  });

  it('useStreak returns current + longest', async () => {
    const streak: RitualStreak = { current: 5, longest: 9 };
    vi.mocked(apiClient.getRitualStreak).mockResolvedValue(streak);
    const { result } = renderHook(() => useStreak(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(streak));
  });

  it('useSaveTimebox posts blocks and invalidates ritual + tasks', async () => {
    const blocks: RitualTimeboxBlock[] = [{ taskId: 'a', start: '09:00', end: '10:00' }];
    vi.mocked(apiClient.saveTimebox).mockResolvedValue(blocks);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSaveTimebox(), { wrapper });
    result.current.mutate([{ taskId: 'a', start: '09:00' }]);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.saveTimebox).toHaveBeenCalledWith([{ taskId: 'a', start: '09:00' }]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ritual'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] });
  });

  it('useAcceptTimebox accepts the proposal and invalidates ritual + tasks', async () => {
    const blocks: RitualTimeboxBlock[] = [{ taskId: 'a', start: '09:00', end: '10:00' }];
    vi.mocked(apiClient.acceptTimeboxProposal).mockResolvedValue(blocks);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useAcceptTimebox(), { wrapper });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.acceptTimeboxProposal).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ritual'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] });
  });
});
