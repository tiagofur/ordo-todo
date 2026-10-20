import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PomodoroTimer, type TimerState, type TimerActions } from './pomodoro-timer.js';

const baseState: TimerState = {
  isLoaded: true,
  isRunning: true,
  isPaused: false,
  timeLeft: 20 * 60,
  mode: 'WORK',
  completedPomodoros: 0,
  pauseCount: 0,
  defaultMode: 'POMODORO',
  selectedTaskId: null,
  progress: 20,
};

function setup(state: Partial<TimerState> = {}) {
  const actions: TimerActions = {
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    skipToNext: vi.fn(),
    switchTask: vi.fn(),
    setSelectedTaskId: vi.fn(),
  };
  render(
    <PomodoroTimer
      state={{ ...baseState, ...state }}
      actions={actions}
      variant="horizontal"
      allowVariantToggle={false}
    />
  );
  return actions;
}

describe('PomodoroTimer skip confirmation', () => {
  it('asks for confirmation on early WORK skip, and skips on confirm', () => {
    const actions = setup({ progress: 20 });

    fireEvent.click(screen.getByTitle('Saltar al siguiente bloque'));

    expect(screen.getByText('¿Saltar a Descanso Corto?')).toBeInTheDocument();
    expect(actions.skipToNext).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Saltar'));
    expect(actions.skipToNext).toHaveBeenCalledTimes(1);
  });

  it('cancelling the dialog does not skip', () => {
    const actions = setup({ progress: 10 });

    fireEvent.click(screen.getByTitle('Saltar al siguiente bloque'));
    fireEvent.click(screen.getByText('Cancelar'));

    expect(actions.skipToNext).not.toHaveBeenCalled();
  });

  it('uses the wrapper-provided target label when available', () => {
    const actions: TimerActions = {
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      skipToNext: vi.fn(),
      switchTask: vi.fn(),
      setSelectedTaskId: vi.fn(),
    };
    render(
      <PomodoroTimer
        state={{ ...baseState, progress: 30 }}
        actions={actions}
        variant="horizontal"
        allowVariantToggle={false}
        labels={{ skipTargetLabel: 'Descanso largo (15:00)' }}
      />
    );

    fireEvent.click(screen.getByTitle('Saltar al siguiente bloque'));
    expect(screen.getByText('¿Saltar a Descanso largo (15:00)?')).toBeInTheDocument();
  });

  it('skips straight through on nearly-finished WORK (≥80%)', () => {
    const actions = setup({ progress: 85 });

    fireEvent.click(screen.getByTitle('Saltar al siguiente bloque'));

    expect(screen.queryByText(/¿Saltar a/)).toBeNull();
    expect(actions.skipToNext).toHaveBeenCalledTimes(1);
  });

  it('skips straight through on breaks', () => {
    const actions = setup({ mode: 'SHORT_BREAK', progress: 10 });

    fireEvent.click(screen.getByTitle('Saltar al siguiente bloque'));

    expect(screen.queryByText(/¿Saltar a/)).toBeNull();
    expect(actions.skipToNext).toHaveBeenCalledTimes(1);
  });

  it('circular variant also confirms early WORK skips', () => {
    const actions: TimerActions = {
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      stop: vi.fn(),
      skipToNext: vi.fn(),
      switchTask: vi.fn(),
      setSelectedTaskId: vi.fn(),
    };
    render(
      <PomodoroTimer
        state={{ ...baseState, progress: 15 }}
        actions={actions}
        variant="circular"
        allowVariantToggle={false}
      />
    );

    fireEvent.click(screen.getByTitle('Saltar al siguiente bloque'));
    expect(screen.getByText('¿Saltar a Descanso Corto?')).toBeInTheDocument();
    expect(actions.skipToNext).not.toHaveBeenCalled();
  });
});
