/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RiskAlertsCard } from '../risk-alerts-card';

const labels = {
  title: 'Riesgos',
  empty: 'Sin riesgos por hoy',
  overload: 'Día sobrecargado',
  deadlineAtRisk: 'Vencimiento en riesgo',
};

// T4b wire shape: { kind, taskIds, message, options: [{ label, action }] }.
const risks = [
  {
    kind: 'overload' as const,
    taskIds: ['a', 'b'],
    message: 'El plan de hoy va justo: 2 tareas no caben.',
    options: [
      { label: 'Mover a mañana', action: 'reschedule' as const },
      { label: 'Partir en dos', action: 'split-task' as const },
    ],
  },
];

describe('RiskAlertsCard', () => {
  it('renders alerts with actionable options', () => {
    render(
      <RiskAlertsCard risks={risks} labels={labels} onSelectOption={vi.fn()} />,
    );
    expect(screen.getByText('Riesgos')).toBeDefined();
    expect(screen.getByText('Día sobrecargado')).toBeDefined();
    expect(
      screen.getByText('El plan de hoy va justo: 2 tareas no caben.'),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: 'Mover a mañana' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Partir en dos' })).toBeDefined();
  });

  it('calls onSelectOption with task ids + action', () => {
    const onSelectOption = vi.fn();
    render(
      <RiskAlertsCard risks={risks} labels={labels} onSelectOption={onSelectOption} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Partir en dos' }));
    expect(onSelectOption).toHaveBeenCalledWith(['a', 'b'], 'split-task');
  });

  it('shows empty state without risks', () => {
    render(
      <RiskAlertsCard risks={[]} labels={labels} onSelectOption={vi.fn()} />,
    );
    expect(screen.getByText('Sin riesgos por hoy')).toBeDefined();
  });
});
