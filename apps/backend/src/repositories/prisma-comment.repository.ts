import { Injectable } from '@nestjs/common';
import { Comment, CommentRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { Comment as PrismaComment } from '@prisma/client';

/**
 * Prisma implementation of the CommentRepository interface.
 *
 * This repository bridges the domain layer (Comment entity from @ordo-todo/core)
 * with the data access layer (PrismaComment from Prisma).
 *
 * ## Field Mapping
 *
 * The domain uses `userId` while Prisma uses `authorId`. This repository
 * handles the translation between these two naming conventions.
 *
 * | Domain (Comment) | Prisma (Comment) |
 * |------------------|------------------|
 * | userId           | authorId         |
 * | mentions         | mentions (String[]) |
 * | parentCommentId  | parentCommentId |
 * | isEdited         | isEdited |
 * | editedAt         | editedAt |
 *
 * ## Usage
 *
 * ```typescript
 * // In CommentsService or use cases
 * const comment = await commentRepository.create(commentEntity);
 * const found = await commentRepository.findById(commentId);
 * const taskComments = await commentRepository.findByTaskId(taskId);
 * ```
 */
@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(comment: Comment): Promise<Comment> {
    const prismaComment = await this.prisma.comment.create({
      data: {
        id: comment.id as string,
        taskId: comment.taskId,
        authorId: comment.userId,
        content: comment.content,
        parentCommentId: comment.parentCommentId ?? null,
        mentions: comment.mentions,
        isEdited: comment.isEdited,
        editedAt: comment.editedAt ?? null,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });

    return this.toDomain(prismaComment);
  }

  async update(comment: Comment): Promise<Comment> {
    const prismaComment = await this.prisma.comment.update({
      where: { id: comment.id as string },
      data: {
        taskId: comment.taskId,
        authorId: comment.userId,
        content: comment.content,
        parentCommentId: comment.parentCommentId ?? null,
        mentions: comment.mentions,
        isEdited: comment.isEdited,
        editedAt: comment.editedAt ?? null,
        updatedAt: comment.updatedAt,
      },
    });

    return this.toDomain(prismaComment);
  }

  async findById(id: string): Promise<Comment | null> {
    const prismaComment = await this.prisma.comment.findUnique({
      where: { id },
    });

    return prismaComment ? this.toDomain(prismaComment) : null;
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    const prismaComments = await this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });

    return prismaComments.map((c) => this.toDomain(c));
  }

  async findByUserId(userId: string): Promise<Comment[]> {
    const prismaComments = await this.prisma.comment.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaComments.map((c) => this.toDomain(c));
  }

  async findByParentCommentId(parentCommentId: string): Promise<Comment[]> {
    const prismaComments = await this.prisma.comment.findMany({
      where: { parentCommentId },
      orderBy: { createdAt: 'asc' },
    });

    return prismaComments.map((c) => this.toDomain(c));
  }

  async findMentionsForUser(userId: string): Promise<Comment[]> {
    const prismaComments = await this.prisma.comment.findMany({
      where: {
        mentions: {
          has: userId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaComments.map((c) => this.toDomain(c));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id },
    });
  }

  async countByTaskId(taskId: string): Promise<number> {
    return this.prisma.comment.count({
      where: { taskId },
    });
  }

  async findMentionsForUserInTask(
    taskId: string,
    userId: string,
  ): Promise<Comment[]> {
    const prismaComments = await this.prisma.comment.findMany({
      where: {
        taskId,
        mentions: {
          has: userId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaComments.map((c) => this.toDomain(c));
  }

  private toDomain(prismaComment: PrismaComment): Comment {
    return new Comment({
      id: prismaComment.id,
      taskId: prismaComment.taskId,
      userId: prismaComment.authorId,
      content: prismaComment.content,
      parentCommentId: prismaComment.parentCommentId,
      mentions: prismaComment.mentions,
      isEdited: prismaComment.isEdited,
      editedAt: prismaComment.editedAt ?? undefined,
      createdAt: prismaComment.createdAt,
      updatedAt: prismaComment.updatedAt,
    });
  }
}
