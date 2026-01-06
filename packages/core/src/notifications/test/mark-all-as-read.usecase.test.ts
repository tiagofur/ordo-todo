import { MarkAllAsReadUseCase, MarkAllAsReadInput } from "../usecase/mark-all-as-read.usecase";
import { NotificationRepository } from "../provider/notification.repository";

describe("MarkAllAsReadUseCase", () => {
  let useCase: MarkAllAsReadUseCase;
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
    useCase = new MarkAllAsReadUseCase(mockRepository);
  });

  const validInput: MarkAllAsReadInput = {
    userId: "user-123",
  };

  describe("execute()", () => {
    it("should mark all notifications as read successfully", async () => {
      mockRepository.countUnreadByUserId.mockResolvedValue(5);
      mockRepository.markAllAsRead.mockResolvedValue(undefined);

      const result = await useCase.execute(validInput);

      expect(result.count).toBe(5);
      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith("user-123");
    });

    it("should return count of 0 when no unread notifications", async () => {
      mockRepository.countUnreadByUserId.mockResolvedValue(0);
      mockRepository.markAllAsRead.mockResolvedValue(undefined);

      const result = await useCase.execute(validInput);

      expect(result.count).toBe(0);
      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith("user-123");
    });

    it("should handle large unread counts", async () => {
      mockRepository.countUnreadByUserId.mockResolvedValue(1000);
      mockRepository.markAllAsRead.mockResolvedValue(undefined);

      const result = await useCase.execute(validInput);

      expect(result.count).toBe(1000);
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.markAllAsRead).not.toHaveBeenCalled();
    });

    it("should throw error if userId is only whitespace", async () => {
      const invalidInput = { ...validInput, userId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.markAllAsRead).not.toHaveBeenCalled();
    });

    it("should trim whitespace from userId", async () => {
      mockRepository.countUnreadByUserId.mockResolvedValue(3);
      mockRepository.markAllAsRead.mockResolvedValue(undefined);

      await useCase.execute({
        ...validInput,
        userId: "  user-123  ",
      });

      expect(mockRepository.countUnreadByUserId).toHaveBeenCalledWith("user-123");
      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith("user-123");
    });

    it("should pass repository errors from count through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.countUnreadByUserId.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
      expect(mockRepository.markAllAsRead).not.toHaveBeenCalled();
    });

    it("should pass repository errors from markAllAsRead through", async () => {
      const error = new Error("Update failed");
      mockRepository.countUnreadByUserId.mockResolvedValue(5);
      mockRepository.markAllAsRead.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow("Update failed");
    });
  });
});
