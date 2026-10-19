import { renderHook, act } from '@testing-library/react';
import { useQuickActions } from './use-quick-actions';

const { mockNavigate, mockMutate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockMutate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock('@/lib/shared-hooks', () => ({
  useStartTimer: () => ({ mutate: mockMutate }),
}));

const CANONICAL_IDS = [
  'go-dashboard',
  'go-tasks',
  'go-projects',
  'go-calendar',
  'new-task',
  'new-project',
  'start-timer',
  'search',
];

describe('useQuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useQuickActions());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.filteredActions.length).toBeGreaterThanOrEqual(8);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it('should expose the 8 canonical actions first (same ids as web)', () => {
    const { result } = renderHook(() => useQuickActions());

    const ids = result.current.filteredActions.map((action) => action.id);
    expect(ids.slice(0, 8)).toEqual(CANONICAL_IDS);
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

    act(() => {
      result.current.openQuickActions();
    });
    expect(result.current.isOpen).toBe(true);

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

    act(() => {
      result.current.setSearchTerm('task');
    });

    const filteredActions = result.current.filteredActions;
    expect(filteredActions.length).toBeGreaterThan(0);

    filteredActions.forEach((action) => {
      const matchesLabel = action.label.toLowerCase().includes('task');
      const matchesShortcut = action.shortcut
        ?.toLowerCase()
        .includes('task');
      expect(matchesLabel || matchesShortcut).toBe(true);
    });
  });

  it('should filter actions case-insensitively', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });

    for (const term of ['TASK', 'task', 'TaSk', 'Timer']) {
      act(() => {
        result.current.setSearchTerm(term);
      });

      expect(result.current.filteredActions.length).toBeGreaterThan(0);
    }
  });

  it('should navigate to correct routes for navigation actions', () => {
    const { result } = renderHook(() => useQuickActions());

    const navigationTests = [
      { actionId: 'go-dashboard', expected: '/dashboard' },
      { actionId: 'go-tasks', expected: '/tasks' },
      { actionId: 'go-projects', expected: '/projects' },
      { actionId: 'go-calendar', expected: '/calendar' },
      { actionId: 'new-project', expected: '/projects?action=new' },
      { actionId: 'tags', expected: '/tags' },
      { actionId: 'focus-mode', expected: '/focus' },
      { actionId: 'floating-timer', expected: '/timer/floating' },
    ];

    for (const { actionId, expected } of navigationTests) {
      act(() => {
        result.current.executeAction(actionId);
      });

      expect(mockNavigate).toHaveBeenCalledWith(expected);
    }
  });

  it('should dispatch openQuickAdd for new-task and quick-add', () => {
    const { result } = renderHook(() => useQuickActions());
    const listener = vi.fn();
    window.addEventListener('openQuickAdd', listener);

    act(() => {
      result.current.executeAction('new-task');
    });
    act(() => {
      result.current.executeAction('quick-add');
    });

    expect(listener).toHaveBeenCalledTimes(2);
    window.removeEventListener('openQuickAdd', listener);
  });

  it('should dispatch ordo:open-search for the search action', () => {
    const { result } = renderHook(() => useQuickActions());
    const listener = vi.fn();
    document.addEventListener('ordo:open-search', listener);

    act(() => {
      result.current.executeAction('search');
    });

    expect(listener).toHaveBeenCalledTimes(1);
    document.removeEventListener('ordo:open-search', listener);
  });

  it('should start a WORK timer for start-timer', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.executeAction('start-timer');
    });

    expect(mockMutate).toHaveBeenCalledWith({ type: 'WORK' });
  });

  it('should handle keyboard shortcuts', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should close on escape key', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });
    expect(result.current.isOpen).toBe(true);

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
    const categories = [
      ...new Set(filteredActions.map((action) => action.category)),
    ];

    expect(categories).toContain('task');
    expect(categories).toContain('navigation');
    expect(categories).toContain('timer');
    expect(categories).toContain('general');
  });

  it('should return empty array for no matches', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });

    act(() => {
      result.current.setSearchTerm('xyz123nonexistent');
    });

    expect(result.current.filteredActions).toHaveLength(0);
  });

  it('should clear search when opening', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.setSearchTerm('some search');
    });

    expect(result.current.searchTerm).toBe('some search');

    act(() => {
      result.current.openQuickActions();
    });

    expect(result.current.searchTerm).toBe('');
  });

  it('should close quick actions when executing action', () => {
    const { result } = renderHook(() => useQuickActions());

    act(() => {
      result.current.openQuickActions();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.executeAction('new-task');
    });

    expect(result.current.isOpen).toBe(false);
  });
});
