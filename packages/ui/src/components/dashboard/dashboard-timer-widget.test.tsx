import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardTimerWidget } from './dashboard-timer-widget.js';

const baseProps = {
  isRunning: false,
  isPaused: false,
  timeLeft: 300,
  completedPomodoros: 0,
  progress: 0,
  onToggle: vi.fn(),
  onReset: vi.fn(),
  onSkip: vi.fn(),
  formatTime: (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
};

describe('DashboardTimerWidget mode badge', () => {
  it.each([
    ['SHORT_BREAK', 'Pausa Corta'],
    ['LONG_BREAK', 'Pausa Larga'],
    ['CONTINUOUS', 'Continuo'],
  ])('renders icon-only badge in %s (label exposed via title/aria-label)', (mode, label) => {
    render(<DashboardTimerWidget {...baseProps} mode={mode} />);

    // No visible text node with the label (prevents overlap with duration chips).
    expect(screen.queryByText(label)).toBeNull();

    // Label still available to tooltips and assistive tech.
    const badge = screen.getByLabelText(label);
    expect(badge).toHaveAttribute('title', label);
  });

  it('keeps the compact counter badge in WORK', () => {
    render(<DashboardTimerWidget {...baseProps} mode="WORK" completedPomodoros={2} />);
    expect(screen.getByText('#3')).toBeInTheDocument();
  });
});

describe('DashboardTimerWidget phase chips', () => {
  it('calls onPhaseSelect when a stopped chip is clicked', () => {
    const onPhaseSelect = vi.fn();
    render(
      <DashboardTimerWidget
        {...baseProps}
        mode="WORK"
        isRunning={false}
        isPaused={false}
        onPhaseSelect={onPhaseSelect}
      />
    );

    fireEvent.click(screen.getByTitle('Ir a Pausa Corta'));
    expect(onPhaseSelect).toHaveBeenCalledWith('SHORT_BREAK');
  });

  it('renders chips as plain indicators while running', () => {
    const onPhaseSelect = vi.fn();
    render(
      <DashboardTimerWidget
        {...baseProps}
        mode="WORK"
        isRunning={true}
        isPaused={false}
        onPhaseSelect={onPhaseSelect}
      />
    );

    // No button to click: chips fall back to spans with the disabled hint.
    expect(screen.queryByTitle('Ir a Pausa Corta')).toBeNull();
    expect(screen.getAllByTitle('Detén el temporizador para cambiar de fase')).toHaveLength(2);
  });

  it('renders chips as plain indicators without a handler', () => {
    render(<DashboardTimerWidget {...baseProps} mode="SHORT_BREAK" />);

    expect(screen.queryByRole('button', { name: /Ir a/ })).toBeNull();
    expect(screen.getByText('5m')).toBeInTheDocument();
  });
});
