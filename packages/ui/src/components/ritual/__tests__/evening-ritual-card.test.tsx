/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EveningRitualCard } from '../evening-ritual-card';
import type { RitualEveningMove } from '../evening-ritual-card';

const labels = {
  title: 'Ritual de cierre',
  summaryTitle: 'Resumen del día',
  summaryEmpty: 'Sin resumen disponible',
  completedTitle: 'Completadas',
  completedEmpty: 'Nada completado hoy',
  pendingTitle: 'Pendientes',
  pendingEmpty: 'Día perfecto: sin pendientes',
  destinationTomorrow: 'Mañana',
  destinationDate: 'Fecha',
  destinationArchived: 'Archivar',
  reasonOverran: 'Se alargó',
  reasonUrgent: 'Urgente',
  reasonNoEnergy: 'Sin energía',
  reasonOther: 'Otro',
  complete: 'Cerrar el día',
  skip: 'Omitir',
  completed: 'Día cerrado',
  skipped: 'Cierre omitido',
  shutdown: 'Apagado completo',
  datePlaceholder: 'YYYY-MM-DD',
};

const completed = [{ taskId: 'a', title: 'Informe hecho' }];
const pending = [
  { taskId: 'b', title: 'Llamar cliente' },
  { taskId: 'c', title: 'Revisar PR' },
];

describe('EveningRitualCard (ODD 006 S2/T5)', () => {
  it('renders summary, completed and pending tasks', () => {
    render(
      <EveningRitualCard
        summary="Hoy avanzaste 2 de 4 tareas."
        completed={completed}
        pending={pending}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText('Ritual de cierre')).toBeDefined();
    expect(screen.getByText('Hoy avanzaste 2 de 4 tareas.')).toBeDefined();
    expect(screen.getByText('Informe hecho')).toBeDefined();
    expect(screen.getByText('Llamar cliente')).toBeDefined();
    expect(screen.getByText('Revisar PR')).toBeDefined();
  });

  it('completes with a destination + reason move per pending task', () => {
    const onComplete = vi.fn();
    render(
      <EveningRitualCard
        summary={null}
        completed={completed}
        pending={pending}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={onComplete}
        onSkip={vi.fn()}
      />,
    );
    // Defaults: first pending → tomorrow + overran; change second's reason.
    fireEvent.click(screen.getByRole('button', { name: /cerrar el día/i }));
    const moves: RitualEveningMove[] = onComplete.mock.calls[0][0];
    expect(moves).toHaveLength(2);
    expect(moves[0]).toMatchObject({
      taskId: 'b',
      destination: 'tomorrow',
      reason: 'overran',
    });
    expect(moves[1].taskId).toBe('c');
  });

  it('allows changing destination and reason per task', () => {
    const onComplete = vi.fn();
    render(
      <EveningRitualCard
        summary={null}
        completed={[]}
        pending={[{ taskId: 'b', title: 'Llamar cliente' }]}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={onComplete}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /^archivar$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^urgente$/i }));
    fireEvent.click(screen.getByRole('button', { name: /cerrar el día/i }));
    expect(onComplete).toHaveBeenCalledWith([
      { taskId: 'b', destination: 'archived', reason: 'urgent' },
    ]);
  });

  it('sends the picked date for date-destination moves', () => {
    const onComplete = vi.fn();
    render(
      <EveningRitualCard
        summary={null}
        completed={[]}
        pending={[{ taskId: 'b', title: 'Llamar cliente' }]}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={onComplete}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /^fecha$/i }));
    fireEvent.change(screen.getByLabelText('YYYY-MM-DD'), {
      target: { value: '2026-10-25' },
    });
    fireEvent.click(screen.getByRole('button', { name: /cerrar el día/i }));
    expect(onComplete).toHaveBeenCalledWith([
      { taskId: 'b', destination: 'date', date: '2026-10-25', reason: 'overran' },
    ]);
  });

  it('a perfect day (zero pendings) closes with an empty moves array', () => {
    const onComplete = vi.fn();
    render(
      <EveningRitualCard
        summary={null}
        completed={completed}
        pending={[]}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={onComplete}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText('Día perfecto: sin pendientes')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /cerrar el día/i }));
    expect(onComplete).toHaveBeenCalledWith([]);
  });

  it('shows shutdown state after close and skips with one touch', () => {
    const onSkip = vi.fn();
    const { rerender } = render(
      <EveningRitualCard
        summary={null}
        completed={completed}
        pending={[]}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={vi.fn()}
        onSkip={onSkip}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /omitir/i }));
    expect(onSkip).toHaveBeenCalledTimes(1);
    rerender(
      <EveningRitualCard
        summary={null}
        completed={completed}
        pending={[]}
        status="DONE"
        shutdownComplete
        shutdownSuggestion="Cierra el portátil y sal a caminar."
        labels={labels}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText('Apagado completo')).toBeDefined();
    expect(
      screen.getByText('Cierra el portátil y sal a caminar.'),
    ).toBeDefined();
  });
});
