import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNotes, useWorkspace } from "@/hooks/api";
import { NoteBoard } from "@/components/notes/NoteBoard";
import { Loader2, StickyNote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@ordo-todo/ui";

export function Notes() {
  const { t } = useTranslation();
  const selectedWorkspaceId = useWorkspaceStore((state) => state.selectedWorkspaceId);

  // Fetch workspace details (optional, for title?)
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(selectedWorkspaceId || "");

  // Fetch notes
  const { data: notes, isLoading: isLoadingNotes } = useNotes(selectedWorkspaceId || "");

  if (!selectedWorkspaceId) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <StickyNote className="h-12 w-12 mb-4 opacity-20" />
            <h2 className="text-xl font-medium mb-2">{t('Notes.noWorkspace', 'Selecciona un espacio de trabajo')}</h2>
            <p className="text-sm max-w-md">{t('Notes.noWorkspaceDesc', 'Las notas pertenecen a un espacio de trabajo. Por favor selecciona uno en el menú lateral para ver tus notas.')}</p>
        </div>
    );
  }

  if (isLoadingWorkspace || isLoadingNotes) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
        {/* Header - Optional if we want a title bar */}
        <div className="border-b p-4 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-between">
             <h1 className="text-xl font-semibold flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-yellow-500" />
                {t('Notes.title', 'Notas')}
                <span className="text-muted-foreground text-sm font-normal">
                    — {workspace?.name}
                </span>
             </h1>
        </div>

        {/* Board */}
        <div className="flex-1 relative overflow-hidden bg-dot-pattern">
            <NoteBoard workspaceId={selectedWorkspaceId} notes={notes || []} />
        </div>
    </div>
  );
}
