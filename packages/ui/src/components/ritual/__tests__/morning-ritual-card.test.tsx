/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MorningRitualCard } from '../morning-ritual-card';

const labels = {
  title: 'Ritual de mañana',
  planTitle: 'Plan de hoy',
  planEmpty: 'Sin bloques por hoy',
  overdueTitle: 'Vencidas',
  overdueEmpty: 'Sin vencidas',
  top3Title: 'Tu top-3',
  top3Hint: 'Elige hasta 3',
  complete: 'Completar ritual',
  skip: 'Omitir',
  completed: 'Ritual completado',
  skipped: 'Ritual omitido',
};

const planBlocks = [
  { taskId: 'a', title: 'Escribir informe', start: '09:00', end: '10:00', reason: 'Vence hoy' },
  { taskId: 'b', title: 'Llamar cliente', start: '10:00', end: '10:30', reason: 'Prioridad alta' },
];

const overdue = [{ taskId: 'z', title: 'Vieja pendiente', dueDateKey: '2026-10-18' }];

describe('MorningRitualCard (ODD 006 S1/T5)', () => {
  it('renders plan blocks, overdue and the suggested top-3 preselected', () => {
    render(
      <MorningRitualCard
        planBlocks={planBlocks}
        overdue={overdue}
        suggestedTop3={['a']}
        status="PENDING"
        labels={labels}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText('Ritual de mañana')).toBeDefined();
    expect(screen.getByText('Escribir informe')).toBeDefined();
    expect(screen.getByText('09:00 – 10:00')).toBeDefined();
    expect(screen.getByText('Vieja pendiente')).toBeDefined();
    expect(screen.getByText('2026-10-18')).toBeDefined();
    // Suggested top-3 preselected: 'a' checked, 'b' unchecked.
    expect(screen.getByRole('checkbox', { name: 'Escribir informe' })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Llamar cliente' }),
    ).not.toBeChecked();
  });

  it('lets the user toggle the top-3 and completes with the selection', () => {
    const onComplete = vi.fn();
    render(
      <MorningRitualCard
        planBlocks={planBlocks}
        overdue={[]}
        suggestedTop3={[]}
        status="PENDING"
        labels={labels}
        onComplete={onComplete}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /escribir informe/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /llamar cliente/i }));
    fireEvent.click(screen.getByRole('button', { name: /completar ritual/i }));
    expect(onComplete).toHaveBeenCalledWith(['a', 'b']);
  });

  it('caps the top-3 selection at 3 tasks', () => {
    const onComplete = vi.fn();
    const three = [
      ...planBlocks,
      { taskId: 'c', title: 'Tercera', start: '11:00', end: '11:30', reason: 'x' },
      { taskId: 'd', title: 'Cuarta', start: '12:00', end: '12:30', reason: 'y' },
    ];
    render(
      <MorningRitualCard
        planBlocks={three}
        overdue={[]}
        suggestedTop3={[]}
        status="PENDING"
        labels={labels}
        onComplete={onComplete}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /escribir informe/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /llamar cliente/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /tercera/i }));
    // Fourth toggle is ignored: still 3 selected, complete sends exactly 3.
    fireEvent.click(screen.getByRole('checkbox', { name: /cuarta/i }));
    fireEvent.click(screen.getByRole('button', { name: /completar ritual/i }));
    expect(onComplete).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('calls onSkip with one touch and disables complete without selection', () => {
    const onSkip = vi.fn();
    render(
      <MorningRitualCard
        planBlocks={planBlocks}
        overdue={[]}
        suggestedTop3={[]}
        status="PENDING"
        labels={labels}
        onComplete={vi.fn()}
        onSkip={onSkip}
      />,
    );
    expect(
      screen.getByRole('button', { name: /completar ritual/i }),
    ).toHaveProperty('disabled', true);
    fireEvent.click(screen.getByRole('button', { name: /omitir/i }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('shows done/skipped states without actions', () => {
    const { rerender } = render(
      <MorningRitualCard
        planBlocks={planBlocks}
        overdue={[]}
        suggestedTop3={['a']}
        status="DONE"
        labels={labels}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText('Ritual completado')).toBeDefined();
    expect(screen.queryByRole('button', { name: /omitir/i })).toBeNull();
    rerender(
      <MorningRitualCard
        planBlocks={planBlocks}
        overdue={[]}
        suggestedTop3={[]}
        status="SKIPPED"
        labels={labels}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText('Ritual omitido')).toBeDefined();
  });
});
