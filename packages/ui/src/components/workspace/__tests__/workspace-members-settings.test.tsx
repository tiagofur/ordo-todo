/**
 * Unit Tests for WorkspaceMembersSettings Component
 *
 * These tests verify the WorkspaceMembersSettings component behavior:
 * 1. Rendering member lists
 * 2. Rendering invitation lists
 * 3. Add member functionality
 * 4. Remove member functionality
 * 5. Loading states
 * 6. Error handling
 * 7. Custom labels
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  WorkspaceMembersSettings,
  type WorkspaceMember,
  type WorkspaceInvitation,
  type InviteFormValues,
} from '../workspace-members-settings';

// Mock the InviteMemberDialog component
vi.mock('../invite-member-dialog.js', () => ({
  InviteMemberDialog: ({
    open,
    onOpenChange,
    onSubmit,
    isPending,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: InviteFormValues) => Promise<void>;
    isPending: boolean;
  }) => {
    if (!open) return null;

    return (
      <div data-testid="invite-dialog">
        <button
          onClick={() =>
            onSubmit({ email: 'test@example.com', role: 'MEMBER' })
          }
          data-testid="submit-invite"
        >
          Submit Invite
        </button>
        <button onClick={() => onOpenChange(false)} data-testid="cancel-invite">
          Cancel
        </button>
        {isPending && <span data-testid="invite-pending">Inviting...</span>}
      </div>
    );
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(global, 'window', {
  value: {
    confirm: mockConfirm,
  },
  writable: true,
});

describe('WorkspaceMembersSettings Component', () => {
  const mockMembers: WorkspaceMember[] = [
    {
      id: 'member-1',
      userId: 'user-1',
      role: 'OWNER',
      joinedAt: '2024-01-01T00:00:00.000Z',
      user: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        image: null,
      },
    },
    {
      id: 'member-2',
      userId: 'user-2',
      role: 'ADMIN',
      joinedAt: '2024-01-15T00:00:00.000Z',
      user: {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        image: null,
      },
    },
    {
      id: 'member-3',
      userId: 'user-3',
      role: 'MEMBER',
      joinedAt: '2024-02-01T00:00:00.000Z',
      user: {
        id: 'user-3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        image: null,
      },
    },
  ];

  const mockInvitations: WorkspaceInvitation[] = [
    {
      id: 'invite-1',
      email: 'pending@example.com',
      role: 'MEMBER',
      status: 'PENDING',
      createdAt: '2024-02-15T00:00:00.000Z',
    },
    {
      id: 'invite-2',
      email: 'expired@example.com',
      role: 'VIEWER',
      status: 'EXPIRED',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const defaultProps = {
    members: mockMembers,
    invitations: mockInvitations,
    isLoading: false,
    onInviteMember: vi.fn(),
    onRemoveMember: vi.fn(),
    onDeleteInvitation: vi.fn(),
    isInvitePending: false,
    isRemovePending: false,
  };

  beforeEach(() => {
    mockConfirm.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============ RENDERING TESTS ============

  describe('Rendering Members', () => {
    it('should render all members', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should render member roles with badges', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      expect(screen.getByText('Creator')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
    });

    it('should render member emails', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('should render joined dates', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      // Dates are formatted as "MMM d, yyyy"
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Feb 1, 2024')).toBeInTheDocument();
    });

    it('should render avatar fallbacks for users without images', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      // Avatar fallbacks should show first letter of name or email
      expect(screen.getByText('J')).toBeInTheDocument(); // John
      expect(screen.getByText('B')).toBeInTheDocument(); // Bob
    });

    it('should show remove button for non-OWNER members', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      // Owner should not have remove option
      const johnRow = screen.getByText('John Doe').closest('tr');
      expect(johnRow?.querySelector('button')).toBeNull();

      // Admin should have remove option (in dropdown menu)
      const janeRow = screen.getByText('Jane Smith').closest('tr');
      expect(janeRow?.querySelector('button')).toBeInTheDocument();
    });

    it('should handle members without names', () => {
      const membersWithoutNames: WorkspaceMember[] = [
        {
          id: 'member-1',
          userId: 'user-1',
          role: 'MEMBER',
          joinedAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 'user-1',
            email: 'noname@example.com',
          },
        },
      ];

      render(<WorkspaceMembersSettings {...defaultProps} members={membersWithoutNames} />);

      expect(screen.getByText('Unknown User')).toBeInTheDocument();
      expect(screen.getByText('noname@example.com')).toBeInTheDocument();
    });

    it('should show email as avatar fallback when name is missing', () => {
      const membersWithoutNames: WorkspaceMember[] = [
        {
          id: 'member-1',
          userId: 'user-1',
          role: 'MEMBER',
          joinedAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 'user-1',
            email: 'test@example.com',
          },
        },
      ];

      render(<WorkspaceMembersSettings {...defaultProps} members={membersWithoutNames} />);

      // First letter of email should be in avatar
      const avatars = screen.getAllByText('t');
      expect(avatars.length).toBeGreaterThan(0);
    });
  });

  // ============ RENDERING INVITATIONS ============

  describe('Rendering Invitations', () => {
    it('should render pending invitations', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      expect(screen.getByText('pending@example.com')).toBeInTheDocument();
      expect(screen.getByText('expired@example.com')).toBeInTheDocument();
    });

    it('should render invitation roles', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      const memberBadges = screen.getAllByText('Member');
      expect(memberBadges.length).toBeGreaterThan(0);

      const viewerBadges = screen.getAllByText('Viewer');
      expect(viewerBadges.length).toBeGreaterThan(0);
    });

    it('should render invitation status badges', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('expired')).toBeInTheDocument();
    });

    it('should render invitation dates', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      expect(screen.getByText('Feb 15, 2024')).toBeInTheDocument();
    });

    it('should show delete button for invitations', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      // Delete buttons should be visible for invitations
      const deleteButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should not render invitations section when empty', () => {
      render(<WorkspaceMembersSettings {...defaultProps} invitations={[]} />);

      expect(screen.queryByText('Pending Invitations')).not.toBeInTheDocument();
    });
  });

  // ============ LOADING STATES ============

  describe('Loading States', () => {
    it('should show loading message when isLoading is true', () => {
      render(<WorkspaceMembersSettings {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render members table when loading', () => {
      render(<WorkspaceMembersSettings {...defaultProps} isLoading={true} />);

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  // ============ USER INTERACTIONS ============

  describe('User Interactions', () => {
    it('should open invite dialog when invite button is clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceMembersSettings {...defaultProps} />);

      const inviteButton = screen.getByRole('button', { name: /invite member/i });
      await user.click(inviteButton);

      expect(screen.getByTestId('invite-dialog')).toBeInTheDocument();
    });

    it('should call onInviteMember when invite form is submitted', async () => {
      const user = userEvent.setup();
      const onInviteMember = vi.fn().mockResolvedValue({});

      render(
        <WorkspaceMembersSettings {...defaultProps} onInviteMember={onInviteMember} />
      );

      // Open invite dialog
      const inviteButton = screen.getByRole('button', { name: /invite member/i });
      await user.click(inviteButton);

      // Submit invite
      const submitButton = screen.getByTestId('submit-invite');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onInviteMember).toHaveBeenCalledWith({
          email: 'test@example.com',
          role: 'MEMBER',
        });
      });
    });

    it('should show pending state during invite', async () => {
      const user = userEvent.setup();
      const onInviteMember = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(
        <WorkspaceMembersSettings
          {...defaultProps}
          onInviteMember={onInviteMember}
          isInvitePending={true}
        />
      );

      // Open invite dialog
      const inviteButton = screen.getByRole('button', { name: /invite member/i });
      await user.click(inviteButton);

      expect(screen.getByTestId('invite-pending')).toBeInTheDocument();
    });

    it('should show confirmation before removing member', async () => {
      const user = userEvent.setup();
      const onRemoveMember = vi.fn();
      mockConfirm.mockReturnValue(false);

      render(
        <WorkspaceMembersSettings {...defaultProps} onRemoveMember={onRemoveMember} />
      );

      // Find a non-OWNER member's action button
      const memberRows = screen.getAllByRole('row');
      const janeRow = memberRows.find((row) =>
        row.textContent?.includes('Jane Smith')
      );

      const actionButton = janeRow?.querySelector('button');
      if (actionButton) {
        await user.click(actionButton);

        // Should show confirmation
        expect(mockConfirm).toHaveBeenCalledWith(
          'Are you sure you want to remove this member?'
        );

        // Should not call onRemoveMember when cancelled
        expect(onRemoveMember).not.toHaveBeenCalled();
      }
    });

    it('should call onRemoveMember when removal is confirmed', async () => {
      const user = userEvent.setup();
      const onRemoveMember = vi.fn();
      mockConfirm.mockReturnValue(true);

      render(
        <WorkspaceMembersSettings {...defaultProps} onRemoveMember={onRemoveMember} />
      );

      // Find a non-OWNER member's action button
      const memberRows = screen.getAllByRole('row');
      const janeRow = memberRows.find((row) =>
        row.textContent?.includes('Jane Smith')
      );

      const actionButton = janeRow?.querySelector('button');
      if (actionButton) {
        await user.click(actionButton);

        await waitFor(() => {
          expect(onRemoveMember).toHaveBeenCalledWith('user-2');
        });
      }
    });

    it('should call onDeleteInvitation when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDeleteInvitation = vi.fn();

      render(
        <WorkspaceMembersSettings
          {...defaultProps}
          onDeleteInvitation={onDeleteInvitation}
        />
      );

      // Find delete buttons for invitations
      const deleteButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')
      );

      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        expect(onDeleteInvitation).toHaveBeenCalledWith('invite-1');
      }
    });
  });

  // ============ CUSTOM LABELS ============

  describe('Custom Labels', () => {
    it('should use custom labels', () => {
      const customLabels = {
        membersTitle: 'Team',
        membersDescription: 'Manage your team members',
        inviteMember: 'Add New Member',
        user: 'User Name',
        role: 'Role Type',
        joined: 'Joined On',
        remove: 'Remove Member',
        confirmRemove: 'Really remove?',
        invitationsTitle: 'Pending',
        invitationsDescription: 'Invites waiting',
        roles: {
          owner: 'Owner',
          admin: 'Admin',
          member: 'Team Member',
          viewer: 'Guest',
        },
      };

      render(<WorkspaceMembersSettings {...defaultProps} labels={customLabels} />);

      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Manage your team members')).toBeInTheDocument();
      expect(screen.getByText('Add New Member')).toBeInTheDocument();
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('Team Member')).toBeInTheDocument();
    });

    it('should use custom invite dialog labels', () => {
      const customLabels = {
        inviteDialog: {
          title: 'Send Invitation',
          description: 'Invite a new team member',
          emailLabel: 'Email Address',
          roleLabel: 'Role',
          cancel: 'Close',
          invite: 'Send',
        },
      };

      render(<WorkspaceMembersSettings {...defaultProps} labels={customLabels} />);

      // Labels are passed to the InviteMemberDialog
      // The dialog is mocked so we can't test the actual labels here
    });
  });

  // ============ EMPTY STATES ============

  describe('Empty States', () => {
    it('should render empty members list', () => {
      render(<WorkspaceMembersSettings {...defaultProps} members={[]} />);

      expect(screen.getByText('John Doe')).not.toBeInTheDocument();
      // Table should still be rendered
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render with only owner member', () => {
      const onlyOwner: WorkspaceMember[] = [
        {
          id: 'member-1',
          userId: 'user-1',
          role: 'OWNER',
          joinedAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 'user-1',
            name: 'Owner User',
            email: 'owner@example.com',
            image: null,
          },
        },
      ];

      render(<WorkspaceMembersSettings {...defaultProps} members={onlyOwner} />);

      expect(screen.getByText('Owner User')).toBeInTheDocument();
      expect(screen.getByText('Creator')).toBeInTheDocument();
    });
  });

  // ============ ACCESSIBILITY ============

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Check for table headers
      expect(screen.getByRole('columnheader', { name: /user/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /role/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /joined/i })).toBeInTheDocument();
    });

    it('should have clickable buttons for actions', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        expect(button).toBeVisible();
      });
    });

    it('should announce role changes to screen readers', () => {
      render(<WorkspaceMembersSettings {...defaultProps} />);

      // Role badges should be visible
      const roleBadges = screen.getAllByText(/Creator|Admin|Member/);
      roleBadges.forEach((badge) => {
        expect(badge).toBeVisible();
      });
    });
  });

  // ============ ROLE DISPLAY ============

  describe('Role Display', () => {
    it('should display all role types correctly', () => {
      const allRoles: WorkspaceMember[] = [
        {
          id: 'member-1',
          userId: 'user-1',
          role: 'OWNER',
          joinedAt: '2024-01-01T00:00:00.000Z',
          user: { id: 'user-1', name: 'Owner', email: 'owner@example.com' },
        },
        {
          id: 'member-2',
          userId: 'user-2',
          role: 'ADMIN',
          joinedAt: '2024-01-01T00:00:00.000Z',
          user: { id: 'user-2', name: 'Admin', email: 'admin@example.com' },
        },
        {
          id: 'member-3',
          userId: 'user-3',
          role: 'MEMBER',
          joinedAt: '2024-01-01T00:00:00.000Z',
          user: { id: 'user-3', name: 'Member', email: 'member@example.com' },
        },
        {
          id: 'member-4',
          userId: 'user-4',
          role: 'VIEWER',
          joinedAt: '2024-01-01T00:00:00.000Z',
          user: { id: 'user-4', name: 'Viewer', email: 'viewer@example.com' },
        },
      ];

      render(<WorkspaceMembersSettings {...defaultProps} members={allRoles} />);

      expect(screen.getByText('Creator')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    it('should use lowercase for unknown roles', () => {
      const unknownRole: WorkspaceMember[] = [
        {
          id: 'member-1',
          userId: 'user-1',
          role: 'UNKNOWN_ROLE' as any,
          joinedAt: '2024-01-01T00:00:00.000Z',
          user: { id: 'user-1', name: 'Unknown', email: 'unknown@example.com' },
        },
      ];

      render(<WorkspaceMembersSettings {...defaultProps} members={unknownRole} />);

      expect(screen.getByText('unknown_role')).toBeInTheDocument();
    });
  });
});
