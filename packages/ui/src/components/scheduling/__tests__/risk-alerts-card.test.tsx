/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RiskAlertsCard } from '../risk-alerts-card';

const labels = {
  title: 'Riesgos',
  empty: 'Sin riesgos por hoy',
};

const risks = [
  {
    id: 'r1',
    taskId: 'a',
    title: 'El informe puede no caber hoy',
    detail: 'Faltan 2 h y solo queda 1 h libre.',
    options: [
      { id: 'move', label: 'Mover a mañana' },
      { id: 'split', label: 'Partir en dos' },
    ],
  },
];

describe('RiskAlertsCard', () => {
  it('renders alerts with actionable options', () => {
    render(
      <RiskAlertsCard risks={risks} labels={labels} onSelectOption={vi.fn()} />,
    );
    expect(screen.getByText('Riesgos')).toBeDefined();
    expect(screen.getByText('El informe puede no caber hoy')).toBeDefined();
    expect(screen.getByText('Faltan 2 h y solo queda 1 h libre.')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Mover a mañana' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Partir en dos' })).toBeDefined();
  });

  it('calls onSelectOption with risk + option ids', () => {
    const onSelectOption = vi.fn();
    render(
      <RiskAlertsCard risks={risks} labels={labels} onSelectOption={onSelectOption} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Partir en dos' }));
    expect(onSelectOption).toHaveBeenCalledWith('r1', 'split');
  });

  it('shows empty state without risks', () => {
    render(
      <RiskAlertsCard risks={[]} labels={labels} onSelectOption={vi.fn()} />,
    );
    expect(screen.getByText('Sin riesgos por hoy')).toBeDefined();
  });
});
