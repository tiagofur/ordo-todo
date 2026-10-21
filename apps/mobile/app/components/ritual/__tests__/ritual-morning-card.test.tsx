/**
 * MorningRitualCard (mobile) tests — ODD 006 S1/T5.
 * Parity with packages/ui MorningRitualCard: plan + overdue + top-3
 * selector + complete/skip, labels-injected, no fetching.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MorningRitualCard } from '@ordo-todo/ui-mobile';

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

describe('MorningRitualCard (mobile)', () => {
  it('renders plan blocks, overdue and suggested top-3', () => {
    const { getByText } = render(
      <MorningRitualCard
        planBlocks={planBlocks}
        overdue={[{ taskId: 'z', title: 'Vieja pendiente', dueDateKey: '2026-10-18' }]}
        suggestedTop3={['a']}
        status="PENDING"
        labels={labels}
        onComplete={jest.fn()}
        onSkip={jest.fn()}
      />,
    );
    expect(getByText('Ritual de mañana')).toBeTruthy();
    expect(getByText('Escribir informe')).toBeTruthy();
    expect(getByText('09:00 – 10:00')).toBeTruthy();
    expect(getByText('Vieja pendiente')).toBeTruthy();
  });

  it('toggles the top-3 and completes with the selection', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <MorningRitualCard
        planBlocks={planBlocks}
        overdue={[]}
        suggestedTop3={[]}
        status="PENDING"
        labels={labels}
        onComplete={onComplete}
        onSkip={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Escribir informe'));
    fireEvent.press(getByText('Llamar cliente'));
    fireEvent.press(getByText('Completar ritual'));
    expect(onComplete).toHaveBeenCalledWith(['a', 'b']);
  });

  it('caps the top-3 selection at 3 tasks', () => {
    const onComplete = jest.fn();
    const four = [
      ...planBlocks,
      { taskId: 'c', title: 'Tercera', start: '11:00', end: '11:30', reason: 'x' },
      { taskId: 'd', title: 'Cuarta', start: '12:00', end: '12:30', reason: 'y' },
    ];
    const { getByText } = render(
      <MorningRitualCard
        planBlocks={four}
        overdue={[]}
        suggestedTop3={[]}
        status="PENDING"
        labels={labels}
        onComplete={onComplete}
        onSkip={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Escribir informe'));
    fireEvent.press(getByText('Llamar cliente'));
    fireEvent.press(getByText('Tercera'));
    fireEvent.press(getByText('Cuarta'));
    fireEvent.press(getByText('Completar ritual'));
    expect(onComplete).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('skips with one touch', () => {
    const onSkip = jest.fn();
    const { getByText } = render(
      <MorningRitualCard
        planBlocks={planBlocks}
        overdue={[]}
        suggestedTop3={[]}
        status="PENDING"
        labels={labels}
        onComplete={jest.fn()}
        onSkip={onSkip}
      />,
    );
    fireEvent.press(getByText('Omitir'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('shows done state without actions', () => {
    const { getByText, queryByText } = render(
      <MorningRitualCard
        planBlocks={planBlocks}
        overdue={[]}
        suggestedTop3={['a']}
        status="DONE"
        labels={labels}
        onComplete={jest.fn()}
        onSkip={jest.fn()}
      />,
    );
    expect(getByText('Ritual completado')).toBeTruthy();
    expect(queryByText('Omitir')).toBeNull();
  });
});
