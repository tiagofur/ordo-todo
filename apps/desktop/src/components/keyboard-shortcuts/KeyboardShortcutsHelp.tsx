import { useState, useEffect } from 'react';
import { X, Keyboard, Navigation, Timer, Plus, Settings, HelpCircle, Search, Zap, Copy, Calendar, Tag } from 'lucide-react';
import { cn, Button } from '@ordo-todo/ui';

interface ShortcutGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcuts: Array<{
    keys: string[];
    description: string;
    global?: boolean;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    icon: Navigation,
    shortcuts: [
      {
        keys: ['⌘', '1'],
        description: 'Go to Dashboard',
        global: true,
      },
      {
        keys: ['⌘', '2'],
        description: 'Go to Tasks',
        global: true,
      },
      {
        keys: ['⌘', '3'],
        description: 'Go to Projects',
        global: true,
      },
      {
        keys: ['⌘', '4'],
        description: 'Go to Timer',
        global: true,
      },
      {
        keys: ['⌘', '5'],
        description: 'Go to Analytics',
        global: true,
      },
    ],
  },
  {
    title: 'Task Management',
    icon: Plus,
    shortcuts: [
      {
        keys: ['⌘', 'N'],
        description: 'New Task',
        global: true,
      },
      {
        keys: ['⇧', '⌘', 'N'],
        description: 'Quick Add Task',
        global: true,
      },
      {
        keys: ['⌘', 'D'],
        description: 'Duplicate Current Task',
      },
      {
        keys: ['⌘', 'Enter'],
        description: 'Complete Current Task',
      },
      {
        keys: ['⌘', 'Backspace'],
        description: 'Delete Current Task',
      },
      {
        keys: ['⌘', 'I'],
        description: 'Toggle Task Details',
      },
    ],
  },
  {
    title: 'Timer & Focus',
    icon: Timer,
    shortcuts: [
      {
        keys: ['⌘', 'T'],
        description: 'Start Pomodoro',
        global: true,
      },
      {
        keys: ['⇧', '⌘', 'T'],
        description: 'Start Break',
        global: true,
      },
      {
        keys: ['⇧', '⌘', 'P'],
        description: 'Open Floating Timer',
        global: true,
      },
      {
        keys: ['⇧', '⌘', 'F'],
        description: 'Enter Focus Mode',
        global: true,
      },
    ],
  },
  {
    title: 'Search & Actions',
    icon: Search,
    shortcuts: [
      {
        keys: ['⌘', 'K'],
        description: 'Quick Actions / Search',
        global: true,
      },
      {
        keys: ['⌘', '/'],
        description: 'Show Keyboard Shortcuts',
        global: true,
      },
      {
        keys: ['⇧', '⌘', 'C'],
        description: 'Copy Current Task URL',
      },
    ],
  },
  {
    title: 'System',
    icon: Settings,
    shortcuts: [
      {
        keys: ['⌘', ','],
        description: 'Open Settings',
        global: true,
      },
      {
        keys: ['Esc'],
        description: 'Close Dialog / Cancel',
        global: true,
      },
      {
        keys: ['⌘', 'Ctrl', 'Q'],
        description: 'Quit Application',
        global: true,
      },
      {
        keys: ['⌘', 'M'],
        description: 'Minimize Window',
        global: true,
      },
    ],
  },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleOpenShortcutsHelp = () => setIsOpen(true);
    window.addEventListener('openShortcutsHelp', handleOpenShortcutsHelp);
    return () => window.removeEventListener('openShortcutsHelp', handleOpenShortcutsHelp);
  }, []);

  const filteredGroups = shortcutGroups.map(group => ({
    ...group,
    shortcuts: group.shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
  })).filter(group => group.shortcuts.length > 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-[600px] max-h-[80vh] overflow-hidden z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Keyboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Navigate and control the app with speed
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="overflow-y-auto max-h-[400px] px-6 pb-6">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No shortcuts found matching your search</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <div key={group.title}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {group.title}
                      </h3>
                    </div>
                    <div className="space-y-2 ml-6">
                      {group.shortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {shortcut.description}
                            </p>
                            {shortcut.global && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                                Global
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <div key={keyIndex} className="flex items-center gap-1">
                                <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 min-w-[20px] text-center">
                                  {key}
                                </kbd>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span className="text-gray-400 text-xs">+</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Pro tip:</span> Right-click with Ctrl/Cmd for quick actions menu
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // Show toast notification would go here
              }}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy URL
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}