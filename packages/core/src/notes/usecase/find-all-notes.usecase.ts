import { UseCase } from "../../shared/use-case";
import { Note } from "../model/note.entity";
import { NoteRepository } from "../provider/note.repository";

export interface FindAllNotesInput {
  workspaceId: string;
  userId: string;
  limit?: number;
  page?: number;
  search?: string;
  authorId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class FindAllNotesUseCase implements UseCase<FindAllNotesInput, { data: Note[]; total: number; page: number; limit: number; totalPages: number }> {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: FindAllNotesInput): Promise<{ data: Note[]; total: number; page: number; limit: number; totalPages: number }> {
    // Verify user is a member of the workspace
    const member = await this.repository.findWorkspaceMember(
      input.workspaceId,
      input.userId
    );

    if (!member) {
      throw new Error("You are not a member of this workspace");
    }

    return await this.repository.findByWorkspaceId(input.workspaceId, {
      limit: input.limit,
      page: input.page,
      search: input.search,
      authorId: input.authorId,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    });
  }
}
