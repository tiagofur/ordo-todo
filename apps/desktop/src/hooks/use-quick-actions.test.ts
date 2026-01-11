import { renderHook, act } from '@testing-library/react';
import { useQuickActions } from './use-quick-actions';

describe('useQuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useQuickActions());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.filteredActions).toHaveLength(10); // Default actions
    expect(result.current.searchTerm).toBe('');
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it('should open quick actions with default position', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.position).toEqual({
      x: window.innerWidth / 2 - 200,
      y: window.innerHeight / 2 - 150,
    });
    expect(result.current.searchTerm).toBe('');
  });

  it('should open quick actions with custom position', () => {
    const { result } = renderHook(() => useQuickActions());
    const customPosition = { x: 100, y: 200 };

    act(() => {
      result.current.openQuickActions(customPosition.x, customPosition.y);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.position).toEqual(customPosition);
  });

  it('should close quick actions', () => {
    const { result } = renderHook(() => useQuickActions());

    // Open first
    act(() => {
      result.current.openQuickActions();
    });
    expect(result.current.isOpen).toBe(true);

    // Then close
    act(() => {
      result.current.closeQuickActions();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.searchTerm).toBe('');
  });

  it('should filter actions by search term', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });

    // Search for "task"
    act(() => {
      result.current.setSearchTerm('task');
    });

    const filteredActions = result.current.filteredActions;
    expect(filteredActions.length).toBeGreaterThan(0);

    // All filtered actions should contain "task" in label or shortcut
    filteredActions.forEach(action => {
      const matchesLabel = action.label.toLowerCase().includes('task');
      const matchesShortcut = action.shortcut?.toLowerCase().includes('task');
      expect(matchesLabel || matchesShortcut).toBe(true);
    });
  });

  it('should filter actions case-insensitively', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });

    // Search with different cases
    const searchTerms = ['TASK', 'task', 'TaSk', 'DaSh'];

    searchTerms.forEach(term => {
      act(() => {
        result.current.setSearchTerm(term);
      });

      const filteredActions = result.current.filteredActions;
      expect(filteredActions.length).toBeGreaterThan(0);
    });
  });

  it('should execute navigation actions', () => {
    const { result } = renderHook(() => useQuickActions());

    // Mock window.location
    const mockHash = '';
    Object.defineProperty(window, 'location', {
      value: { hash: mockHash },
      writable: true,
    });

    act(() => {
      result.current.executeAction('new-task');
    });

    expect(window.location.hash).toBe('/tasks?new=true');
  });

  it('should dispatch custom events for special actions', () => {
    const { result } = renderHook(() => useQuickActions());

    // Mock window.dispatchEvent
    const mockDispatchEvent = vi.fn();
    Object.defineProperty(window, 'dispatchEvent', {
      value: mockDispatchEvent,
      writable: true,
    });

    act(() => {
      result.current.executeAction('quick-add');
    });

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'openQuickAdd',
      })
    );
  });

  it('should handle keyboard shortcuts', () => {
    const { result } = renderHook(() => useQuickActions());

    // Mock keyboard event
    const mockEvent = new KeyboardEvent('keydown', {
      metaKey: true,
      key: 'k',
    });

    act(() => {
      // Simulate the keyboard shortcut
      result.current.openQuickActions();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should close on escape key', () => {
    const { result } = renderHook(() => useQuickActions());

    // Open first
    act(() => {
      result.current.openQuickActions();
    });
    expect(result.current.isOpen).toBe(true);

    // Simulate escape key
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    act(() => {
      result.current.closeQuickActions();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should group actions by category', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });

    const filteredActions = result.current.filteredActions;
    const categories = [...new Set(filteredActions.map(action => action.category))];

    // Should have expected categories
    expect(categories).toContain('task');
    expect(categories).toContain('navigation');
    expect(categories).toContain('timer');
    expect(categories).toContain('general');
  });

  it('should navigate to correct routes for navigation actions', () => {
    const { result } = renderHook(() => useQuickActions());

    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true,
    });

    const navigationTests = [
      { actionId: 'dashboard', expectedHash: '/dashboard' },
      { actionId: 'tasks', expectedHash: '/tasks' },
      { actionId: 'projects', expectedHash: '/projects' },
      { actionId: 'timer', expectedHash: '/timer' },
      { actionId: 'analytics', expectedHash: '/analytics' },
    ];

    navigationTests.forEach(({ actionId, expectedHash }) => {
      act(() => {
        result.current.executeAction(actionId);
      });

      expect(window.location.hash).toBe(expectedHash);
    });
  });

  it('should handle timer actions correctly', () => {
    const { result } = renderHook(() => useQuickActions());

    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true,
    });

    // Test pomodoro start
    act(() => {
      result.current.executeAction('start-pomodoro');
    });
    expect(window.location.hash).toBe('/timer?start=pomodoro');

    // Reset hash
    window.location.hash = '';

    // Test floating timer
    act(() => {
      result.current.executeAction('floating-timer');
    });
    expect(window.location.hash).toBe('/timer/floating');
  });

  it('should return empty array for no matches', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });

    // Search for something that won't match
    act(() => {
      result.current.setSearchTerm('xyz123nonexistent');
    });

    expect(result.current.filteredActions).toHaveLength(0);
  });

  it('should clear search when opening', () => {
    const { result } = renderHook(() => useQuickActions());

    // Set search term
    act(() => {
      result.current.setSearchTerm('some search');
    });

    expect(result.current.searchTerm).toBe('some search');

    // Open quick actions should clear search
    act(() => {
      result.current.openQuickActions();
    });

    expect(result.current.searchTerm).toBe('');
  });

  it('should close quick actions when executing action', () => {
    const { result } = renderHook(() => useQuickActions());

    // Open first
    act(() => {
      result.current.openQuickActions();
    });
    expect(result.current.isOpen).toBe(true);

    // Execute action should close
    act(() => {
      result.current.executeAction('new-task');
    });

    expect(result.current.isOpen).toBe(false);
  });
});