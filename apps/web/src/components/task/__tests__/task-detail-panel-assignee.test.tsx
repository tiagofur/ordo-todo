import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskDetailPanel } from '../task-detail-panel';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const membersState: { members: any[] } = {
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
  useTaskComments: () => ({ data: [] }),
  useCreateComment: () => ({ mutateAsync: vi.fn() }),
  useUpdateComment: () => ({ mutateAsync: vi.fn() }),
  useDeleteComment: () => ({ mutateAsync: vi.fn() }),
  useWorkspaceMembers: () => ({ data: membersState.members }),
  useCurrentUser: () => ({ data: { id: 'user-1' } }),
  useTaskAttachments: () => ({ data: [] }),
  useUploadAttachment: () => ({ mutateAsync: vi.fn() }),
  useDeleteAttachment: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/hooks/use-collaboration-socket', () => ({
  useCollaborationSocket: () => ({ taskUsers: [] }),
}));

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getTaskDependencies: vi.fn().mockResolvedValue({ dependencies: [], dependents: [] }),
    getTasks: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/components/shared/confirm-dialog', () => ({
  useConfirm: () => ({
    confirm: vi.fn(async () => true),
    ConfirmModal: () => null,
  }),
}));

vi.mock('../comment-thread', () => ({ CommentThread: () => null }));
vi.mock('../attachment-list', () => ({ AttachmentList: () => null }));
vi.mock('../task-custom-fields-editor', () => ({
  TaskCustomFieldsEditor: () => null,
}));
vi.mock('../recurrence-selector', () => ({ RecurrenceSelector: () => null }));
vi.mock('../subtask-list', () => ({ SubtaskList: () => null }));
vi.mock('@/components/collaboration/presence-avatars', () => ({
  PresenceAvatars: () => null,
}));

// Radix Popover shims for jsdom
beforeEach(() => {
  membersState.members = [
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
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  // vitest.setup.tsx replaces window.Image with a bare class; Radix Avatar
  // calls addEventListener on its probe image.
  const ImageCtor = (globalThis as any).Image;
  if (typeof ImageCtor?.prototype?.addEventListener !== 'function') {
    ImageCtor.prototype.addEventListener = function (
      this: any,
      type: string,
      listener: () => void,
    ) {
      if (type === 'load') setTimeout(listener, 0);
    };
    ImageCtor.prototype.removeEventListener = function () {};
  }
});

const baseTask = {
  id: 'task-1',
  title: 'Shared task',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  project: { id: 'proj-1', name: 'Work', workspaceId: 'ws-1' },
  assignee: null,
  subTasks: [],
  comments: [],
} as any;

function renderPanel(taskOverrides: Record<string, unknown> = {}) {
  const onUpdate = vi.fn();
  render(
    <TaskDetailPanel
      taskId="task-1"
      open={true}
      onOpenChange={vi.fn()}
      task={{ ...baseTask, ...taskOverrides }}
      onUpdate={onUpdate}
    />,
  );
  return onUpdate;
}

describe('TaskDetailPanel assignee (ODD 018 S1)', () => {
  it('renders the selector with the workspace members and assigns on click', async () => {
    const onUpdate = renderPanel();

    expect(await screen.findByText('Assigned to')).toBeDefined();

    fireEvent.click(screen.getByText('Unassigned - Click to assign'));

    fireEvent.click(await screen.findByText('Bob Member'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('task-1', {
        assigneeId: 'user-2',
      });
    });
  });

  it('hides the selector in a single-member workspace', async () => {
    membersState.members = [
      {
        id: 'm1',
        role: 'OWNER',
        user: { id: 'user-1', name: 'Ann Owner', email: 'ann@x.com', image: null },
      },
    ];

    renderPanel();

    expect(await screen.findByText('DESCRIPTION')).toBeDefined();
    expect(screen.queryByText('Assigned to')).toBeNull();
  });

  it('prefers the renderAssigneeSelector override', async () => {
    render(
      <TaskDetailPanel
        taskId="task-1"
        open={true}
        onOpenChange={vi.fn()}
        task={baseTask}
        onUpdate={vi.fn()}
        renderAssigneeSelector={() => <div>custom-selector</div>}
      />,
    );

    expect(await screen.findByText('custom-selector')).toBeDefined();
    expect(screen.queryByText('Assigned to')).toBeNull();
  });
});
