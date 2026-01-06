import { CreateNotificationUseCase, CreateNotificationInput } from "../usecase/create-notification.usecase";
import { NotificationRepository } from "../provider/notification.repository";
import { Notification, NotificationType, ResourceType } from "../model/notification.entity";

describe("CreateNotificationUseCase", () => {
  let useCase: CreateNotificationUseCase;
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
    useCase = new CreateNotificationUseCase(mockRepository);
  });

  const validInput: CreateNotificationInput = {
    userId: "user-123",
    type: NotificationType.TASK_ASSIGNED,
    title: "New task assigned",
    message: "You have been assigned to a new task",
  };

  describe("execute()", () => {
    it("should create a notification successfully", async () => {
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(validInput);

      expect(result).toBeInstanceOf(Notification);
      expect(result.userId).toBe(validInput.userId);
      expect(result.type).toBe(validInput.type);
      expect(result.title).toBe(validInput.title);
      expect(result.message).toBe(validInput.message);
      expect(result.isRead).toBe(false);
      expect(mockRepository.create).toHaveBeenCalledWith(result);
    });

    it("should create a notification with message", async () => {
      const inputWithMessage: CreateNotificationInput = {
        ...validInput,
        message: "Test message",
      };
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(inputWithMessage);

      expect(result.message).toBe("Test message");
    });

    it("should create a notification with resourceId and resourceType", async () => {
      const inputWithResource: CreateNotificationInput = {
        ...validInput,
        resourceId: "task-456",
        resourceType: ResourceType.TASK,
      };
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(inputWithResource);

      expect(result.resourceId).toBe("task-456");
      expect(result.resourceType).toBe(ResourceType.TASK);
    });

    it("should create a notification with metadata", async () => {
      const metadata = { workspaceId: "ws-789" };
      const inputWithMetadata: CreateNotificationInput = {
        ...validInput,
        metadata,
      };
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(inputWithMetadata);

      expect(result.metadata).toEqual(metadata);
    });

    it("should create a notification with null resourceId if not provided", async () => {
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(validInput);

      expect(result.resourceId).toBeNull();
    });

    it("should create a notification with null resourceType if not provided", async () => {
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(validInput);

      expect(result.resourceType).toBeNull();
    });

    it("should create a notification with null metadata if not provided", async () => {
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(validInput);

      expect(result.metadata).toBeNull();
    });

    it("should create a notification with null message if not provided", async () => {
      const inputWithoutMessage: CreateNotificationInput = {
        userId: "user-123",
        type: NotificationType.TASK_ASSIGNED,
        title: "New task assigned",
      };
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(inputWithoutMessage);

      expect(result.message).toBeUndefined();
    });

    it("should trim title whitespace", async () => {
      const inputWithWhitespace: CreateNotificationInput = {
        ...validInput,
        title: "  New task assigned  ",
      };
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(inputWithWhitespace);

      expect(result.title).toBe("New task assigned");
    });

    it("should trim message whitespace", async () => {
      const inputWithWhitespace: CreateNotificationInput = {
        ...validInput,
        message: "  Test message  ",
      };
      mockRepository.create.mockResolvedValue({} as unknown as Notification);

      const result = await useCase.execute(inputWithWhitespace);

      expect(result.message).toBe("Test message");
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if userId is only whitespace", async () => {
      const invalidInput = { ...validInput, userId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if type is missing", async () => {
      const invalidInput = {
        ...validInput,
        type: undefined as unknown as NotificationType,
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Notification type is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if title is missing", async () => {
      const invalidInput = { ...validInput, title: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Notification title is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if title is only whitespace", async () => {
      const invalidInput = { ...validInput, title: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Notification title is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if title is too long", async () => {
      const invalidInput = {
        ...validInput,
        title: "a".repeat(201), // Max is 200
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if message is too long", async () => {
      const invalidInput = {
        ...validInput,
        message: "a".repeat(1001), // Max is 1000
      };

      await expect(useCase.execute(invalidInput)).rejects.toThrow();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.create.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle all notification types", async () => {
      const types: NotificationType[] = [
        NotificationType.TASK_ASSIGNED,
        NotificationType.COMMENT_ADDED,
        NotificationType.MENTIONED,
        NotificationType.DUE_DATE_APPROACHING,
        NotificationType.INVITATION_RECEIVED,
        NotificationType.SYSTEM,
      ];

      for (const type of types) {
        mockRepository.create.mockResolvedValue({} as unknown as Notification);

        const result = await useCase.execute({
          ...validInput,
          type,
        });

        expect(result.type).toBe(type);
      }
    });
  });
});
