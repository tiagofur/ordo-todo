/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentJobCard, type AgentJobCardJob } from '../agent-job-card';

const labels = {
  active: 'Activo',
  paused: 'Pausado',
  nextRun: 'Próxima ejecución',
  neverRan: 'Sin programar',
  pause: 'Pausar',
  resume: 'Reanudar',
  runNow: 'Ejecutar ahora',
  del: 'Borrar',
};

const job: AgentJobCardJob = {
  id: 'job-1',
  name: 'Resumen semanal',
  schedule: '0 17 * * 5',
  taskPrompt: 'prepárame el resumen semanal',
  isActive: true,
  nextRunAt: '2026-10-24T17:00:00.000Z',
  lastStatus: 'ok',
};

describe('AgentJobCard', () => {
  it('renders name, schedule and next run', () => {
    render(
      <AgentJobCard
        job={job}
        labels={labels}
        onToggle={vi.fn()}
        onRunNow={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Resumen semanal')).toBeDefined();
    expect(screen.getByText(/0 17 \* \* 5/)).toBeDefined();
    expect(screen.getByText('Activo')).toBeDefined();
  });

  it('calls onToggle with the flipped state', () => {
    const onToggle = vi.fn();
    render(
      <AgentJobCard
        job={job}
        labels={labels}
        onToggle={onToggle}
        onRunNow={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Pausar'));
    expect(onToggle).toHaveBeenCalledWith('job-1', false);
  });

  it('calls onRunNow and onDelete', () => {
    const onRunNow = vi.fn();
    const onDelete = vi.fn();
    render(
      <AgentJobCard
        job={job}
        labels={labels}
        onToggle={vi.fn()}
        onRunNow={onRunNow}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByText('Ejecutar ahora'));
    expect(onRunNow).toHaveBeenCalledWith('job-1');
    fireEvent.click(screen.getByText('Borrar'));
    expect(onDelete).toHaveBeenCalledWith('job-1');
  });

  it('shows resume and error status for paused failed jobs', () => {
    render(
      <AgentJobCard
        job={{ ...job, isActive: false, lastStatus: 'error: boom' }}
        labels={labels}
        onToggle={vi.fn()}
        onRunNow={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Reanudar')).toBeDefined();
    expect(screen.getByText(/error: boom/)).toBeDefined();
  });
});
