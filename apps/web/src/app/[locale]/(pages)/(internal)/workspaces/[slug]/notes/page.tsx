'use client';

import { useWorkspaceBySlug } from '@/lib/api-hooks';
import { useNotes } from '@/lib/api-hooks';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { NoteBoard } from '@/components/notes/board';
import { Loader2 } from 'lucide-react';

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

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative overflow-hidden bg-dot-pattern">
       <NoteBoard workspaceId={workspace.id} notes={notes || []} />
    </div>
  );
}
