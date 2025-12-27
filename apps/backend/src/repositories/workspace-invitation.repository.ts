import { Injectable } from '@nestjs/common';
import {
  WorkspaceInvitation as PrismaWorkspaceInvitation,
  InviteStatus as PrismaInviteStatus,
  MemberRole as PrismaMemberRole,
} from '@prisma/client';
import {
  WorkspaceInvitation,
  WorkspaceInvitationRepository,
  InviteStatus,
  MemberRole,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaWorkspaceInvitationRepository implements WorkspaceInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(
    prismaInvitation: PrismaWorkspaceInvitation,
  ): WorkspaceInvitation {
    return new WorkspaceInvitation({
      id: prismaInvitation.id,
      workspaceId: prismaInvitation.workspaceId,
      email: prismaInvitation.email,
      tokenHash: prismaInvitation.tokenHash,
      role: this.mapRoleToDomain(prismaInvitation.role),
      status: this.mapStatusToDomain(prismaInvitation.status),
      invitedById: prismaInvitation.invitedById ?? undefined,
      expiresAt: prismaInvitation.expiresAt,
      acceptedAt: prismaInvitation.acceptedAt ?? undefined,
      createdAt: prismaInvitation.createdAt,
      updatedAt: prismaInvitation.updatedAt,
    });
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

  private mapStatusToDomain(status: PrismaInviteStatus): InviteStatus {
    switch (status) {
      case 'PENDING':
        return 'PENDING';
      case 'ACCEPTED':
        return 'ACCEPTED';
      case 'EXPIRED':
        return 'EXPIRED';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }

  private mapStatusToPrisma(status: InviteStatus): PrismaInviteStatus {
    switch (status) {
      case 'PENDING':
        return 'PENDING';
      case 'ACCEPTED':
        return 'ACCEPTED';
      case 'EXPIRED':
        return 'EXPIRED';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }

  async create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation> {
    const data = {
      id: invitation.id as string,
      workspaceId: invitation.props.workspaceId,
      email: invitation.props.email,
      tokenHash: invitation.props.tokenHash,
      role: this.mapRoleToPrisma(invitation.props.role),
      status: this.mapStatusToPrisma(invitation.props.status),
      invitedById: invitation.props.invitedById,
      expiresAt: invitation.props.expiresAt,
      updatedAt: invitation.props.updatedAt,
    };

    const created = await this.prisma.workspaceInvitation.create({
      data: data,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<WorkspaceInvitation | null> {
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { id },
    });
    if (!invitation) return null;
    return this.toDomain(invitation);
  }

  /**
   * @deprecated Use findPendingInvitations() instead and compare hashes manually
   * This method is kept for backward compatibility but won't work with hashed tokens
   */
  async findByToken(tokenHash: string): Promise<WorkspaceInvitation | null> {
    // This method is deprecated because with bcrypt hashes, we can't search directly
    // Keep for backward compatibility with legacy data
    const invitation = await this.prisma.workspaceInvitation.findFirst({
      where: { tokenHash },
    });
    if (!invitation) return null;
    return this.toDomain(invitation);
  }

  async findPendingInvitations(): Promise<WorkspaceInvitation[]> {
    const invitations = await this.prisma.workspaceInvitation.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          gt: new Date(), // Only non-expired invitations
        },
      },
    });
    return invitations.map((i) => this.toDomain(i));
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const invitations = await this.prisma.workspaceInvitation.findMany({
      where: { workspaceId },
    });
    return invitations.map((i) => this.toDomain(i));
  }

  async findByEmail(email: string): Promise<WorkspaceInvitation[]> {
    const invitations = await this.prisma.workspaceInvitation.findMany({
      where: { email },
    });
    return invitations.map((i) => this.toDomain(i));
  }

  async update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation> {
    const data = {
      status: this.mapStatusToPrisma(invitation.props.status),
      acceptedAt: invitation.props.acceptedAt,
      updatedAt: invitation.props.updatedAt,
    };

    const updated = await this.prisma.workspaceInvitation.update({
      where: { id: invitation.id as string },
      data: data,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workspaceInvitation.delete({ where: { id } });
  }
}
