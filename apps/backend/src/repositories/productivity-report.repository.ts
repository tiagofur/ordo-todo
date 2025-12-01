import { Injectable } from '@nestjs/common';
import { ProductivityReport as PrismaProductivityReport, Prisma } from '@prisma/client';
import {
  ProductivityReport,
  ProductivityReportRepository,
  ReportScope,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaProductivityReportRepository
  implements ProductivityReportRepository
{
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(
    prismaReport: PrismaProductivityReport,
  ): ProductivityReport {
    return new ProductivityReport({
      id: prismaReport.id,
      userId: prismaReport.userId,
      taskId: prismaReport.taskId ?? undefined,
      projectId: prismaReport.projectId ?? undefined,
      scope: prismaReport.scope as ReportScope,
      summary: prismaReport.summary,
      strengths: prismaReport.strengths as string[],
      weaknesses: prismaReport.weaknesses as string[],
      recommendations: prismaReport.recommendations as string[],
      patterns: prismaReport.patterns as string[],
      productivityScore: prismaReport.productivityScore,
      metricsSnapshot: prismaReport.metricsSnapshot as any,
      generatedAt: prismaReport.generatedAt,
      aiModel: prismaReport.aiModel ?? undefined,
    });
  }

  async save(report: ProductivityReport): Promise<ProductivityReport> {
    const data: Prisma.ProductivityReportCreateInput = {
      user: {
        connect: { id: report.props.userId },
      },
      ...(report.props.taskId && {
        task: { connect: { id: report.props.taskId } },
      }),
      ...(report.props.projectId && {
        project: { connect: { id: report.props.projectId } },
      }),
      scope: report.props.scope,
      summary: report.props.summary,
      strengths: report.props.strengths as Prisma.InputJsonValue,
      weaknesses: report.props.weaknesses as Prisma.InputJsonValue,
      recommendations: report.props.recommendations as Prisma.InputJsonValue,
      patterns: report.props.patterns as Prisma.InputJsonValue,
      productivityScore: report.props.productivityScore,
      metricsSnapshot: report.props.metricsSnapshot as Prisma.InputJsonValue,
      generatedAt: report.props.generatedAt,
      aiModel: report.props.aiModel,
    };

    const saved = await this.prisma.productivityReport.create({ data });
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<ProductivityReport | null> {
    const report = await this.prisma.productivityReport.findUnique({
      where: { id },
    });

    if (!report) return null;
    return this.toDomain(report);
  }

  async findByUserId(
    userId: string,
    options?: {
      scope?: ReportScope;
      limit?: number;
      offset?: number;
    },
  ): Promise<ProductivityReport[]> {
    const reports = await this.prisma.productivityReport.findMany({
      where: {
        userId,
        ...(options?.scope && { scope: options.scope }),
      },
      orderBy: {
        generatedAt: 'desc',
      },
      take: options?.limit,
      skip: options?.offset,
    });

    return reports.map((r) => this.toDomain(r));
  }

  async findByTaskId(taskId: string): Promise<ProductivityReport[]> {
    const reports = await this.prisma.productivityReport.findMany({
      where: { taskId },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    return reports.map((r) => this.toDomain(r));
  }

  async findByProjectId(projectId: string): Promise<ProductivityReport[]> {
    const reports = await this.prisma.productivityReport.findMany({
      where: { projectId },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    return reports.map((r) => this.toDomain(r));
  }

  async findLatestByScope(
    userId: string,
    scope: ReportScope,
  ): Promise<ProductivityReport | null> {
    const report = await this.prisma.productivityReport.findFirst({
      where: {
        userId,
        scope,
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    if (!report) return null;
    return this.toDomain(report);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.productivityReport.delete({
      where: { id },
    });
  }

  async countByUserId(
    userId: string,
    scope?: ReportScope,
  ): Promise<number> {
    return await this.prisma.productivityReport.count({
      where: {
        userId,
        ...(scope && { scope }),
      },
    });
  }
}
