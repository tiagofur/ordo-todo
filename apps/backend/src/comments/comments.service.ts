import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import {
  Comment,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  GetCommentsByTaskUseCase,
  GetCommentsByUserUseCase,
} from '@ordo-todo/core';
import type { CommentRepository } from '@ordo-todo/core';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationType, ResourceType } from '@prisma/client';
import { EmbeddingIndexerService } from '../ai/retrieval/embedding-indexer.service';

/**
 * Response DTO for comment with author details.
 */
export interface CommentWithAuthor {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  parentCommentId: string | null;
  mentions: string[];
  isEdited: boolean;
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing comments on tasks.
 *
 * This service orchestrates the use cases from the domain layer and handles
 * cross-cutting concerns such as:
 * - Notifications for assignees and mentioned users
 * - Activity logging
 * - Enriching responses with author details
 *
 * ## Architecture
 *
 * This service follows Clean Architecture principles:
 * - Uses domain use cases for business logic
 * - Uses CommentRepository for data access
 * - Handles only orchestration and cross-cutting concerns
 * - Maps domain entities to response DTOs
 *
 * @see {@link ../../../../packages/core/src/comments/ | Comments Domain}
 */
@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @Inject('CommentRepository')
    private readonly commentRepository: CommentRepository,
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
    @Optional() private readonly indexer?: EmbeddingIndexerService,
  ) {}

  /**
   * Creates a new comment on a task.
   *
   * Creates a comment and sends notifications to:
   * - The task assignee (if different from author)
   * - The task owner (if different from author and assignee)
   * - Any users mentioned in the comment
   *
   * Also logs the activity and tracks mentions.
   *
   * @param createCommentDto - The comment creation data
   * @param userId - The ID of the user creating the comment
   * @returns The created comment with author details
   *
   * @example
   * ```typescript
   * const comment = await commentsService.create(
   *   { taskId: 'task-123', content: 'Please review this task' },
   *   'user-456'
   * );
   * ```
   */
  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentWithAuthor> {
    this.logger.debug(
      `Creating comment on task ${createCommentDto.taskId} by user ${userId}`,
    );

    // SECURITY: Ensure task exists and user has access to the workspace
    const task = await this.prisma.task.findUnique({
      where: { id: createCommentDto.taskId },
      select: {
        id: true,
        project: {
          select: {
            workspaceId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: task.project.workspaceId,
          userId: userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have permission to comment on this task',
      );
    }

    // Resolve mentions: explicit member IDs first, exact-name fallback second
    const mentions = await this.resolveMentionedUserIds(
      createCommentDto.content,
      createCommentDto.mentionedUserIds,
      task.project.workspaceId,
    );

    // Execute use case to create comment
    const createCommentUseCase = new CreateCommentUseCase(
      this.commentRepository,
    );
    const comment = await createCommentUseCase.execute({
      taskId: createCommentDto.taskId,
      userId,
      content: createCommentDto.content,
      mentions,
    });

    this.logger.debug(`Comment created with ID: ${comment.id}`);

    // Enrich response with author details
    const commentWithAuthor = await this.enrichWithAuthor(comment);

    // Send notifications and log activity
    await this.handleCommentNotifications(
      commentWithAuthor,
      userId,
      mentions,
    ).catch((error) => {
      this.logger.error('Failed to send comment notifications', error);
    });

    await this.indexer?.indexContent(
      'COMMENT',
      commentWithAuthor.id,
      commentWithAuthor.content,
      { taskId: commentWithAuthor.taskId },
    );

    return commentWithAuthor;
  }

  /**
   * Updates an existing comment.
   *
   * Only the comment author can update their own comment.
   * Updates the content and marks the comment as edited.
   *
   * @param id - The ID of the comment to update
   * @param updateCommentDto - The update data
   * @param userId - The ID of the user attempting to update
   * @returns The updated comment with author details
   * @throws {NotFoundException} If comment not found
   * @throws {ForbiddenException} If user is not the author
   *
   * @example
   * ```typescript
   * const updated = await commentsService.update(
   *   'comment-123',
   *   { content: 'Updated text' },
   *   'user-456'
   * );
   * ```
   */
  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<CommentWithAuthor> {
    this.logger.debug(`Updating comment ${id} by user ${userId}`);

    const existingComment = await this.commentRepository.findById(id);
    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }

    const taskDetails = await this.getTaskDetails(existingComment.taskId);
    const newMentions = await this.resolveMentionedUserIds(
      updateCommentDto.content,
      updateCommentDto.mentionedUserIds,
      taskDetails?.workspaceId ?? '',
    );

    const updateCommentUseCase = new UpdateCommentUseCase(
      this.commentRepository,
    );
    const updatedComment = await updateCommentUseCase.execute({
      commentId: id,
      userId,
      newContent: updateCommentDto.content,
      newMentions,
    });

    this.logger.debug(`Comment ${id} updated successfully`);

    // Notify only newly-mentioned users: editing must not re-notify (W3)
    const previouslyMentioned = new Set(existingComment.mentions ?? []);
    if (
      newMentions.some((mid) => mid !== userId && !previouslyMentioned.has(mid))
    ) {
      const { author } = await this.enrichWithAuthor(updatedComment);
      for (const mentionedUserId of newMentions) {
        if (
          mentionedUserId !== userId &&
          !previouslyMentioned.has(mentionedUserId)
        ) {
          await this.notificationsService.create({
            userId: mentionedUserId,
            type: NotificationType.MENTIONED,
            title: 'You were mentioned',
            message: `${author.name} mentioned you in a comment`,
            resourceId: updatedComment.taskId,
            resourceType: ResourceType.COMMENT,
            metadata: { commentId: updatedComment.id },
          });
        }
      }
    }

    // Log activity
    await this.activitiesService.logCommentEdited(
      updatedComment.taskId,
      userId,
    );

    await this.indexer?.indexContent(
      'COMMENT',
      id,
      updatedComment.props.content,
      { taskId: updatedComment.taskId },
    );

    // Enrich response with author details
    return this.enrichWithAuthor(updatedComment);
  }

  /**
   * Deletes a comment.
   *
   * Only the comment author can delete their own comment.
   * Deletion is permanent.
   *
   * @param id - The ID of the comment to delete
   * @param userId - The ID of the user attempting to delete
   * @returns Success confirmation
   * @throws {NotFoundException} If comment not found
   * @throws {ForbiddenException} If user is not the author
   *
   * @example
   * ```typescript
   * await commentsService.remove('comment-123', 'user-456');
   * // Returns: { success: true }
   * ```
   */
  async remove(id: string, userId: string): Promise<{ success: true }> {
    this.logger.debug(`Deleting comment ${id} by user ${userId}`);

    // Get comment first for activity logging
    const existingComment = await this.commentRepository.findById(id);
    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }

    const deleteCommentUseCase = new DeleteCommentUseCase(
      this.commentRepository,
    );
    await deleteCommentUseCase.execute({
      commentId: id,
      userId,
    });

    this.logger.debug(`Comment ${id} deleted successfully`);

    // Log activity
    await this.activitiesService.logCommentDeleted(
      existingComment.taskId,
      userId,
    );

    await this.indexer?.removeContent('COMMENT', id);

    return { success: true };
  }

  /**
   * Finds a single comment by ID.
   *
   * @param id - The ID of the comment to find
   * @returns The comment with author details
   * @throws {NotFoundException} If comment not found
   *
   * @example
   * ```typescript
   * const comment = await commentsService.findOne('comment-123');
   * ```
   */
  async findOne(id: string): Promise<CommentWithAuthor> {
    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.enrichWithAuthor(comment);
  }

  /**
   * Finds all comments for a specific task.
   *
   * Comments are ordered chronologically (oldest first).
   *
   * @param taskId - The ID of the task
   * @returns Array of comments with author details
   *
   * @example
   * ```typescript
   * const comments = await commentsService.findByTask('task-123');
   * ```
   */
  async findByTask(taskId: string): Promise<CommentWithAuthor[]> {
    const getCommentsByTaskUseCase = new GetCommentsByTaskUseCase(
      this.commentRepository,
    );
    const comments = await getCommentsByTaskUseCase.execute({ taskId });

    // Enrich all comments with author details
    return Promise.all(
      comments.map((comment) => this.enrichWithAuthor(comment)),
    );
  }

  /**
   * Handles notifications for a new comment.
   *
   * Sends notifications to:
   * - Task assignee (if different from author)
   * - Task owner (if different from author and assignee)
   * - Mentioned users
   *
   * Also logs the activity.
   *
   * @private
   */
  private async handleCommentNotifications(
    comment: CommentWithAuthor,
    userId: string,
    mentions: string[],
  ): Promise<void> {
    // Get task details for notifications
    const task = await this.getTaskDetails(comment.taskId);
    if (!task) {
      this.logger.warn(`Task ${comment.taskId} not found for notifications`);
      return;
    }

    // Notify assignee
    if (task.assigneeId && task.assigneeId !== userId) {
      await this.notificationsService.create({
        userId: task.assigneeId,
        type: NotificationType.COMMENT_ADDED,
        title: 'New comment on task',
        message: `${comment.author.name} commented on "${task.title}"`,
        resourceId: comment.taskId,
        resourceType: ResourceType.TASK,
        metadata: { commentId: comment.id },
      });
    }

    // Notify creator (if not assignee and not comment author)
    if (task.ownerId !== userId && task.ownerId !== task.assigneeId) {
      await this.notificationsService.create({
        userId: task.ownerId,
        type: NotificationType.COMMENT_ADDED,
        title: 'New comment on task',
        message: `${comment.author.name} commented on "${task.title}"`,
        resourceId: comment.taskId,
        resourceType: ResourceType.TASK,
        metadata: { commentId: comment.id },
      });
    }

    // Notify mentioned users; resolveMentionedUserIds already validated
    // workspace membership (ODD 018 S2 / W2)
    for (const mentionedUserId of mentions) {
      if (mentionedUserId !== userId) {
        await this.notificationsService.create({
          userId: mentionedUserId,
          type: NotificationType.MENTIONED,
          title: 'You were mentioned',
          message: `${comment.author.name} mentioned you in a comment`,
          resourceId: comment.taskId,
          resourceType: ResourceType.COMMENT,
          metadata: { commentId: comment.id },
        });
      }
    }

    // Log activity. Mentions are no longer put in metadata: they are user
    // IDs now and rendering raw IDs in the feed would be worse than nothing.
    await this.activitiesService.logCommentAdded(comment.taskId, userId);
  }

  /**
   * Enriches a comment with author details.
   *
   * This requires direct database access since user data is not
   * part of the domain entity. This is a pragmatic compromise.
   *
   * @private
   */
  private async enrichWithAuthor(comment: Comment): Promise<CommentWithAuthor> {
    const author = await this.getUserById(comment.userId);

    return {
      id: comment.id as string,
      content: comment.content,
      taskId: comment.taskId,
      authorId: comment.userId,
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
        image: author.image,
      },
      parentCommentId: comment.parentCommentId ?? null,
      mentions: comment.mentions,
      isEdited: comment.isEdited,
      editedAt: comment.editedAt ?? null,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  /**
   * Resolves the mentioned user IDs for a comment.
   *
   * Primary source of truth: explicit `mentionedUserIds` picked from the
   * member list by the client — non-members are dropped silently (a removed
   * member mid-draft must not 400 a comment). Fallback for API/agent
   * clients: exact case-insensitive "@Full Name" matching against the real
   * member names, longest name first (so "@Ann Lee" never also notifies
   * "Ann"). The old /@\w+/ regex split names at spaces and the `contains`
   * lookup notified "@ann" inside "Joanne" — both gone (ODD 018 S2 / W2).
   *
   * @private
   */
  private async resolveMentionedUserIds(
    content: string,
    mentionedUserIds: string[] | undefined,
    workspaceId: string,
  ): Promise<string[]> {
    if (mentionedUserIds) {
      const unique = [...new Set(mentionedUserIds)];
      if (unique.length === 0) return [];
      const members = await this.prisma.workspaceMember.findMany({
        where: { workspaceId, userId: { in: unique } },
        select: { userId: true },
      });
      const memberIds = new Set(members.map((m) => m.userId));
      return unique.filter((id) => memberIds.has(id));
    }

    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true, user: { select: { name: true } } },
    });

    const namedMembers = members
      .filter((m) => !!m.user?.name)
      .map((m) => ({ userId: m.userId, name: m.user.name }))
      .sort((a, b) => b.name.length - a.name.length);

    const mentioned: string[] = [];
    let working = content;
    for (const { userId, name } of namedMembers) {
      const pattern = new RegExp(
        `@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}_])`,
        'giu',
      );
      if (pattern.test(working)) {
        mentioned.push(userId);
        // Remove the match so a shorter member name cannot match inside it
        working = working.replace(pattern, '');
      }
    }
    return mentioned;
  }

  /**
   * Gets task details for notifications.
   * Direct DB access - pragmatic compromise for enrichment.
   *
   * @private
   */
  private async getTaskDetails(taskId: string): Promise<{
    title: string;
    ownerId: string;
    assigneeId: string | null;
    workspaceId: string;
  } | null> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        title: true,
        ownerId: true,
        assigneeId: true,
        project: {
          select: {
            workspaceId: true,
          },
        },
      },
    });

    if (!task) return null;

    return {
      title: task.title,
      ownerId: task.ownerId,
      assigneeId: task.assigneeId,
      workspaceId: task.project.workspaceId,
    };
  }

  /**
   * Gets user by ID for author enrichment.
   * Direct DB access - pragmatic compromise for enrichment.
   *
   * @private
   */
  private async getUserById(userId: string): Promise<{
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true },
    });

    if (!user) {
      // Return fallback if user not found
      return {
        id: userId,
        name: 'Unknown User',
        email: 'unknown@example.com',
        image: null,
      };
    }

    return user;
  }
}
