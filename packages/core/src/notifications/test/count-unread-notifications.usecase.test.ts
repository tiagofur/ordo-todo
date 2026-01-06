import { CountUnreadNotificationsUseCase, CountUnreadNotificationsInput } from "../usecase/count-unread-notifications.usecase";
import { NotificationRepository } from "../provider/notification.repository";

describe("CountUnreadNotificationsUseCase", () => {
  let useCase: CountUnreadNotificationsUseCase;
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
    useCase = new CountUnreadNotificationsUseCase(mockRepository);
  });

  const validInput: CountUnreadNotificationsInput = {
    userId: "user-123",
  };

  describe("execute()", () => {
    it("should count unread notifications successfully", async () => {
      mockRepository.countUnreadByUserId.mockResolvedValue(5);

      const result = await useCase.execute(validInput);

      expect(result.count).toBe(5);
      expect(mockRepository.countUnreadByUserId).toHaveBeenCalledWith("user-123");
    });

    it("should return count of 0 when no unread notifications", async () => {
      mockRepository.countUnreadByUserId.mockResolvedValue(0);

      const result = await useCase.execute(validInput);

      expect(result.count).toBe(0);
    });

    it("should handle large unread counts", async () => {
      mockRepository.countUnreadByUserId.mockResolvedValue(1000);

      const result = await useCase.execute(validInput);

      expect(result.count).toBe(1000);
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.countUnreadByUserId).not.toHaveBeenCalled();
    });

    it("should throw error if userId is only whitespace", async () => {
      const invalidInput = { ...validInput, userId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.countUnreadByUserId).not.toHaveBeenCalled();
    });

    it("should trim whitespace from userId", async () => {
      mockRepository.countUnreadByUserId.mockResolvedValue(3);

      await useCase.execute({
        ...validInput,
        userId: "  user-123  ",
      });

      expect(mockRepository.countUnreadByUserId).toHaveBeenCalledWith("user-123");
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.countUnreadByUserId.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should return count in correct format", async () => {
      mockRepository.countUnreadByUserId.mockResolvedValue(42);

      const result = await useCase.execute(validInput);

      expect(result).toEqual({ count: 42 });
      expect(typeof result.count).toBe("number");
    });
  });
});
