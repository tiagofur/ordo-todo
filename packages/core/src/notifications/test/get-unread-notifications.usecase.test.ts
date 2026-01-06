import { GetUnreadNotificationsUseCase, GetUnreadNotificationsInput } from "../usecase/get-unread-notifications.usecase";
import { NotificationRepository } from "../provider/notification.repository";
import { Notification, NotificationType } from "../model/notification.entity";

describe("GetUnreadNotificationsUseCase", () => {
  let useCase: GetUnreadNotificationsUseCase;
  let mockRepository: jest.Mocked<NotificationRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findUnreadByUserId: jest.fn(),
      findReadByUserId: jest.fn(),
      findByType: jest.fn(),
      findByPriority: jest.fn(),
      delete: jest.fn(),
      markAllAsRead: jest.fn(),
      countUnreadByUserId: jest.fn(),
      deleteExpired: jest.fn(),
      deleteOlderThan: jest.fn(),
    };
    useCase = new GetUnreadNotificationsUseCase(mockRepository);
  });

  const validInput: GetUnreadNotificationsInput = {
    userId: "user-123",
  };

  describe("execute()", () => {
    it("should get unread notifications successfully", async () => {
      const notifications = [
        Notification.create({
          userId: "user-123",
          type: NotificationType.TASK_ASSIGNED,
          title: "Task assigned",
        }),
        Notification.create({
          userId: "user-123",
          type: NotificationType.COMMENT_ADDED,
          title: "Comment added",
        }),
      ];
      mockRepository.findUnreadByUserId.mockResolvedValue(notifications);

      const result = await useCase.execute(validInput);

      expect(result).toHaveLength(2);
      expect(mockRepository.findUnreadByUserId).toHaveBeenCalledWith("user-123");
    });

    it("should return empty array when no unread notifications", async () => {
      mockRepository.findUnreadByUserId.mockResolvedValue([]);

      const result = await useCase.execute(validInput);

      expect(result).toEqual([]);
    });

    it("should sort high priority notifications first", async () => {
      const older = new Date(Date.now() - 10000);
      const newer = new Date(Date.now() - 5000);

      const notifications = [
        // Low priority, newer
        Notification.create({
          userId: "user-123",
          type: NotificationType.COMMENT_ADDED,
          title: "Comment added",
        }),
        // High priority, older
        new Notification(
          {
            userId: "user-123",
            type: NotificationType.TASK_ASSIGNED,
            title: "Task assigned",
            createdAt: older,
          },
          "valid",
        ),
        // Low priority, oldest
        new Notification(
          {
            userId: "user-123",
            type: NotificationType.SYSTEM,
            title: "System message",
            createdAt: newer,
          },
          "valid",
        ),
      ];
      mockRepository.findUnreadByUserId.mockResolvedValue(notifications);

      const result = await useCase.execute(validInput);

      // High priority (TASK_ASSIGNED) should come first despite being older
      expect(result[0].type).toBe(NotificationType.TASK_ASSIGNED);
      expect(result[0].title).toBe("Task assigned");
    });

    it("should sort by creation time within same priority", async () => {
      const newerDate = new Date(Date.now() - 1000);
      const olderDate = new Date(Date.now() - 5000);

      const notifications = [
        // Older high priority
        new Notification(
          {
            userId: "user-123",
            type: NotificationType.MENTIONED,
            title: "Mentioned (older)",
            createdAt: olderDate,
          },
          "valid",
        ),
        // Newer high priority
        new Notification(
          {
            userId: "user-123",
            type: NotificationType.MENTIONED,
            title: "Mentioned (newer)",
            createdAt: newerDate,
          },
          "valid",
        ),
      ];
      mockRepository.findUnreadByUserId.mockResolvedValue(notifications);

      const result = await useCase.execute(validInput);

      // Newer should come first within same priority
      expect(result[0].title).toBe("Mentioned (newer)");
      expect(result[1].title).toBe("Mentioned (older)");
    });

    it("should apply limit when specified", async () => {
      const notifications = Array.from({ length: 10 }, (_, i) =>
        Notification.create({
          userId: "user-123",
          type: NotificationType.COMMENT_ADDED,
          title: `Notification ${i}`,
        }),
      );
      mockRepository.findUnreadByUserId.mockResolvedValue(notifications);

      const result = await useCase.execute({
        ...validInput,
        limit: 5,
      });

      expect(result).toHaveLength(5);
    });

    it("should apply limit of 1", async () => {
      const notifications = [
        Notification.create({
          userId: "user-123",
          type: NotificationType.TASK_ASSIGNED,
          title: "Task assigned",
        }),
        Notification.create({
          userId: "user-123",
          type: NotificationType.COMMENT_ADDED,
          title: "Comment added",
        }),
      ];
      mockRepository.findUnreadByUserId.mockResolvedValue(notifications);

      const result = await useCase.execute({
        ...validInput,
        limit: 1,
      });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(NotificationType.TASK_ASSIGNED);
    });

    it("should not apply limit when not specified", async () => {
      const notifications = [
        Notification.create({
          userId: "user-123",
          type: NotificationType.COMMENT_ADDED,
          title: "Comment added",
        }),
      ];
      mockRepository.findUnreadByUserId.mockResolvedValue(notifications);

      const result = await useCase.execute(validInput);

      expect(result).toHaveLength(1);
    });

    it("should return empty array when limit is 0", async () => {
      const notifications = [
        Notification.create({
          userId: "user-123",
          type: NotificationType.COMMENT_ADDED,
          title: "Comment added",
        }),
      ];
      mockRepository.findUnreadByUserId.mockResolvedValue(notifications);

      const result = await useCase.execute({
        ...validInput,
        limit: 0,
      });

      expect(result).toEqual([]);
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findUnreadByUserId).not.toHaveBeenCalled();
    });

    it("should throw error if userId is only whitespace", async () => {
      const invalidInput = { ...validInput, userId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findUnreadByUserId).not.toHaveBeenCalled();
    });

    it("should trim whitespace from userId", async () => {
      mockRepository.findUnreadByUserId.mockResolvedValue([]);

      await useCase.execute({
        ...validInput,
        userId: "  user-123  ",
      });

      expect(mockRepository.findUnreadByUserId).toHaveBeenCalledWith("user-123");
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findUnreadByUserId.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});
