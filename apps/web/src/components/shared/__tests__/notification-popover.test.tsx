import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationPopover } from '../notification-popover';

const markReadMutate = vi.fn();
const push = vi.fn();

const hooksState: { notifications: any[] } = {
  notifications: [
    {
      id: 'n1',
      type: 'MENTIONED',
      title: 'You were mentioned',
      message: 'Bob mentioned you',
      resourceId: 'task-1',
      resourceType: 'COMMENT',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'n2',
      type: 'WORKSPACE_INVITATION',
      title: 'Invitation',
      message: 'You were invited',
      resourceId: 'ws-1',
      resourceType: 'WORKSPACE',
      isRead: true,
      createdAt: new Date().toISOString(),
    },
  ],
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/lib/api-hooks', () => ({
  useNotifications: () => ({ data: hooksState.notifications, isLoading: false }),
  useUnreadNotificationsCount: () => ({ data: 1 }),
  useMarkNotificationAsRead: () => ({ mutate: markReadMutate, isPending: false }),
  useMarkAllNotificationsAsRead: () => ({ mutate: vi.fn(), isPending: false }),
}));

beforeEach(() => {
  hooksState.notifications = hooksState.notifications.map((n) => ({ ...n }));
  markReadMutate.mockClear();
  push.mockClear();
});

describe('NotificationPopover navigation (ODD 018 S5)', () => {
  it('opens the task panel for task-linked notifications', async () => {
    render(<NotificationPopover />);

    // Open the popover, then click the notification row
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(await screen.findByText('You were mentioned'));

    expect(push).toHaveBeenCalledWith('/dashboard?taskId=task-1');
    expect(markReadMutate).toHaveBeenCalledWith('n1');
  });

  it('does not navigate for notifications without a task link', async () => {
    render(<NotificationPopover />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(await screen.findByText('Invitation'));

    expect(push).not.toHaveBeenCalled();
    expect(markReadMutate).not.toHaveBeenCalled();
  });
});
