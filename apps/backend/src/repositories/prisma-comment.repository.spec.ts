import { Test, TestingModule } from '@nestjs/testing';
import { PrismaCommentRepository } from './prisma-comment.repository';
import { PrismaService } from '../database/prisma.service';
import { Comment } from '@ordo-todo/core';
import { Comment as PrismaComment } from '@prisma/client';

describe('PrismaCommentRepository', () => {
  let repository: PrismaCommentRepository;

  const mockPrismaService = {
    comment: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaCommentRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaCommentRepository>(PrismaCommentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const comment = Comment.create({
        taskId: 'task-123',
        userId: 'user-456',
        content: 'This is a test comment',
        mentions: ['user-789'],
      });

      const prismaComment: PrismaComment = {
        id: comment.id as string,
        taskId: 'task-123',
        authorId: 'user-456',
        content: 'This is a test comment',
        parentCommentId: null,
        mentions: ['user-789'],
        isEdited: false,
        editedAt: null as Date | null,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };

      mockPrismaService.comment.create.mockResolvedValue(prismaComment);

      const result = await repository.create(comment);

      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: {
          id: comment.id as string,
          taskId: 'task-123',
          authorId: 'user-456',
          content: 'This is a test comment',
          parentCommentId: null,
          mentions: ['user-789'],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        },
      });
      expect(result).toBeInstanceOf(Comment);
      expect(result.id).toBe(comment.id);
      expect(result.content).toBe('This is a test comment');
    });

    it('should create a reply comment with parentCommentId', async () => {
      const comment = Comment.create({
        taskId: 'task-123',
        userId: 'user-456',
        content: 'This is a reply',
        parentCommentId: 'comment-parent-123',
      });

      const prismaComment: PrismaComment = {
        id: comment.id as string,
        taskId: 'task-123',
        authorId: 'user-456',
        content: 'This is a reply',
        parentCommentId: 'comment-parent-123',
        mentions: [],
        isEdited: false,
        editedAt: null as Date | null,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };

      mockPrismaService.comment.create.mockResolvedValue(prismaComment);

      const result = await repository.create(comment);

      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          parentCommentId: 'comment-parent-123',
        }),
      });
      expect(result.parentCommentId).toBe('comment-parent-123');
    });
  });

  describe('update', () => {
    it('should update an existing comment', async () => {
      const comment = Comment.create({
        taskId: 'task-123',
        userId: 'user-456',
        content: 'Original content',
      });

      const edited = comment.edit('Updated content');

      const prismaComment: PrismaComment = {
        id: edited.id as string,
        taskId: 'task-123',
        authorId: 'user-456',
        content: 'Updated content',
        parentCommentId: null,
        mentions: [],
        isEdited: true,
        editedAt: edited.editedAt ?? null,
        createdAt: edited.createdAt,
        updatedAt: edited.updatedAt,
      };

      mockPrismaService.comment.update.mockResolvedValue(prismaComment);

      const result = await repository.update(edited);

      expect(mockPrismaService.comment.update).toHaveBeenCalledWith({
        where: { id: edited.id },
        data: expect.objectContaining({
          content: 'Updated content',
          isEdited: true,
          editedAt: edited.editedAt ?? null,
        }),
      });
      expect(result.isEdited).toBe(true);
    });

    it('should update mentions', async () => {
      const comment = Comment.create({
        taskId: 'task-123',
        userId: 'user-456',
        content: 'Content with mentions',
        mentions: ['user-789'],
      });

      const withMention = comment.addMention('user-abc');

      const prismaComment: PrismaComment = {
        id: withMention.id as string,
        taskId: 'task-123',
        authorId: 'user-456',
        content: 'Content with mentions',
        parentCommentId: null,
        mentions: ['user-789', 'user-abc'],
        isEdited: false,
        editedAt: null as Date | null,
        createdAt: withMention.createdAt,
        updatedAt: withMention.updatedAt,
      };

      mockPrismaService.comment.update.mockResolvedValue(prismaComment);

      const result = await repository.update(withMention);

      expect(mockPrismaService.comment.update).toHaveBeenCalledWith({
        where: { id: withMention.id },
        data: expect.objectContaining({
          mentions: ['user-789', 'user-abc'],
        }),
      });
      expect(result.mentions).toEqual(['user-789', 'user-abc']);
    });
  });

  describe('findById', () => {
    it('should find a comment by ID', async () => {
      const commentId = 'comment-123';

      const prismaComment: PrismaComment = {
        id: commentId,
        taskId: 'task-123',
        authorId: 'user-456',
        content: 'Test comment',
        parentCommentId: null,
        mentions: [],
        isEdited: false,
        editedAt: null as Date | null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(prismaComment);

      const result = await repository.findById(commentId);

      expect(mockPrismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(result).toBeInstanceOf(Comment);
      expect(result?.id).toBe(commentId);
      expect(result?.content).toBe('Test comment');
    });

    it('should return null when comment not found', async () => {
      const commentId = 'nonexistent-comment';

      mockPrismaService.comment.findUnique.mockResolvedValue(null);

      const result = await repository.findById(commentId);

      expect(mockPrismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByTaskId', () => {
    it('should find all comments for a task', async () => {
      const taskId = 'task-123';

      const prismaComments = [
        {
          id: 'comment-1',
          taskId,
          authorId: 'user-1',
          content: 'First comment',
          parentCommentId: null,
          mentions: [],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          id: 'comment-2',
          taskId,
          authorId: 'user-2',
          content: 'Second comment',
          parentCommentId: null,
          mentions: [],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date('2024-01-01T11:00:00Z'),
          updatedAt: new Date('2024-01-01T11:00:00Z'),
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(prismaComments);

      const result = await repository.findByTaskId(taskId);

      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: { taskId },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('comment-1');
      expect(result[1].id).toBe('comment-2');
    });

    it('should return empty array when no comments found', async () => {
      const taskId = 'empty-task';

      mockPrismaService.comment.findMany.mockResolvedValue([]);

      const result = await repository.findByTaskId(taskId);

      expect(result).toEqual([]);
    });
  });

  describe('findByUserId', () => {
    it('should find all comments by a user', async () => {
      const userId = 'user-456';

      const prismaComments = [
        {
          id: 'comment-1',
          taskId: 'task-1',
          authorId: userId,
          content: 'My comment on task 1',
          parentCommentId: null,
          mentions: [],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'comment-2',
          taskId: 'task-2',
          authorId: userId,
          content: 'My comment on task 2',
          parentCommentId: null,
          mentions: [],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(prismaComments);

      const result = await repository.findByUserId(userId);

      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(userId);
      expect(result[1].userId).toBe(userId);
    });
  });

  describe('findByParentCommentId', () => {
    it('should find all replies to a comment', async () => {
      const parentCommentId = 'comment-parent-123';

      const prismaComments = [
        {
          id: 'reply-1',
          taskId: 'task-123',
          authorId: 'user-1',
          content: 'First reply',
          parentCommentId,
          mentions: [],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'reply-2',
          taskId: 'task-123',
          authorId: 'user-2',
          content: 'Second reply',
          parentCommentId,
          mentions: [],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(prismaComments);

      const result = await repository.findByParentCommentId(parentCommentId);

      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: { parentCommentId },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].parentCommentId).toBe(parentCommentId);
      expect(result[1].parentCommentId).toBe(parentCommentId);
    });

    it('should return empty array when no replies found', async () => {
      const parentCommentId = 'comment-with-no-replies';

      mockPrismaService.comment.findMany.mockResolvedValue([]);

      const result = await repository.findByParentCommentId(parentCommentId);

      expect(result).toEqual([]);
    });
  });

  describe('findMentionsForUser', () => {
    it('should find all comments mentioning the user', async () => {
      const userId = 'user-789';

      const prismaComments = [
        {
          id: 'comment-1',
          taskId: 'task-1',
          authorId: 'user-1',
          content: '@user-789 please review',
          parentCommentId: null,
          mentions: [userId],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'comment-2',
          taskId: 'task-2',
          authorId: 'user-2',
          content: 'Also @user-789 check this',
          parentCommentId: null,
          mentions: [userId],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(prismaComments);

      const result = await repository.findMentionsForUser(userId);

      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: {
          mentions: {
            has: userId,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].hasMention(userId)).toBe(true);
      expect(result[1].hasMention(userId)).toBe(true);
    });

    it('should return empty array when user has no mentions', async () => {
      const userId = 'user-never-mentioned';

      mockPrismaService.comment.findMany.mockResolvedValue([]);

      const result = await repository.findMentionsForUser(userId);

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete a comment', async () => {
      const commentId = 'comment-123';

      mockPrismaService.comment.delete.mockResolvedValue({
        id: commentId,
        taskId: 'task-123',
        authorId: 'user-456',
        content: 'Deleted',
        parentCommentId: null,
        mentions: [],
        isEdited: false,
        editedAt: null as Date | null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.delete(commentId);

      expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });
  });

  describe('countByTaskId', () => {
    it('should count comments for a task', async () => {
      const taskId = 'task-123';

      mockPrismaService.comment.count.mockResolvedValue(5);

      const result = await repository.countByTaskId(taskId);

      expect(mockPrismaService.comment.count).toHaveBeenCalledWith({
        where: { taskId },
      });
      expect(result).toBe(5);
    });

    it('should return 0 for task with no comments', async () => {
      const taskId = 'empty-task';

      mockPrismaService.comment.count.mockResolvedValue(0);

      const result = await repository.countByTaskId(taskId);

      expect(result).toBe(0);
    });
  });

  describe('findMentionsForUserInTask', () => {
    it('should find mentions for user in specific task', async () => {
      const taskId = 'task-123';
      const userId = 'user-789';

      const prismaComments = [
        {
          id: 'comment-1',
          taskId,
          authorId: 'user-1',
          content: '@user-789 please review this task',
          parentCommentId: null,
          mentions: [userId],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(prismaComments);

      const result = await repository.findMentionsForUserInTask(taskId, userId);

      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: {
          taskId,
          mentions: {
            has: userId,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].taskId).toBe(taskId);
      expect(result[0].hasMention(userId)).toBe(true);
    });

    it('should return empty array when no mentions found in task', async () => {
      const taskId = 'task-123';
      const userId = 'user-789';

      mockPrismaService.comment.findMany.mockResolvedValue([]);

      const result = await repository.findMentionsForUserInTask(taskId, userId);

      expect(result).toEqual([]);
    });

    it('should only return mentions from the specified task', async () => {
      const taskId = 'task-123';
      const userId = 'user-789';

      const prismaComments = [
        {
          id: 'comment-1',
          taskId,
          authorId: 'user-1',
          content: 'Mention in task-123',
          parentCommentId: null,
          mentions: [userId],
          isEdited: false,
          editedAt: null as Date | null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(prismaComments);

      const result = await repository.findMentionsForUserInTask(taskId, userId);

      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: {
          taskId,
          mentions: {
            has: userId,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].taskId).toBe(taskId);
    });
  });

  describe('toDomain mapping', () => {
    it('should correctly map Prisma Comment to domain Comment', async () => {
      const commentId = 'comment-123';

      const prismaComment: PrismaComment = {
        id: commentId,
        taskId: 'task-123',
        authorId: 'user-456',
        content: 'Test comment with mentions',
        parentCommentId: 'parent-123',
        mentions: ['user-789', 'user-abc'],
        isEdited: true,
        editedAt: new Date('2024-01-02T10:00:00Z'),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-02T10:00:00Z'),
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(prismaComment);

      const result = await repository.findById(commentId);

      expect(result).toBeInstanceOf(Comment);
      expect(result?.id).toBe(commentId);
      expect(result?.taskId).toBe('task-123');
      expect(result?.userId).toBe('user-456'); // Maps from authorId
      expect(result?.content).toBe('Test comment with mentions');
      expect(result?.parentCommentId).toBe('parent-123');
      expect(result?.mentions).toEqual(['user-789', 'user-abc']);
      expect(result?.isEdited).toBe(true);
      expect(result?.editedAt).toEqual(new Date('2024-01-02T10:00:00Z'));
    });

    it('should handle null parentCommentId', async () => {
      const commentId = 'comment-123';

      const prismaComment: PrismaComment = {
        id: commentId,
        taskId: 'task-123',
        authorId: 'user-456',
        content: 'Top-level comment',
        parentCommentId: null,
        mentions: [],
        isEdited: false,
        editedAt: null as Date | null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(prismaComment);

      const result = await repository.findById(commentId);

      expect(result?.parentCommentId).toBeNull();
      expect(result?.isReply()).toBe(false);
    });
  });
});
