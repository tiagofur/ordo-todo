import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { NoteItem } from './NoteItem';
import { useCreateNote, useUpdateNote } from '@/hooks/api';
import { Button } from '@ordo-todo/ui';
import { Plus, Loader2 } from 'lucide-react';
import type { Note } from '@ordo-todo/api-client';
import { useTranslation } from 'react-i18next';

interface NoteBoardProps {
  workspaceId: string;
  notes: Note[] | null | undefined;
}

export function NoteBoard({ workspaceId, notes }: NoteBoardProps) {
  // Ensure notes is always an array
  const safeNotes = Array.isArray(notes) ? notes : [];
  const { t } = useTranslation();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const noteId = active.id as string;
    const note = safeNotes.find((n) => n.id === noteId);

    if (note) {
      updateNote.mutate({
        id: noteId,
        data: {
          x: note.x + delta.x,
          y: note.y + delta.y,
        },
      });
    }
  };

  const handleAddNote = () => {
    createNote.mutate({
      workspaceId,
      content: '',
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      color: '#feff9c',
      width: 300,
      height: 300,
    });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative w-full h-full p-4 overflow-auto bg-dot-pattern">
        <div className="absolute top-8 right-8 z-50">
           <Button 
             onClick={handleAddNote} 
             disabled={createNote.isPending}
             className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-xl shadow-yellow-500/20 border-none px-6 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95"
           >
             {createNote.isPending ? (
               <Loader2 className="mr-2 h-5 w-5 animate-spin" />
             ) : (
               <Plus className="mr-2 h-5 w-5" />
             )}
             <span className="text-base font-semibold">
               {t('Notes.add', 'Agregar Nota')}
             </span>
           </Button>
        </div>
        
        <div className="relative min-w-full min-h-full w-[2000px] h-[2000px]">
            {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
            ))}
        </div>
      </div>
    </DndContext>
  );
}
