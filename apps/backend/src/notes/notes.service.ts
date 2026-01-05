import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNoteDto: CreateNoteDto, authorId: string) {
    return this.prisma.note.create({
      data: {
        ...createNoteDto,
        authorId,
      },
    });
  }

  async findAll(workspaceId: string, userId: string, query: QueryNoteDto) {
    // Verify user is a member of the workspace
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    const { limit = 20, page = 0, search, authorId, sortBy, sortOrder } = query;

    const where: any = { workspaceId };

    // Search filter
    if (search) {
      where.content = {
        contains: search,
        mode: 'insensitive', // Case-insensitive search
      };
    }

    // Author filter
    if (authorId) {
      where.authorId = authorId;
    }

    const [data, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        orderBy: { [sortBy as string]: sortOrder },
        take: limit,
        skip: page * limit,
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    // Check if user is the author
    if (note.authorId !== userId) {
      // If not author, verify user is a workspace member
      const member = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: note.workspaceId,
            userId: userId,
          },
        },
      });

      if (!member) {
        throw new ForbiddenException(
          'You do not have permission to access this note',
        );
      }
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string) {
    // First verify ownership using findOne
    const note = await this.findOne(id, userId);

    // Only the author can update
    if (note.authorId !== userId) {
      throw new ForbiddenException(
        'Only the note author can update it',
      );
    }

    return await this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });
  }

  async remove(id: string, userId: string) {
    // First verify ownership using findOne
    const note = await this.findOne(id, userId);

    // Only the author can delete
    if (note.authorId !== userId) {
      throw new ForbiddenException(
        'Only the note author can delete it',
      );
    }

    return await this.prisma.note.delete({
      where: { id },
    });
  }
}
