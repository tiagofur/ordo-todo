import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceMembersSettings } from '../workspace-members-settings';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/lib/error-handler', () => ({
  getErrorMessage: vi.fn((_e: unknown, fallback: string) => fallback),
}));

vi.mock('@/components/shared/confirm-dialog', () => ({
  useConfirm: () => ({
    confirm: vi.fn(async () => true),
    ConfirmModal: () => null,
  }),
}));

vi.mock('@/hooks/use-workspace-permissions', () => ({
  useWorkspacePermissions: () => ({ canInvite: true, canManageMembers: true }),
}));

vi.mock('../invite-member-dialog', () => ({
  InviteMemberDialog: () => null,
}));

const removeMutate = vi.fn();
const changeRoleMutate = vi.fn().mockResolvedValue({ success: true });
const cancelMutate = vi.fn().mockResolvedValue({ success: true });
const leaveMutate = vi.fn().mockResolvedValue({ success: true });

const hooksState: {
  members: any[];
  invitations: any[];
  currentUser: { id: string } | undefined;
} = {
  members: [],
  invitations: [],
  currentUser: { id: 'owner-1' },
};

vi.mock('@/lib/api-hooks', () => ({
  useWorkspace: () => ({
    data: {
      id: 'ws-1',
      owner: { id: 'owner-1', name: 'Owner', email: 'owner@x.com' },
      ownerId: 'owner-1',
      createdAt: new Date().toISOString(),
    },
  }),
  useWorkspaceMembers: () => ({ data: hooksState.members, isLoading: false }),
  useWorkspaceInvitations: () => ({
    data: hooksState.invitations,
    isLoading: false,
  }),
  useCurrentUser: () => ({ data: hooksState.currentUser }),
  useRemoveWorkspaceMember: () => ({ mutateAsync: removeMutate, isPending: false }),
  useChangeWorkspaceMemberRole: () => ({ mutateAsync: changeRoleMutate, isPending: false }),
  useCancelWorkspaceInvitation: () => ({ mutateAsync: cancelMutate, isPending: false }),
  useLeaveWorkspace: () => ({ mutateAsync: leaveMutate, isPending: false }),
}));

// Radix dropdown shims for jsdom
beforeEach(() => {
  hooksState.members = [
    {
      id: 'm2',
      role: 'ADMIN',
      userId: 'user-2',
      joinedAt: new Date().toISOString(),
      user: { id: 'user-2', name: 'Bob Admin', email: 'bob@x.com', image: null },
    },
  ];
  hooksState.invitations = [];
  hooksState.currentUser = { id: 'owner-1' };
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
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
  vi.stubGlobal('location', { ...window.location, assign: vi.fn() });
  removeMutate.mockClear();
  changeRoleMutate.mockClear();
  cancelMutate.mockClear();
  leaveMutate.mockClear();
});

function renderSettings() {
  return render(<WorkspaceMembersSettings workspaceId="ws-1" />);
}

describe('WorkspaceMembersSettings member lifecycle (ODD 018 S3)', () => {
  it('offers role changes in the member menu and calls the mutation', async () => {
    renderSettings();

    const row = screen.getByText('Bob Admin').closest('tr')!;
    const trigger = row.querySelector('button')!;
    // Radix menus open on the pointerdown → click sequence
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);

    // Role items live flat in the menu; the i18n mock renders key paths
    fireEvent.click(await screen.findByText('roles.viewer'));

    await waitFor(() => {
      expect(changeRoleMutate).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        userId: 'user-2',
        role: 'VIEWER',
      });
    });
  });

  it('wires the cancel button for pending invitations', async () => {
    hooksState.invitations = [
      {
        id: 'inv-1',
        email: 'ghost@example.com',
        role: 'MEMBER',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    ];

    renderSettings();

    const row = screen.getByText('ghost@example.com').closest('tr')!;
    fireEvent.click(row.querySelector('button')!);

    await waitFor(() => {
      expect(cancelMutate).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        invitationId: 'inv-1',
      });
    });
  });

  it('offers leave to members and calls the mutation (W6)', async () => {
    hooksState.members = [
      {
        id: 'm-me',
        role: 'MEMBER',
        userId: 'user-me',
        joinedAt: new Date().toISOString(),
        user: { id: 'user-me', name: 'Me', email: 'me@x.com', image: null },
      },
    ];
    hooksState.currentUser = { id: 'user-me' };

    renderSettings();

    fireEvent.click(await screen.findByText('leave'));

    await waitFor(() => {
      expect(leaveMutate).toHaveBeenCalledWith({ workspaceId: 'ws-1' });
    });
    expect(window.location.assign).toHaveBeenCalledWith('/');
  });

  it('hides leave for the workspace owner', () => {
    renderSettings();

    expect(screen.queryByText('leave')).toBeNull();
  });
});
