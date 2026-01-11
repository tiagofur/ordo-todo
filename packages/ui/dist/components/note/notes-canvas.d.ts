import type { Note } from './sticky-note';
export interface NotesCanvasProps {
    notes: Note[];
    onCreateNote?: (data: {
        content: string;
        x: number;
        y: number;
        workspaceId: string;
    }) => void;
    onUpdateNote?: (id: string, data: {
        content?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
    }) => void;
    onDeleteNote?: (id: string) => void;
    workspaceId: string;
    selectedNoteId?: string;
    onSelectNote?: (id: string) => void;
    readOnly?: boolean;
    labels?: {
        create?: string;
        delete?: string;
        edit?: string;
        newNote?: string;
    };
    className?: string;
}
export declare function NotesCanvas({ notes, onCreateNote, onUpdateNote, onDeleteNote, workspaceId, selectedNoteId, onSelectNote, readOnly, labels, className, }: NotesCanvasProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=notes-canvas.d.ts.map