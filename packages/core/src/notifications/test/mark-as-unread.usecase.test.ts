import { MarkAsUnreadUseCase, MarkAsUnreadInput } from "../usecase/mark-as-unread.usecase";
import { NotificationRepository } from "../provider/notification.repository";
import { Notification, NotificationType } from "../model/notification.entity";

describe("MarkAsUnreadUseCase", () => {
  let useCase: MarkAsUnreadUseCase;
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
    useCase = new MarkAsUnreadUseCase(mockRepository);
  });

  const validInput: MarkAsUnreadInput = {
    notificationId: "notif-123",
    userId: "user-456",
  };

  const mockReadNotification = Notification.create({
    userId: "user-456",
    type: NotificationType.TASK_ASSIGNED,
    title: "New task assigned",
  }).markAsRead();

  describe("execute()", () => {
    it("should mark notification as unread successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockReadNotification);
      mockRepository.update.mockResolvedValue(mockReadNotification);

      const result = await useCase.execute(validInput);

      expect(result.isRead).toBe(false);
      expect(result.readAt).toBeNull();
      expect(mockRepository.update).toHaveBeenCalledWith(result);
    });

    it("should be idempotent - allow marking already unread notification", async () => {
      const unreadNotification = Notification.create({
        userId: "user-456",
        type: NotificationType.TASK_ASSIGNED,
        title: "New task assigned",
      });
      mockRepository.findById.mockResolvedValue(unreadNotification);
      mockRepository.update.mockResolvedValue(unreadNotification);

      const result = await useCase.execute(validInput);

      expect(result.isRead).toBe(false);
      expect(result).toBe(unreadNotification);
      // update should still be called even if already unread
      expect(mockRepository.update).toHaveBeenCalledWith(result);
    });

    it("should throw error if notificationId is missing", async () => {
      const invalidInput = { ...validInput, notificationId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Notification ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if notification is not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Notification not found",
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error if user doesn't own the notification", async () => {
      const otherUsersNotification = Notification.create({
        userId: "user-789", // Different user
        type: NotificationType.TASK_ASSIGNED,
        title: "New task assigned",
      });
      mockRepository.findById.mockResolvedValue(otherUsersNotification);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "You do not have permission to mark this notification as unread",
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should trim whitespace from notificationId", async () => {
      mockRepository.findById.mockResolvedValue(mockReadNotification);
      mockRepository.update.mockResolvedValue(mockReadNotification);

      await useCase.execute({
        ...validInput,
        notificationId: "  notif-123  ",
      });

      expect(mockRepository.findById).toHaveBeenCalledWith("notif-123");
    });

    it("should trim whitespace from userId", async () => {
      mockRepository.findById.mockResolvedValue(mockReadNotification);
      mockRepository.update.mockResolvedValue(mockReadNotification);

      await useCase.execute({
        ...validInput,
        userId: "  user-456  ",
      });

      expect(mockRepository.findById).toHaveBeenCalledWith("notif-123");
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle update errors", async () => {
      const error = new Error("Update failed");
      mockRepository.findById.mockResolvedValue(mockReadNotification);
      mockRepository.update.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow("Update failed");
    });
  });
});
