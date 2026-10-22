import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { NotFoundException } from '@nestjs/common';
import { Comment } from '@ordo-todo/core';
import type { CommentRepository } from '@ordo-todo/core';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationType, ResourceType } from '@prisma/client';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: jest.Mocked<Partial<CommentRepository>>;
  let prismaService: jest.Mocked<Partial<PrismaService>>;
  let activitiesService: jest.Mocked<ActivitiesService>;
  let notificationsService: jest.Mocked<NotificationsService>;

  // Mock repository
  const mockCommentRepository: jest.Mocked<Partial<CommentRepository>> = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByTaskId: jest.fn(),
    findByUserId: jest.fn(),
    findByParentCommentId: jest.fn(),
    findMentionsForUser: jest.fn(),
    delete: jest.fn(),
    countByTaskId: jest.fn(),
    findMentionsForUserInTask: jest.fn(),
  };

  // Mock PrismaService
  const mockPrismaService: any = {
    comment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'member-1', role: 'MEMBER' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  // Mock services
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
        { provide: 'CommentRepository', useValue: mockCommentRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ActivitiesService, useValue: mockActivitiesService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get('CommentRepository');
    prismaService = module.get(PrismaService);
    activitiesService = module.get<ActivitiesService>(
      ActivitiesService,
    ) as jest.Mocked<ActivitiesService>;
    notificationsService = module.get<NotificationsService>(
      NotificationsService,
    ) as jest.Mocked<NotificationsService>;

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment and return it with author details', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const content = 'Hello world';

      // Mock domain entity - note that mentions will be added by the service
      const mockComment = Comment.create({
        taskId,
        userId,
        content,
        mentions: [], // No mentions in this test
      });
      (mockComment.id as string) = 'comment-1';

      commentRepository.create = jest.fn().mockResolvedValue(mockComment);

      // Mock author lookup
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        name: 'User 1',
        email: 'u1@example.com',
        image: null,
      });

      // Mock task lookup for notifications
      (prismaService.task?.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: 'Task 1',
        ownerId: userId,
        assigneeId: userId, // Same as author, no notification
        project: { workspaceId: 'ws-1' },
      });

      // Mock user lookup for mentions (none in this case)
      (prismaService.user?.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.create({ taskId, content }, userId);
      // Wait for async notifications and activity logging
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(commentRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('content', content);
      expect(result).toHaveProperty('author');
      expect(result.author).toHaveProperty('id', userId);
      expect(mockActivitiesService.logCommentAdded).toHaveBeenCalledWith(
        taskId,
        userId,
      );
    });

    it('should notify assignee if different from author', async () => {
      const userId = 'user-1';
      const assigneeId = 'user-2';
      const taskId = 'task-1';
      const content = 'Hello';

      const mockComment = Comment.create({
        taskId,
        userId,
        content,
        mentions: [],
      });
      (mockComment.id as string) = 'comment-1';

      commentRepository.create = jest.fn().mockResolvedValue(mockComment);

      // Mock author lookup
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        name: 'User 1',
        email: 'u1@example.com',
        image: null,
      });

      // Mock task lookup with different assignee
      (prismaService.task?.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: 'Task 1',
        ownerId: userId,
        assigneeId: assigneeId,
        project: { workspaceId: 'ws-1' },
      });

      (prismaService.user?.findMany as jest.Mock).mockResolvedValue([]);

      // Wait for async notifications
      await service.create({ taskId, content }, userId);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: assigneeId,
          type: NotificationType.COMMENT_ADDED,
        }),
      );
    });

    it('should notify the exact member on "@Full Name" with spaces (ODD 018 S2)', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const content = 'Hey @Ann Lee, welcome!';

      const mockComment = Comment.create({ taskId, userId, content });
      (mockComment.id as string) = 'comment-1';

      const createSpy = jest.fn().mockResolvedValue(mockComment);
      commentRepository.create = createSpy;

      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        name: 'User 1',
        email: 'u1@example.com',
        image: null,
      });
      (prismaService.task?.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: 'Task 1',
        ownerId: userId,
        assigneeId: userId,
        project: { workspaceId: 'ws-1' },
      });
      // Longest name first must win: "@Ann Lee" notifies Ann Lee, not Ann
      (prismaService.workspaceMember?.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user-3', user: { name: 'Ann' } },
        { userId: 'user-2', user: { name: 'Ann Lee' } },
      ]);

      await service.create({ taskId, content }, userId);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const created = createSpy.mock.calls[0][0];
      expect(created.props.mentions).toEqual(['user-2']);
      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-2',
          type: NotificationType.MENTIONED,
        }),
      );
      expect(mockNotificationsService.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-3' }),
      );
    });

    it('should NOT notify "Joanne Hunter" when content says "@ann" (no fuzzy matching, ODD 018 S2)', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      const content = 'hey @ann can you look?';

      const mockComment = Comment.create({ taskId, userId, content });
      (mockComment.id as string) = 'comment-1';

      const createSpy = jest.fn().mockResolvedValue(mockComment);
      commentRepository.create = createSpy;

      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        name: 'User 1',
        email: 'u1@example.com',
        image: null,
      });
      (prismaService.task?.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: 'Task 1',
        ownerId: userId,
        assigneeId: userId,
        project: { workspaceId: 'ws-1' },
      });
      (prismaService.workspaceMember?.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user-9', user: { name: 'Joanne Hunter' } },
      ]);

      await service.create({ taskId, content }, userId);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const created = createSpy.mock.calls[0][0];
      expect(created.props.mentions).toEqual([]);
      expect(mockNotificationsService.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-9',
          type: NotificationType.MENTIONED,
        }),
      );
    });

    it('should drop mentionedUserIds that are not workspace members (W2)', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';

      const mockComment = Comment.create({
        taskId,
        userId,
        content: 'ping',
      });
      (mockComment.id as string) = 'comment-1';

      const createSpy = jest.fn().mockResolvedValue(mockComment);
      commentRepository.create = createSpy;

      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        name: 'User 1',
        email: 'u1@example.com',
        image: null,
      });
      (prismaService.task?.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: 'Task 1',
        ownerId: userId,
        assigneeId: userId,
        project: { workspaceId: 'ws-1' },
      });
      (prismaService.workspaceMember?.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user-2' },
      ]);

      await service.create(
        {
          taskId,
          content: 'ping',
          mentionedUserIds: ['user-2', 'user-outsider'],
        },
        userId,
      );
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(
        prismaService.workspaceMember?.findMany as jest.Mock,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            workspaceId: 'ws-1',
            userId: { in: ['user-2', 'user-outsider'] },
          },
        }),
      );
      const created = createSpy.mock.calls[0][0];
      expect(created.props.mentions).toEqual(['user-2']);
      expect(mockNotificationsService.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-outsider',
          type: NotificationType.MENTIONED,
        }),
      );
    });
  });

  describe('mentions on update (ODD 018 S2 / W3)', () => {
    const buildUpdateMocks = () => {
      const author = {
        id: 'user-1',
        name: 'User 1',
        email: 'u1@example.com',
        image: null,
      };
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue(author);
      (prismaService.task?.findUnique as jest.Mock).mockResolvedValue({
        id: 'task-1',
        title: 'Task 1',
        ownerId: 'user-1',
        assigneeId: 'user-1',
        project: { workspaceId: 'ws-1' },
      });
    };

    it('should notify only newly-mentioned users when editing', async () => {
      buildUpdateMocks();
      const existing = Comment.create({
        taskId: 'task-1',
        userId: 'user-1',
        content: 'first',
        mentions: ['user-2'],
      });
      (existing.id as string) = 'comment-1';
      commentRepository.findById = jest.fn().mockResolvedValue(existing);
      commentRepository.update = jest.fn().mockResolvedValue(undefined);
      (prismaService.workspaceMember?.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user-2' },
        { userId: 'user-3' },
      ]);

      await service.update(
        'comment-1',
        {
          content: 'now with more people',
          mentionedUserIds: ['user-2', 'user-3'],
        },
        'user-1',
      );
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-3',
          type: NotificationType.MENTIONED,
        }),
      );
      expect(mockNotificationsService.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-2',
          type: NotificationType.MENTIONED,
        }),
      );
    });

    it('should not re-notify when editing without new mentions', async () => {
      buildUpdateMocks();
      const existing = Comment.create({
        taskId: 'task-1',
        userId: 'user-1',
        content: 'thanks @Ann Lee',
        mentions: ['user-2'],
      });
      (existing.id as string) = 'comment-1';
      commentRepository.findById = jest.fn().mockResolvedValue(existing);
      commentRepository.update = jest.fn().mockResolvedValue(undefined);
      (prismaService.workspaceMember?.findMany as jest.Mock).mockResolvedValue([
        { userId: 'user-2', user: { name: 'Ann Lee' } },
      ]);

      await service.update(
        'comment-1',
        { content: 'thanks @Ann Lee' },
        'user-1',
      );
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockNotificationsService.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-2',
          type: NotificationType.MENTIONED,
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a comment if author matches', async () => {
      const userId = 'user-1';
      const commentId = 'comment-1';
      const newContent = 'Updated content';

      const mockComment = Comment.create({
        taskId: 'task-1',
        userId,
        content: 'Original content',
      });
      (mockComment.id as string) = commentId;

      const updatedComment = mockComment.edit(newContent);

      commentRepository.findById = jest.fn().mockResolvedValue(mockComment);
      commentRepository.update = jest.fn().mockResolvedValue(updatedComment);

      // Mock author lookup
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        name: 'User 1',
        email: 'u1@example.com',
        image: null,
      });

      const result = await service.update(
        commentId,
        { content: newContent },
        userId,
      );

      expect(commentRepository.update).toHaveBeenCalled();
      expect(mockActivitiesService.logCommentEdited).toHaveBeenCalledWith(
        'task-1',
        userId,
      );
      expect(result.content).toBe(newContent);
      expect(result.isEdited).toBe(true);
    });

    it('should throw error if author does not match', async () => {
      const userId = 'user-2';
      const commentId = 'comment-1';
      const newContent = 'Updated content';

      const mockComment = Comment.create({
        taskId: 'task-1',
        userId: 'user-1', // Different user
        content: 'Original content',
      });
      (mockComment.id as string) = commentId;

      commentRepository.findById = jest.fn().mockResolvedValue(mockComment);

      // The use case will throw an error
      await expect(
        service.update(commentId, { content: newContent }, userId),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete a comment if author matches', async () => {
      const userId = 'user-1';
      const commentId = 'comment-1';

      const mockComment = Comment.create({
        taskId: 'task-1',
        userId,
        content: 'Test comment',
      });
      (mockComment.id as string) = commentId;

      commentRepository.findById = jest.fn().mockResolvedValue(mockComment);
      commentRepository.delete = jest.fn().mockResolvedValue(undefined);

      const result = await service.remove(commentId, userId);

      expect(commentRepository.delete).toHaveBeenCalledWith(commentId);
      expect(mockActivitiesService.logCommentDeleted).toHaveBeenCalledWith(
        'task-1',
        userId,
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      const userId = 'user-1';
      const commentId = 'nonexistent';

      commentRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(service.remove(commentId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a comment with author details', async () => {
      const commentId = 'comment-1';
      const userId = 'user-1';

      const mockComment = Comment.create({
        taskId: 'task-1',
        userId,
        content: 'Test comment',
      });
      (mockComment.id as string) = commentId;

      commentRepository.findById = jest.fn().mockResolvedValue(mockComment);

      // Mock author lookup
      (prismaService.user?.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        name: 'User 1',
        email: 'u1@example.com',
        image: null,
      });

      const result = await service.findOne(commentId);

      expect(result).toHaveProperty('id', commentId);
      expect(result).toHaveProperty('author');
      expect(result.author).toHaveProperty('id', userId);
    });

    it('should throw NotFoundException if comment not found', async () => {
      commentRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByTask', () => {
    it('should return all comments for a task with author details', async () => {
      const taskId = 'task-1';
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      const mockComments = [
        Comment.create({ taskId, userId: userId1, content: 'Comment 1' }),
        Comment.create({ taskId, userId: userId2, content: 'Comment 2' }),
      ];
      (mockComments[0].id as string) = 'comment-1';
      (mockComments[1].id as string) = 'comment-2';

      commentRepository.findByTaskId = jest
        .fn()
        .mockResolvedValue(mockComments);

      // Mock author lookups
      (prismaService.user?.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: userId1,
          name: 'User 1',
          email: 'u1@example.com',
          image: null,
        })
        .mockResolvedValueOnce({
          id: userId2,
          name: 'User 2',
          email: 'u2@example.com',
          image: null,
        });

      const result = await service.findByTask(taskId);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('author');
      expect(result[1]).toHaveProperty('author');
      expect(commentRepository.findByTaskId).toHaveBeenCalledWith(taskId);
    });

    it('should return empty array if no comments exist', async () => {
      commentRepository.findByTaskId = jest.fn().mockResolvedValue([]);

      const result = await service.findByTask('task-1');

      expect(result).toEqual([]);
    });
  });
});
