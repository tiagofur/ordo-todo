import { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { type Note } from "@ordo-todo/api-client";
import { cn, Button } from "@ordo-todo/ui";
import { X, GripVertical } from "lucide-react";
import { useDeleteNote, useUpdateNote } from "@/hooks/api";
import { NOTE_PASTELS } from "./NoteBoard";

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
  
  // Update local state when note prop changes
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

        <div className="flex items-center gap-1">
          {/* ODD 025 S6: cambiar color de la nota */}
          <div className="hidden group-hover:flex items-center gap-1 mr-1">
            {NOTE_PASTELS.map((pastel) => (
              <button
                key={pastel}
                type="button"
                aria-label={`Color ${pastel}`}
                onClick={() => updateNote.mutate({ id: note.id, data: { color: pastel } })}
                className={cn(
                  "h-3.5 w-3.5 rounded-full border border-black/20 transition-transform hover:scale-125",
                  note.color?.toLowerCase() === pastel.toLowerCase() &&
                    "ring-1 ring-offset-1 ring-gray-500 scale-110",
                )}
                style={{ backgroundColor: pastel }}
              />
            ))}
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
      </div>
      <textarea
        className="flex-1 w-full bg-transparent resize-none border-none focus:outline-none text-sm text-gray-800 placeholder:text-gray-500"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe algo..."
      />
    </div>
  );
}
