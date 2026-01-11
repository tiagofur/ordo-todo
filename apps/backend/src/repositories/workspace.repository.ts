import { Injectable } from '@nestjs/common';
import {
  Workspace as PrismaWorkspace,
  WorkspaceTier as PrismaWorkspaceTier,
  WorkspaceMember as PrismaWorkspaceMember,
  MemberRole as PrismaMemberRole,
} from '@prisma/client';
import {
  Workspace,
  WorkspaceRepository,
  WorkspaceTier,
  WorkspaceMember,
  MemberRole,
  MemberWithUser,
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
        return MemberRole.OWNER;
      case 'ADMIN':
        return MemberRole.ADMIN;
      case 'MEMBER':
        return MemberRole.MEMBER;
      case 'VIEWER':
        return MemberRole.VIEWER;
      default:
        return MemberRole.MEMBER;
    }
  }

  private mapRoleToPrisma(role: MemberRole): PrismaMemberRole {
    switch (role) {
      case MemberRole.OWNER:
        return 'OWNER';
      case MemberRole.ADMIN:
        return 'ADMIN';
      case MemberRole.MEMBER:
        return 'MEMBER';
      case MemberRole.VIEWER:
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
    const workspace = await this.prisma.workspace.findFirst({
      where: { id, isDeleted: false },
    });
    if (!workspace) return null;
    return this.toDomain(workspace);
  }

  async findBySlug(slug: string, ownerId: string): Promise<Workspace | null> {
    // SECURITY FIX: Include ownerId to prevent accessing workspaces with duplicate slugs
    // owned by different users. This prevents unauthorized access to other users' workspaces.
    const workspace = await this.prisma.workspace.findFirst({
      where: { slug, ownerId, isDeleted: false },
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

  async findByOwnerAndSlugWithStats(
    ownerId: string,
    slug: string,
  ): Promise<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    tier: string;
    color: string;
    icon: string | null;
    ownerId: string;
    owner: {
      id: string;
      username: string;
      name: string | null;
      email: string | null;
    };
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    stats: {
      projectCount: number;
      memberCount: number;
      taskCount: number;
    };
  } | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        ownerId_slug: {
          ownerId,
          slug,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
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

    if (!workspace || workspace.isDeleted) {
      return null;
    }

    // Format stats manually
    const taskCount = workspace.projects.reduce(
      (acc, p) => acc + p._count.tasks,
      0,
    );

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      tier: workspace.tier,
      color: workspace.color,
      icon: workspace.icon,
      ownerId: workspace.ownerId!,
      owner: workspace.owner!,
      isArchived: workspace.isArchived,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      stats: {
        projectCount: workspace._count.projects,
        memberCount: workspace._count.members,
        taskCount: taskCount,
      },
    };
  }

  async findByOwnerId(ownerId: string): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: { ownerId, isDeleted: false },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
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
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return workspaces.map((w) => this.toDomain(w));
  }

  async map(ownerId: string, userId: string): Promise<Map<string, Workspace>> {
    const workspaces = await this.findByOwnerId(ownerId);
    const map = new Map<string, Workspace>();

    for (const workspace of workspaces) {
      if (workspace.id) {
        map.set(String(workspace.id), workspace);
      }
    }

    return map;
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

  async findDeleted(userId: string): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        ownerId: userId,
        isDeleted: true,
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
      orderBy: {
        deletedAt: 'desc',
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

  async softDelete(id: string): Promise<void> {
    await this.prisma.workspace.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.workspace.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async permanentDelete(id: string): Promise<void> {
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

  async listMembersWithUser(workspaceId: string): Promise<
    Array<{
      userId: string;
      role: MemberRole;
      user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
      };
    }>
  > {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return members.map((m) => ({
      userId: m.userId,
      role: this.mapRoleToDomain(m.role),
      user: m.user,
    }));
  }
}
