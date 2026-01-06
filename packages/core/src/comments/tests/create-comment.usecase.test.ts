import { CreateCommentUseCase, CreateCommentInput } from "../usecase/create-comment.usecase";
import { CommentRepository } from "../provider/comment.repository";
import { Comment } from "../model/comment.entity";

describe("CreateCommentUseCase", () => {
  let useCase: CreateCommentUseCase;
  let mockRepository: jest.Mocked<CommentRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByTaskId: jest.fn(),
      findByUserId: jest.fn(),
      findByParentCommentId: jest.fn(),
      findMentionsForUser: jest.fn(),
      delete: jest.fn(),
      countByTaskId: jest.fn(),
      findMentionsForUserInTask: jest.fn(),
    };
    useCase = new CreateCommentUseCase(mockRepository);
  });

  const validInput: CreateCommentInput = {
    taskId: "task-123",
    userId: "user-456",
    content: "This is a test comment",
  };

  describe("execute()", () => {
    it("should create a comment successfully", async () => {
      mockRepository.create.mockResolvedValue({} as unknown as Comment);

      const result = await useCase.execute(validInput);

      expect(result).toBeInstanceOf(Comment);
      expect(result.taskId).toBe(validInput.taskId);
      expect(result.userId).toBe(validInput.userId);
      expect(result.content).toBe(validInput.content);
      expect(mockRepository.create).toHaveBeenCalledWith(result);
    });

    it("should create a comment with mentions", async () => {
      const inputWithMentions: CreateCommentInput = {
        ...validInput,
        mentions: ["user-789", "user-abc"],
      };
      mockRepository.create.mockResolvedValue({} as unknown as Comment);

      const result = await useCase.execute(inputWithMentions);

      expect(result.mentions).toEqual(["user-789", "user-abc"]);
    });

    it("should create a comment with parentCommentId", async () => {
      const inputWithParent: CreateCommentInput = {
        ...validInput,
        parentCommentId: "comment-123",
      };
      mockRepository.create.mockResolvedValue({} as unknown as Comment);

      const result = await useCase.execute(inputWithParent);

      expect(result.parentCommentId).toBe("comment-123");
    });

    it("should create a comment with empty mentions array", async () => {
      mockRepository.create.mockResolvedValue({} as unknown as Comment);

      const result = await useCase.execute(validInput);

      expect(result.mentions).toEqual([]);
    });

    it("should trim content whitespace", async () => {
      const inputWithWhitespace: CreateCommentInput = {
        ...validInput,
        content: "  This is a test comment  ",
      };
      mockRepository.create.mockResolvedValue({} as unknown as Comment);

      const result = await useCase.execute(inputWithWhitespace);

      expect(result.content).toBe("This is a test comment");
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

    it("should throw error if content is missing", async () => {
      const invalidInput = { ...validInput, content: "" };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Comment content is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if content is only whitespace", async () => {
      const invalidInput = { ...validInput, content: "   " };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        "Comment content is required",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if content is too long", async () => {
      const invalidInput = {
        ...validInput,
        content: "a".repeat(2001), // Max is 2000
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

    it("should set default values for optional fields", async () => {
      const minimalInput: CreateCommentInput = {
        taskId: "task-123",
        userId: "user-456",
        content: "Test comment",
      };
      mockRepository.create.mockResolvedValue({} as unknown as Comment);

      const result = await useCase.execute(minimalInput);

      expect(result.parentCommentId).toBeNull();
      expect(result.mentions).toEqual([]);
      expect(result.isEdited).toBe(false);
    });

    it("should accept null parentCommentId", async () => {
      const inputWithNull: CreateCommentInput = {
        ...validInput,
        parentCommentId: null,
      };
      mockRepository.create.mockResolvedValue({} as unknown as Comment);

      const result = await useCase.execute(inputWithNull);

      expect(result.parentCommentId).toBeNull();
    });

    it("should accept undefined mentions", async () => {
      const inputWithoutMentions: CreateCommentInput = {
        ...validInput,
        mentions: undefined,
      };
      mockRepository.create.mockResolvedValue({} as unknown as Comment);

      const result = await useCase.execute(inputWithoutMentions);

      expect(result.mentions).toEqual([]);
    });
  });
});
