import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationType, ResourceType } from '@prisma/client';

describe('CommentsService', () => {
  let service: CommentsService;
  let prismaService: PrismaService;
  let activitiesService: ActivitiesService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    comment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  const mockActivitiesService = {
    logCommentAdded: jest.fn(),
    logCommentEdited: jest.fn(),
    logCommentDeleted: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ActivitiesService, useValue: mockActivitiesService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    activitiesService = module.get<ActivitiesService>(ActivitiesService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment and notify assignee', async () => {
      const userId = 'user-1';
      const assigneeId = 'user-2';
      const taskId = 'task-1';
      const dto = { content: 'Hello', taskId };

      const createdComment = {
        id: 'comment-1',
        content: 'Hello',
        taskId,
        authorId: userId,
        author: {
          id: userId,
          name: 'User 1',
          email: 'u1@example.com',
          image: null,
        },
      };

      const task = {
        id: taskId,
        title: 'Task 1',
        creatorId: userId,
        assigneeId: assigneeId,
      };

      mockPrismaService.comment.create.mockResolvedValue(createdComment);
      mockPrismaService.task.findUnique.mockResolvedValue(task);
      mockPrismaService.user.findMany.mockResolvedValue([]); // No mentions

      const result = await service.create(dto, userId);

      expect(mockPrismaService.comment.create).toHaveBeenCalled();
      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: assigneeId,
          type: NotificationType.COMMENT_ADDED,
          resourceId: taskId,
        }),
      );
      expect(mockActivitiesService.logCommentAdded).toHaveBeenCalledWith(
        taskId,
        userId,
        undefined,
      );
      expect(result).toEqual(createdComment);
    });

    it('should notify mentioned users', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const dto = { content: 'Hello @User2', taskId };

      const createdComment = {
        id: 'comment-1',
        content: 'Hello @User2',
        taskId,
        authorId: userId,
        author: {
          id: userId,
          name: 'User 1',
          email: 'u1@example.com',
          image: null,
        },
      };

      const task = {
        id: taskId,
        title: 'Task 1',
        creatorId: userId,
        assigneeId: userId, // Assigned to self, so no assignee notification
      };

      const mentionedUser = { id: 'user-2', name: 'User 2' };

      mockPrismaService.comment.create.mockResolvedValue(createdComment);
      mockPrismaService.task.findUnique.mockResolvedValue(task);
      mockPrismaService.user.findMany.mockResolvedValue([mentionedUser]);

      const result = await service.create(dto, userId);

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mentionedUser.id,
          type: NotificationType.MENTIONED,
          resourceId: taskId,
        }),
      );
      expect(mockActivitiesService.logCommentAdded).toHaveBeenCalledWith(
        taskId,
        userId,
        ['User2'],
      );
    });
  });

  describe('update', () => {
    it('should update a comment if author matches', async () => {
      const userId = 'user-1';
      const commentId = 'comment-1';
      const dto = { content: 'Updated content' };

      const existingComment = {
        id: commentId,
        authorId: userId,
        taskId: 'task-1',
      };

      const updatedComment = { ...existingComment, content: 'Updated content' };

      mockPrismaService.comment.findUnique.mockResolvedValue(existingComment);
      mockPrismaService.comment.update.mockResolvedValue(updatedComment);

      const result = await service.update(commentId, dto, userId);

      expect(mockPrismaService.comment.update).toHaveBeenCalled();
      expect(mockActivitiesService.logCommentEdited).toHaveBeenCalledWith(
        'task-1',
        userId,
      );
      expect(result).toEqual(updatedComment);
    });

    it('should throw ForbiddenException if author does not match', async () => {
      const userId = 'user-2';
      const commentId = 'comment-1';
      const dto = { content: 'Updated content' };

      const existingComment = {
        id: commentId,
        authorId: 'user-1',
        taskId: 'task-1',
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(existingComment);

      await expect(service.update(commentId, dto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a comment if author matches', async () => {
      const userId = 'user-1';
      const commentId = 'comment-1';

      const existingComment = {
        id: commentId,
        authorId: userId,
        taskId: 'task-1',
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(existingComment);
      mockPrismaService.comment.delete.mockResolvedValue(existingComment);

      const result = await service.remove(commentId, userId);

      expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(mockActivitiesService.logCommentDeleted).toHaveBeenCalledWith(
        'task-1',
        userId,
      );
      expect(result).toEqual({ success: true });
    });
  });
});
