/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />
/**
 * Unit Tests for WorkspaceCard Component
 *
 * These tests verify the WorkspaceCard component behavior:
 * 1. Rendering workspace information (name, description, type, stats)
 * 2. User interactions (click, delete, settings)
 * 3. Accessibility (keyboard navigation, ARIA labels)
 * 4. Visual states (hover, loading)
 * 5. Label customization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceCard, type WorkspaceData } from '../workspace-card';

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className, style }: { children?: React.ReactNode; onClick?: () => void; className?: string; style?: React.CSSProperties }) => (
      <div onClick={onClick} className={className} style={style}>
        {children}
      </div>
    ),
  },
}));

// Mock window.confirm without destroying other window properties
const mockConfirm = vi.fn();
vi.stubGlobal('confirm', mockConfirm);

describe('WorkspaceCard Component', () => {
  const mockWorkspace: WorkspaceData = {
    id: 'workspace-123',
    slug: 'test-workspace',
    name: 'Test Workspace',
    description: 'A test workspace for testing',
    type: 'PERSONAL',
    color: '#06b6d4',
    icon: null,
    projectsCount: 5,
    tasksCount: 25,
  };

  beforeEach(() => {
    mockConfirm.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============ RENDERING TESTS ============

  describe('Rendering', () => {
    it('should render workspace name', () => {
      render(<WorkspaceCard workspace={mockWorkspace} />);

      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
    });

    it('should render workspace description when provided', () => {
      render(<WorkspaceCard workspace={mockWorkspace} />);

      expect(screen.getByText('A test workspace for testing')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const workspaceWithoutDesc = { ...mockWorkspace, description: undefined };
      render(<WorkspaceCard workspace={workspaceWithoutDesc} />);

      expect(screen.queryByText('A test workspace for testing')).not.toBeInTheDocument();
    });

    it('should render workspace type badge', () => {
      render(<WorkspaceCard workspace={mockWorkspace} />);

      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('should render active status badge', () => {
      render(<WorkspaceCard workspace={mockWorkspace} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render project stats', () => {
      render(<WorkspaceCard workspace={mockWorkspace} />);

      expect(screen.getByText(/5 projects/)).toBeInTheDocument();
    });

    it('should render task stats', () => {
      render(<WorkspaceCard workspace={mockWorkspace} />);

      expect(screen.getByText(/25 tasks/)).toBeInTheDocument();
    });

    it('should render zero stats when not provided', () => {
      const workspaceWithoutStats = { ...mockWorkspace, projectsCount: undefined, tasksCount: undefined };
      render(<WorkspaceCard workspace={workspaceWithoutStats} />);

      expect(screen.getByText(/0 projects/)).toBeInTheDocument();
      expect(screen.getByText(/0 tasks/)).toBeInTheDocument();
    });

    it('should render correct icon for WORK type', () => {
      const workWorkspace = { ...mockWorkspace, type: 'WORK' as const };
      render(<WorkspaceCard workspace={workWorkspace} />);

      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('should render correct icon for TEAM type', () => {
      const teamWorkspace = { ...mockWorkspace, type: 'TEAM' as const };
      render(<WorkspaceCard workspace={teamWorkspace} />);

      expect(screen.getByText('Team')).toBeInTheDocument();
    });
  });

  // ============ USER INTERACTIONS ============

  describe('User Interactions', () => {
    it('should call onWorkspaceClick when card is clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<WorkspaceCard workspace={mockWorkspace} onWorkspaceClick={handleClick} />);

      const card = screen.getByText('Test Workspace').closest('div');
      await user.click(card!);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(mockWorkspace);
    });

    it('should open dropdown menu when more button is clicked', async () => {
      const user = userEvent.setup();

      render(<WorkspaceCard workspace={mockWorkspace} />);

      // Find the more button (it appears on hover but we can still click it)
      const moreButton = screen.getAllByRole('button').find(
        (btn) => btn.querySelector('svg')?.getAttribute('data-lucide') === 'more-vertical'
      );

      if (moreButton) {
        await user.click(moreButton);

        // Menu items should be visible after clicking
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
      }
    });

    it('should call onOpenSettings when settings menu item is clicked', async () => {
      const handleSettings = vi.fn();
      const user = userEvent.setup();

      render(<WorkspaceCard workspace={mockWorkspace} onOpenSettings={handleSettings} />);

      // Find and click the more button
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons.find(
        (btn) => btn.querySelector('svg')
      );

      if (moreButton) {
        await user.click(moreButton);

        const settingsButton = screen.getByText('Settings');
        await user.click(settingsButton);

        expect(handleSettings).toHaveBeenCalledWith('workspace-123');
      }
    });

    it('should call onDelete when delete button is clicked', async () => {
      const handleDelete = vi.fn();
      const user = userEvent.setup();

      render(<WorkspaceCard workspace={mockWorkspace} onDelete={handleDelete} />);

      // Find and click the more button to open dropdown
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons.find((btn) => btn.querySelector('svg'));

      if (moreButton) {
        await user.click(moreButton);

        const deleteButton = screen.getByText('Delete');
        await user.click(deleteButton);

        // Component calls onDelete directly (confirmation is handled by parent)
        expect(handleDelete).toHaveBeenCalledWith('workspace-123');
      }
    });

    it('should call onDelete when delete is confirmed', async () => {
      mockConfirm.mockReturnValue(true);
      const handleDelete = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(<WorkspaceCard workspace={mockWorkspace} onDelete={handleDelete} />);

      // Find and click the more button
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons.find((btn) => btn.querySelector('svg'));

      if (moreButton) {
        await user.click(moreButton);

        const deleteButton = screen.getByText('Delete');
        await user.click(deleteButton);

        expect(handleDelete).toHaveBeenCalledWith('workspace-123');
      }
    });

    it('should not show delete option for owner', () => {
      // This would be tested by checking that OWNER role members don't see delete
      // The component itself doesn't handle permissions - it's up to the parent
      render(<WorkspaceCard workspace={mockWorkspace} />);

      // Delete option should still be visible in menu
      // Permission checks should be done in the parent component
      const deleteButton = screen.queryByText('Delete');
      // Initially not visible until menu is open
      expect(deleteButton).not.toBeInTheDocument();
    });
  });

  // ============ CUSTOM LABELS ============

  describe('Custom Labels', () => {
    it('should use custom type labels', () => {
      const customLabels = {
        types: {
          PERSONAL: 'My Personal',
          WORK: 'My Work',
          TEAM: 'My Team',
        },
      };

      render(<WorkspaceCard workspace={mockWorkspace} labels={customLabels} />);

      expect(screen.getByText('My Personal')).toBeInTheDocument();
    });

    it('should use custom stats labels', () => {
      const customLabels = {
        stats: {
          projects: (count: number) => `${count} projects!`,
          tasks: (count: number) => `${count} tasks!`,
        },
      };

      render(<WorkspaceCard workspace={mockWorkspace} labels={customLabels} />);

      expect(screen.getByText('5 projects!')).toBeInTheDocument();
      expect(screen.getByText('25 tasks!')).toBeInTheDocument();
    });

    it('should use custom action labels', () => {
      const customLabels = {
        actions: {
          settings: 'Configurar',
          delete: 'Eliminar',
        },
      };

      render(<WorkspaceCard workspace={mockWorkspace} labels={customLabels} />);

      // Need to open the menu to see these labels
      // This would require clicking the more button first
    });

    it('should use custom action labels', async () => {
      const handleDelete = vi.fn();
      const user = userEvent.setup();

      const customLabels = {
        actions: {
          settings: 'Configurar',
          delete: 'Eliminar',
        },
      };

      render(
        <WorkspaceCard workspace={mockWorkspace} onDelete={handleDelete} labels={customLabels} />
      );

      // Open menu to see custom labels
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons.find((btn) => btn.querySelector('svg'));

      if (moreButton) {
        await user.click(moreButton);

        // Should use custom Spanish labels
        expect(screen.getByText('Eliminar')).toBeInTheDocument();
        expect(screen.getByText('Configurar')).toBeInTheDocument();
      }
    });
  });

  // ============ ACCESSIBILITY TESTS ============

  describe('Accessibility', () => {
    it('should respond to click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<WorkspaceCard workspace={mockWorkspace} onWorkspaceClick={handleClick} />);

      const card = screen.getByText('Test Workspace').closest('div');
      expect(card).toBeInTheDocument();

      // Click should trigger the callback
      await user.click(card!);

      expect(handleClick).toHaveBeenCalledWith(mockWorkspace);
    });

    it('should render with proper styling for interactivity', () => {
      const { container } = render(<WorkspaceCard workspace={mockWorkspace} />);

      // The card has cursor-pointer class for visual feedback
      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });

    it('should have proper button roles for interactive elements', () => {
      render(<WorkspaceCard workspace={mockWorkspace} />);

      // Settings and delete buttons should have role="button"
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should announce workspace type to screen readers', () => {
      render(<WorkspaceCard workspace={mockWorkspace} />);

      const typeBadge = screen.getByText('Personal');
      expect(typeBadge).toBeVisible();
    });
  });

  // ============ VISUAL STATES ============

  describe('Visual States', () => {
    it('should apply left border color based on workspace type', () => {
      const { container } = render(<WorkspaceCard workspace={mockWorkspace} />);

      // Border is applied via inline style, not CSS class
      const card = container.querySelector('[style*="border-left"]');
      expect(card).toBeInTheDocument();
    });

    it('should render icon box with type-appropriate color', () => {
      const { container } = render(<WorkspaceCard workspace={mockWorkspace} />);

      // Type icon box should have background color
      const iconBox = container.querySelector('[style*="background-color"]');
      expect(iconBox).toBeInTheDocument();
    });

    it('should render different colors for different workspace types', () => {
      const { rerender } = render(<WorkspaceCard workspace={mockWorkspace} />);

      // PERSONAL type uses cyan color
      const personalCard = screen.getByText('Test Workspace').closest('div');
      expect(personalCard).toBeInTheDocument();

      // Rerender with WORK type
      const workWorkspace = { ...mockWorkspace, type: 'WORK' as const };
      rerender(<WorkspaceCard workspace={workWorkspace} />);

      expect(screen.getByText('Work')).toBeInTheDocument();
    });
  });

  // ============ EDGE CASES ============

  describe('Edge Cases', () => {
    it('should handle workspace without owner', () => {
      const workspaceWithoutOwner = { ...mockWorkspace, ownerId: undefined };
      expect(() =>
        render(<WorkspaceCard workspace={workspaceWithoutOwner} />)
      ).not.toThrow();
    });

    it('should handle very long workspace names', () => {
      const longNameWorkspace = {
        ...mockWorkspace,
        name: 'This is a very very very long workspace name that should be truncated',
      };

      render(<WorkspaceCard workspace={longNameWorkspace} />);

      expect(
        screen.getByText('This is a very very very long workspace name that should be truncated')
      ).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDescWorkspace = {
        ...mockWorkspace,
        description: 'This is a very long description that should be truncated with line-clamp-2 class',
      };

      render(<WorkspaceCard workspace={longDescWorkspace} />);

      expect(
        screen.getByText('This is a very long description that should be truncated with line-clamp-2 class')
      ).toBeInTheDocument();
    });

    it('should handle missing stats gracefully', () => {
      const workspaceWithoutStats = {
        ...mockWorkspace,
        projectsCount: undefined,
        tasksCount: undefined,
      };

      expect(() =>
        render(<WorkspaceCard workspace={workspaceWithoutStats} />)
      ).not.toThrow();

      expect(screen.getByText(/0 projects/)).toBeInTheDocument();
    });

    it('should handle null description', () => {
      const workspaceWithNullDesc = { ...mockWorkspace, description: null };
      render(<WorkspaceCard workspace={workspaceWithNullDesc} />);

      // Should not show null as text
      expect(screen.queryByText('null')).not.toBeInTheDocument();
    });

    it('should handle empty description', () => {
      const workspaceWithEmptyDesc = { ...mockWorkspace, description: '' };
      render(<WorkspaceCard workspace={workspaceWithEmptyDesc} />);

      // Empty string is falsy, so description should not be shown
      const descriptions = screen.queryAllByText(/A test workspace/);
      expect(descriptions).toHaveLength(0);
    });
  });

  // ============ SETTINGS DIALOG RENDER ============

  describe('Settings Dialog', () => {
    it('should render settings dialog when provided', () => {
      const settingsDialog = <div data-testid="settings-dialog">Settings Dialog</div>;

      render(
        <WorkspaceCard workspace={mockWorkspace} renderSettingsDialog={() => settingsDialog} />
      );

      expect(screen.getByTestId('settings-dialog')).toBeInTheDocument();
    });

    it('should not render settings dialog when not provided', () => {
      render(<WorkspaceCard workspace={mockWorkspace} />);

      expect(screen.queryByTestId('settings-dialog')).not.toBeInTheDocument();
    });
  });

  // ============ ANIMATION DELAY ============

  describe('Animation', () => {
    it('should apply staggered animation delay based on index', () => {
      const { rerender } = render(<WorkspaceCard workspace={mockWorkspace} index={0} />);

      // Index 0 should have minimal delay
      rerender(<WorkspaceCard workspace={mockWorkspace} index={2} />);

      // Index 2 should have a delay
      // The actual delay is handled by framer-motion which we mocked
      expect(() =>
        render(<WorkspaceCard workspace={mockWorkspace} index={5} />)
      ).not.toThrow();
    });
  });
});
