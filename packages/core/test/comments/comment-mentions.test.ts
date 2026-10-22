import { describe, it, expect, jest } from "@jest/globals";
import { Comment } from "../../src/comments/model/comment.entity";
import { UpdateCommentUseCase } from "../../src/comments/usecase/update-comment.usecase";

describe("Comment mentions (ODD 018 S2 / W2-W3)", () => {
  const base = { taskId: "task-1", userId: "user-1", content: "hello" };

  const buildComment = (props: Partial<Parameters<typeof Comment.create>[0]> = {}) => {
    const comment = Comment.create({ ...base, ...props });
    (comment.id as string) = "comment-1";
    return comment;
  };

  it("withMentions replaces the mention set and dedupes", () => {
    const comment = buildComment({ mentions: ["user-2"] });
    const updated = comment.withMentions(["user-2", "user-2", "user-3"]);

    expect(updated.props.mentions).toEqual(["user-2", "user-3"]);
    // Immutable: original untouched
    expect(comment.props.mentions).toEqual(["user-2"]);
  });

  it("withMentions can clear all mentions", () => {
    const comment = buildComment({ mentions: ["user-2"] });

    expect(comment.withMentions([]).props.mentions).toEqual([]);
  });

  it("edit() preserves existing mentions", () => {
    const comment = buildComment({ mentions: ["user-2"] });
    const edited = comment.edit("edited content");

    expect(edited.props.mentions).toEqual(["user-2"]);
    expect(edited.props.isEdited).toBe(true);
  });

  it("update use case persists re-resolved mentions together with the edit", async () => {
    const existing = buildComment({ mentions: ["user-2"] });
    const repository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(undefined),
    };

    const result = await new UpdateCommentUseCase(
      repository as never,
    ).execute({
      commentId: "comment-1",
      userId: "user-1",
      newContent: "new content",
      newMentions: ["user-2", "user-3"],
    });

    expect(result.props.mentions).toEqual(["user-2", "user-3"]);
    expect(result.props.content).toBe("new content");
    expect(repository.update).toHaveBeenCalledWith(result);
  });

  it("update use case keeps mentions untouched when none are provided", async () => {
    const existing = buildComment({ mentions: ["user-2"] });
    const repository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(undefined),
    };

    const result = await new UpdateCommentUseCase(
      repository as never,
    ).execute({
      commentId: "comment-1",
      userId: "user-1",
      newContent: "new content",
    });

    expect(result.props.mentions).toEqual(["user-2"]);
  });
});
