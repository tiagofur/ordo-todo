/**
 * TimeboxCard + StreakCard (mobile) tests — ODD 006 S3/S4/T5.
 * Parity with packages/ui: editable HH:mm blocks (strings, TZ-safe) +
 * accept proposal; streak + milestones.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimeboxCard } from '@ordo-todo/ui-mobile';
import { StreakCard } from '@ordo-todo/ui-mobile';

const timeboxLabels = {
  title: 'Bloques de tiempo',
  empty: 'Completa el ritual de mañana para ver tu top-3',
  startLabel: 'Inicio',
  endLabel: 'Fin',
  save: 'Guardar bloques',
  acceptProposal: 'Aceptar propuesta',
  saved: 'Bloques guardados',
  saveError: 'No se pudieron guardar los bloques',
};

const streakLabels = {
  title: 'Racha del ritual',
  days: 'días seguidos',
  best: 'Tu mejor racha',
  nextMilestone: 'Próximo hito',
  milestoneReached: 'Hito alcanzado',
  empty: 'Completa tu primer ritual para empezar la racha',
};

const top3 = [
  { taskId: 'a', title: 'Escribir informe', start: '09:00', end: '10:00' },
];

describe('TimeboxCard (mobile)', () => {
  it('renders the top-3 with editable HH:mm blocks', () => {
    const { getByText, getByDisplayValue } = render(
      <TimeboxCard
        top3={top3}
        labels={timeboxLabels}
        onSave={jest.fn()}
        onAcceptProposal={jest.fn()}
      />,
    );
    expect(getByText('Bloques de tiempo')).toBeTruthy();
    expect(getByText('Escribir informe')).toBeTruthy();
    expect(getByDisplayValue('09:00')).toBeTruthy();
  });

  it('saves manual blocks and accepts the proposal', () => {
    const onSave = jest.fn();
    const onAcceptProposal = jest.fn();
    const { getByText, getByDisplayValue } = render(
      <TimeboxCard
        top3={top3}
        labels={timeboxLabels}
        onSave={onSave}
        onAcceptProposal={onAcceptProposal}
      />,
    );
    fireEvent.changeText(getByDisplayValue('09:00'), '08:30');
    fireEvent.press(getByText('Guardar bloques'));
    expect(onSave).toHaveBeenCalledWith([
      { taskId: 'a', start: '08:30', end: '10:00' },
    ]);
    fireEvent.press(getByText('Aceptar propuesta'));
    expect(onAcceptProposal).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state without a top-3', () => {
    const { getByText, queryByText } = render(
      <TimeboxCard
        top3={[]}
        labels={timeboxLabels}
        onSave={jest.fn()}
        onAcceptProposal={jest.fn()}
      />,
    );
    expect(
      getByText('Completa el ritual de mañana para ver tu top-3'),
    ).toBeTruthy();
    expect(queryByText('Aceptar propuesta')).toBeNull();
  });
});

describe('StreakCard (mobile)', () => {
  it('renders current streak, best and next milestone', () => {
    const { getByText } = render(
      <StreakCard
        current={5}
        longest={9}
        milestones={[7, 30, 100]}
        labels={streakLabels}
      />,
    );
    expect(getByText('Racha del ritual')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('días seguidos')).toBeTruthy();
    expect(getByText('9')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
  });

  it('celebrates a reached milestone and shows empty state at zero', () => {
    const { getByText, rerender } = render(
      <StreakCard
        current={7}
        longest={7}
        milestones={[7, 30, 100]}
        labels={streakLabels}
      />,
    );
    expect(getByText('Hito alcanzado')).toBeTruthy();
    rerender(
      <StreakCard
        current={0}
        longest={0}
        milestones={[7, 30, 100]}
        labels={streakLabels}
      />,
    );
    expect(
      getByText('Completa tu primer ritual para empezar la racha'),
    ).toBeTruthy();
  });
});
