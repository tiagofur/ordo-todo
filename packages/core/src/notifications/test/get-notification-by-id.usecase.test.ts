import { GetNotificationByIdUseCase, GetNotificationByIdInput } from "../usecase/get-notification-by-id.usecase";
import { NotificationRepository } from "../provider/notification.repository";
import { Notification, NotificationType } from "../model/notification.entity";

describe("GetNotificationByIdUseCase", () => {
  let useCase: GetNotificationByIdUseCase;
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
    useCase = new GetNotificationByIdUseCase(mockRepository);
  });

  const validInput: GetNotificationByIdInput = {
    notificationId: "notif-123",
    userId: "user-456",
  };

  const mockNotification = Notification.create({
    userId: "user-456",
    type: NotificationType.TASK_ASSIGNED,
    title: "New task assigned",
  });

  describe("execute()", () => {
    it("should get notification by id successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);

      const result = await useCase.execute(validInput);

      expect(result).not.toBeNull();
      expect(result).toBe(mockNotification);
      expect(mockRepository.findById).toHaveBeenCalledWith("notif-123");
    });

    it("should return null if notification is not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(validInput);

      expect(result).toBeNull();
    });

    it("should return null if user doesn't own the notification", async () => {
      const otherUsersNotification = Notification.create({
        userId: "user-789", // Different user
        type: NotificationType.TASK_ASSIGNED,
        title: "New task assigned",
      });
      mockRepository.findById.mockResolvedValue(otherUsersNotification);

      const result = await useCase.execute(validInput);

      expect(result).toBeNull();
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

    it("should trim whitespace from notificationId", async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);

      await useCase.execute({
        ...validInput,
        notificationId: "  notif-123  ",
      });

      expect(mockRepository.findById).toHaveBeenCalledWith("notif-123");
    });

    it("should trim whitespace from userId", async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);

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

    it("should verify ownership correctly", async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);

      const result = await useCase.execute({
        notificationId: "notif-123",
        userId: "user-456", // Correct owner
      });

      expect(result).not.toBeNull();
      expect(result?.userId).toBe("user-456");
    });
  });
});
