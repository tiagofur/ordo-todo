import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { DayPlanSection } from '../day-plan-section';

const PLAN = {
  proposalId: 'prop-1',
  status: 'PROPOSED' as const,
  blocks: [
    { taskId: 'a', start: '09:00', end: '10:00', reason: 'Vence hoy' },
  ],
  frozenTaskIds: [],
  changes: [
    {
      taskId: 'a',
      type: 'moved' as const,
      from: { start: '08:00', end: '09:00' },
      to: { start: '09:00', end: '10:00' },
      reason: 'La llamada se alargó',
    },
  ],
};

const LABELS = {
  loading: 'Cargando...',
  loadError: 'Error al cargar',
  retry: 'Reintentar',
  title: 'Mi plan de hoy',
  planEmpty: 'Sin bloques',
  planFrozen: 'Fijo',
  planFreeze: 'Fijar',
  planUnfreeze: 'Soltar',
  changesTitle: 'Qué cambió',
  changesEmpty: 'Sin cambios',
  changesAccept: 'Aceptar plan',
  changesReject: 'Rechazar',
  changeMoved: 'movido',
  changeAdded: 'añadido',
  changeRemoved: 'quitado',
  changeResized: 'reajustado',
  risksTitle: 'Riesgos',
  risksEmpty: 'Sin riesgos',
  risksOverload: 'Día sobrecargado',
  risksDeadlineAtRisk: 'Vencimiento en riesgo',
  applied: 'Aplicado',
  applyError: 'Error aplicar',
  dismissed: 'Rechazado',
  dismissError: 'Error rechazar',
  freezeError: 'Error fijar',
};

const mutateApply = vi.fn();
const mutateDismiss = vi.fn();
const mutateFreeze = vi.fn();

vi.mock('@/hooks/use-day-plan', () => ({
  useDayPlan: vi.fn(),
  useDayPlanRisks: vi.fn(),
  useApplyDayPlan: () => ({ mutate: mutateApply }),
  useDismissDayPlan: () => ({ mutate: mutateDismiss }),
  useToggleFreezeDayPlan: () => ({ mutate: mutateFreeze }),
}));

vi.mock('@/lib/api-hooks', () => ({
  useTasks: () => ({ data: [{ id: 'a', title: 'Escribir informe' }] }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

async function mockPlanState(state: {
  plan?: unknown;
  isLoading?: boolean;
  isError?: boolean;
  risks?: unknown;
}) {
  const hooks = await import('@/hooks/use-day-plan');
  vi.mocked(hooks.useDayPlan).mockReturnValue({
    data: (state.plan ?? PLAN) as never,
    isLoading: state.isLoading ?? false,
    isError: state.isError ?? false,
    refetch: vi.fn(),
  } as never);
  vi.mocked(hooks.useDayPlanRisks).mockReturnValue({
    data: (state.risks ?? null) as never,
  } as never);
}

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<DayPlanSection labels={LABELS} />, { wrapper });
}

describe('DayPlanSection (ODD 005 S6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders plan blocks with resolved titles + changes', async () => {
    await mockPlanState({});
    renderSection();

    expect(screen.getAllByText('Escribir informe')).toHaveLength(2); // block + change
    expect(screen.getByText('09:00 – 10:00')).toBeDefined();
    expect(screen.getByText('Qué cambió')).toBeDefined();
    expect(screen.getByText('La llamada se alargó')).toBeDefined();
  });

  it('accept calls apply with the proposal id', async () => {
    await mockPlanState({});
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar plan' }));
    expect(mutateApply).toHaveBeenCalledWith(
      'prop-1',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('reject calls dismiss with the proposal id', async () => {
    await mockPlanState({});
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
    expect(mutateDismiss).toHaveBeenCalledWith(
      'prop-1',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('freeze button calls toggle with task id', async () => {
    await mockPlanState({});
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: /fijar/i }));
    expect(mutateFreeze).toHaveBeenCalledWith(
      { taskId: 'a', freeze: true },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('shows loading state', async () => {
    await mockPlanState({ isLoading: true, plan: undefined });
    renderSection();

    expect(screen.getByText('Cargando...')).toBeDefined();
  });

  it('shows error state with retry', async () => {
    await mockPlanState({ isError: true, plan: undefined });
    renderSection();

    expect(screen.getByText('Error al cargar')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeDefined();
  });

  it('hides risks card when there are no risks', async () => {
    await mockPlanState({ risks: [] });
    renderSection();

    expect(screen.queryByText('Riesgos')).toBeNull();
  });

  it('renders risks card when data exists', async () => {
    await mockPlanState({
      risks: [
        {
          kind: 'overload',
          taskIds: ['a'],
          message: 'El informe puede no caber hoy.',
          options: [{ label: 'Mover a mañana', action: 'reschedule' }],
        },
      ],
    });
    renderSection();

    expect(screen.getByText('Riesgos')).toBeDefined();
    expect(screen.getByText('Día sobrecargado')).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Mover a mañana' }),
    ).toBeDefined();
  });
});
