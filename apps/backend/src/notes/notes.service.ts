import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import type { NoteRepository } from '@ordo-todo/core';
import {
  CreateNoteUseCase,
  FindNoteUseCase,
  FindAllNotesUseCase,
  UpdateNoteUseCase,
  DeleteNoteUseCase,
} from '@ordo-todo/core';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';
import { EmbeddingIndexerService } from '../ai/retrieval/embedding-indexer.service';

@Injectable()
export class NotesService {
  constructor(
    @Inject('NoteRepository')
    private readonly noteRepository: NoteRepository,
    @Optional() private readonly indexer?: EmbeddingIndexerService,
  ) {}

  async create(createNoteDto: CreateNoteDto, authorId: string) {
    const createNoteUseCase = new CreateNoteUseCase(this.noteRepository);
    const note = await createNoteUseCase.execute({
      ...createNoteDto,
      content: createNoteDto.content || '',
      authorId,
    });
    await this.indexer?.indexContent(
      'NOTE',
      String(note.id),
      note.props.content,
    );
    return note.props;
  }

  async findAll(workspaceId: string, userId: string, query: QueryNoteDto) {
    const findAllNotesUseCase = new FindAllNotesUseCase(this.noteRepository);
    const result = await findAllNotesUseCase.execute({
      workspaceId,
      userId,
      limit: query.limit,
      page: query.page,
      search: query.search,
      authorId: query.authorId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      data: result.data.map((note) => note.props),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const findNoteUseCase = new FindNoteUseCase(this.noteRepository);
    try {
      const note = await findNoteUseCase.execute({
        id,
        userId,
      });
      return note.props;
    } catch (error) {
      if (error.message === 'Note not found') {
        throw new NotFoundException('Note not found');
      }
      if (error.message === 'You do not have permission to access this note') {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string) {
    const updateNoteUseCase = new UpdateNoteUseCase(this.noteRepository);

    try {
      const note = await updateNoteUseCase.execute({
        id,
        userId,
        ...updateNoteDto,
      });
      await this.indexer?.indexContent(
        'NOTE',
        String(note.id),
        note.props.content,
      );
      return note.props;
    } catch (error) {
      if (error.message === 'Note not found') {
        throw new NotFoundException(`Note with ID ${id} not found`);
      }
      if (error.message === 'Only the note author can update it') {
        throw new ForbiddenException('Only the note author can update it');
      }
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    const deleteNoteUseCase = new DeleteNoteUseCase(this.noteRepository);

    try {
      const note = await deleteNoteUseCase.execute({
        id,
        userId,
      });
      await this.indexer?.removeContent('NOTE', id);
      return {
        id: note.id,
        content: note.props.content,
        workspaceId: note.props.workspaceId,
        authorId: note.props.authorId,
        deletedAt: new Date(),
      };
    } catch (error) {
      if (error.message === 'Note not found') {
        throw new NotFoundException(`Note with ID ${id} not found`);
      }
      if (error.message === 'Only the note author can delete it') {
        throw new ForbiddenException('Only the note author can delete it');
      }
      throw error;
    }
  }
}
