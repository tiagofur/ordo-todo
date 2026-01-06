import { GetCommentsByUserUseCase, GetCommentsByUserInput } from "../usecase/get-comments-by-user.usecase";
import { CommentRepository } from "../provider/comment.repository";
import { Comment } from "../model/comment.entity";

describe("GetCommentsByUserUseCase", () => {
  let useCase: GetCommentsByUserUseCase;
  let mockRepository: jest.Mocked<CommentRepository>;
  let mockComments: Comment[];

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

    // Create mock comments by the same user
    mockComments = [
      Comment.create({
        taskId: "task-123",
        userId: "user-456",
        content: "First comment by user",
      }),
      Comment.create({
        taskId: "task-456",
        userId: "user-456",
        content: "Second comment by user",
      }),
    ];

    useCase = new GetCommentsByUserUseCase(mockRepository);
  });

  describe("execute()", () => {
    it("should return comments by a user", async () => {
      mockRepository.findByUserId.mockResolvedValue(mockComments);

      const input: GetCommentsByUserInput = { userId: "user-456" };
      const result = await useCase.execute(input);

      expect(result).toEqual(mockComments);
      expect(result.length).toBe(2);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith("user-456");
    });

    it("should return empty array if user has no comments", async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const input: GetCommentsByUserInput = { userId: "user-456" };
      const result = await useCase.execute(input);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should throw error if userId is missing", async () => {
      const input: GetCommentsByUserInput = { userId: "" };

      await expect(useCase.execute(input)).rejects.toThrow("User ID is required");
      expect(mockRepository.findByUserId).not.toHaveBeenCalled();
    });

    it("should throw error if userId is only whitespace", async () => {
      const input: GetCommentsByUserInput = { userId: "   " };

      await expect(useCase.execute(input)).rejects.toThrow("User ID is required");
    });

    it("should pass repository errors through", async () => {
      const dbError = new Error("Database connection failed");
      mockRepository.findByUserId.mockRejectedValue(dbError);

      const input: GetCommentsByUserInput = { userId: "user-456" };

      await expect(useCase.execute(input)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should return comments with all properties", async () => {
      mockRepository.findByUserId.mockResolvedValue(mockComments);

      const input: GetCommentsByUserInput = { userId: "user-456" };
      const result = await useCase.execute(input);

      expect(result[0]).toBeInstanceOf(Comment);
      expect(result[0].userId).toBe("user-456");
      expect(result[0].taskId).toBe("task-123");
      expect(result[0].content).toBe("First comment by user");
    });

    it("should handle comments with mentions", async () => {
      const commentWithMentions = Comment.create({
        taskId: "task-123",
        userId: "user-456",
        content: "Hey @user-789",
        mentions: ["user-789"],
      });

      mockRepository.findByUserId.mockResolvedValue([commentWithMentions]);

      const input: GetCommentsByUserInput = { userId: "user-456" };
      const result = await useCase.execute(input);

      expect(result[0].mentions).toEqual(["user-789"]);
    });

    it("should handle edited comments", async () => {
      const editedComment = Comment.create({
        taskId: "task-123",
        userId: "user-456",
        content: "Original content",
      });
      const updatedComment = editedComment.edit("Updated content");

      mockRepository.findByUserId.mockResolvedValue([updatedComment]);

      const input: GetCommentsByUserInput = { userId: "user-456" };
      const result = await useCase.execute(input);

      expect(result[0].isEdited).toBe(true);
      expect(result[0].editedAt).toBeInstanceOf(Date);
    });
  });
});
