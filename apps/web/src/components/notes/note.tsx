'use client';

import { useDraggable } from '@dnd-kit/core';
import { Note } from '@ordo-todo/api-client';
import { cn } from '@/lib/utils';
import { Button } from '@ordo-todo/ui';
import { X, GripVertical } from 'lucide-react';
import { useDeleteNote, useUpdateNote } from '@/lib/api-hooks';
import { useState, useEffect } from 'react';

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: note.id,
  });
  
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [content, setContent] = useState(note.content);
  
  // Update local state when note prop changes (e.g. from other user or initial load)
  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  // Debounce update to server
  useEffect(() => {
    const timer = setTimeout(() => {
        if (content !== note.content) {
            updateNote.mutate({ id: note.id, data: { content } });
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [content, note.id, note.content, updateNote]);

  // We use transform for the drag preview movement
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
      }}
      className={cn(
        "absolute shadow-md rounded-md flex flex-col p-2 group transition-shadow hover:shadow-lg",
      )}
    >
      <div className="flex justify-between items-center mb-1">
         {/* Grip handle for dragging */}
         <div 
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
            {...listeners} 
            {...attributes}
         >
            <GripVertical className="h-4 w-4" />
         </div>

        <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-black/10 text-gray-700"
            onClick={() => deleteNote.mutate(note.id)}
        >
            <X className="h-3 w-3" />
        </Button>
      </div>
      <textarea
        className="flex-1 w-full bg-transparent resize-none border-none focus:outline-none text-sm text-gray-800 placeholder:text-gray-500"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write something..."
      />
    </div>
  );
}
