import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Clock,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  FolderKanban,
  Tag,
  FileText,
  Zap,
} from 'lucide-react';
import { useStartTimer } from '@/lib/shared-hooks';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
  category: 'task' | 'project' | 'timer' | 'navigation' | 'general';
}

/**
 * Command palette (S3): Cmd/Ctrl+K everywhere.
 * First 8 actions are the canonical list shared with web
 * (see docs/guides/shortcuts.md); the rest are desktop extras.
 */
export function useQuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const startTimer = useStartTimer();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const closeQuickActions = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
  }, []);

  const openQuickAdd = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openQuickAdd'));
    closeQuickActions();
  }, [closeQuickActions]);

  const openSearch = useCallback(() => {
    document.dispatchEvent(new Event('ordo:open-search'));
    closeQuickActions();
  }, [closeQuickActions]);

  const actions: QuickAction[] = useMemo(
    () => [
      // Canonical 8 (same ids as web, translated labels)
      {
        id: 'go-dashboard',
        label: t('CommandPalette.actions.go-dashboard', 'Go to dashboard'),
        icon: LayoutDashboard,
        category: 'navigation',
        action: () => {
          navigate('/dashboard');
          closeQuickActions();
        },
      },
      {
        id: 'go-tasks',
        label: t('CommandPalette.actions.go-tasks', 'Go to tasks'),
        icon: CheckSquare,
        category: 'navigation',
        action: () => {
          navigate('/tasks');
          closeQuickActions();
        },
      },
      {
        id: 'go-projects',
        label: t('CommandPalette.actions.go-projects', 'Go to projects'),
        icon: FolderKanban,
        category: 'navigation',
        action: () => {
          navigate('/projects');
          closeQuickActions();
        },
      },
      {
        id: 'go-calendar',
        label: t('CommandPalette.actions.go-calendar', 'Go to calendar'),
        icon: CalendarDays,
        category: 'navigation',
        action: () => {
          navigate('/calendar');
          closeQuickActions();
        },
      },
      {
        id: 'new-task',
        label: t('CommandPalette.actions.new-task', 'New task'),
        icon: Plus,
        shortcut: 'Cmd+N',
        category: 'task',
        action: openQuickAdd,
      },
      {
        id: 'new-project',
        label: t('CommandPalette.actions.new-project', 'New project'),
        icon: FolderKanban,
        category: 'task',
        action: () => {
          navigate('/projects?action=new');
          closeQuickActions();
        },
      },
      {
        id: 'start-timer',
        label: t('CommandPalette.actions.start-timer', 'Start timer'),
        icon: Clock,
        shortcut: 'Cmd+T',
        category: 'timer',
        action: () => {
          startTimer.mutate({ type: 'WORK' });
          closeQuickActions();
        },
      },
      {
        id: 'search',
        label: t('CommandPalette.actions.search', 'Search Ordo'),
        icon: Search,
        shortcut: 'Cmd+K',
        category: 'navigation',
        action: openSearch,
      },

      // Desktop extras (kept from the previous palette)
      {
        id: 'quick-add',
        label: t('CommandPalette.actions.new-task', 'New task'),
        icon: Zap,
        shortcut: 'Cmd+Shift+N',
        category: 'task',
        action: openQuickAdd,
      },
      {
        id: 'start-break',
        label: 'Start Break',
        icon: Coffee,
        shortcut: 'Cmd+Shift+T',
        category: 'timer',
        action: () => {
          navigate('/timer');
          closeQuickActions();
        },
      },
      {
        id: 'today',
        label: "Today's Tasks",
        icon: CalendarDays,
        shortcut: 'Cmd+1',
        category: 'navigation',
        action: () => {
          navigate('/dashboard?filter=today');
          closeQuickActions();
        },
      },
      {
        id: 'tags',
        label: 'Tags',
        icon: Tag,
        shortcut: 'Cmd+3',
        category: 'navigation',
        action: () => {
          navigate('/tags');
          closeQuickActions();
        },
      },
      {
        id: 'focus-mode',
        label: 'Focus Mode',
        icon: Zap,
        shortcut: 'Cmd+Shift+F',
        category: 'general',
        action: () => {
          navigate('/focus');
          closeQuickActions();
        },
      },
      {
        id: 'floating-timer',
        label: 'Floating Timer',
        icon: Clock,
        shortcut: 'Cmd+Shift+P',
        category: 'general',
        action: () => {
          navigate('/timer/floating');
          closeQuickActions();
        },
      },
      {
        id: 'projects',
        label: 'Projects',
        icon: FileText,
        shortcut: 'Cmd+2',
        category: 'navigation',
        action: () => {
          navigate('/projects');
          closeQuickActions();
        },
      },
    ],
    [t, navigate, closeQuickActions, openQuickAdd, openSearch, startTimer],
  );

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