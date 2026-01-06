import { CreateAttachmentUseCase, CreateAttachmentInput } from "../usecase/create-attachment.usecase";
import { AttachmentRepository } from "../provider/attachment.repository";
import { Attachment } from "../model/attachment.entity";

describe("CreateAttachmentUseCase", () => {
  let useCase: CreateAttachmentUseCase;
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
    useCase = new CreateAttachmentUseCase(mockRepository);
  });

  const validInput: CreateAttachmentInput = {
    taskId: "task-123",
    userId: "user-456",
    fileName: "stored-name.pdf",
    originalName: "document.pdf",
    mimeType: "application/pdf",
    size: 1024000,
    storagePath: "/uploads/stored-name.pdf",
  };

  describe("execute()", () => {
    it("should create an attachment successfully", async () => {
      mockRepository.create.mockResolvedValue({} as unknown as Attachment);

      const result = await useCase.execute(validInput);

      expect(result).toBeInstanceOf(Attachment);
      expect(result.taskId).toBe(validInput.taskId);
      expect(result.userId).toBe(validInput.userId);
      expect(result.fileName).toBe(validInput.fileName);
      expect(result.originalName).toBe(validInput.originalName);
      expect(result.mimeType).toBe(validInput.mimeType);
      expect(result.size).toBe(validInput.size);
      expect(result.storagePath).toBe(validInput.storagePath);
      expect(mockRepository.create).toHaveBeenCalledWith(result);
    });

    it("should create an attachment with image MIME type", async () => {
      const inputWithImage: CreateAttachmentInput = {
        ...validInput,
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        originalName: "photo.jpg",
      };
      mockRepository.create.mockResolvedValue({} as unknown as Attachment);

      const result = await useCase.execute(inputWithImage);

      expect(result.mimeType).toBe("image/jpeg");
    });

    it("should trim whitespace from string fields", async () => {
      const inputWithWhitespace: CreateAttachmentInput = {
        ...validInput,
        taskId: "  task-123  ",
        userId: "  user-456  ",
        fileName: "  stored-name.pdf  ",
        originalName: "  document.pdf  ",
        mimeType: "  application/pdf  ",
        storagePath: "  /uploads/stored-name.pdf  ",
      };
      mockRepository.create.mockResolvedValue({} as unknown as Attachment);

      const result = await useCase.execute(inputWithWhitespace);

      expect(result.taskId).toBe("task-123");
      expect(result.userId).toBe("user-456");
      expect(result.fileName).toBe("stored-name.pdf");
      expect(result.originalName).toBe("document.pdf");
      expect(result.mimeType).toBe("application/pdf");
      expect(result.storagePath).toBe("/uploads/stored-name.pdf");
    });

    it("should throw error if taskId is missing", async () => {
      const invalidInput = { ...validInput, taskId: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Task ID is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if taskId is only whitespace", async () => {
      const invalidInput = { ...validInput, taskId: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Task ID is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
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

    it("should throw error if fileName is missing", async () => {
      const invalidInput = { ...validInput, fileName: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "File name is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if originalName is missing", async () => {
      const invalidInput = { ...validInput, originalName: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Original file name is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if mimeType is missing", async () => {
      const invalidInput = { ...validInput, mimeType: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "MIME type is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if size is not a positive number", async () => {
      const invalidInput = { ...validInput, size: 0 };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "File size must be a positive number",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if size is negative", async () => {
      const invalidInput = { ...validInput, size: -100 };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "File size must be a positive number",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if storagePath is missing", async () => {
      const invalidInput = { ...validInput, storagePath: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Storage path is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should pass repository errors through", async () => {
      const error = new Error("Database connection failed");
      mockRepository.create.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should set default values for optional fields", async () => {
      mockRepository.create.mockResolvedValue({} as unknown as Attachment);

      const result = await useCase.execute(validInput);

      expect(result.isUploaded).toBe(false);
    });
  });
});
