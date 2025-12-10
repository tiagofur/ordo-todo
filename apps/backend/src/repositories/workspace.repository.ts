import { Injectable } from '@nestjs/common';
import {
  Workspace as PrismaWorkspace,
  WorkspaceType as PrismaWorkspaceType,
  WorkspaceTier as PrismaWorkspaceTier,
  WorkspaceMember as PrismaWorkspaceMember,
  MemberRole as PrismaMemberRole,
} from '@prisma/client';
import {
  Workspace,
  WorkspaceRepository,
  WorkspaceType,
  WorkspaceTier,
  WorkspaceMember,
  MemberRole,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaWorkspace: PrismaWorkspace): Workspace {
    return new Workspace({
      id: prismaWorkspace.id,
      name: prismaWorkspace.name,
      slug: prismaWorkspace.slug,
      description: prismaWorkspace.description ?? undefined,
      type: this.mapTypeToDomain(prismaWorkspace.type),
      tier: this.mapTierToDomain(prismaWorkspace.tier),
      color: prismaWorkspace.color,
      icon: prismaWorkspace.icon ?? undefined,
      ownerId: prismaWorkspace.ownerId ?? undefined,
      isArchived: prismaWorkspace.isArchived,
      isDeleted: prismaWorkspace.isDeleted,
      deletedAt: prismaWorkspace.deletedAt ?? undefined,
      createdAt: prismaWorkspace.createdAt,
      updatedAt: prismaWorkspace.updatedAt,
    });
  }

  private toMemberDomain(prismaMember: PrismaWorkspaceMember): WorkspaceMember {
    return new WorkspaceMember({
      id: prismaMember.id,
      workspaceId: prismaMember.workspaceId,
      userId: prismaMember.userId,
      role: this.mapRoleToDomain(prismaMember.role),
      joinedAt: prismaMember.joinedAt,
    });
  }

  private mapTypeToDomain(type: PrismaWorkspaceType): WorkspaceType {
    switch (type) {
      case 'PERSONAL':
        return 'PERSONAL';
      case 'WORK':
        return 'WORK';
      case 'TEAM':
        return 'TEAM';
      default:
        return 'PERSONAL';
    }
  }

  private mapTypeToPrisma(type: WorkspaceType): PrismaWorkspaceType {
    switch (type) {
      case 'PERSONAL':
        return 'PERSONAL';
      case 'WORK':
        return 'WORK';
      case 'TEAM':
        return 'TEAM';
      default:
        return 'PERSONAL';
    }
  }

  private mapTierToDomain(tier: PrismaWorkspaceTier): WorkspaceTier {
    switch (tier) {
      case 'FREE':
        return 'FREE';
      case 'PRO':
        return 'PRO';
      case 'ENTERPRISE':
        return 'ENTERPRISE';
      default:
        return 'FREE';
    }
  }

  private mapTierToPrisma(tier: WorkspaceTier): PrismaWorkspaceTier {
    switch (tier) {
      case 'FREE':
        return 'FREE';
      case 'PRO':
        return 'PRO';
      case 'ENTERPRISE':
        return 'ENTERPRISE';
      default:
        return 'FREE';
    }
  }

  private mapRoleToDomain(role: PrismaMemberRole): MemberRole {
    switch (role) {
      case 'OWNER':
        return 'OWNER';
      case 'ADMIN':
        return 'ADMIN';
      case 'MEMBER':
        return 'MEMBER';
      case 'VIEWER':
        return 'VIEWER';
      default:
        return 'MEMBER';
    }
  }

  private mapRoleToPrisma(role: MemberRole): PrismaMemberRole {
    switch (role) {
      case 'OWNER':
        return 'OWNER';
      case 'ADMIN':
        return 'ADMIN';
      case 'MEMBER':
        return 'MEMBER';
      case 'VIEWER':
        return 'VIEWER';
      default:
        return 'MEMBER';
    }
  }

  async create(workspace: Workspace): Promise<Workspace> {
    const data = {
      id: workspace.id as string,
      name: workspace.props.name,
      slug: workspace.props.slug,
      description: workspace.props.description,
      type: this.mapTypeToPrisma(workspace.props.type),
      tier: this.mapTierToPrisma(workspace.props.tier),
      color: workspace.props.color,
      icon: workspace.props.icon,
      ownerId: workspace.props.ownerId,
      isArchived: workspace.props.isArchived,
      isDeleted: workspace.props.isDeleted,
      deletedAt: workspace.props.deletedAt,
      updatedAt: workspace.props.updatedAt,
    };

    const created = await this.prisma.$transaction(async (tx) => {
      const workspaceData = await tx.workspace.create({
        data: data,
      });

      // Also add the owner as a member
      if (workspace.props.ownerId) {
        await tx.workspaceMember.create({
          data: {
            workspaceId: workspaceData.id,
            userId: workspace.props.ownerId,
            role: 'OWNER',
          },
        });
      }

      return workspaceData;
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Workspace | null> {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) return null;
    return this.toDomain(workspace);
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    // Note: With the new schema change, finding by slug globally is ambiguous
    // This method should probably be findBySlugAndOwner, but if used for global uniqueness check it fails.
    // For now, let's assume we find the FIRST one (which is risky) or we need to update the interface.
    // Given the request to support user namespaces, findBySlug should probably require ownerId.
    // However, to keep backward compatibility or find 'public' workspaces?
    // Let's implement findFirst since findUnique no longer works with just slug.
    const workspace = await this.prisma.workspace.findFirst({
      where: { slug },
      include: {
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
        projects: {
          select: {
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
    });

    if (!workspace) return null;

    const domainWorkspace = this.toDomain(workspace);
    const taskCount = workspace.projects.reduce(
      (acc, p) => acc + p._count.tasks,
      0,
    );

    return domainWorkspace.setStats({
      projectCount: workspace._count.projects,
      memberCount: workspace._count.members,
      taskCount: taskCount,
    });
  }

  async findByOwnerId(ownerId: string): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: { ownerId },
    });
    return workspaces.map((w) => this.toDomain(w));
  }

  async findByUserId(userId: string): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        isDeleted: false,
      },
      include: {
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
        projects: {
          select: {
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
    });

    return workspaces.map((w) => {
      const domainWorkspace = this.toDomain(w);
      const taskCount = w.projects.reduce((acc, p) => acc + p._count.tasks, 0);

      return domainWorkspace.setStats({
        projectCount: w._count.projects,
        memberCount: w._count.members,
        taskCount: taskCount,
      });
    });
  }

  async update(workspace: Workspace): Promise<Workspace> {
    const data = {
      name: workspace.props.name,
      slug: workspace.props.slug,
      description: workspace.props.description,
      type: this.mapTypeToPrisma(workspace.props.type),
      tier: this.mapTierToPrisma(workspace.props.tier),
      color: workspace.props.color,
      icon: workspace.props.icon,
      ownerId: workspace.props.ownerId,
      isArchived: workspace.props.isArchived,
      isDeleted: workspace.props.isDeleted,
      deletedAt: workspace.props.deletedAt,
      updatedAt: workspace.props.updatedAt,
    };

    const updated = await this.prisma.workspace.update({
      where: { id: workspace.id as string },
      data: data,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workspace.delete({ where: { id } });
  }

  // Member management
  async addMember(member: WorkspaceMember): Promise<WorkspaceMember> {
    const data = {
      id: member.id as string,
      workspaceId: member.props.workspaceId,
      userId: member.props.userId,
      role: this.mapRoleToPrisma(member.props.role),
      joinedAt: member.props.joinedAt,
    };

    const created = await this.prisma.workspaceMember.create({
      data: data,
    });

    return this.toMemberDomain(created);
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async findMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
    if (!member) return null;
    return this.toMemberDomain(member);
  }

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
    });
    return members.map((m) => this.toMemberDomain(m));
  }
}
