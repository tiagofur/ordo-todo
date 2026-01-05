import { Note } from "../model/note.entity";

export interface NoteRepository {
  save(note: Note): Promise<Note>;
  findById(id: string): Promise<Note | null>;
  findByWorkspaceId(workspaceId: string, options?: {
    limit?: number;
    page?: number;
    search?: string;
    authorId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ data: Note[]; total: number; page: number; limit: number; totalPages: number }>;
  update(note: Note): Promise<Note>;
  delete(id: string): Promise<Note>;
  findWorkspaceMember(workspaceId: string, userId: string): Promise<{ userId: string; workspaceId: string; role: string } | null>;
}
