import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTaskDialog } from '../create-task-dialog';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const hooksState: {
  project: Record<string, unknown>;
  members: any[];
} = {
  project: { id: 'proj-1', name: 'Work', workspaceId: 'ws-1' },
  members: [
    {
      id: 'm1',
      role: 'OWNER',
      user: { id: 'user-1', name: 'Ann Owner', email: 'ann@x.com', image: null },
    },
    {
      id: 'm2',
      role: 'MEMBER',
      user: { id: 'user-2', name: 'Bob Member', email: 'bob@x.com', image: null },
    },
  ],
};

vi.mock('@/lib/api-hooks', () => ({
  useProject: () => ({ data: hooksState.project }),
  useWorkspaceMembers: () => ({ data: hooksState.members }),
  useProjects: () => ({ data: [] }),
}));

vi.mock('../recurrence-selector', () => ({ RecurrenceSelector: () => null }));

beforeEach(() => {
  hooksState.project = { id: 'proj-1', name: 'Work', workspaceId: 'ws-1' };
  hooksState.members = [
    {
      id: 'm1',
      role: 'OWNER',
      user: { id: 'user-1', name: 'Ann Owner', email: 'ann@x.com', image: null },
    },
    {
      id: 'm2',
      role: 'MEMBER',
      user: { id: 'user-2', name: 'Bob Member', email: 'bob@x.com', image: null },
    },
  ];
});

function renderDialog(onSubmit = vi.fn()) {
  render(
    <CreateTaskDialog
      open={true}
      onOpenChange={vi.fn()}
      projectId="proj-1"
      projects={[{ id: 'proj-1', name: 'Work' }]}
      onSubmit={onSubmit}
    />,
  );
  return onSubmit;
}

describe('CreateTaskDialog assignee (ODD 018 S1)', () => {
  it('shows an Assign to field with the workspace members and submits the selection', async () => {
    const onSubmit = renderDialog();

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New shared task' },
    });
    fireEvent.change(screen.getByLabelText('Assign to'), {
      target: { value: 'user-2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New shared task',
          projectId: 'proj-1',
          assigneeId: 'user-2',
        }),
      );
    });
  });

  it('submits without assigneeId when left unassigned', async () => {
    const onSubmit = renderDialog();

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Solo task' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.assigneeId).toBeUndefined();
  });

  it('hides the Assign to field in a single-member workspace', () => {
    hooksState.members = [
      {
        id: 'm1',
        role: 'OWNER',
        user: { id: 'user-1', name: 'Ann Owner', email: 'ann@x.com', image: null },
      },
    ];

    renderDialog();

    expect(screen.queryByLabelText('Assign to')).toBeNull();
  });

});

describe('CreateTaskDialog express (ODD 021 S5)', () => {
  it('creates a task without project when "No project" stays selected', async () => {
    const onSubmit = vi.fn();
    render(
      <CreateTaskDialog
        open={true}
        onOpenChange={vi.fn()}
        projects={[
          { id: 'proj-1', name: 'Work' },
          { id: 'proj-2', name: 'Personal' },
        ]}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Comprar pan' },
    });
    // El select muestra "No project (express)" seleccionado por defecto
    expect(
      (screen.getByLabelText('Project') as HTMLSelectElement).value,
    ).toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Comprar pan',
          projectId: undefined,
        }),
      );
    });
  });

  it('still opens with the pre-selected project when projectId prop is given', async () => {
    const onSubmit = renderDialog();

    expect(
      (screen.queryByLabelText('Project') as HTMLSelectElement | null),
    ).toBeNull();

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'En proyecto' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'proj-1',
        }),
      );
    });
  });
});
