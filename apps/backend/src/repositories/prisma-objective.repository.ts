import { Injectable } from '@nestjs/common';
import {
  Objective,
  KeyResult,
  ObjectiveProps,
  OKRPeriod as DomainOKRPeriod,
  ObjectiveStatus as DomainObjectiveStatus,
  MetricType as DomainMetricType,
} from '@ordo-todo/core';
import type { IObjectiveRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
  Objective as PrismaObjective,
  KeyResult as PrismaKeyResult,
  OKRPeriod as PrismaOKRPeriod,
  ObjectiveStatus as PrismaObjectiveStatus,
  MetricType as PrismaMetricType,
  Prisma,
} from '@prisma/client';

/**
 * Prisma implementation of the IObjectiveRepository interface.
 */
@Injectable()
export class PrismaObjectiveRepository implements IObjectiveRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Objective | null> {
    const objective = await this.prisma.objective.findUnique({
      where: { id },
      include: {
        keyResults: true,
      },
    });

    return objective ? this.toDomain(objective, objective.keyResults) : null;
  }

  async findByUserId(userId: string): Promise<Objective[]> {
    const objectives = await this.prisma.objective.findMany({
      where: { userId },
      include: { keyResults: true },
      orderBy: { createdAt: 'desc' },
    });

    return objectives.map((o) => this.toDomain(o, o.keyResults));
  }

  async findByWorkspaceId(workspaceId: string): Promise<Objective[]> {
    const objectives = await this.prisma.objective.findMany({
      where: { workspaceId },
      include: { keyResults: true },
      orderBy: { createdAt: 'desc' },
    });

    return objectives.map((o) => this.toDomain(o, o.keyResults));
  }

  async create(objective: Objective): Promise<Objective> {
    const created = await this.prisma.objective.create({
      data: {
        id: objective.id as string,
        title: objective.title,
        description: objective.props.description,
        userId: objective.props.userId,
        workspaceId: objective.props.workspaceId,
        startDate: objective.props.startDate,
        endDate: objective.props.endDate,
        period: objective.props.period as PrismaOKRPeriod,
        status: objective.props.status as PrismaObjectiveStatus,
        progress: objective.props.progress,
        color: objective.props.color,
        icon: objective.props.icon,
      },
      include: {
        keyResults: true,
      },
    });

    return this.toDomain(created, created.keyResults);
  }

  async update(objective: Objective): Promise<Objective> {
    const updated = await this.prisma.objective.update({
      where: { id: objective.id as string },
      data: {
        title: objective.title,
        description: objective.props.description,
        startDate: objective.props.startDate,
        endDate: objective.props.endDate,
        period: objective.props.period as PrismaOKRPeriod,
        status: objective.props.status as PrismaObjectiveStatus,
        progress: objective.props.progress,
        color: objective.props.color,
        icon: objective.props.icon,
      },
      include: {
        keyResults: true,
      },
    });

    return this.toDomain(updated, updated.keyResults);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.objective.delete({
      where: { id },
    });
  }

  async findKeyResultById(id: string): Promise<KeyResult | null> {
    const kr = await this.prisma.keyResult.findUnique({
      where: { id },
    });

    return kr ? this.krToDomain(kr) : null;
  }

  async createKeyResult(kr: KeyResult): Promise<KeyResult> {
    const created = await this.prisma.keyResult.create({
      data: {
        id: kr.id as string,
        objectiveId: kr.props.objectiveId,
        title: kr.props.title,
        description: kr.props.description,
        metricType: kr.props.metricType as PrismaMetricType,
        startValue: kr.props.startValue,
        targetValue: kr.props.targetValue,
        currentValue: kr.props.currentValue,
        unit: kr.props.unit,
        progress: kr.props.progress,
      },
    });

    return this.krToDomain(created);
  }

  async updateKeyResult(kr: KeyResult): Promise<KeyResult> {
    const updated = await this.prisma.keyResult.update({
      where: { id: kr.id as string },
      data: {
        title: kr.props.title,
        description: kr.props.description,
        metricType: kr.props.metricType as PrismaMetricType,
        startValue: kr.props.startValue,
        targetValue: kr.props.targetValue,
        currentValue: kr.props.currentValue,
        unit: kr.props.unit,
        progress: kr.props.progress,
      },
    });

    return this.krToDomain(updated);
  }

  async deleteKeyResult(id: string): Promise<void> {
    await this.prisma.keyResult.delete({
      where: { id },
    });
  }

  async linkTask(krId: string, taskId: string, weight = 1): Promise<void> {
    await this.prisma.keyResultTask.upsert({
      where: {
        keyResultId_taskId: {
          keyResultId: krId,
          taskId: taskId,
        },
      },
      update: { weight },
      create: {
        keyResultId: krId,
        taskId: taskId,
        weight,
      },
    });
  }

  async unlinkTask(krId: string, taskId: string): Promise<void> {
    await this.prisma.keyResultTask.delete({
      where: {
        keyResultId_taskId: {
          keyResultId: krId,
          taskId: taskId,
        },
      },
    });
  }

  // ============ Domain Mappers ============

  private toDomain(
    prismaObj: PrismaObjective,
    prismaKRs: PrismaKeyResult[] = [],
  ): Objective {
    return new Objective({
      id: prismaObj.id,
      title: prismaObj.title,
      description: prismaObj.description ?? undefined,
      userId: prismaObj.userId,
      workspaceId: prismaObj.workspaceId ?? undefined,
      startDate: prismaObj.startDate,
      endDate: prismaObj.endDate,
      period: prismaObj.period as any,
      status: prismaObj.status as any,
      progress: prismaObj.progress,
      color: prismaObj.color,
      icon: prismaObj.icon ?? undefined,
      createdAt: prismaObj.createdAt,
      updatedAt: prismaObj.updatedAt,
      keyResults: prismaKRs.map((kr) => this.krToDomain(kr)),
    });
  }

  private krToDomain(prismaKR: PrismaKeyResult): KeyResult {
    return new KeyResult({
      id: prismaKR.id,
      objectiveId: prismaKR.objectiveId,
      title: prismaKR.title,
      description: prismaKR.description ?? undefined,
      metricType: prismaKR.metricType as any,
      startValue: prismaKR.startValue,
      targetValue: prismaKR.targetValue,
      currentValue: prismaKR.currentValue,
      unit: prismaKR.unit ?? undefined,
      progress: prismaKR.progress,
      createdAt: prismaKR.createdAt,
      updatedAt: prismaKR.updatedAt,
    });
  }
}
