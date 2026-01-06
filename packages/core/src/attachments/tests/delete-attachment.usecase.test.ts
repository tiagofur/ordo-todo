import { DeleteAttachmentUseCase, DeleteAttachmentInput } from "../usecase/delete-attachment.usecase";
import { AttachmentRepository } from "../provider/attachment.repository";
import { Attachment } from "../model/attachment.entity";

describe("DeleteAttachmentUseCase", () => {
  let useCase: DeleteAttachmentUseCase;
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
    useCase = new DeleteAttachmentUseCase(mockRepository);
  });

  const validInput: DeleteAttachmentInput = {
    attachmentId: "attachment-123",
    userId: "user-456",
  };

  describe("execute()", () => {
    it("should delete attachment successfully", async () => {
      const existingAttachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "file.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/file.pdf",
      });
      mockRepository.findById.mockResolvedValue(existingAttachment);
      mockRepository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute(validInput)).resolves.toBeUndefined();

      expect(mockRepository.findById).toHaveBeenCalledWith(validInput.attachmentId);
      expect(mockRepository.delete).toHaveBeenCalledWith(validInput.attachmentId);
    });

    it("should throw error if attachmentId is missing", async () => {
      const invalidInput = { ...validInput, attachmentId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Attachment ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if attachmentId is only whitespace", async () => {
      const invalidInput = { ...validInput, attachmentId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Attachment ID is required",
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

    it("should throw error if userId is only whitespace", async () => {
      const invalidInput = { ...validInput, userId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "User ID is required",
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if attachment not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Attachment not found",
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(validInput.attachmentId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if user is not the uploader", async () => {
      const existingAttachment = Attachment.create({
        taskId: "task-123",
        userId: "user-789", // Different user
        fileName: "file.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/file.pdf",
      });
      mockRepository.findById.mockResolvedValue(existingAttachment);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "You can only delete your own attachments",
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should allow deletion by the uploader", async () => {
      const existingAttachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456", // Same as input userId
        fileName: "file.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/file.pdf",
      });
      mockRepository.findById.mockResolvedValue(existingAttachment);
      mockRepository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute(validInput)).resolves.toBeUndefined();

      expect(mockRepository.delete).toHaveBeenCalledWith(validInput.attachmentId);
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should pass delete errors through", async () => {
      const existingAttachment = Attachment.create({
        taskId: "task-123",
        userId: "user-456",
        fileName: "file.pdf",
        originalName: "document.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        storagePath: "/uploads/file.pdf",
      });
      mockRepository.findById.mockResolvedValue(existingAttachment);
      const error = new Error("Delete failed");
      mockRepository.delete.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow("Delete failed");
    });
  });
});
