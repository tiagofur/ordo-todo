import { GetNotificationsByTypeUseCase, GetNotificationsByTypeInput } from "../usecase/get-notifications-by-type.usecase";
import { NotificationRepository } from "../provider/notification.repository";
import { Notification, NotificationType } from "../model/notification.entity";

describe("GetNotificationsByTypeUseCase", () => {
  let useCase: GetNotificationsByTypeUseCase;
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
    useCase = new GetNotificationsByTypeUseCase(mockRepository);
  });

  const validInput: GetNotificationsByTypeInput = {
    userId: "user-123",
    type: NotificationType.TASK_ASSIGNED,
  };

  describe("execute()", () => {
    it("should get notifications by type successfully", async () => {
      const notifications = [
        Notification.create({
          userId: "user-123",
          type: NotificationType.TASK_ASSIGNED,
          title: "Task assigned 1",
        }),
        Notification.create({
          userId: "user-123",
          type: NotificationType.TASK_ASSIGNED,
          title: "Task assigned 2",
        }),
      ];
      mockRepository.findByType.mockResolvedValue(notifications);

      const result = await useCase.execute(validInput);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(NotificationType.TASK_ASSIGNED);
      expect(mockRepository.findByType).toHaveBeenCalledWith("user-123", NotificationType.TASK_ASSIGNED);
    });

    it("should return empty array when no notifications of type", async () => {
      mockRepository.findByType.mockResolvedValue([]);

      const result = await useCase.execute(validInput);

      expect(result).toEqual([]);
    });

    it("should handle different notification types", async () => {
      const types: NotificationType[] = [
        NotificationType.TASK_ASSIGNED,
        NotificationType.COMMENT_ADDED,
        NotificationType.MENTIONED,
        NotificationType.DUE_DATE_APPROACHING,
        NotificationType.INVITATION_RECEIVED,
        NotificationType.SYSTEM,
      ];

      for (const type of types) {
        const notifications = [
          Notification.create({
            userId: "user-123",
            type,
            title: "Test notification",
          }),
        ];
        mockRepository.findByType.mockResolvedValue(notifications);

        const result = await useCase.execute({
          userId: "user-123",
          type,
        });

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(type);
      }
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findByType).not.toHaveBeenCalled();
    });

    it("should throw error if userId is only whitespace", async () => {
      const invalidInput = { ...validInput, userId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findByType).not.toHaveBeenCalled();
    });

    it("should throw error if type is missing", async () => {
      const invalidInput = {
        ...validInput,
        type: undefined as unknown as NotificationType,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Notification type is required",
      );
      expect(mockRepository.findByType).not.toHaveBeenCalled();
    });

    it("should trim whitespace from userId", async () => {
      mockRepository.findByType.mockResolvedValue([]);

      await useCase.execute({
        ...validInput,
        userId: "  user-123  ",
      });

      expect(mockRepository.findByType).toHaveBeenCalledWith("user-123", validInput.type);
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findByType.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});
