import { GetCommentsByTaskUseCase, GetCommentsByTaskInput } from "../usecase/get-comments-by-task.usecase";
import { CommentRepository } from "../provider/comment.repository";
import { Comment } from "../model/comment.entity";

describe("GetCommentsByTaskUseCase", () => {
  let useCase: GetCommentsByTaskUseCase;
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

    // Create mock comments
    mockComments = [
      Comment.create({
        taskId: "task-123",
        userId: "user-456",
        content: "First comment",
      }),
      Comment.create({
        taskId: "task-123",
        userId: "user-789",
        content: "Second comment",
      }),
    ];

    useCase = new GetCommentsByTaskUseCase(mockRepository);
  });

  describe("execute()", () => {
    it("should return comments for a task", async () => {
      mockRepository.findByTaskId.mockResolvedValue(mockComments);

      const input: GetCommentsByTaskInput = { taskId: "task-123" };
      const result = await useCase.execute(input);

      expect(result).toEqual(mockComments);
      expect(result.length).toBe(2);
      expect(mockRepository.findByTaskId).toHaveBeenCalledWith("task-123");
    });

    it("should return empty array if no comments exist", async () => {
      mockRepository.findByTaskId.mockResolvedValue([]);

      const input: GetCommentsByTaskInput = { taskId: "task-123" };
      const result = await useCase.execute(input);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should throw error if taskId is missing", async () => {
      const input: GetCommentsByTaskInput = { taskId: "" };

      await expect(useCase.execute(input)).rejects.toThrow("Task ID is required");
      expect(mockRepository.findByTaskId).not.toHaveBeenCalled();
    });

    it("should throw error if taskId is only whitespace", async () => {
      const input: GetCommentsByTaskInput = { taskId: "   " };

      await expect(useCase.execute(input)).rejects.toThrow("Task ID is required");
    });

    it("should pass repository errors through", async () => {
      const dbError = new Error("Database connection failed");
      mockRepository.findByTaskId.mockRejectedValue(dbError);

      const input: GetCommentsByTaskInput = { taskId: "task-123" };

      await expect(useCase.execute(input)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should return comments with all properties", async () => {
      mockRepository.findByTaskId.mockResolvedValue(mockComments);

      const input: GetCommentsByTaskInput = { taskId: "task-123" };
      const result = await useCase.execute(input);

      expect(result[0]).toBeInstanceOf(Comment);
      expect(result[0].taskId).toBe("task-123");
      expect(result[0].userId).toBe("user-456");
      expect(result[0].content).toBe("First comment");
    });

    it("should handle comments with mentions", async () => {
      const commentWithMentions = Comment.create({
        taskId: "task-123",
        userId: "user-456",
        content: "Hey @user-789",
        mentions: ["user-789"],
      });

      mockRepository.findByTaskId.mockResolvedValue([commentWithMentions]);

      const input: GetCommentsByTaskInput = { taskId: "task-123" };
      const result = await useCase.execute(input);

      expect(result[0].mentions).toEqual(["user-789"]);
    });

    it("should handle threaded comments (replies)", async () => {
      const replyComment = Comment.create({
        taskId: "task-123",
        userId: "user-456",
        content: "Reply to comment",
        parentCommentId: "comment-123",
      });

      mockRepository.findByTaskId.mockResolvedValue([replyComment]);

      const input: GetCommentsByTaskInput = { taskId: "task-123" };
      const result = await useCase.execute(input);

      expect(result[0].isReply()).toBe(true);
      expect(result[0].parentCommentId).toBe("comment-123");
    });
  });
});
