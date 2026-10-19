"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  CalendarDays,
  Timer,
  Search,
  Plus,
  Command as CommandIcon,
} from "lucide-react";
import { useStartTimer } from "@/lib/api-hooks";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNewTask?: () => void;
}

interface PaletteAction {
  id: string;
  icon: typeof Search;
  run: () => void;
}

/**
 * Command palette (S3): Cmd/Ctrl+K everywhere.
 * Same action list as desktop (see docs/guides/shortcuts.md):
 * go to, new task/project, start timer, search.
 */
export function CommandPalette({ open, onClose, onNewTask }: CommandPaletteProps) {
  const t = useTranslations("CommandPalette");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const startTimer = useStartTimer();

  const actions: PaletteAction[] = useMemo(
    () => [
      { id: "go-dashboard", icon: LayoutDashboard, run: () => router.push("/dashboard") },
      { id: "go-tasks", icon: CheckSquare, run: () => router.push("/tasks") },
      { id: "go-projects", icon: FolderKanban, run: () => router.push("/projects") },
      { id: "go-calendar", icon: CalendarDays, run: () => router.push("/calendar") },
      {
        id: "new-task",
        icon: Plus,
        run: () => {
          onClose();
          onNewTask?.();
        },
      },
      {
        id: "new-project",
        icon: FolderKanban,
        run: () => router.push("/projects?action=new"),
      },
      {
        id: "start-timer",
        icon: Timer,
        run: () => startTimer.mutate({ type: "WORK" }),
      },
      {
        id: "search",
        icon: Search,
        run: () => document.dispatchEvent(new Event("ordo:open-search")),
      },
    ],
    [router, onClose, onNewTask, startTimer],
  );

  // Reset the filter each time the palette opens.
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  if (!open) return null;

  const filtered = actions.filter((action) =>
    t(`actions.${action.id}`)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border bg-card shadow-xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 p-4 border-b">
          <CommandIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              if (event.key === "Enter" && filtered[0]) {
                filtered[0].run();
                onClose();
              }
            }}
            placeholder={t("placeholder")}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  action.run();
                  onClose();
                }}
                className="flex items-center gap-3 w-full p-2.5 rounded-lg text-left hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{t(`actions.${action.id}`)}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center">
              {t("noResults")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
