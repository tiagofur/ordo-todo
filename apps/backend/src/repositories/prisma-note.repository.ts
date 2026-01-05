import { Injectable } from '@nestjs/common';
import { Note as NoteEntity, NoteRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaNoteRepository implements NoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(note: NoteEntity): Promise<NoteEntity> {
    const saved = await this.prisma.note.create({
      data: {
        id: note.id as string,
        content: note.props.content,
        workspaceId: note.props.workspaceId,
        authorId: note.props.authorId,
        x: note.props.x,
        y: note.props.y,
        width: note.props.width,
        height: note.props.height,
        color: note.props.color,
        createdAt: note.props.createdAt,
        updatedAt: note.props.updatedAt,
      },
    });

    return this.toEntity(saved);
  }

  async findById(id: string): Promise<NoteEntity | null> {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    return note ? this.toEntity(note) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    options?: {
      limit?: number;
      page?: number;
      search?: string;
      authorId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<{
    data: NoteEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const limit = options?.limit ?? 20;
    const page = options?.page ?? 0;
    const sortBy = options?.sortBy ?? 'createdAt';
    const sortOrder = options?.sortOrder ?? 'desc';

    const where: any = { workspaceId };

    // Search filter
    if (options?.search) {
      where.content = {
        contains: options.search,
        mode: 'insensitive',
      };
    }

    // Author filter
    if (options?.authorId) {
      where.authorId = options.authorId;
    }

    const [data, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: page * limit,
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      data: data.map((note) => this.toEntity(note)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(note: NoteEntity): Promise<NoteEntity> {
    const updated = await this.prisma.note.update({
      where: { id: note.id as string },
      data: {
        content: note.props.content,
        x: note.props.x,
        y: note.props.y,
        width: note.props.width,
        height: note.props.height,
        color: note.props.color,
        updatedAt: note.props.updatedAt,
      },
    });

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<NoteEntity> {
    const deleted = await this.prisma.note.delete({
      where: { id },
    });

    return this.toEntity(deleted);
  }

  async findWorkspaceMember(
    workspaceId: string,
    userId: string,
  ): Promise<{ userId: string; workspaceId: string; role: string } | null> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: userId,
        },
      },
    });

    if (!member) {
      return null;
    }

    return {
      userId: member.userId,
      workspaceId: member.workspaceId,
      role: member.role,
    };
  }

  private toEntity(prismaNote: any): NoteEntity {
    return new NoteEntity({
      id: prismaNote.id,
      content: prismaNote.content,
      workspaceId: prismaNote.workspaceId,
      authorId: prismaNote.authorId,
      x: prismaNote.x,
      y: prismaNote.y,
      width: prismaNote.width,
      height: prismaNote.height,
      color: prismaNote.color,
      createdAt: prismaNote.createdAt,
      updatedAt: prismaNote.updatedAt,
    });
  }
}
