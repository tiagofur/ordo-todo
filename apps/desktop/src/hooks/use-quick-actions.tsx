import { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Search,
  Clock,
  Calendar,
  Tag,
  FileText,
  Zap,
  Command,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
  category: 'task' | 'project' | 'timer' | 'navigation' | 'general';
}

export function useQuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const actions: QuickAction[] = [
    // Task Actions
    {
      id: 'new-task',
      label: 'New Task',
      icon: Plus,
      shortcut: 'Cmd+N',
      category: 'task',
      action: () => {
        // Navigate to new task creation
        window.location.hash = '/tasks?new=true';
        setIsOpen(false);
      },
    },
    {
      id: 'quick-add',
      label: 'Quick Add Task',
      icon: Zap,
      shortcut: 'Cmd+Shift+N',
      category: 'task',
      action: () => {
        // Open quick add dialog
        const event = new CustomEvent('openQuickAdd');
        window.dispatchEvent(event);
        setIsOpen(false);
      },
    },
    {
      id: 'search-tasks',
      label: 'Search Tasks',
      icon: Search,
      shortcut: 'Cmd+K',
      category: 'navigation',
      action: () => {
        // Focus search bar
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
        setIsOpen(false);
      },
    },

    // Timer Actions
    {
      id: 'start-pomodoro',
      label: 'Start Pomodoro',
      icon: Clock,
      shortcut: 'Cmd+T',
      category: 'timer',
      action: () => {
        // Start pomodoro timer
        window.location.hash = '/timer?start=pomodoro';
        setIsOpen(false);
      },
    },
    {
      id: 'start-break',
      label: 'Start Break',
      icon: Coffee,
      shortcut: 'Cmd+Shift+T',
      category: 'timer',
      action: () => {
        // Start break timer
        window.location.hash = '/timer?start=break';
        setIsOpen(false);
      },
    },

    // Navigation Actions
    {
      id: 'today',
      label: "Today's Tasks",
      icon: Calendar,
      shortcut: 'Cmd+1',
      category: 'navigation',
      action: () => {
        window.location.hash = '/dashboard?filter=today';
        setIsOpen(false);
      },
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FileText,
      shortcut: 'Cmd+2',
      category: 'navigation',
      action: () => {
        window.location.hash = '/projects';
        setIsOpen(false);
      },
    },
    {
      id: 'tags',
      label: 'Tags',
      icon: Tag,
      shortcut: 'Cmd+3',
      category: 'navigation',
      action: () => {
        window.location.hash = '/tags';
        setIsOpen(false);
      },
    },

    // System Actions
    {
      id: 'focus-mode',
      label: 'Focus Mode',
      icon: Zap,
      shortcut: 'Cmd+Shift+F',
      category: 'general',
      action: () => {
        window.location.hash = '/focus';
        setIsOpen(false);
      },
    },
    {
      id: 'floating-timer',
      label: 'Floating Timer',
      icon: Clock,
      shortcut: 'Cmd+Shift+P',
      category: 'general',
      action: () => {
        window.location.hash = '/timer/floating';
        setIsOpen(false);
      },
    },
  ];

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.shortcut?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openQuickActions = useCallback((clientX?: number, clientY?: number) => {
    if (clientX && clientY) {
      setPosition({ x: clientX, y: clientY });
    } else {
      // Center on screen
      setPosition({
        x: window.innerWidth / 2 - 200,
        y: window.innerHeight / 2 - 150,
      });
    }
    setSearchTerm('');
    setIsOpen(true);
  }, []);

  const closeQuickActions = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open quick actions
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openQuickActions();
        return;
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        closeQuickActions();
        return;
      }

      // Check for specific shortcuts when menu is open
      if (isOpen) {
        const action = actions.find(
          a => a.shortcut?.replace('Cmd+', e.metaKey ? 'Cmd+' : 'Ctrl+').replace('Shift+', e.shiftKey ? 'Shift+' : '') ===
               `${e.metaKey ? 'Cmd+' : e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key.toUpperCase()}`
        );

        if (action) {
          e.preventDefault();
          action.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openQuickActions, closeQuickActions, actions]);

  // Global mouse event handler
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Only show on right-click with modifier (Cmd/Ctrl)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        openQuickActions(e.clientX, e.clientY);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [openQuickActions]);

  const executeAction = useCallback((actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      action.action();
    }
  }, [actions]);

  return {
    isOpen,
    filteredActions,
    searchTerm,
    setSearchTerm,
    position,
    openQuickActions,
    closeQuickActions,
    executeAction,
  };
}

// Icon component for actions
function Coffee({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}