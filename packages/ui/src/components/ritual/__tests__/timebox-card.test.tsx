/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeboxCard } from '../timebox-card';

const labels = {
  title: 'Bloques de tiempo',
  empty: 'Completa el ritual de mañana para ver tu top-3',
  startLabel: 'Inicio',
  endLabel: 'Fin',
  save: 'Guardar bloques',
  acceptProposal: 'Aceptar propuesta',
};

const top3 = [
  { taskId: 'a', title: 'Escribir informe', start: '09:00', end: '10:00' },
  { taskId: 'b', title: 'Llamar cliente', start: '10:00', end: '10:30' },
];

describe('TimeboxCard (ODD 006 S3/T5)', () => {
  it('renders the top-3 with editable HH:mm blocks (hours as strings)', () => {
    render(
      <TimeboxCard
        top3={top3}
        labels={labels}
        onSave={vi.fn()}
        onAcceptProposal={vi.fn()}
      />,
    );
    expect(screen.getByText('Bloques de tiempo')).toBeDefined();
    expect(screen.getByText('Escribir informe')).toBeDefined();
    expect(screen.getByDisplayValue('09:00')).toBeDefined();
    expect(screen.getByDisplayValue('10:30')).toBeDefined();
  });

  it('saves manual blocks with the edited times', () => {
    const onSave = vi.fn();
    render(
      <TimeboxCard
        top3={top3}
        labels={labels}
        onSave={onSave}
        onAcceptProposal={vi.fn()}
      />,
    );
    const starts = screen.getAllByLabelText(/inicio/i);
    fireEvent.change(starts[0], { target: { value: '08:30' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar bloques/i }));
    expect(onSave).toHaveBeenCalledWith([
      { taskId: 'a', start: '08:30', end: '10:00' },
      { taskId: 'b', start: '10:00', end: '10:30' },
    ]);
  });

  it('accepts the proposal with one touch', () => {
    const onAcceptProposal = vi.fn();
    render(
      <TimeboxCard
        top3={top3}
        labels={labels}
        onSave={vi.fn()}
        onAcceptProposal={onAcceptProposal}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /aceptar propuesta/i }));
    expect(onAcceptProposal).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state without a top-3', () => {
    render(
      <TimeboxCard
        top3={[]}
        labels={labels}
        onSave={vi.fn()}
        onAcceptProposal={vi.fn()}
      />,
    );
    expect(
      screen.getByText('Completa el ritual de mañana para ver tu top-3'),
    ).toBeDefined();
    expect(
      screen.queryByRole('button', { name: /aceptar propuesta/i }),
    ).toBeNull();
  });
});
