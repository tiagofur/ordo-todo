/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayPlanCard } from '../day-plan-card';

const labels = {
  title: 'Mi plan de hoy',
  empty: 'Sin bloques por hoy',
  frozen: 'Fijo',
  freeze: 'Fijar',
  unfreeze: 'Soltar',
};

const blocks = [
  { taskId: 'a', title: 'Escribir informe', start: '09:00', end: '10:00', reason: 'Vence hoy' },
  { taskId: 'b', title: 'Llamar cliente', start: '10:00', end: '10:30', reason: 'Prioridad alta' },
];

describe('DayPlanCard', () => {
  it('renders blocks with hours, titles and reasons', () => {
    render(
      <DayPlanCard
        blocks={blocks}
        frozenTaskIds={[]}
        labels={labels}
        onToggleFreeze={vi.fn()}
      />,
    );
    expect(screen.getByText('Mi plan de hoy')).toBeDefined();
    expect(screen.getByText('Escribir informe')).toBeDefined();
    expect(screen.getByText('09:00 – 10:00')).toBeDefined();
    expect(screen.getByText('Vence hoy')).toBeDefined();
  });

  it('marks frozen blocks and calls onToggleFreeze', () => {
    const onToggleFreeze = vi.fn();
    render(
      <DayPlanCard
        blocks={blocks}
        frozenTaskIds={['a']}
        labels={labels}
        onToggleFreeze={onToggleFreeze}
      />,
    );
    expect(screen.getByText('Fijo')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /soltar/i }));
    expect(onToggleFreeze).toHaveBeenCalledWith('a', false);
  });

  it('shows empty state without blocks', () => {
    render(
      <DayPlanCard
        blocks={[]}
        frozenTaskIds={[]}
        labels={labels}
        onToggleFreeze={vi.fn()}
      />,
    );
    expect(screen.getByText('Sin bloques por hoy')).toBeDefined();
  });
});
