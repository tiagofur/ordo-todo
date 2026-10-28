"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { QuickAdd as QuickAddView } from "@ordo-todo/ui";
import { useParseTask } from "@/hooks/use-parse-task";
import { useCreateTask, useAllProjects } from "@/lib/api-hooks";

interface QuickAddDialogProps {
  open: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

/**
 * Global quick-add container (S2): NL input → live parse preview →
 * Enter creates the task. Opens from anywhere via Cmd/Ctrl+N.
 */
export function QuickAddDialog({ open, onClose, defaultProjectId }: QuickAddDialogProps) {
  const t = useTranslations("QuickAdd");
  const [input, setInput] = useState("");
  const { parsed, isParsing } = useParseTask(input);
  const createTask = useCreateTask();
  const { data: projects } = useAllProjects();

  const resolveProjectId = useCallback((): string | undefined => {
    if (defaultProjectId) return defaultProjectId;
    const hint = parsed?.projectHint?.toLowerCase();
    if (hint && projects) {
      const match = projects.find(
        (project) =>
          project.name.toLowerCase().includes(hint) ||
          project.slug.toLowerCase() === hint,
      );
      if (match) return match.id;
    }
    // ODD 021: sin proyecto resuelto → tarea express (sin projectId);
    // ya no se cae al primer proyecto ni se bloquea la creación.
    return undefined;
  }, [defaultProjectId, parsed?.projectHint, projects]);

  const handleSubmit = useCallback(
    (value: string) => {
      const projectId = resolveProjectId();
      const title = parsed?.title || value;
      // Optimistic: dismiss immediately, confirm via toast.
      setInput("");
      onClose();
      createTask.mutate(
        {
          title,
          projectId,
          description: undefined,
          dueDate: parsed?.dueAt,
          priority: parsed?.priority ?? "MEDIUM",
          recurrence: parsed?.recurrence
            ? { pattern: parsed.recurrence }
            : undefined,
        },
        {
          onSuccess: () => toast.success(t("created", { title })),
          onError: () => toast.error(t("error")),
        },
      );
    },
    [parsed, resolveProjectId, createTask, onClose, t],
  );

  return (
    <QuickAddView
      open={open}
      value={input}
      parsed={
        parsed
          ? {
              title: parsed.title,
              dueAt: parsed.dueAt,
              priority: parsed.priority,
              projectHint: parsed.projectHint,
              recurrence: parsed.recurrence,
              needsConfirmation: parsed.needsConfirmation,
            }
          : null
      }
      isParsing={isParsing}
      onSubmit={handleSubmit}
      onInputChange={setInput}
      onClose={() => {
        setInput("");
        onClose();
      }}
      labels={{
        placeholder: t("placeholder"),
        hint: t("hint"),
        confirmHint: t("confirmHint"),
      }}
    />
  );
}
