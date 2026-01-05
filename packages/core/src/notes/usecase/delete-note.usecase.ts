import { UseCase } from "../../shared/use-case";
import { Note } from "../model/note.entity";
import { NoteRepository } from "../provider/note.repository";
import { FindNoteUseCase } from "./find-note.usecase";

export interface DeleteNoteInput {
  id: string;
  userId: string;
}

export class DeleteNoteUseCase implements UseCase<DeleteNoteInput, Note> {
  constructor(private readonly repository: NoteRepository) {}

  async execute(input: DeleteNoteInput): Promise<Note> {
    // First find the note to verify ownership
    const findNoteUseCase = new FindNoteUseCase(this.repository);
    const note = await findNoteUseCase.execute({
      id: input.id,
      userId: input.userId,
    });

    // Only the author can delete
    if (note.props.authorId !== input.userId) {
      throw new Error("Only the note author can delete it");
    }

    await this.repository.delete(note.id as string);

    return note;
  }
}
