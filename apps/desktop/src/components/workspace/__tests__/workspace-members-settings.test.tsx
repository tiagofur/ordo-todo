import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceMembersSettings } from '../workspace-members-settings';

// The global setup mocks @ordo-todo/ui with a short list; this component
// needs the real Table/Dropdown implementations
vi.mock('@ordo-todo/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ordo-todo/ui')>();
  return { ...actual };
});

// Desktop uses window.confirm (native)
vi.stubGlobal('confirm', vi.fn(() => true));

vi.mock('../invite-member-dialog', () => ({
  InviteMemberDialog: () => null,
}));

const removeMutate = vi.fn().mockResolvedValue(undefined);
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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/hooks/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/api')>();
  return {
    ...actual,
    useWorkspace: () => ({
      data: { id: 'ws-1', ownerId: 'owner-1' },
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
  };
});

const member = {
  id: 'm-me',
  role: 'MEMBER',
  userId: 'user-me',
  joinedAt: new Date().toISOString(),
  user: { id: 'user-me', name: 'Me', email: 'me@x.com', image: null },
};

beforeEach(() => {
  hooksState.members = [member];
  hooksState.invitations = [];
  hooksState.currentUser = { id: 'owner-1' };
  removeMutate.mockClear();
  changeRoleMutate.mockClear();
  cancelMutate.mockClear();
  leaveMutate.mockClear();
  (confirm as ReturnType<typeof vi.fn>).mockClear();
});

function renderSettings() {
  return render(<WorkspaceMembersSettings workspaceId="ws-1" />);
}

describe('WorkspaceMembersSettings member lifecycle (ODD 018 S3)', () => {
  it('renders members with their roles', () => {
    renderSettings();

    expect(screen.getByText('Me')).toBeDefined();
    expect(screen.getByText('WorkspaceMembersSettings.roles.member')).toBeDefined();
  });

  it('offers leave to non-owner members and calls the mutation (W6)', async () => {
    hooksState.currentUser = { id: 'user-me' };

    renderSettings();

    fireEvent.click(screen.getByText('WorkspaceMembersSettings.leave'));

    await waitFor(() => {
      expect(leaveMutate).toHaveBeenCalledWith({ workspaceId: 'ws-1' });
    });
  });

  it('hides leave for the workspace owner', () => {
    renderSettings();

    expect(screen.queryByText('WorkspaceMembersSettings.leave')).toBeNull();
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
});
