import { ShortcutsDialog as ShortcutsDialogUI, type ShortcutItem } from "@ordo-todo/ui";
import { useUIStore } from "@/stores/ui-store";
import { useTranslation } from "react-i18next";

const shortcuts: ShortcutItem[] = [
  // Timer
  { keys: ["Ctrl", "Space"], description: "Start/Pause Timer", category: "Timer" },
  { keys: ["Ctrl", "Shift", "S"], description: "Toggle Timer (Global)", category: "Timer" },
  { keys: ["Ctrl", "Shift", "K"], description: "Skip to Next", category: "Timer" },

  // Lists
  { keys: ["j"], description: "Next Element", category: "Lists" },
  { keys: ["k"], description: "Previous Element", category: "Lists" },
  { keys: ["x"], description: "Complete Selected Task", category: "Lists" },
  { keys: ["Enter"], description: "Open Details", category: "Lists" },

  // Navigation
  { keys: ["Ctrl", "1"], description: "Go to Dashboard", category: "Navigation" },
  { keys: ["Ctrl", "2"], description: "Go to Tasks", category: "Navigation" },
  { keys: ["Ctrl", "3"], description: "Go to Projects", category: "Navigation" },
  { keys: ["Ctrl", "4"], description: "Go to Timer", category: "Navigation" },
  { keys: ["Ctrl", "5"], description: "Go to Analytics", category: "Navigation" },

  // Actions
  { keys: ["Ctrl", "N"], description: "New Task", category: "Actions" },
  { keys: ["Ctrl", "Shift", "P"], description: "New Project", category: "Actions" },
  { keys: ["Ctrl", "Shift", "N"], description: "Quick Task (Global)", category: "Actions" },

  // Window
  { keys: ["Ctrl", "Shift", "O"], description: "Show/Hide Window (Global)", category: "Window" },
  { keys: ["Ctrl", "Shift", "F"], description: "Focus Window (Global)", category: "Window" },
  { keys: ["F11"], description: "Fullscreen", category: "Window" },

  // General
  { keys: ["Ctrl", "/"], description: "Show Shortcuts", category: "General" },
  { keys: ["Ctrl", ","], description: "Settings", category: "General" },
];

export function ShortcutsDialog() {
  const { t } = useTranslation();
  const { shortcutsDialogOpen, closeShortcutsDialog } = useUIStore();

  return (
    <ShortcutsDialogUI
      open={shortcutsDialogOpen}
      onOpenChange={(val) => !val && closeShortcutsDialog()}
      shortcuts={shortcuts}
      labels={{
        title: t("shortcuts.title", "Keyboard Shortcuts"),
        description: t(
          "shortcuts.description",
          "Use these shortcuts to navigate and control the app faster. Shortcuts marked as 'Global' work even when the window is not focused."
        ),
        footer: t(
          "shortcuts.footerNote",
          "You can customize global shortcuts in Settings → Shortcuts"
        ),
      }}
    />
  );
}
