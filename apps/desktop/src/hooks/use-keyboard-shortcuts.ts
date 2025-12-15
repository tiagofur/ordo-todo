import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface KeyboardShortcut {
  id: string;
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  global?: boolean; // If true, works even when focused on inputs
}

interface KeyboardShortcutConfig {
  shortcuts: KeyboardShortcut[];
  onShortcutTriggered?: (shortcut: KeyboardShortcut) => void;
}

export function useKeyboardShortcuts({ shortcuts, onShortcutTriggered }: KeyboardShortcutConfig) {
  const navigate = useNavigate();

  const matchesShortcut = useCallback((e: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    return (
      e.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!e.metaKey === !!shortcut.metaKey &&
      !!e.ctrlKey === !!shortcut.ctrlKey &&
      !!e.shiftKey === !!shortcut.shiftKey &&
      !!e.altKey === !!shortcut.altKey
    );
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs, unless global
    const activeElement = document.activeElement;
    const isInput = activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      (activeElement as HTMLElement)?.contentEditable === 'true';

    for (const shortcut of shortcuts) {
      if (matchesShortcut(e, shortcut)) {
        // Skip for input fields unless marked as global
        if (isInput && !shortcut.global) {
          continue;
        }

        e.preventDefault();
        e.stopPropagation();

        try {
          shortcut.action();
          onShortcutTriggered?.(shortcut);
        } catch (error) {
          console.error('Error executing keyboard shortcut:', error);
          toast.error(`Failed to execute shortcut: ${shortcut.description}`);
        }

        break;
      }
    }
  }, [shortcuts, matchesShortcut, onShortcutTriggered]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    // Helper to create navigation shortcuts
    createNavigationShortcut: (key: string, path: string, description: string, options?: Partial<KeyboardShortcut>): KeyboardShortcut => ({
      id: `nav-${path}`,
      key,
      action: () => navigate(path),
      description,
      ...options,
    }),

    // Helper to create action shortcuts
    createActionShortcut: (key: string, action: () => void, description: string, options?: Partial<KeyboardShortcut>): KeyboardShortcut => ({
      id: `action-${Date.now()}`,
      key,
      action,
      description,
      ...options,
    }),
  };
}

// Default shortcuts for the app
export const defaultShortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    id: 'nav-dashboard',
    key: '1',
    metaKey: true,
    action: () => { window.location.hash = '/dashboard'; },
    description: 'Go to Dashboard',
    global: true,
  },
  {
    id: 'nav-tasks',
    key: '2',
    metaKey: true,
    action: () => { window.location.hash = '/tasks'; },
    description: 'Go to Tasks',
    global: true,
  },
  {
    id: 'nav-projects',
    key: '3',
    metaKey: true,
    action: () => { window.location.hash = '/projects'; },
    description: 'Go to Projects',
    global: true,
  },
  {
    id: 'nav-timer',
    key: '4',
    metaKey: true,
    action: () => { window.location.hash = '/timer'; },
    description: 'Go to Timer',
    global: true,
  },
  {
    id: 'nav-analytics',
    key: '5',
    metaKey: true,
    action: () => { window.location.hash = '/analytics'; },
    description: 'Go to Analytics',
    global: true,
  },

  // Task Actions
  {
    id: 'new-task',
    key: 'n',
    metaKey: true,
    action: () => { window.location.hash = '/tasks?new=true'; },
    description: 'New Task',
    global: true,
  },
  {
    id: 'quick-add',
    key: 'n',
    metaKey: true,
    shiftKey: true,
    action: () => {
      const event = new CustomEvent('openQuickAdd');
      window.dispatchEvent(event);
    },
    description: 'Quick Add Task',
    global: true,
  },
  {
    id: 'search',
    key: 'k',
    metaKey: true,
    action: () => {
      const event = new CustomEvent('openQuickActions');
      window.dispatchEvent(event);
    },
    description: 'Search / Quick Actions',
    global: true,
  },

  // Timer Actions
  {
    id: 'start-pomodoro',
    key: 't',
    metaKey: true,
    action: () => { window.location.hash = '/timer?start=pomodoro'; },
    description: 'Start Pomodoro',
    global: true,
  },
  {
    id: 'start-break',
    key: 't',
    metaKey: true,
    shiftKey: true,
    action: () => { window.location.hash = '/timer?start=break'; },
    description: 'Start Break',
    global: true,
  },
  {
    id: 'floating-timer',
    key: 'p',
    metaKey: true,
    shiftKey: true,
    action: () => { window.location.hash = '/timer/floating'; },
    description: 'Open Floating Timer',
    global: true,
  },

  // Focus Mode
  {
    id: 'focus-mode',
    key: 'f',
    metaKey: true,
    shiftKey: true,
    action: () => { window.location.hash = '/focus'; },
    description: 'Enter Focus Mode',
    global: true,
  },

  // Settings
  {
    id: 'settings',
    key: ',',
    metaKey: true,
    action: () => { window.location.hash = '/settings'; },
    description: 'Open Settings',
    global: true,
  },
  {
    id: 'shortcuts-help',
    key: '/',
    metaKey: true,
    shiftKey: true,
    action: () => {
      const event = new CustomEvent('openShortcutsHelp');
      window.dispatchEvent(event);
    },
    description: 'Show Keyboard Shortcuts',
    global: true,
  },

  // Quick Actions (within app)
  {
    id: 'duplicate-task',
    key: 'd',
    metaKey: true,
    action: () => {
      const event = new CustomEvent('duplicateCurrentTask');
      window.dispatchEvent(event);
    },
    description: 'Duplicate Current Task',
  },
  {
    id: 'delete-task',
    key: 'backspace',
    metaKey: true,
    action: () => {
      const event = new CustomEvent('deleteCurrentTask');
      window.dispatchEvent(event);
    },
    description: 'Delete Current Task',
  },
  {
    id: 'complete-task',
    key: 'enter',
    metaKey: true,
    action: () => {
      const event = new CustomEvent('completeCurrentTask');
      window.dispatchEvent(event);
    },
    description: 'Complete Current Task',
  },
  {
    id: 'toggle-task-details',
    key: 'i',
    metaKey: true,
    action: () => {
      const event = new CustomEvent('toggleTaskDetails');
      window.dispatchEvent(event);
    },
    description: 'Toggle Task Details',
  },
];

// Hook to provide all shortcuts with keyboard management
export function useGlobalKeyboardShortcuts() {
  return useKeyboardShortcuts({
    shortcuts: defaultShortcuts,
    onShortcutTriggered: (shortcut) => {
      console.log(`Keyboard shortcut triggered: ${shortcut.description}`);
    },
  });
}