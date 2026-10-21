import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { RitualSection } from '../ritual-section';

const MORNING = {
  plan: {
    proposalId: 'p',
    status: 'PROPOSED' as const,
    blocks: [{ taskId: 'a', start: '09:00', end: '10:00', reason: 'Vence hoy' }],
    frozenTaskIds: [],
    changes: [],
  },
  overdue: [{ taskId: 'z', title: 'Vieja', dueDateKey: '2026-10-18' }],
  suggestedTop3: ['a'],
  ritual: null,
};

const EVENING = {
  summary: null,
  completed: [{ taskId: 'done-1', title: 'Hecha' }],
  pending: [{ taskId: 'b', title: 'Pendiente' }],
  ritual: null,
};

const LABELS = {
  loading: 'Cargando...',
  loadError: 'Error al cargar',
  retry: 'Reintentar',
  morningTitle: 'Ritual de mañana',
  morningPlanTitle: 'Plan de hoy',
  morningPlanEmpty: 'Sin bloques',
  morningOverdueTitle: 'Vencidas',
  morningOverdueEmpty: 'Sin vencidas',
  morningTop3Title: 'Tu top-3',
  morningTop3Hint: 'Elige hasta 3',
  morningComplete: 'Completar ritual',
  morningSkip: 'Omitir',
  morningCompleted: 'Ritual completado',
  morningSkipped: 'Ritual omitido',
  morningDone: 'Mañana lista',
  morningError: 'No se pudo completar',
  morningSkippedToast: 'Mañana omitida',
  eveningTitle: 'Ritual de cierre',
  eveningSummaryTitle: 'Resumen',
  eveningSummaryEmpty: 'Sin resumen',
  eveningCompletedTitle: 'Completadas',
  eveningCompletedEmpty: 'Nada',
  eveningPendingTitle: 'Pendientes',
  eveningPendingEmpty: 'Día perfecto',
  eveningTomorrow: 'Mañana',
  eveningDate: 'Fecha',
  eveningArchived: 'Archivar',
  eveningOverran: 'Se alargó',
  eveningUrgent: 'Urgente',
  eveningNoEnergy: 'Sin energía',
  eveningOther: 'Otro',
  eveningComplete: 'Cerrar el día',
  eveningSkip: 'Omitir',
  eveningCompleted: 'Día cerrado',
  eveningSkipped: 'Cierre omitido',
  eveningShutdown: 'Apagado completo',
  eveningDone: 'Noche lista',
  eveningError: 'No se pudo cerrar',
  eveningSkippedToast: 'Cierre omitido',
  eveningUnmoved: 'Sin destino',
  eveningDatePlaceholder: 'YYYY-MM-DD',
  timeboxTitle: 'Bloques',
  timeboxEmpty: 'Sin top-3',
  timeboxStart: 'Inicio',
  timeboxEnd: 'Fin',
  timeboxSave: 'Guardar bloques',
  timeboxAccept: 'Aceptar propuesta',
  timeboxSaved: 'Bloques guardados',
  timeboxError: 'Error bloques',
  streakTitle: 'Racha',
  streakDays: 'días seguidos',
  streakBest: 'Mejor racha',
  streakNext: 'Próximo hito',
  streakReached: 'Hito alcanzado',
  streakEmpty: 'Sin racha',
};

const mutateCompleteMorning = vi.fn();
const mutateSkipMorning = vi.fn();
const mutateCompleteEvening = vi.fn();
const mutateSkipEvening = vi.fn();
const mutateSaveTimebox = vi.fn();
const mutateAcceptTimebox = vi.fn();

vi.mock('@/hooks/use-ritual', () => ({
  useMorningRitual: vi.fn(),
  useCompleteMorning: () => ({ mutate: mutateCompleteMorning }),
  useSkipMorning: () => ({ mutate: mutateSkipMorning }),
  useEveningRitual: vi.fn(),
  useCompleteEvening: () => ({ mutate: mutateCompleteEvening }),
  useSkipEvening: () => ({ mutate: mutateSkipEvening }),
  useStreak: vi.fn(),
  useSaveTimebox: () => ({ mutate: mutateSaveTimebox }),
  useAcceptTimebox: () => ({ mutate: mutateAcceptTimebox }),
}));

