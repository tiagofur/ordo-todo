import { Injectable } from '@nestjs/common';
import { Tag as PrismaTag } from '@prisma/client';
import { Tag, TagRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaTagRepository implements TagRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaTag: PrismaTag): Tag {
    return new Tag({
      id: prismaTag.id,
      name: prismaTag.name,
      color: prismaTag.color,
      workspaceId: (prismaTag as any).workspaceId,
      createdAt: prismaTag.createdAt,
    });
  }

  async create(tag: Tag): Promise<Tag> {
    const data = {
      id: tag.id as string,
      name: tag.props.name,
      color: tag.props.color,
      workspaceId: tag.props.workspaceId,
    };

    const created = await this.prisma.tag.create({
      data: data,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) return null;
    return this.toDomain(tag);
  }

  async findByWorkspaceId(workspaceId: string): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      where: { workspaceId } as any,
    });
    return tags.map((t) => this.toDomain(t));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tag.delete({ where: { id } });
  }

  async assignToTask(tagId: string, taskId: string): Promise<void> {
    await this.prisma.taskTag.create({
      data: {
        tagId,
        taskId,
      },
    });
  }

  async removeFromTask(tagId: string, taskId: string): Promise<void> {
    await this.prisma.taskTag.delete({
      where: {
        taskId_tagId: {
          taskId,
          tagId,
        },
      },
    });
  }

  async findByTaskId(taskId: string): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      where: {
        tasks: {
          some: {
            taskId: taskId,
          },
        },
      },
    });
    return tags.map((t) => this.toDomain(t));
  }
}
