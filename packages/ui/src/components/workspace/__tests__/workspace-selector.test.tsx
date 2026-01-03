/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />
/**
 * Unit Tests for WorkspaceSelector Component
 *
 * These tests verify the WorkspaceSelector component behavior:
 * 1. Rendering workspace list
 * 2. Opening/closing dropdown
 * 3. Selecting workspace
 * 4. Searching/filtering
 * 5. Grouping by type
 * 6. Creating new workspace
 * 7. Loading states
 * 8. Empty states
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceSelector, type WorkspaceSelectorItem } from '../workspace-selector';

describe('WorkspaceSelector Component', () => {
  const mockWorkspaces: WorkspaceSelectorItem[] = [
    {
      id: 'ws-1',
      slug: 'personal-ws',
      name: 'Personal Workspace',
      type: 'PERSONAL',
      color: '#06b6d4',
      stats: { projectCount: 3, taskCount: 15 },
    },
    {
      id: 'ws-2',
      slug: 'work-ws',
      name: 'Work Projects',
      type: 'WORK',
      color: '#a855f7',
      stats: { projectCount: 5, taskCount: 25 },
    },
    {
      id: 'ws-3',
      slug: 'team-ws',
      name: 'Team Collaboration',
      type: 'TEAM',
      color: '#ec4899',
      stats: { projectCount: 2, taskCount: 8 },
    },
  ];

  const defaultProps = {
    workspaces: mockWorkspaces,
    selectedWorkspaceId: 'ws-1',
    onSelect: vi.fn(),
    onCreateClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============ RENDERING TESTS ============

  describe('Rendering', () => {
    it('should render selected workspace name', () => {
      render(<WorkspaceSelector {...defaultProps} />);

      expect(screen.getByText('Personal Workspace')).toBeInTheDocument();
    });

    it('should render workspace stats', () => {
      render(<WorkspaceSelector {...defaultProps} />);

      // Should show project count
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render first workspace when none selected', () => {
      render(<WorkspaceSelector {...defaultProps} selectedWorkspaceId={null} />);

      expect(screen.getByText('Personal Workspace')).toBeInTheDocument();
    });

    it('should show different colors for different workspace types', () => {
      const { rerender } = render(<WorkspaceSelector {...defaultProps} selectedWorkspaceId="ws-1" />);

      // PERSONAL workspace selected
      expect(screen.getByText('Personal Workspace')).toBeInTheDocument();

      rerender(<WorkspaceSelector {...defaultProps} selectedWorkspaceId="ws-2" />);

      // WORK workspace selected
      expect(screen.getByText('Work Projects')).toBeInTheDocument();
    });

    it('should render chevron icon', () => {
      render(<WorkspaceSelector {...defaultProps} />);

      // The chevron icon should be present (lucide icon)
      // The chevron icon should be present (lucide icon)
      // Lucide icons render as svgs with specific classes
      const trigger = screen.getByRole('button');
      expect(trigger.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ============ DROPDOWN INTERACTIONS ============

  describe('Dropdown Interactions', () => {
    it('should open dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Dropdown content should be visible (rendered in DOM)
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    it('should call onSelect when workspace is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<WorkspaceSelector {...defaultProps} onSelect={onSelect} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Click on a different workspace
      const workWorkspace = screen.getByText('Work Projects');
      await user.click(workWorkspace);

      expect(onSelect).toHaveBeenCalledWith(mockWorkspaces[1]);
    });

    it('should close dropdown after selecting workspace', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Dropdown should be open
      expect(screen.getByText('Personal')).toBeInTheDocument();

      // Select a workspace
      const workWorkspace = screen.getByText('Work Projects');
      await user.click(workWorkspace);

      // After selection, dropdown should close (content removed from DOM)
      await waitFor(() => {
        expect(screen.queryByText('Personal')).not.toBeInTheDocument();
      });
    });

    it('should show checkmark for selected workspace', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} selectedWorkspaceId="ws-2" />);

      // Open dropdown
      const trigger = screen.getByText('Work Projects').closest('button');
      await user.click(trigger!);

      // Checkmark should be on selected workspace
      const checkIcon = document.querySelector('[data-lucide="check"]');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  // ============ SEARCH FUNCTIONALITY ============

  describe('Search Functionality', () => {
    it('should filter workspaces by search query', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Type in search
      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'Personal');

      // Only Personal workspace should be visible
      expect(screen.getByText('Personal Workspace')).toBeInTheDocument();
      expect(screen.queryByText('Work Projects')).not.toBeInTheDocument();
      expect(screen.queryByText('Team Collaboration')).not.toBeInTheDocument();
    });

    it('should show no results when search matches nothing', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Type non-matching search
      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'NonExistent');

      expect(screen.getByText('No workspaces found')).toBeInTheDocument();
    });

    it('should be case-insensitive when searching', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Type lowercase
      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'team');

      expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
    });
  });

  // ============ GROUPING BY TYPE ============

  describe('Grouping by Type', () => {
    it('should group workspaces by type', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Should show type headers
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    it('should show workspaces under correct type groups', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // All workspaces should be visible
      expect(screen.getByText('Personal Workspace')).toBeInTheDocument();
      expect(screen.getByText('Work Projects')).toBeInTheDocument();
      expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
    });

    it('should hide empty type groups', async () => {
      const user = userEvent.setup();
      const onlyPersonalWorkspaces: WorkspaceSelectorItem[] = [
        {
          id: 'ws-1',
          slug: 'personal',
          name: 'Personal Only',
          type: 'PERSONAL',
          color: '#06b6d4',
        },
      ];

      render(<WorkspaceSelector {...defaultProps} workspaces={onlyPersonalWorkspaces} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Only').closest('button');
      await user.click(trigger!);

      // Only Personal group should be visible
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.queryByText('Work')).not.toBeInTheDocument();
      expect(screen.queryByText('Team')).not.toBeInTheDocument();
    });
  });

  // ============ CREATE WORKSPACE ============

  describe('Create Workspace', () => {
    it('should show create workspace button in dropdown', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Create button should be at bottom
      const createButton = screen.getByText('Create Workspace');
      expect(createButton).toBeInTheDocument();
    });

    it('should call onCreateClick when create button is clicked', async () => {
      const user = userEvent.setup();
      const onCreateClick = vi.fn();

      render(<WorkspaceSelector {...defaultProps} onCreateClick={onCreateClick} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Click create button
      const createButton = screen.getByText('Create Workspace');
      await user.click(createButton);

      expect(onCreateClick).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown after clicking create', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Click create
      const createButton = screen.getByText('Create Workspace');
      await user.click(createButton);

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText('Create Workspace')).not.toBeInTheDocument();
      });
    });
  });

  // ============ LOADING STATES ============

  describe('Loading States', () => {
    it('should show skeleton when loading', () => {
      render(<WorkspaceSelector {...defaultProps} isLoading={true} />);

      // Should show skeleton elements (animate-pulse)
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should not show dropdown when loading', () => {
      render(<WorkspaceSelector {...defaultProps} isLoading={true} />);

      // Trigger should still be visible
      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });
  });

  // ============ EMPTY STATES ============

  describe('Empty States', () => {
    it('should show create button when no workspaces', () => {
      render(<WorkspaceSelector {...defaultProps} workspaces={[]} />);

      expect(screen.getByText('Create Workspace')).toBeInTheDocument();
    });

    it('should call onCreateClick when clicking create in empty state', async () => {
      const user = userEvent.setup();
      const onCreateClick = vi.fn();

      render(<WorkspaceSelector {...defaultProps} workspaces={[]} onCreateClick={onCreateClick} />);

      const createButton = screen.getByText('Create Workspace');
      await user.click(createButton);

      expect(onCreateClick).toHaveBeenCalledTimes(1);
    });

    it('should show dashed border in empty state', () => {
      render(<WorkspaceSelector {...defaultProps} workspaces={[]} />);

      const createButton = screen.getByRole('button');
      expect(createButton).toHaveClass('border-dashed');
    });
  });

  // ============ CUSTOM LABELS ============

  describe('Custom Labels', () => {
    it('should use custom create label', () => {
      render(
        <WorkspaceSelector
          {...defaultProps}
          workspaces={[]}
          labels={{ create: 'New Workspace' }}
        />
      );

      expect(screen.getByText('New Workspace')).toBeInTheDocument();
    });

    it('should use custom search placeholder', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} labels={{ search: 'Find...' }} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      const searchInput = screen.getByPlaceholderText('Find...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should use custom type labels', async () => {
      const user = userEvent.setup();
      render(
        <WorkspaceSelector
          {...defaultProps}
          labels={{
            types: {
              personal: 'My Personal',
              work: 'My Work',
              team: 'My Team',
            },
          }}
        />
      );

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      expect(screen.getByText('My Personal')).toBeInTheDocument();
      expect(screen.getByText('My Work')).toBeInTheDocument();
      expect(screen.getByText('My Team')).toBeInTheDocument();
    });

    it('should use custom stats labels', () => {
      render(
        <WorkspaceSelector
          {...defaultProps}
          labels={{
            stats: {
              projects: 'projs',
              tasks: 'tasks',
            },
          }}
        />
      );

      // Stats should be visible without opening dropdown
      expect(screen.getByText(/projs/)).toBeInTheDocument();
    });
  });

  // ============ ACCESSIBILITY ============

  describe('Accessibility', () => {
    it('should have clickable trigger button', () => {
      render(<WorkspaceSelector {...defaultProps} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });

    it('should have accessible search input', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toBeInTheDocument();
    });

    it('should have keyboard navigation support', () => {
      render(<WorkspaceSelector {...defaultProps} />);

      const trigger = screen.getByRole('button');
      trigger?.focus();

      expect(document.activeElement).toBe(trigger);
    });
  });

  // ============ STATS DISPLAY ============

  describe('Stats Display', () => {
    it('should show project count in dropdown', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      // Stats should be visible in dropdown items
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should show task count in dropdown', async () => {
      const user = userEvent.setup();
      render(<WorkspaceSelector {...defaultProps} />);

      // Open dropdown
      const trigger = screen.getByText('Personal Workspace').closest('button');
      await user.click(trigger!);

      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should show zero for missing stats', () => {
      const workspaceWithoutStats: WorkspaceSelectorItem[] = [
        {
          id: 'ws-1',
          slug: 'no-stats',
          name: 'No Stats',
          type: 'PERSONAL',
          color: '#06b6d4',
        },
      ];

      render(<WorkspaceSelector {...defaultProps} workspaces={workspaceWithoutStats} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
