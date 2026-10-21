/**
 * EveningRitualCard (mobile) tests — ODD 006 S2/T5.
 * Parity with packages/ui EveningRitualCard: summary + completed +
 * pending with destination/reason + complete/skip + shutdown.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EveningRitualCard } from '@ordo-todo/ui-mobile';

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

describe('EveningRitualCard (mobile)', () => {
  it('renders summary, completed and pending tasks', () => {
    const { getByText } = render(
      <EveningRitualCard
        summary="Hoy avanzaste 2 de 4 tareas."
        completed={[{ taskId: 'a', title: 'Informe hecho' }]}
        pending={[{ taskId: 'b', title: 'Llamar cliente' }]}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={jest.fn()}
        onSkip={jest.fn()}
      />,
    );
    expect(getByText('Ritual de cierre')).toBeTruthy();
    expect(getByText('Hoy avanzaste 2 de 4 tareas.')).toBeTruthy();
    expect(getByText('Informe hecho')).toBeTruthy();
    expect(getByText('Llamar cliente')).toBeTruthy();
  });

  it('completes with a destination + reason move per pending task', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <EveningRitualCard
        summary={null}
        completed={[]}
        pending={[{ taskId: 'b', title: 'Llamar cliente' }]}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={onComplete}
        onSkip={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Archivar'));
    fireEvent.press(getByText('Urgente'));
    fireEvent.press(getByText('Cerrar el día'));
    expect(onComplete).toHaveBeenCalledWith([
      { taskId: 'b', destination: 'archived', reason: 'urgent' },
    ]);
  });

  it('a perfect day closes with an empty moves array', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <EveningRitualCard
        summary={null}
        completed={[]}
        pending={[]}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={onComplete}
        onSkip={jest.fn()}
      />,
    );
    expect(getByText('Día perfecto: sin pendientes')).toBeTruthy();
    fireEvent.press(getByText('Cerrar el día'));
    expect(onComplete).toHaveBeenCalledWith([]);
  });

  it('sends the typed date for date-destination moves', () => {
    const onComplete = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <EveningRitualCard
        summary={null}
        completed={[]}
        pending={[{ taskId: 'b', title: 'Llamar cliente' }]}
        status="PENDING"
        shutdownComplete={false}
        labels={labels}
        onComplete={onComplete}
        onSkip={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Fecha'));
    fireEvent.changeText(getByPlaceholderText('YYYY-MM-DD'), '2026-10-25');
    fireEvent.press(getByText('Cerrar el día'));
    expect(onComplete).toHaveBeenCalledWith([
      { taskId: 'b', destination: 'date', date: '2026-10-25', reason: 'overran' },
    ]);
  });

  it('shows shutdown state after close', () => {
    const { getByText } = render(
      <EveningRitualCard
        summary={null}
        completed={[]}
        pending={[]}
        status="DONE"
        shutdownComplete
        shutdownSuggestion="Cierra el portátil y sal a caminar."
        labels={labels}
        onComplete={jest.fn()}
        onSkip={jest.fn()}
      />,
    );
    expect(getByText('Apagado completo')).toBeTruthy();
    expect(getByText('Cierra el portátil y sal a caminar.')).toBeTruthy();
  });
});
