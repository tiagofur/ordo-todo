/**
 * Note DTOs and Interfaces
 */
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
export interface CreateNoteDto {
    content: string;
    x?: number;
    y?: number;
    color?: string;
    width?: number;
    height?: number;
    workspaceId: string;
}
export interface UpdateNoteDto {
    content?: string;
    x?: number;
    y?: number;
    color?: string;
    width?: number;
    height?: number;
}
//# sourceMappingURL=note.types.d.ts.map