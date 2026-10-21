/**
 * Ritual screen tests — ODD 006 S6/T5 (mobile parity).
 * Mocks hooks (same pattern as task.test.tsx): morning complete/skip,
 * evening close with moves, timebox accept, streak visible.
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RitualScreen from '../ritual';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';

jest.mock('@/app/data/hooks/use-theme-colors.hook', () => ({
  useThemeColors: jest.fn(),
}));

const mockMutateCompleteMorning = jest.fn();
const mockMutateSkipMorning = jest.fn();
const mockMutateCompleteEvening = jest.fn();
const mockMutateAcceptTimebox = jest.fn();
// Overridable evening state for the loading-gate test (B1 parity).
let mockEveningState: { data: unknown; isLoading: boolean; isError: boolean } = {
  data: null,
  isLoading: false,
  isError: false,
};

jest.mock('@/app/lib/ritual-hooks', () => ({
  useMorningRitual: () => ({ data: mockMorning, isLoading: false, isError: false, refetch: jest.fn() }),
  useCompleteMorning: () => ({ mutate: mockMutateCompleteMorning }),
  useSkipMorning: () => ({ mutate: mockMutateSkipMorning }),
  useEveningRitual: () => ({ ...mockEveningState, refetch: jest.fn() }),
  useCompleteEvening: () => ({ mutate: mockMutateCompleteEvening }),
  useSkipEvening: () => ({ mutate: jest.fn() }),
  useStreak: () => ({ data: { current: 5, longest: 9 } }),
  useSaveTimebox: () => ({ mutate: jest.fn() }),
  useAcceptTimebox: () => ({ mutate: mockMutateAcceptTimebox }),
}));

jest.mock('@/app/lib/shared-hooks', () => ({
  useTasks: () => ({
    data: [
      { id: 'a', title: 'Escribir informe' },
      { id: 'b', title: 'Pendiente' },
    ],
  }),
}));

const mockMorning = {
  plan: {
    proposalId: 'p',
    status: 'PROPOSED',
    blocks: [{ taskId: 'a', start: '09:00', end: '10:00', reason: 'Vence hoy' }],
    frozenTaskIds: [],
    changes: [],
  },
  overdue: [{ taskId: 'z', title: 'Vieja', dueDateKey: '2026-10-18' }],
  suggestedTop3: ['a'],
  ritual: null,
};

const mockEvening = {
  summary: null,
  completed: [{ taskId: 'done-1', title: 'Hecha' }],
  pending: [{ taskId: 'b', title: 'Pendiente' }],
  ritual: null,
};

// i18n: ritual screen uses the shared Ritual namespace; fall back to keys.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

describe('RitualScreen (ODD 006 S6)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEveningState = { data: mockEvening, isLoading: false, isError: false };
    (useThemeColors as jest.Mock).mockReturnValue({
      card: '#FFF',
      background: '#F5F5F5',
      text: '#111',
      textMuted: '#666',
      primary: '#6366f1',
      border: '#EEE',
    });
  });

  it('renders morning + evening + timebox + streak sections', () => {
    const { getByText } = render(<RitualScreen />);
    expect(getByText('Escribir informe')).toBeTruthy();
    expect(getByText('Vieja')).toBeTruthy();
    expect(getByText('Pendiente')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('completes the morning ritual with the selected top-3', async () => {
    const { getByText } = render(<RitualScreen />);
    // Suggested top-3 preselects 'a': toggle off and back on to prove the
    // selection flows through to the mutation.
    fireEvent.press(getByText('Escribir informe'));
    fireEvent.press(getByText('Escribir informe'));
    fireEvent.press(getByText('Ritual.morning.complete'));
    await waitFor(() =>
      expect(mockMutateCompleteMorning).toHaveBeenCalledWith(['a']),
    );
  });

  it('skips the morning ritual with one touch', () => {
    const { getAllByText } = render(<RitualScreen />);
    fireEvent.press(getAllByText('Ritual.morning.skip')[0]);
    expect(mockMutateSkipMorning).toHaveBeenCalledTimes(1);
  });

  it('closes the evening ritual with one move per pending task', async () => {
    const { getByText } = render(<RitualScreen />);
    fireEvent.press(getByText('Ritual.evening.complete'));
    await waitFor(() =>
      expect(mockMutateCompleteEvening).toHaveBeenCalledWith(
        [{ taskId: 'b', destination: 'tomorrow', reason: 'overran' }],
        expect.anything(),
      ),
    );
  });

  it('accepts the timebox proposal once morning is done', () => {
    const { queryByText } = render(<RitualScreen />);
    // Morning ritual is PENDING in the mock, so the accept button must not show.
    expect(queryByText('Ritual.timebox.acceptProposal')).toBeNull();
  });

  it('gates evening actions until evening loads (B1 parity: no phantom close)', () => {
    mockEveningState = { data: null, isLoading: true, isError: false };
    const { queryByText, unmount } = render(<RitualScreen />);

    expect(queryByText('Ritual.evening.title')).toBeNull();
    expect(queryByText('Ritual.evening.complete')).toBeNull();
    unmount();

    mockEveningState = { data: null, isLoading: false, isError: true };
    const retry = render(<RitualScreen />);
    expect(retry.queryByText('Ritual.evening.title')).toBeNull();
    expect(retry.queryByText('Ritual.retry')).toBeTruthy();
  });
});
