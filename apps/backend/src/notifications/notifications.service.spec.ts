import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationType, ResourceType } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const data = {
        userId: 'user-1',
        type: NotificationType.COMMENT_ADDED,
        title: 'New Comment',
        message: 'User B commented',
        resourceId: 'task-1',
        resourceType: ResourceType.TASK,
        metadata: { commentId: 'comment-1' },
      };

      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notif-1',
        ...data,
      });

      const result = await service.create(data);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data,
      });
      expect(result).toEqual({ id: 'notif-1', ...data });
    });
  });

  describe('findAll', () => {
    it('should return notifications for a user', async () => {
      const userId = 'user-1';
      const notifications = [
        { id: 'notif-1', userId, title: 'Notif 1' },
        { id: 'notif-2', userId, title: 'Notif 2' },
      ];

      mockPrismaService.notification.findMany.mockResolvedValue(notifications);

      const result = await service.findAll(userId);

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(notifications);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const userId = 'user-1';
      mockPrismaService.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(userId);

      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: { userId, isRead: false },
      });
      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const id = 'notif-1';
      const userId = 'user-1';

      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.markAsRead(id, userId);

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { id, userId },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
      expect(result).toEqual({ count: 1 });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'user-1';

      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(userId);

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId, isRead: false },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
      expect(result).toEqual({ count: 5 });
    });
  });
});
