import { DeleteNotificationUseCase, DeleteNotificationInput } from "../usecase/delete-notification.usecase";
import { NotificationRepository } from "../provider/notification.repository";
import { Notification, NotificationType } from "../model/notification.entity";

describe("DeleteNotificationUseCase", () => {
  let useCase: DeleteNotificationUseCase;
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
    useCase = new DeleteNotificationUseCase(mockRepository);
  });

  const validInput: DeleteNotificationInput = {
    notificationId: "notif-123",
    userId: "user-456",
  };

  const mockNotification = Notification.create({
    userId: "user-456",
    type: NotificationType.TASK_ASSIGNED,
    title: "New task assigned",
  });

  describe("execute()", () => {
    it("should delete notification successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(validInput);

      expect(mockRepository.delete).toHaveBeenCalledWith("notif-123");
    });

    it("should return void on successful deletion", async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);
      mockRepository.delete.mockResolvedValue(undefined);

      const result = await useCase.execute(validInput);

      expect(result).toBeUndefined();
    });

    it("should throw error if notificationId is missing", async () => {
      const invalidInput = { ...validInput, notificationId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Notification ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if notification is not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Notification not found",
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if user doesn't own the notification", async () => {
      const otherUsersNotification = Notification.create({
        userId: "user-789", // Different user
        type: NotificationType.TASK_ASSIGNED,
        title: "New task assigned",
      });
      mockRepository.findById.mockResolvedValue(otherUsersNotification);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "You do not have permission to delete this notification",
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should trim whitespace from notificationId", async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute({
        ...validInput,
        notificationId: "  notif-123  ",
      });

      expect(mockRepository.findById).toHaveBeenCalledWith("notif-123");
      expect(mockRepository.delete).toHaveBeenCalledWith("notif-123");
    });

    it("should trim whitespace from userId", async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute({
        ...validInput,
        userId: "  user-456  ",
      });

      expect(mockRepository.findById).toHaveBeenCalledWith("notif-123");
      expect(mockRepository.delete).toHaveBeenCalledWith("notif-123");
    });

    it("should pass repository findById errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should pass repository delete errors through", async () => {
      const error = new Error("Delete failed");
      mockRepository.findById.mockResolvedValue(mockNotification);
      mockRepository.delete.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow("Delete failed");
    });
  });
});
