import { UseCase } from "../../shared/use-case";
import { Note } from "../model/note.entity";
import { NoteRepository } from "../provider/note.repository";
import { FindNoteUseCase } from "./find-note.usecase";

export interface UpdateNoteInput {
  id: string;
  userId: string;
  content?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
}

export class UpdateNoteUseCase implements UseCase<UpdateNoteInput, Note> {
  constructor(private readonly repository: NoteRepository) { }

  async execute(input: UpdateNoteInput): Promise<Note> {
    // First find the note to verify ownership
    const findNoteUseCase = new FindNoteUseCase(this.repository);
    const note = await findNoteUseCase.execute({
      id: input.id,
      userId: input.userId,
    });

    // Only the author can update
    if (note.props.authorId !== input.userId) {
      throw new Error("Only the note author can update it");
    }

    // Update only provided fields
    const updatedNote = note.update({
      content: input.content,
      x: input.x !== undefined ? Math.round(input.x) : undefined,
      y: input.y !== undefined ? Math.round(input.y) : undefined,
      width: input.width !== undefined ? Math.round(input.width) : undefined,
      height: input.height !== undefined ? Math.round(input.height) : undefined,
      color: input.color,
    });

    await this.repository.update(updatedNote);

    return updatedNote;
  }
}
