/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlanChangesCard } from '../plan-changes-card';

const labels = {
  title: 'Qué cambió',
  empty: 'Sin cambios pendientes',
  accept: 'Aceptar plan',
  reject: 'Rechazar',
  moved: 'movido',
  added: 'añadido',
  removed: 'quitado',
  resized: 'reajustado',
};

const changes = [
  {
    taskId: 'a',
    title: 'Escribir informe',
    type: 'moved' as const,
    from: { start: '09:00', end: '10:00' },
    to: { start: '11:00', end: '12:00' },
    reason: 'La llamada se alargó',
  },
  {
    taskId: 'b',
    title: 'Llamar cliente',
    type: 'added' as const,
    reason: 'Hueco libre por la mañana',
  },
];

describe('PlanChangesCard', () => {
  it('renders each change with type, slots and reason', () => {
    render(
      <PlanChangesCard
        changes={changes}
        labels={labels}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    expect(screen.getByText('Qué cambió')).toBeDefined();
    expect(screen.getByText('Escribir informe')).toBeDefined();
    expect(screen.getByText(/movido/)).toBeDefined();
    expect(screen.getByText(/09:00.*11:00/)).toBeDefined();
    expect(screen.getByText('La llamada se alargó')).toBeDefined();
  });

  it('calls onAccept and onReject', () => {
    const onAccept = vi.fn();
    const onReject = vi.fn();
    render(
      <PlanChangesCard
        changes={changes}
        labels={labels}
        onAccept={onAccept}
        onReject={onReject}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar plan' }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('shows empty state without changes', () => {
    render(
      <PlanChangesCard
        changes={[]}
        labels={labels}
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    expect(screen.getByText('Sin cambios pendientes')).toBeDefined();
  });
});
