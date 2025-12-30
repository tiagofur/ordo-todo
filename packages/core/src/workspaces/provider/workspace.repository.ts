import { Workspace } from "../model/workspace.entity";
import { WorkspaceMember, MemberRole } from "../model/workspace-member.entity";

export interface MemberWithUser {
  userId: string;
  role: MemberRole;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export interface WorkspaceRepository {
  create(workspace: Workspace): Promise<Workspace>;
  findById(id: string): Promise<Workspace | null>;
  findBySlug(slug: string): Promise<Workspace | null>;
  findByOwnerId(ownerId: string): Promise<Workspace[]>;
  findByUserId(userId: string): Promise<Workspace[]>;
  findDeleted(userId: string): Promise<Workspace[]>;
  update(workspace: Workspace): Promise<Workspace>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  permanentDelete(id: string): Promise<void>;

  // Member management
  addMember(member: WorkspaceMember): Promise<WorkspaceMember>;
  removeMember(workspaceId: string, userId: string): Promise<void>;
  findMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null>;
  listMembers(workspaceId: string): Promise<WorkspaceMember[]>;
  listMembersWithUser(workspaceId: string): Promise<MemberWithUser[]>;
}
