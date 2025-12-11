import { Injectable, Inject, Logger } from '@nestjs/common';
import type {
  AIProfileRepository,
  ProductivityReportRepository,
  AnalyticsRepository,
  TimerRepository,
  TaskRepository,
} from '@ordo-todo/core';
import {
  GetOptimalScheduleUseCase,
  PredictTaskDurationUseCase,
  GenerateWeeklyReportUseCase,
} from '@ordo-todo/core';
import { GeminiAIService } from './gemini-ai.service';
import type { ChatMessageDto } from './dto/ai-chat.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    @Inject('AIProfileRepository')
    private readonly aiProfileRepository: AIProfileRepository,
    @Inject('ProductivityReportRepository')
    private readonly reportRepository: ProductivityReportRepository,
    @Inject('AnalyticsRepository')
    private readonly analyticsRepository: AnalyticsRepository,
    @Inject('TimerRepository')
    private readonly timerRepository: TimerRepository,
    private readonly geminiService: GeminiAIService,
    private readonly prisma: PrismaService,
  ) {}

  // ============ AI CHAT ============

  async chat(
    userId: string,
    message: string,
    history: ChatMessageDto[] = [],
    context?: { workspaceId?: string; projectId?: string },
  ) {
    // Get user's current tasks for context
    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    const response = await this.geminiService.chat(message, history, {
      ...context,
      tasks,
    });

    // Execute actions if any
    if (response.actions && response.actions.length > 0) {
      for (const action of response.actions) {
        if (action.type === 'CREATE_TASK' && action.data) {
          try {
            // Find default project
            const defaultProject = await this.prisma.project.findFirst({
              where: {
                workspace: {
                  members: { some: { userId } },
                },
              },
              orderBy: { createdAt: 'asc' },
            });

            if (defaultProject) {
              const task = await this.prisma.task.create({
                data: {
                  title: action.data.title,
                  description: action.data.description,
                  priority: action.data.priority || 'MEDIUM',
                  dueDate: action.data.dueDate
                    ? new Date(action.data.dueDate)
                    : null,
                  projectId: defaultProject.id,
                  creatorId: userId,
                },
              });
              action.result = { taskId: task.id, success: true };
              this.logger.log(`Created task via chat: ${task.id}`);
            }
          } catch (error) {
            this.logger.error('Failed to create task from chat', error);
            action.result = { success: false, error: 'Failed to create task' };
          }
        }
      }
    }

    return response;
  }

  // ============ NATURAL LANGUAGE TASK PARSING ============

  async parseNaturalLanguageTask(
    input: string,
    projectId?: string,
    timezone?: string,
  ) {
    const result = await this.geminiService.parseNaturalLanguageTask(
      input,
      timezone || 'America/Mexico_City',
    );

    return {
      ...result,
      projectId,
    };
  }

  // ============ WELLBEING INDICATORS ============

  async getWellbeingIndicators(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    // Default to last 30 days
    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get daily metrics
    const dailyMetrics = await this.prisma.dailyMetrics.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'desc' },
    });

    // Get time sessions
    const sessions = await this.prisma.timeSession.findMany({
      where: {
        userId,
        startedAt: { gte: start, lte: end },
        endedAt: { not: null },
      },
    });

    // Get AI profile if exists
    const profile = await this.aiProfileRepository.findByUserId(userId);

    return this.geminiService.analyzeWellbeing({
      dailyMetrics,
      sessions,
      profile: profile?.props,
    });
  }

  // ============ WORKFLOW SUGGESTIONS ============

  async suggestWorkflow(
    projectName: string,
    projectDescription?: string,
    objectives?: string,
  ) {
    return this.geminiService.suggestWorkflow(
      projectName,
      projectDescription,
      objectives,
    );
  }

  // ============ TASK DECOMPOSITION ============

  async decomposeTask(
    taskTitle: string,
    taskDescription?: string,
    projectContext?: string,
    maxSubtasks?: number,
  ) {
    return this.geminiService.decomposeTask(
      taskTitle,
      taskDescription,
      projectContext,
      maxSubtasks,
    );
  }

  // ============ EXISTING METHODS ============

  async getProfile(userId: string) {
    const profile = await this.aiProfileRepository.findByUserId(userId);
    if (!profile) {
      return null;
    }
    return profile.props;
  }

  async getOptimalSchedule(userId: string, topN?: number) {
    const useCase = new GetOptimalScheduleUseCase(this.aiProfileRepository);
    return await useCase.execute({ userId, topN });
  }

  async predictTaskDuration(
    userId: string,
    taskTitle?: string,
    taskDescription?: string,
    category?: string,
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  ) {
    const useCase = new PredictTaskDurationUseCase(this.aiProfileRepository);
    const localPrediction = await useCase.execute({
      userId,
      taskTitle,
      taskDescription,
      category,
      priority,
    });

    // HYBRID STRATEGY (Local First -> Gemini Fallback)
    // If local confidence is LOW and we have meaningful input, try Gemini to get a better estimate.
    if (localPrediction.confidence === 'LOW' && taskTitle) {
      const geminiPrediction = await this.geminiService.estimateTaskDuration(
        taskTitle,
        taskDescription,
        localPrediction.estimatedMinutes,
      );

      // If Gemini provides a result, use it.
      if (geminiPrediction.confidence !== 'LOW') {
        return {
          estimatedMinutes: geminiPrediction.estimatedMinutes,
          confidence: geminiPrediction.confidence as any,
          reasoning: `🤖 ${geminiPrediction.reasoning}`,
          source: 'AI',
        };
      }
    }

    return {
      ...localPrediction,
      source: 'Local',
    };
  }

  // ============ REPORTS ============

  async generateWeeklyReport(userId: string, weekStart?: Date) {
    const useCase = new GenerateWeeklyReportUseCase(
      this.reportRepository,
      this.analyticsRepository,
      this.timerRepository,
      this.aiProfileRepository,
      (context) => this.geminiService.generateProductivityReport(context),
    );

    const result = await useCase.execute({ userId, weekStart });
    return {
      ...result.report.props,
      isNew: result.isNew,
    };
  }

  async generateMonthlyReport(userId: string, monthStart?: Date) {
    // Get the start and end of the month
    const start = monthStart || new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);

    // Get metrics for the month
    const dailyMetrics = await this.prisma.dailyMetrics.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
    });

    const sessions = await this.prisma.timeSession.findMany({
      where: {
        userId,
        startedAt: { gte: start, lte: end },
        endedAt: { not: null },
      },
    });

    const profile = await this.aiProfileRepository.findByUserId(userId);

    // Aggregate metrics
    const metricsSnapshot = {
      totalTasksCompleted: dailyMetrics.reduce(
        (sum, d) => sum + d.tasksCompleted,
        0,
      ),
      totalMinutesWorked: dailyMetrics.reduce(
        (sum, d) => sum + d.minutesWorked,
        0,
      ),
      totalPomodoros: dailyMetrics.reduce(
        (sum, d) => sum + d.pomodorosCompleted,
        0,
      ),
      avgFocusScore:
        dailyMetrics.length > 0
          ? dailyMetrics.reduce((sum, d) => sum + (d.focusScore || 0), 0) /
            dailyMetrics.length
          : 0,
      daysWorked: dailyMetrics.filter((d) => d.minutesWorked > 0).length,
    };

    const report = await this.geminiService.generateProductivityReport({
      userId,
      scope: 'MONTHLY_SCHEDULED',
      metricsSnapshot,
      sessions: sessions.slice(0, 20),
      profile: profile?.props,
    });

    // Save report to database
    const savedReport = await this.prisma.productivityReport.create({
      data: {
        userId,
        scope: 'MONTHLY_SCHEDULED',
        summary: report.summary,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        recommendations: report.recommendations,
        patterns: report.patterns,
        productivityScore: report.productivityScore,
        metricsSnapshot: metricsSnapshot as any,
        aiModel: 'gemini-1.5-pro',
      },
    });

    return {
      ...report,
      id: savedReport.id,
      isNew: true,
    };
  }

  async generateProjectReport(userId: string, projectId: string) {
    // Get project details
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            actualMinutes: true,
            estimatedMinutes: true,
            completedAt: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Get time sessions for project tasks
    const taskIds = project.tasks.map((t) => t.id);
    const sessions = await this.prisma.timeSession.findMany({
      where: {
        taskId: { in: taskIds },
        endedAt: { not: null },
      },
    });

    const metricsSnapshot = {
      projectName: project.name,
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter((t) => t.status === 'COMPLETED')
        .length,
      totalMinutesWorked: sessions.reduce(
        (sum, s) => sum + (s.duration || 0),
        0,
      ),
      avgTaskDuration:
        project.tasks.length > 0
          ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
            project.tasks.filter((t) => t.status === 'COMPLETED').length
          : 0,
      estimateAccuracy: this.calculateEstimateAccuracy(project.tasks),
    };

    const report = await this.geminiService.generateProductivityReport({
      userId,
      scope: 'PROJECT_SUMMARY',
      metricsSnapshot,
      sessions: sessions.slice(0, 20),
      projectName: project.name,
    });

    // Save report
    const savedReport = await this.prisma.productivityReport.create({
      data: {
        userId,
        projectId,
        scope: 'PROJECT_SUMMARY',
        summary: report.summary,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        recommendations: report.recommendations,
        patterns: report.patterns,
        productivityScore: report.productivityScore,
        metricsSnapshot: metricsSnapshot as any,
        aiModel: 'gemini-2.0-flash-exp',
      },
    });

    return {
      ...report,
      id: savedReport.id,
      isNew: true,
    };
  }

  private calculateEstimateAccuracy(tasks: any[]): number {
    const tasksWithEstimates = tasks.filter(
      (t) => t.estimatedMinutes && t.actualMinutes && t.status === 'COMPLETED',
    );

    if (tasksWithEstimates.length === 0) return 0;

    const totalAccuracy = tasksWithEstimates.reduce((sum, t) => {
      const ratio = t.actualMinutes / t.estimatedMinutes;
      const accuracy = ratio > 1 ? 1 / ratio : ratio;
      return sum + accuracy;
    }, 0);

    return Math.round((totalAccuracy / tasksWithEstimates.length) * 100);
  }

  async getReports(
    userId: string,
    options?: {
      scope?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const reports = await this.reportRepository.findByUserId(userId, {
      scope: options?.scope as any,
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
    });

    return reports.map((r) => r.props);
  }

  async getReport(reportId: string) {
    const report = await this.reportRepository.findById(reportId);
    if (!report) {
      return null;
    }
    return report.props;
  }

  async deleteReport(reportId: string) {
    await this.reportRepository.delete(reportId);
  }

  // ============ MODEL STATS ============

  getModelStats() {
    return this.geminiService.getModelStats();
  }
}
