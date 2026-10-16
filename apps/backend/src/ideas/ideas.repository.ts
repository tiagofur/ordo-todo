import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, Idea, IdeaStatus } from '@prisma/client';

export interface FindIdeasParams {
  userId: string;
  workspaceId: string;
  status?: IdeaStatus;
  search?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class IdeasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.IdeaCreateInput): Promise<Idea> {
    return this.prisma.idea.create({
      data,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async findById(id: string, workspaceId: string): Promise<Idea | null> {
    return this.prisma.idea.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        contentPiece: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async findMany(
    params: FindIdeasParams,
  ): Promise<{ ideas: Idea[]; total: number }> {
    const { userId, workspaceId, status, search, skip = 0, take = 50 } = params;

    const where: Prisma.IdeaWhereInput = {
      userId,
      workspaceId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [ideas, total] = await Promise.all([
      this.prisma.idea.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.idea.count({ where }),
    ]);

    return { ideas, total };
  }

  async update(id: string, data: Prisma.IdeaUpdateInput): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.idea.delete({
      where: { id },
    });
  }

  async archive(id: string): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
    });
  }

  async promote(id: string, contentPieceId: string): Promise<Idea> {
    return this.prisma.idea.update({
      where: { id },
      data: {
        status: 'PROMOTED',
        promotedAt: new Date(),
        contentPieceId,
      },
    });
  }

  async addTags(ideaId: string, tagIds: string[]): Promise<void> {
    await this.prisma.ideaTag.createMany({
      data: tagIds.map((tagId) => ({
        ideaId,
        tagId,
      })),
      skipDuplicates: true,
    });
  }

  async removeTags(ideaId: string, tagIds: string[]): Promise<void> {
    await this.prisma.ideaTag.deleteMany({
      where: {
        ideaId,
        tagId: { in: tagIds },
      },
    });
  }

  async setTags(ideaId: string, tagIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.ideaTag.deleteMany({
        where: { ideaId },
      }),
      this.prisma.ideaTag.createMany({
        data: tagIds.map((tagId) => ({
          ideaId,
          tagId,
        })),
      }),
    ]);
  }
}
