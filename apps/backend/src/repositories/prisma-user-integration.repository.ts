import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  UserIntegration,
  UserIntegrationRepository,
  UserIntegrationInput,
} from '@ordo-todo/core';

@Injectable()
export class PrismaUserIntegrationRepository implements UserIntegrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: UserIntegrationInput): Promise<UserIntegration> {
    const data = await this.prisma.userIntegration.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        expiresAt: input.expiresAt,
        scope: input.scope,
        providerUserId: input.providerUserId,
        providerEmail: input.providerEmail,
        settings: input.settings as any,
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<UserIntegration | null> {
    const data = await this.prisma.userIntegration.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByUserAndProvider(
    userId: string,
    provider: any,
  ): Promise<UserIntegration | null> {
    const data = await this.prisma.userIntegration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByUser(userId: string): Promise<UserIntegration[]> {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId },
    });

    return integrations.map((i) => this.toDomain(i));
  }

  async update(id: string, input: Partial<UserIntegrationInput>): Promise<UserIntegration> {
    const data = await this.prisma.userIntegration.update({
      where: { id },
      data: {
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        expiresAt: input.expiresAt,
        scope: input.scope,
        providerUserId: input.providerUserId,
        providerEmail: input.providerEmail,
        settings: input.settings as any,
      },
    });

    return this.toDomain(data);
  }

  async updateLastSync(id: string): Promise<UserIntegration> {
    const data = await this.prisma.userIntegration.update({
      where: { id },
      data: { lastSyncAt: new Date() },
    });

    return this.toDomain(data);
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.userIntegration.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userIntegration.delete({
      where: { id },
    });
  }

  async findActive(): Promise<UserIntegration[]> {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { isActive: true },
    });

    return integrations.map((i) => this.toDomain(i));
  }

  async findExpiringSoon(): Promise<UserIntegration[]> {
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    const integrations = await this.prisma.userIntegration.findMany({
      where: {
        isActive: true,
        expiresAt: {
          lte: oneHourFromNow,
        },
      },
    });

    return integrations.map((i) => this.toDomain(i));
  }

  private toDomain(prismaIntegration: any): UserIntegration {
    return new UserIntegration({
      id: prismaIntegration.id,
      userId: prismaIntegration.userId,
      provider: prismaIntegration.provider,
      accessToken: prismaIntegration.accessToken,
      refreshToken: prismaIntegration.refreshToken,
      expiresAt: prismaIntegration.expiresAt,
      scope: prismaIntegration.scope,
      providerUserId: prismaIntegration.providerUserId,
      providerEmail: prismaIntegration.providerEmail,
      settings: prismaIntegration.settings as any,
      isActive: prismaIntegration.isActive,
      lastSyncAt: prismaIntegration.lastSyncAt,
      createdAt: prismaIntegration.createdAt,
      updatedAt: prismaIntegration.updatedAt,
    });
  }
}
