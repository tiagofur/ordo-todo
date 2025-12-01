import { Injectable } from '@nestjs/common';
import { AIProfile as PrismaAIProfile, Prisma } from '@prisma/client';
import { AIProfile, AIProfileRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaAIProfileRepository implements AIProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaProfile: PrismaAIProfile): AIProfile {
    return new AIProfile({
      id: prismaProfile.id,
      userId: prismaProfile.userId,
      peakHours: prismaProfile.peakHours as Record<number, number>,
      peakDays: prismaProfile.peakDays as Record<number, number>,
      avgTaskDuration: prismaProfile.avgTaskDuration,
      completionRate: prismaProfile.completionRate,
      categoryPreferences: prismaProfile.categoryPreferences as Record<
        string,
        number
      >,
      updatedAt: prismaProfile.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<AIProfile | null> {
    const profile = await this.prisma.aIProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;
    return this.toDomain(profile);
  }

  async findOrCreate(userId: string): Promise<AIProfile> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    // Create a new profile with default values
    const newProfile = AIProfile.create(userId);
    return await this.save(newProfile);
  }

  async save(profile: AIProfile): Promise<AIProfile> {
    const data: Prisma.AIProfileCreateInput = {
      user: {
        connect: { id: profile.props.userId },
      },
      peakHours: profile.props.peakHours as Prisma.InputJsonValue,
      peakDays: profile.props.peakDays as Prisma.InputJsonValue,
      avgTaskDuration: profile.props.avgTaskDuration,
      completionRate: profile.props.completionRate,
      categoryPreferences: profile.props
        .categoryPreferences as Prisma.InputJsonValue,
    };

    const saved = await this.prisma.aIProfile.upsert({
      where: { userId: profile.props.userId },
      create: data,
      update: {
        peakHours: data.peakHours,
        peakDays: data.peakDays,
        avgTaskDuration: data.avgTaskDuration,
        completionRate: data.completionRate,
        categoryPreferences: data.categoryPreferences,
      },
    });

    return this.toDomain(saved);
  }

  async update(profile: AIProfile): Promise<AIProfile> {
    const updated = await this.prisma.aIProfile.update({
      where: { id: profile.id as string },
      data: {
        peakHours: profile.props.peakHours as Prisma.InputJsonValue,
        peakDays: profile.props.peakDays as Prisma.InputJsonValue,
        avgTaskDuration: profile.props.avgTaskDuration,
        completionRate: profile.props.completionRate,
        categoryPreferences: profile.props
          .categoryPreferences as Prisma.InputJsonValue,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.aIProfile.delete({
      where: { id },
    });
  }
}
