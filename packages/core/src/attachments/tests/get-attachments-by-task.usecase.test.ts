import { GetAttachmentsByTaskUseCase, GetAttachmentsByTaskInput } from "../usecase/get-attachments-by-task.usecase";
import { AttachmentRepository } from "../provider/attachment.repository";
import { Attachment } from "../model/attachment.entity";

describe("GetAttachmentsByTaskUseCase", () => {
  let useCase: GetAttachmentsByTaskUseCase;
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
    useCase = new GetAttachmentsByTaskUseCase(mockRepository);
  });

  const validInput: GetAttachmentsByTaskInput = {
    taskId: "task-123",
  };

  describe("execute()", () => {
    it("should get attachments by task successfully", async () => {
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
          taskId: "task-123",
          userId: "user-456",
          fileName: "file2.jpg",
          originalName: "photo.jpg",
          mimeType: "image/jpeg",
          size: 524288,
          storagePath: "/uploads/file2.jpg",
        }),
      ];
      mockRepository.findByTaskId.mockResolvedValue(attachments);

      const result = await useCase.execute(validInput);

      expect(result).toEqual(attachments);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByTaskId).toHaveBeenCalledWith(validInput.taskId);
    });

    it("should return empty array if no attachments found", async () => {
      mockRepository.findByTaskId.mockResolvedValue([]);

      const result = await useCase.execute(validInput);

      expect(result).toEqual([]);
      expect(mockRepository.findByTaskId).toHaveBeenCalledWith(validInput.taskId);
    });

    it("should throw error if taskId is missing", async () => {
      const invalidInput = { ...validInput, taskId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Task ID is required",
      );
      expect(mockRepository.findByTaskId).not.toHaveBeenCalled();
    });

    it("should throw error if taskId is only whitespace", async () => {
      const invalidInput = { ...validInput, taskId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Task ID is required",
      );
      expect(mockRepository.findByTaskId).not.toHaveBeenCalled();
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findByTaskId.mockRejectedValue(error);

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
      mockRepository.findByTaskId.mockResolvedValue(attachments);

      const result = await useCase.execute(validInput);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Attachment);
    });
  });
});
