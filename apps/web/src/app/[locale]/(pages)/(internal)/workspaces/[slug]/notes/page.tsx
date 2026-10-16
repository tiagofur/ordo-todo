'use client';

import { useWorkspaceBySlug } from '@/lib/api-hooks';
import { useNotes } from '@/lib/api-hooks';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { NoteBoard } from '@/components/notes/board';
import { Loader2, StickyNote, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCreateNote } from '@/lib/api-hooks';
import { Button } from '@ordo-todo/ui';

export default function NotesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations('Notes');

  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspaceBySlug(slug);
  const { data: notes, isLoading: isLoadingNotes } = useNotes(workspace?.id || '');

  if (isLoadingWorkspace) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">Workspace not found</p>
      </div>
    );
  }

  if (isLoadingNotes) {
     return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
  }

  const createNote = useCreateNote();

  const handleAddNote = () => {
    if (!workspace) return;
    createNote.mutate({
      workspaceId: workspace.id,
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
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Standard Iconic Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-background/50 backdrop-blur-sm z-20 border-b"
      >
        <motion.div variants={itemVariants} className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-notes text-white shadow-lg shadow-notes/25 shrink-0">
            <StickyNote className="h-7 w-7" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight truncate flex items-center gap-2">
              {t('title')}
              <span className="text-muted-foreground text-sm font-normal hidden sm:inline">
                — {workspace.name}
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 line-clamp-1">
              {t('subtitle')}
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
            {t('add')}
          </Button>
        </motion.div>
      </motion.div>

      {/* Board */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex-1 relative overflow-hidden bg-dot-pattern"
      >
         <NoteBoard workspaceId={workspace.id} notes={notes || []} hideAddButton />
      </motion.div>
    </div>
  );
}
