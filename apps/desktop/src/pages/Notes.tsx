import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNotes, useWorkspace } from "@/hooks/api";
import { NoteBoard } from "@/components/notes/NoteBoard";
import { Button } from "@ordo-todo/ui";
import { Loader2, StickyNote, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useCreateNote } from "@/hooks/api";
import { PageTransition, SlideIn, FadeIn } from "@/components/motion";

export function Notes() {
  const { t } = useTranslation();
  const selectedWorkspaceId = useWorkspaceStore((state) => state.selectedWorkspaceId);

  // Fetch workspace details (optional, for title?)
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(selectedWorkspaceId || "");

  // Fetch notes
  const { data: notes, isLoading: isLoadingNotes } = useNotes(selectedWorkspaceId || "");
  const createNote = useCreateNote();

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

  const handleAddNote = () => {
    if (!selectedWorkspaceId) return;
    createNote.mutate({
      workspaceId: selectedWorkspaceId,
      content: '',
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      color: '#feff9c',
      width: 300,
      height: 300,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-full w-full overflow-hidden">
        {/* Header - Standard Iconic Design */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-background/50 backdrop-blur-sm z-10 border-b"
        >
          <motion.div variants={itemVariants} className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-notes text-white shadow-lg shadow-notes/25 shrink-0">
              <StickyNote className="h-7 w-7" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold tracking-tight truncate flex items-center gap-2">
                {t('Notes.title', 'Notas')}
                <span className="text-muted-foreground text-sm font-normal">
                  — {workspace?.name}
                </span>
              </h1>
              <p className="text-muted-foreground mt-1 line-clamp-1">
                {t('Notes.subtitle', 'Captura tus ideas y mantenlas organizadas en el tablero')}
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              onClick={handleAddNote}
              disabled={createNote.isPending}
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-notes px-6 py-6 text-base font-bold text-white shadow-lg shadow-notes/25 transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              {t('Notes.add', 'Agregar Nota')}
            </Button>
          </motion.div>
        </motion.div>

        {/* Board */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex-1 relative overflow-hidden bg-dot-pattern"
        >
          <NoteBoard workspaceId={selectedWorkspaceId} notes={notes || []} hideAddButton />
        </motion.div>
      </div>
    </PageTransition>
  );
}
