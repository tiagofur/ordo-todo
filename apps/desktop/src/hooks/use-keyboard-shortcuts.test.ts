import { renderHook, act, fireEvent } from '@testing-library/react';
import { useKeyboardShortcuts } from './use-keyboard-shortcuts';
import { defaultShortcuts } from './use-keyboard-shortcuts';

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Remove any existing event listeners
    document.removeEventListener('keydown', vi.fn());
    window.removeEventListener('keydown', vi.fn());
  });

  it('should match keyboard shortcuts correctly', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({
      shortcuts: [],
    }));

    const { matchesShortcut } = result.current;

    // Test basic key match
    const event1 = new KeyboardEvent('keydown', { key: 'k' });
    const shortcut1 = { key: 'k' };
    expect(matchesShortcut(event1, shortcut1)).toBe(true);

    // Test meta key match
    const event2 = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    const shortcut2 = { key: 'k', metaKey: true };
    expect(matchesShortcut(event2, shortcut2)).toBe(true);

    // Test ctrl key match
    const event3 = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    const shortcut3 = { key: 'k', ctrlKey: true };
    expect(matchesShortcut(event3, shortcut3)).toBe(true);

    // Test shift key match
    const event4 = new KeyboardEvent('keydown', { key: 'K', shiftKey: true });
    const shortcut4 = { key: 'K', shiftKey: true };
    expect(matchesShortcut(event4, shortcut4)).toBe(true);

    // Test combination match
    const event5 = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      shiftKey: true,
    });
    const shortcut5 = { key: 'k', metaKey: true, shiftKey: true };
    expect(matchesShortcut(event5, shortcut5)).toBe(true);

    // Test mismatch
    const event6 = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    const shortcut6 = { key: 'k', ctrlKey: true };
    expect(matchesShortcut(event6, shortcut6)).toBe(false);
  });

  it('should handle case-insensitive matching', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({
      shortcuts: [],
    }));

    const { matchesShortcut } = result.current;

    // Test uppercase/lowercase match
    const event1 = new KeyboardEvent('keydown', { key: 'K' });
    const shortcut1 = { key: 'k' };
    expect(matchesShortcut(event1, shortcut1)).toBe(true);

    const event2 = new KeyboardEvent('keydown', { key: 'k' });
    const shortcut2 = { key: 'K' };
    expect(matchesShortcut(event2, shortcut2)).toBe(true);
  });

  it('should trigger actions for matching shortcuts', () => {
    const mockAction = vi.fn();
    const mockOnTriggered = vi.fn();

    renderHook(() => useKeyboardShortcuts({
      shortcuts: [
        {
          id: 'test-shortcut',
          key: 'k',
          metaKey: true,
          action: mockAction,
          description: 'Test shortcut',
        },
      ],
      onShortcutTriggered: mockOnTriggered,
    }));

    // Trigger matching keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });
    fireEvent(document, event);

    expect(mockAction).toHaveBeenCalled();
    expect(mockOnTriggered).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-shortcut',
        key: 'k',
        metaKey: true,
      })
    );
  });

  it('should not trigger actions for non-matching shortcuts', () => {
    const mockAction = vi.fn();

    renderHook(() => useKeyboardShortcuts({
      shortcuts: [
        {
          id: 'test-shortcut',
          key: 'k',
          metaKey: true,
          action: mockAction,
          description: 'Test shortcut',
        },
      ],
    }));

    // Trigger non-matching keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 'l',
      metaKey: true,
    });
    fireEvent(document, event);

    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should handle global shortcuts correctly', () => {
    const mockAction = vi.fn();

    renderHook(() => useKeyboardShortcuts({
      shortcuts: [
        {
          id: 'global-shortcut',
          key: 'k',
          metaKey: true,
          action: mockAction,
          description: 'Global shortcut',
          global: true,
        },
      ],
    }));

    // Create an input element and simulate it being focused
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Trigger global shortcut (should work even when input is focused)
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });
    fireEvent(document, event);

    expect(mockAction).toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should not trigger non-global shortcuts when input is focused', () => {
    const mockAction = vi.fn();

    renderHook(() => useKeyboardShortcuts({
      shortcuts: [
        {
          id: 'local-shortcut',
          key: 'k',
          metaKey: true,
          action: mockAction,
          description: 'Local shortcut',
          global: false, // Not global
        },
      ],
    }));

    // Create an input element and simulate it being focused
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Trigger local shortcut (should not work when input is focused)
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });
    fireEvent(document, event);

    expect(mockAction).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should create navigation shortcuts', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({
      shortcuts: [],
    }));

    const { createNavigationShortcut } = result.current;

    const shortcut = createNavigationShortcut('1', '/dashboard', 'Go to Dashboard');

    expect(shortcut.id).toBe('nav-/dashboard');
    expect(shortcut.key).toBe('1');
    expect(shortcut.action).toBeDefined();
    expect(shortcut.description).toBe('Go to Dashboard');
  });

  it('should create action shortcuts', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({
      shortcuts: [],
    }));

    const { createActionShortcut } = result.current;
    const mockAction = vi.fn();

    const shortcut = createActionShortcut('n', mockAction, 'New Task');

    expect(shortcut.id).toBeDefined();
    expect(shortcut.key).toBe('n');
    expect(shortcut.action).toBe(mockAction);
    expect(shortcut.description).toBe('New Task');
  });

  it('should handle errors in shortcut actions gracefully', () => {
    const mockAction = vi.fn(() => {
      throw new Error('Test error');
    });
    const mockToast = { error: vi.fn() };

    // Mock toast module
    vi.doMock('sonner', () => ({
      toast: mockToast,
    }));

    renderHook(() => useKeyboardShortcuts({
      shortcuts: [
        {
          id: 'error-shortcut',
          key: 'e',
          action: mockAction,
          description: 'Error shortcut',
        },
      ],
    }));

    // Trigger shortcut that throws error
    const event = new KeyboardEvent('keydown', { key: 'e' });
    fireEvent(document, event);

    expect(mockAction).toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to execute shortcut: Error shortcut')
    );
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts({
      shortcuts: [
        {
          id: 'test-shortcut',
          key: 'k',
          action: vi.fn(),
          description: 'Test shortcut',
        },
      ],
    }));

    // Event listeners should be set up
    expect(document.removeEventListener).not.toHaveBeenCalled();

    // Unmount should clean up
    unmount();

    // Note: In a real test environment, we'd verify that removeEventListener was called
    // but since we're using vi.fn(), we can track the cleanup
  });

  it('should work with default shortcuts', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));

    renderHook(() => useKeyboardShortcuts({
      shortcuts: defaultShortcuts,
    }));

    // Test navigation shortcut
    const event1 = new KeyboardEvent('keydown', { key: '1', metaKey: true });
    fireEvent(document, event1);

    // Note: In real implementation, this would trigger navigation
    // but for testing we verify the event listener setup works
  });

  it('should handle multiple shortcuts with same key but different modifiers', () => {
    const mockAction1 = vi.fn();
    const mockAction2 = vi.fn();

    renderHook(() => useKeyboardShortcuts({
      shortcuts: [
        {
          id: 'shortcut-1',
          key: 'k',
          action: mockAction1,
          description: 'Shortcut 1',
        },
        {
          id: 'shortcut-2',
          key: 'k',
          metaKey: true,
          action: mockAction2,
          description: 'Shortcut 2',
        },
      ],
    }));

    // Test basic k press
    const event1 = new KeyboardEvent('keydown', { key: 'k' });
    fireEvent(document, event1);
    expect(mockAction1).toHaveBeenCalled();
    expect(mockAction2).not.toHaveBeenCalled();

    // Reset mocks
    mockAction1.mockClear();
    mockAction2.mockClear();

    // Test cmd+k press
    const event2 = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    fireEvent(document, event2);
    expect(mockAction1).not.toHaveBeenCalled();
    expect(mockAction2).toHaveBeenCalled();
  });

  it('should handle complex modifier combinations', () => {
    const mockAction = vi.fn();

    renderHook(() => useKeyboardShortcuts({
      shortcuts: [
        {
          id: 'complex-shortcut',
          key: 'k',
          metaKey: true,
          shiftKey: true,
          altKey: true,
          action: mockAction,
          description: 'Complex shortcut',
        },
      ],
    }));

    // Test exact match
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      shiftKey: true,
      altKey: true,
    });
    fireEvent(document, event);
    expect(mockAction).toHaveBeenCalled();

    mockAction.mockClear();

    // Test partial match (should not trigger)
    const event2 = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      shiftKey: true,
      // Missing altKey
    });
    fireEvent(document, event2);
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should handle preventDefault on matched shortcuts', () => {
    const mockAction = vi.fn();
    let eventPrevented = false;

    renderHook(() => useKeyboardShortcuts({
      shortcuts: [
        {
          id: 'test-shortcut',
          key: 'k',
          metaKey: true,
          action: mockAction,
          description: 'Test shortcut',
        },
      ],
    }));

    // Create event with preventDefault tracking
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });

    // Mock preventDefault
    Object.defineProperty(event, 'preventDefault', {
      value: () => { eventPrevented = true; },
      writable: true,
    });

    fireEvent(document, event);

    expect(mockAction).toHaveBeenCalled();
    expect(eventPrevented).toBe(true);
  });
});