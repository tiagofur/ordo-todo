'use client';

import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.js';

export interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts?: ShortcutItem[];
  labels?: {
    title?: string;
    description?: string;
    footer?: string;
  };
}

const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  // Timer
  { keys: ['Ctrl', 'Space'], description: 'Start/Pause Timer', category: 'Timer' },
  { keys: ['Ctrl', 'Shift', 'S'], description: 'Toggle Timer (Global)', category: 'Timer' },
  { keys: ['Ctrl', 'Shift', 'K'], description: 'Skip to next', category: 'Timer' },

  // Lists
  { keys: ['j'], description: 'Next item', category: 'Lists' },
  { keys: ['k'], description: 'Previous item', category: 'Lists' },
  { keys: ['x'], description: 'Complete selected task', category: 'Lists' },
  { keys: ['Enter'], description: 'Open details', category: 'Lists' },

  // Navigation
  { keys: ['Ctrl', '1'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['Ctrl', '2'], description: 'Go to Tasks', category: 'Navigation' },
  { keys: ['Ctrl', '3'], description: 'Go to Projects', category: 'Navigation' },
  { keys: ['Ctrl', '4'], description: 'Go to Timer', category: 'Navigation' },
  { keys: ['Ctrl', '5'], description: 'Go to Analytics', category: 'Navigation' },

  // Actions
  { keys: ['Ctrl', 'N'], description: 'New Task', category: 'Actions' },
  { keys: ['Ctrl', 'Shift', 'P'], description: 'New Project', category: 'Actions' },
  { keys: ['Ctrl', 'Shift', 'N'], description: 'Quick Task (Global)', category: 'Actions' },

  // Window
  { keys: ['Ctrl', 'Shift', 'O'], description: 'Show/Hide Window (Global)', category: 'Window' },
  { keys: ['Ctrl', 'Shift', 'F'], description: 'Focus Window (Global)', category: 'Window' },
  { keys: ['F11'], description: 'Fullscreen', category: 'Window' },

  // General
  { keys: ['Ctrl', '/'], description: 'Show Shortcuts', category: 'General' },
  { keys: ['Ctrl', ','], description: 'Settings', category: 'General' },
];

const DEFAULT_LABELS = {
  title: 'Keyboard Shortcuts',
  description:
    'Use these shortcuts to navigate and control the app faster. Shortcuts marked as "Global" work even when the window is not focused.',
  footer: 'You can customize global shortcuts in Settings → Shortcuts',
};

export function ShortcutsDialog({
  open,
  onOpenChange,
  shortcuts = DEFAULT_SHORTCUTS,
  labels = {},
}: ShortcutsDialogProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category]!.push(shortcut);
      return acc;
    },
    {} as Record<string, ShortcutItem[]>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
          {t.footer}
        </div>
      </DialogContent>
    </Dialog>
  );
}
