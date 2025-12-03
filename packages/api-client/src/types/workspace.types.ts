/**
 * Workspace-related types and DTOs
 */

export type WorkspaceType = 'PERSONAL' | 'WORK' | 'TEAM';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  type: WorkspaceType;
  color: string;
  icon: string | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    projectCount: number;
    taskCount: number;
    memberCount: number;
  };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface WorkspaceWithMembers extends Workspace {
  members: WorkspaceMember[];
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  type: WorkspaceType;
  color?: string;
  icon?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface AddMemberDto {
  userId: string;
  role: MemberRole;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: MemberRole;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: Date;
  invitedById?: string;
  createdAt: Date;
}

export interface InviteMemberDto {
  email: string;
  role?: MemberRole;
}

export interface AcceptInvitationDto {
  token: string;
}
