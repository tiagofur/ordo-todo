import { useEffect, useRef, useState } from 'react';
import { useQuickActions } from '@/hooks/use-quick-actions';
import { Command, Search, Clock, FileText, Tag, Zap, Plus, Circle } from 'lucide-react';
import { cn, Input, Command as CommandRoot, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@ordo-todo/ui';

const CATEGORY_ICONS = {
  task: Plus,
  timer: Clock,
  navigation: Search,
  general: Zap,
};

const CATEGORY_COLORS = {
  task: 'text-blue-500',
  timer: 'text-green-500',
  navigation: 'text-purple-500',
  general: 'text-orange-500',
};

export function QuickActionsOverlay() {
  const {
    isOpen,
    filteredActions,
    searchTerm,
    setSearchTerm,
    position,
    closeQuickActions,
    executeAction,
  } = useQuickActions();

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const action = filteredActions[selectedIndex];
        if (action) {
          executeAction(action.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, executeAction]);

  if (!isOpen) return null;

  // Group actions by category
  const groupedActions = filteredActions.reduce((groups, action) => {
    if (!groups[action.category]) {
      groups[action.category] = [];
    }
    groups[action.category].push(action);
    return groups;
  }, {} as Record<string, typeof filteredActions>);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={closeQuickActions}
      />

      {/* Quick Actions Dialog */}
      <div
        className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-[400px] max-h-[500px] overflow-hidden z-50"
        style={{
          left: Math.min(position.x, window.innerWidth - 440),
          top: Math.min(position.y, window.innerHeight - 540),
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Command className="h-5 w-5 text-gray-500" />
          <Input
            ref={inputRef}
            placeholder="Type a command or search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            className="border-0 shadow-none focus-visible:ring-0 text-base"
            autoFocus
          />
        </div>

        {/* Actions List */}
        <div className="overflow-y-auto max-h-[400px] p-2">
          {filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Search className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No actions found</p>
            </div>
          ) : (
            Object.entries(groupedActions).map(([category, actions]) => (
              <div key={category} className="mb-4">
                <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {(() => {
                    const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
                    return <Icon className={cn('h-3 w-3', CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS])} />;
                  })()}
                  {category}
                </div>
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  const globalIndex = filteredActions.indexOf(action);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={action.id}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        isSelected && 'bg-gray-100 dark:bg-gray-700'
                      )}
                      onClick={() => executeAction(action.id)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {action.label}
                        </p>
                      </div>
                      {action.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
                          {action.shortcut.replace('Cmd', '⌘')}
                        </kbd>
                      )}
                      {isSelected && (
                        <Circle className="h-1.5 w-1.5 text-blue-500 fill-current shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">ESC</kbd>
              Close
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>Ctrl/Cmd+K to open</span>
          </div>
        </div>
      </div>
    </>
  );
}