vi.mock('@/lib/api-hooks', () => ({
  useTasks: () => ({ data: [{ id: 'a', title: 'Escribir informe' }] }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

async function mockRitualState(state: {
  morning?: unknown;
  morningLoading?: boolean;
  morningError?: boolean;
  evening?: unknown;
  eveningLoading?: boolean;
  eveningError?: boolean;
  streak?: unknown;
}) {
  const hooks = await import('@/hooks/use-ritual');
  vi.mocked(hooks.useMorningRitual).mockReturnValue({
    data: (state.morning ?? null) as never,
    isLoading: state.morningLoading ?? false,
    isError: state.morningError ?? false,
    refetch: vi.fn(),
  } as never);
  vi.mocked(hooks.useEveningRitual).mockReturnValue({
    data: (state.evening ?? null) as never,
    isLoading: state.eveningLoading ?? false,
    isError: state.eveningError ?? false,
    refetch: vi.fn(),
  } as never);
  vi.mocked(hooks.useStreak).mockReturnValue({
    data: (state.streak ?? null) as never,
  } as never);
}

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<RitualSection labels={LABELS} />, { wrapper });
}

describe('RitualSection (ODD 006 T5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders morning blocks with resolved titles + overdue + streak', async () => {
    await mockRitualState({
      morning: MORNING,
      evening: EVENING,
      streak: { current: 5, longest: 9 },
    });
    renderSection();
    expect(screen.getByText('Ritual de mañana')).toBeDefined();
    expect(screen.getByText('Escribir informe')).toBeDefined();
    expect(screen.getByText('Vieja')).toBeDefined();
    expect(screen.getByText('Ritual de cierre')).toBeDefined();
    expect(screen.getByText('Racha')).toBeDefined();
  });

  it('completing the morning ritual posts the selected top-3', async () => {
    await mockRitualState({ morning: MORNING, evening: EVENING });
    renderSection();
    // Suggested top-3 preselects 'a': toggle off and back on to prove the
    // selection flows through to the mutation.
    fireEvent.click(screen.getByRole('checkbox', { name: /escribir informe/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /escribir informe/i }));
    fireEvent.click(screen.getByRole('button', { name: /completar ritual/i }));
    expect(mutateCompleteMorning).toHaveBeenCalledWith(['a'], expect.anything());
  });

  it('skipping the morning ritual calls skip', async () => {
    await mockRitualState({ morning: MORNING, evening: EVENING });
    renderSection();
    const skips = screen.getAllByRole('button', { name: /^omitir$/i });
    fireEvent.click(skips[0]);
    expect(mutateSkipMorning).toHaveBeenCalledTimes(1);
  });

  it('closing the evening ritual posts one move per pending task', async () => {
    await mockRitualState({ morning: MORNING, evening: EVENING });
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /cerrar el día/i }));
    expect(mutateCompleteEvening).toHaveBeenCalledWith(
      [{ taskId: 'b', destination: 'tomorrow', reason: 'overran' }],
      expect.anything(),
    );
  });

  it('accepting the timebox proposal calls accept', async () => {
    await mockRitualState({
      morning: {
        ...MORNING,
        ritual: {
          morningStatus: 'DONE',
          morningAt: '2026-10-20T12:00:00Z',
          morningTop3: ['a'],
          morningPlannedAt: '2026-10-20T12:00:00Z',
          eveningStatus: 'PENDING',
          eveningAt: null,
        },
      },
      evening: EVENING,
    });
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /aceptar propuesta/i }));
    expect(mutateAcceptTimebox).toHaveBeenCalledTimes(1);
  });

  it('skipping the evening ritual calls skip', async () => {
    await mockRitualState({ morning: MORNING, evening: EVENING });
    renderSection();
    const skips = screen.getAllByRole('button', { name: /^omitir$/i });
    fireEvent.click(skips[skips.length - 1]);
    expect(mutateSkipEvening).toHaveBeenCalledTimes(1);
  });

  it('saving manual timebox blocks posts the edited times', async () => {
    await mockRitualState({
      morning: {
        ...MORNING,
        ritual: {
          morningStatus: 'DONE',
          morningAt: '2026-10-20T12:00:00Z',
          morningTop3: ['a'],
          morningPlannedAt: '2026-10-20T12:00:00Z',
          eveningStatus: 'PENDING',
          eveningAt: null,
        },
      },
      evening: EVENING,
    });
    renderSection();
    const starts = screen.getAllByLabelText(/inicio/i);
    fireEvent.change(starts[0], { target: { value: '08:30' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar bloques/i }));
    expect(mutateSaveTimebox).toHaveBeenCalledWith(
      [{ taskId: 'a', start: '08:30', end: '10:00' }],
      expect.anything(),
    );
  });

  it('shows loading and error states with retry', async () => {
    await mockRitualState({ morningLoading: true });
    const { unmount } = renderSection();
    expect(screen.getByText('Cargando...')).toBeDefined();
    unmount();
    await mockRitualState({ morningError: true });
    renderSection();
    expect(screen.getByText('Error al cargar')).toBeDefined();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeDefined();
  });

  it('gates evening actions until evening loads (B1: no phantom close)', async () => {
    await mockRitualState({ morning: MORNING, eveningLoading: true });
    const { unmount } = renderSection();

    // Loading placeholder instead of the close card: no actions available.
    expect(screen.queryByText('Ritual de cierre')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cerrar el día' })).toBeNull();
    unmount();

    await mockRitualState({ morning: MORNING, eveningError: true });
    renderSection();
    expect(screen.queryByText('Ritual de cierre')).toBeNull();
  });
});
