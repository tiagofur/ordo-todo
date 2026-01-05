import { UseCase } from "../../shared/use-case";
import { Note } from "../model/note.entity";
import { NoteRepository } from "../provider/note.repository";

export interface FindNoteInput {
  id: string;
  userId: string;
}

export class FindNoteUseCase implements UseCase<FindNoteInput, Note> {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: FindNoteInput): Promise<Note> {
    const note = await this.repository.findById(input.id);

    if (!note) {
      throw new Error("Note not found");
    }

    // Check if user is the author
    if (note.props.authorId !== input.userId) {
      // If not author, verify user is a workspace member
      const member = await this.repository.findWorkspaceMember(
        note.props.workspaceId,
        input.userId
      );

      if (!member) {
        throw new Error("You do not have permission to access this note");
      }
    }

    return note;
  }
}
