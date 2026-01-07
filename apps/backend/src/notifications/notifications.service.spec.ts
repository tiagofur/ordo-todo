import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationType, ResourceType } from '@prisma/client';
import { Notification } from '@ordo-todo/core';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: any;

  const mockNotificationRepository = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    countUnreadByUserId: jest.fn(),
    markAllAsRead: jest.fn(),
    startTransaction: jest.fn(), // If needed
    findById: jest.fn(),
    update: jest.fn(),
    findUnreadByUserId: jest.fn(),
    findReadByUserId: jest.fn(),
    findByType: jest.fn(),
    findByPriority: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: 'NotificationRepository',
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get('NotificationRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const data = {
        userId: 'user-1',
        type: 'COMMENT_ADDED' as NotificationType,
        title: 'New Comment',
        message: 'User B commented',
        resourceId: 'task-1',
        resourceType: 'TASK' as ResourceType,
        metadata: { commentId: 'comment-1' },
      };

      const createdNotification = new Notification({
        id: 'notif-1',
        ...data,
        type: data.type as any,
        message: data.message,
        resourceId: data.resourceId,
        resourceType: data.resourceType as any,
        metadata: data.metadata,
      });

      mockNotificationRepository.create.mockResolvedValue(createdNotification);

      const result = await service.create(data);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            userId: data.userId,
            title: data.title,
          }),
        }),
      );

      expect(result.title).toBe(data.title);
      expect(result.userId).toBe(data.userId);
      expect(result.message).toBe(data.message);
    });
  });

  describe('findAll', () => {
    it('should return notifications for a user', async () => {
      const userId = 'user-1';
      const notifications = [
        new Notification({
          id: 'notif-1',
          userId,
          title: 'Notif 1',
          type: 'SYSTEM' as any,
        }),
        new Notification({
          id: 'notif-2',
          userId,
          title: 'Notif 2',
          type: 'SYSTEM' as any,
        }),
      ];

      mockNotificationRepository.findByUserId.mockResolvedValue(notifications);

      const result = await service.findAll(userId);

      expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(notifications);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const userId = 'user-1';
      mockNotificationRepository.countUnreadByUserId.mockResolvedValue(5);

      const result = await service.getUnreadCount(userId);

      expect(
        mockNotificationRepository.countUnreadByUserId,
      ).toHaveBeenCalledWith(userId);
      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const id = 'notif-1';
      const userId = 'user-1';

      const notification = new Notification({
        id,
        userId,
        title: 'Test',
        type: 'SYSTEM' as any,
        isRead: false,
      });

      const updatedNotification = new Notification({
        ...notification.props,
        isRead: true,
        readAt: new Date(),
      });

      mockNotificationRepository.findById.mockResolvedValue(notification);
      mockNotificationRepository.update.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(id, userId);

      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(id);
      expect(mockNotificationRepository.update).toHaveBeenCalled();
      expect(result.id).toBe(id);
      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeInstanceOf(Date);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'user-1';

      mockNotificationRepository.markAllAsRead.mockResolvedValue(undefined);

      const result = await service.markAllAsRead(userId);

      expect(mockNotificationRepository.markAllAsRead).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual({ count: 1 });
    });
  });
});
