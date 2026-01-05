import { UseCase } from "../../shared/use-case";
import { Note } from "../model/note.entity";
import { NoteRepository } from "../provider/note.repository";

export interface CreateNoteInput {
  content: string;
  workspaceId: string;
  authorId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
}

export class CreateNoteUseCase implements UseCase<CreateNoteInput, Note> {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: CreateNoteInput): Promise<Note> {
    if (!input.content || input.content.trim().length === 0) {
      throw new Error("Note content is required");
    }

    if (!input.workspaceId) {
      throw new Error("Workspace ID is required");
    }

    const note = Note.create({
      content: input.content,
      workspaceId: input.workspaceId,
      authorId: input.authorId,
      x: input.x ?? 100,
      y: input.y ?? 100,
      width: input.width ?? 300,
      height: input.height ?? 300,
      color: input.color ?? "#feff9c",
    });

    await this.repository.save(note);

    return note;
  }
}
