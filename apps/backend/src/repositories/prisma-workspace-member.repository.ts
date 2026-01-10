import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  WorkspaceMember,
  WorkspaceMemberRepository,
  WorkspaceMemberInput,
  MemberRole as CoreMemberRole,
} from '@ordo-todo/core';
import { MemberRole as PrismaMemberRole } from '@prisma/client';

@Injectable()
export class PrismaWorkspaceMemberRepository implements WorkspaceMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: WorkspaceMemberInput): Promise<WorkspaceMember> {
    const data = await this.prisma.workspaceMember.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        role: this.toPrismaRole(input.role),
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<WorkspaceMember | null> {
    const data = await this.prisma.workspaceMember.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    const data = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
    });

    return members.map((m) => this.toDomain(m));
  }

  async findByUser(userId: string): Promise<WorkspaceMember[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { userId },
    });

    return members.map((m) => this.toDomain(m));
  }

  async findByWorkspaceAndRole(
    workspaceId: string,
    role: CoreMemberRole,
  ): Promise<WorkspaceMember[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId, role: this.toPrismaRole(role) },
    });

    return members.map((m) => this.toDomain(m));
  }

  async updateRole(id: string, role: CoreMemberRole): Promise<WorkspaceMember> {
    const data = await this.prisma.workspaceMember.update({
      where: { id },
      data: { role: this.toPrismaRole(role) },
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: { id },
    });
  }

  async deleteByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return !!member;
  }

  async countMembers(workspaceId: string): Promise<number> {
    return await this.prisma.workspaceMember.count({
      where: { workspaceId },
    });
  }

  async findOwner(workspaceId: string): Promise<WorkspaceMember | null> {
    const owner = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, role: PrismaMemberRole.OWNER },
    });

    return owner ? this.toDomain(owner) : null;
  }

  async findAdmins(workspaceId: string): Promise<WorkspaceMember[]> {
    const admins = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        role: { in: [PrismaMemberRole.OWNER, PrismaMemberRole.ADMIN] },
      },
    });

    return admins.map((a) => this.toDomain(a));
  }

  private toDomain(prismaMember: any): WorkspaceMember {
    return new WorkspaceMember({
      id: prismaMember.id,
      workspaceId: prismaMember.workspaceId,
      userId: prismaMember.userId,
      role: this.toCoreRole(prismaMember.role),
      joinedAt: prismaMember.joinedAt,
    });
  }

  private toCoreRole(role: PrismaMemberRole): CoreMemberRole {
    switch (role) {
      case PrismaMemberRole.OWNER:
        return CoreMemberRole.OWNER;
      case PrismaMemberRole.ADMIN:
        return CoreMemberRole.ADMIN;
      case PrismaMemberRole.MEMBER:
        return CoreMemberRole.MEMBER;
      case PrismaMemberRole.VIEWER:
        return CoreMemberRole.VIEWER;
      default:
        return CoreMemberRole.MEMBER;
    }
  }

  private toPrismaRole(role: CoreMemberRole): PrismaMemberRole {
    switch (role) {
      case CoreMemberRole.OWNER:
        return PrismaMemberRole.OWNER;
      case CoreMemberRole.ADMIN:
        return PrismaMemberRole.ADMIN;
      case CoreMemberRole.MEMBER:
        return PrismaMemberRole.MEMBER;
      case CoreMemberRole.VIEWER:
        return PrismaMemberRole.VIEWER;
      default:
        return PrismaMemberRole.MEMBER;
    }
  }
}
