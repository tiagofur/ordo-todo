import { GetAttachmentsByUserUseCase, GetAttachmentsByUserInput } from "../usecase/get-attachments-by-user.usecase";
import { AttachmentRepository } from "../provider/attachment.repository";
import { Attachment } from "../model/attachment.entity";

describe("GetAttachmentsByUserUseCase", () => {
  let useCase: GetAttachmentsByUserUseCase;
  let mockRepository: jest.Mocked<AttachmentRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByTaskId: jest.fn(),
      findByUserId: jest.fn(),
      findByMimeType: jest.fn(),
      delete: jest.fn(),
      countByTaskId: jest.fn(),
      getTotalSizeByTaskId: jest.fn(),
    };
    useCase = new GetAttachmentsByUserUseCase(mockRepository);
  });

  const validInput: GetAttachmentsByUserInput = {
    userId: "user-456",
  };

  describe("execute()", () => {
    it("should get attachments by user successfully", async () => {
      const attachments = [
        Attachment.create({
          taskId: "task-123",
          userId: "user-456",
          fileName: "file1.pdf",
          originalName: "document1.pdf",
          mimeType: "application/pdf",
          size: 1024000,
          storagePath: "/uploads/file1.pdf",
        }),
        Attachment.create({
          taskId: "task-456",
          userId: "user-456",
          fileName: "file2.jpg",
          originalName: "photo.jpg",
          mimeType: "image/jpeg",
          size: 524288,
          storagePath: "/uploads/file2.jpg",
        }),
      ];
      mockRepository.findByUserId.mockResolvedValue(attachments);

      const result = await useCase.execute(validInput);

      expect(result).toEqual(attachments);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(validInput.userId);
    });

    it("should return empty array if user has no attachments", async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute(validInput);

      expect(result).toEqual([]);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(validInput.userId);
    });

    it("should throw error if userId is missing", async () => {
      const invalidInput = { ...validInput, userId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findByUserId).not.toHaveBeenCalled();
    });

    it("should throw error if userId is only whitespace", async () => {
      const invalidInput = { ...validInput, userId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findByUserId).not.toHaveBeenCalled();
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findByUserId.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle single attachment", async () => {
      const attachments = [
        Attachment.create({
          taskId: "task-123",
          userId: "user-456",
          fileName: "file.pdf",
          originalName: "document.pdf",
          mimeType: "application/pdf",
          size: 1024000,
          storagePath: "/uploads/file.pdf",
        }),
      ];
      mockRepository.findByUserId.mockResolvedValue(attachments);

      const result = await useCase.execute(validInput);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Attachment);
    });

    it("should return attachments for different tasks", async () => {
      const attachments = [
        Attachment.create({
          taskId: "task-123",
          userId: "user-456",
          fileName: "file1.pdf",
          originalName: "document1.pdf",
          mimeType: "application/pdf",
          size: 1024000,
          storagePath: "/uploads/file1.pdf",
        }),
        Attachment.create({
          taskId: "task-789",
          userId: "user-456",
          fileName: "file2.pdf",
          originalName: "document2.pdf",
          mimeType: "application/pdf",
          size: 512000,
          storagePath: "/uploads/file2.pdf",
        }),
      ];
      mockRepository.findByUserId.mockResolvedValue(attachments);

      const result = await useCase.execute(validInput);

      expect(result).toHaveLength(2);
      expect(result[0].taskId).toBe("task-123");
      expect(result[1].taskId).toBe("task-789");
    });
  });
});
