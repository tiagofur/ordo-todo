import { describe, it, expect, jest } from "@jest/globals";
import { ChangeMemberRoleUseCase } from "../../src/workspaces/usecase/change-member-role.usecase";
import { CancelInvitationUseCase } from "../../src/workspaces/usecase/cancel-invitation.usecase";
import { LeaveWorkspaceUseCase } from "../../src/workspaces/usecase/leave-workspace.usecase";

describe("Member lifecycle use cases (ODD 018 S3 / W5-W6)", () => {
  const workspace = { id: "ws-1", props: { id: "ws-1", ownerId: "owner-1" } };
  const member = {
    id: "member-2",
    props: { id: "member-2", workspaceId: "ws-1", userId: "user-2", role: "MEMBER" },
  };

  describe("ChangeMemberRoleUseCase (W5)", () => {
    const buildRepo = () => ({
      workspaceRepository: {
        findById: jest.fn().mockResolvedValue(workspace),
        findMember: jest.fn().mockResolvedValue(member),
      },
      workspaceMemberRepository: {
        updateRole: jest.fn().mockResolvedValue(member),
      },
    });

    it("updates the role through the member repository", async () => {
      const repos = buildRepo();
      await new ChangeMemberRoleUseCase(
        repos.workspaceRepository as never,
        repos.workspaceMemberRepository as never,
      ).execute("ws-1", "owner-1", "user-2", "VIEWER");

      expect(repos.workspaceMemberRepository.updateRole).toHaveBeenCalledWith(
        "member-2",
        "VIEWER",
      );
    });

    it.each(["OWNER"] as const)(
      "rejects assigning %s (ownership has no transfer flow)",
      async (role) => {
        const repos = buildRepo();
        await expect(
          new ChangeMemberRoleUseCase(
            repos.workspaceRepository as never,
            repos.workspaceMemberRepository as never,
          ).execute("ws-1", "owner-1", "user-2", role),
        ).rejects.toThrow("Cannot assign the OWNER role");
      },
    );

    it("rejects changing the owner's role", async () => {
      const repos = buildRepo();
      await expect(
        new ChangeMemberRoleUseCase(
          repos.workspaceRepository as never,
          repos.workspaceMemberRepository as never,
        ).execute("ws-1", "user-2", "owner-1", "MEMBER"),
      ).rejects.toThrow("Cannot change the owner role");
    });

    it("rejects changing your own role", async () => {
      const repos = buildRepo();
      await expect(
        new ChangeMemberRoleUseCase(
          repos.workspaceRepository as never,
          repos.workspaceMemberRepository as never,
        ).execute("ws-1", "user-2", "user-2", "VIEWER"),
      ).rejects.toThrow("Cannot change your own role");
    });
  });

  describe("CancelInvitationUseCase (W5)", () => {
    it("cancels a pending invitation of the route workspace", async () => {
      const invitation = {
        props: { id: "inv-1", workspaceId: "ws-1", status: "PENDING" },
        cancel: jest.fn().mockReturnThis(),
      };
      const repository = {
        findById: jest.fn().mockResolvedValue(invitation),
        update: jest.fn().mockResolvedValue(undefined),
      };

      await new CancelInvitationUseCase(repository as never).execute(
        "ws-1",
        "inv-1",
      );

      expect(invitation.cancel).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(invitation);
    });

    it("treats a foreign-workspace invitation as not found (B1)", async () => {
      const repository = {
        findById: jest.fn().mockResolvedValue({
          props: { id: "inv-2", workspaceId: "other-ws", status: "PENDING" },
          cancel: jest.fn(),
        }),
        update: jest.fn(),
      };

      await expect(
        new CancelInvitationUseCase(repository as never).execute(
          "ws-1",
          "inv-2",
        ),
      ).rejects.toThrow("Invitation not found");
      expect(repository.update).not.toHaveBeenCalled();
    });

    it("rejects cancelling a non-pending invitation", async () => {
      const repository = {
        findById: jest.fn().mockResolvedValue({
          props: { id: "inv-2", workspaceId: "ws-1", status: "ACCEPTED" },
          cancel: jest.fn(),
        }),
        update: jest.fn(),
      };

      await expect(
        new CancelInvitationUseCase(repository as never).execute(
          "ws-1",
          "inv-2",
        ),
      ).rejects.toThrow("Invitation is not pending");
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe("LeaveWorkspaceUseCase (W6)", () => {
    it("removes the member", async () => {
      const repository = {
        findById: jest.fn().mockResolvedValue(workspace),
        findMember: jest.fn().mockResolvedValue(member),
        removeMember: jest.fn().mockResolvedValue(undefined),
      };

      await new LeaveWorkspaceUseCase(repository as never).execute(
        "ws-1",
        "user-2",
      );

      expect(repository.removeMember).toHaveBeenCalledWith("ws-1", "user-2");
    });

    it("blocks the owner from leaving (W6)", async () => {
      const repository = {
        findById: jest.fn().mockResolvedValue(workspace),
        findMember: jest.fn().mockResolvedValue({
          id: "m-owner",
          props: { id: "m-owner", workspaceId: "ws-1", userId: "owner-1", role: "OWNER" },
        }),
        removeMember: jest.fn(),
      };

      await expect(
        new LeaveWorkspaceUseCase(repository as never).execute(
          "ws-1",
          "owner-1",
        ),
      ).rejects.toThrow("The workspace owner cannot leave");
      expect(repository.removeMember).not.toHaveBeenCalled();
    });

    it("blocks an OWNER-row member when ownerId is null (nullable edge)", async () => {
      const repository = {
        findById: jest.fn().mockResolvedValue({
          id: "ws-x",
          props: { id: "ws-x", ownerId: null },
        }),
        findMember: jest.fn().mockResolvedValue({
          id: "m-owner",
          props: { id: "m-owner", workspaceId: "ws-x", userId: "user-o", role: "OWNER" },
        }),
        removeMember: jest.fn(),
      };

      await expect(
        new LeaveWorkspaceUseCase(repository as never).execute(
          "ws-x",
          "user-o",
        ),
      ).rejects.toThrow("The workspace owner cannot leave");
      expect(repository.removeMember).not.toHaveBeenCalled();
    });

    it("rejects a non-member", async () => {
      const repository = {
        findById: jest.fn().mockResolvedValue(workspace),
        findMember: jest.fn().mockResolvedValue(null),
        removeMember: jest.fn(),
      };

      await expect(
        new LeaveWorkspaceUseCase(repository as never).execute("ws-1", "ghost"),
      ).rejects.toThrow("User is not a member of this workspace");
    });
  });
});
