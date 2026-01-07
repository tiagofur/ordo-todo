import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  WorkspaceMember,
  WorkspaceMemberRepository,
  WorkspaceMemberInput,
} from '@ordo-todo/core';
import { MemberRole } from '@prisma/client';

@Injectable()
export class PrismaWorkspaceMemberRepository implements WorkspaceMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: WorkspaceMemberInput): Promise<WorkspaceMember> {
    const data = await this.prisma.workspaceMember.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        role: input.role,
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
    role: MemberRole,
  ): Promise<WorkspaceMember[]> {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId, role },
    });

    return members.map((m) => this.toDomain(m));
  }

  async updateRole(id: string, role: MemberRole): Promise<WorkspaceMember> {
    const data = await this.prisma.workspaceMember.update({
      where: { id },
      data: { role },
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
      where: { workspaceId, role: MemberRole.OWNER },
    });

    return owner ? this.toDomain(owner) : null;
  }

  async findAdmins(workspaceId: string): Promise<WorkspaceMember[]> {
    const admins = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
      },
    });

    return admins.map((a) => this.toDomain(a));
  }

  private toDomain(prismaMember: any): WorkspaceMember {
    return new WorkspaceMember({
      id: prismaMember.id,
      workspaceId: prismaMember.workspaceId,
      userId: prismaMember.userId,
      role: prismaMember.role as MemberRole,
      joinedAt: prismaMember.joinedAt,
    });
  }
}
