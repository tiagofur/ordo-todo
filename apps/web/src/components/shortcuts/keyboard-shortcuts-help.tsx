"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@ordo-todo/ui";

interface ShortcutItem {
  key: string;
  description: string;
}

interface ShortcutCategory {
  name: string;
  shortcuts: ShortcutItem[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: "Navegación",
    shortcuts: [
      { key: "Ctrl+G", description: "Ir a Dashboard" },
      { key: "Ctrl+Shift+T", description: "Ir a Tareas" },
      { key: "Ctrl+Shift+P", description: "Ir a Proyectos" },
      { key: "Ctrl+,", description: "Ir a Settings" },
    ],
  },
  {
    name: "Búsqueda",
    shortcuts: [
      { key: "Ctrl+K / ⌘K", description: "Abrir búsqueda inteligente" },
    ],
  },
  {
    name: "Creación",
    shortcuts: [
      { key: "Ctrl+N", description: "Nueva tarea" },
      { key: "Ctrl+Shift+N", description: "Nuevo proyecto" },
    ],
  },
  {
    name: "AI Features",
    shortcuts: [
      { key: "Ctrl+Shift+M", description: "Ir a Meetings" },
      { key: "Ctrl+Shift+W", description: "Ir a Bienestar" },
    ],
  },
  {
    name: "UI",
    shortcuts: [
      { key: "Ctrl+B", description: "Toggle sidebar" },
      { key: "Shift+?", description: "Mostrar esta ayuda" },
      { key: "Escape", description: "Cerrar modal/panel" },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atajos de Teclado
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {shortcutCategories.map((category) => (
            <div key={category.name}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Presiona <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Shift+?</kbd> en cualquier momento para ver esta ayuda
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
