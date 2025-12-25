import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, ResourceType } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        taskId: createCommentDto.taskId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Fetch task to get assignee and creator
    const task = await this.prisma.task.findUnique({
      where: { id: createCommentDto.taskId },
      select: { title: true, ownerId: true, assigneeId: true },
    });

    if (task) {
      // Notify Assignee
      if (task.assigneeId && task.assigneeId !== userId) {
        await this.notificationsService.create({
          userId: task.assigneeId,
          type: NotificationType.COMMENT_ADDED,
          title: 'New comment on task',
          message: `${comment.author.name} commented on "${task.title}"`,
          resourceId: createCommentDto.taskId,
          resourceType: ResourceType.TASK,
          metadata: { commentId: comment.id },
        });
      }

      // Notify Creator (if not assignee and not comment author)
      if (task.ownerId !== userId && task.ownerId !== task.assigneeId) {
        await this.notificationsService.create({
          userId: task.ownerId,
          type: NotificationType.COMMENT_ADDED,
          title: 'New comment on task',
          message: `${comment.author.name} commented on "${task.title}"`,
          resourceId: createCommentDto.taskId,
          resourceType: ResourceType.TASK,
          metadata: { commentId: comment.id },
        });
      }
    }

    // Detect mentions
    const mentions = this.detectMentions(createCommentDto.content);

    if (mentions.length > 0) {
      const mentionedUsers = await this.prisma.user.findMany({
        where: {
          OR: mentions.map((name) => ({
            name: { contains: name, mode: 'insensitive' },
          })),
        },
        select: { id: true },
      });

      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser.id !== userId) {
          await this.notificationsService.create({
            userId: mentionedUser.id,
            type: NotificationType.MENTIONED,
            title: 'You were mentioned',
            message: `${comment.author.name} mentioned you in a comment`,
            resourceId: createCommentDto.taskId,
            resourceType: ResourceType.COMMENT,
            metadata: { commentId: comment.id },
          });
        }
      }
    }

    // Log activity with mentions
    await this.activitiesService.logCommentAdded(
      createCommentDto.taskId,
      userId,
      mentions.length > 0 ? mentions : undefined,
    );

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: {
        content: updateCommentDto.content,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Log activity
    await this.activitiesService.logCommentEdited(comment.taskId, userId);

    return updatedComment;
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    // Log activity
    await this.activitiesService.logCommentDeleted(comment.taskId, userId);

    return { success: true };
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async findByTask(taskId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return comments;
  }

  private detectMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map((m) => m.substring(1)) : [];
  }
}
