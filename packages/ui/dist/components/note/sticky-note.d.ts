export interface Note {
    id: string;
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    workspaceId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
}
export interface StickyNoteProps {
    note: Note;
    onUpdate?: (id: string, data: {
        content?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        color?: string;
    }) => void;
    onDelete?: (id: string) => void;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    readOnly?: boolean;
    labels?: {
        delete?: string;
        edit?: string;
    };
    className?: string;
}
export declare function StickyNote({ note, onUpdate, onDelete, isSelected, onSelect, readOnly, labels, className, }: StickyNoteProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=sticky-note.d.ts.map