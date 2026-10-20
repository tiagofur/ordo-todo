import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  AIProfileRepository,
  ProductivityReportRepository,
  AnalyticsRepository,
  TimerRepository,
} from '@ordo-todo/core';
import {
  GetOptimalScheduleUseCase,
  PredictTaskDurationUseCase,
  GenerateWeeklyReportUseCase,
  type WeeklyReportContext,
} from '@ordo-todo/core';
import { GeminiAIService } from './gemini-ai.service';
import { TaskNlParserService } from './task-nl-parser.service';
import type { ChatMessageDto } from './dto/ai-chat.dto';
import { PrismaService } from '../database/prisma.service';
import type { Prisma } from '@prisma/client';
import { CircuitBreaker } from '../common/decorators/circuit-breaker.decorator';
import { RetrievalService } from './retrieval/retrieval.service';
import type { Citation } from './retrieval/retrieval.service';
import { AgentToolsService } from './tools/agent-tools.service';
import {
  planReason,
  planRequiresConfirmation,
  type AgentExecuteResult,
  type AgentPlan,
  type AgentToolCall,
} from './tools/agent-tool.types';
import { LLM_PROVIDER } from './llm/llm-provider.interface';
import type { LlmProvider } from './llm/llm-provider.interface';
import { CreditsService } from './credits/credits.service';

const ASK_SYSTEM_PROMPT =
  'Answer the question using ONLY the provided sources. ' +
  'If the sources do not contain enough information, say so clearly. ' +
  'Reply in the same language as the question.';

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
    private readonly nlParser: TaskNlParserService,
    @Optional() private readonly retrieval?: RetrievalService,
    @Optional() @Inject(LLM_PROVIDER) private readonly llm?: LlmProvider,
    @Optional() private readonly agentTools?: AgentToolsService,
    @Optional() private readonly credits?: CreditsService,
  ) {}

  // ============ AI CHAT ============
  @CircuitBreaker({ failureThreshold: 3, resetTimeout: 30000 })
  async chat(
    userId: string,
    message: string,
    history: ChatMessageDto[] = [],
    context?: { workspaceId?: string; projectId?: string },
  ) {
    // Get user's current tasks for context
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
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
      tasks: tasks.map((t) => ({
        ...t,
        dueDate: t.dueDate || undefined,
      })),
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

            if (defaultProject && action.data) {
              const task = await this.prisma.task.create({
                data: {
                  title: String(action.data.title || ''),
                  description: action.data.description
                    ? String(action.data.description)
                    : undefined,
                  priority: action.data.priority || 'MEDIUM',
                  dueDate: action.data.dueDate
                    ? new Date(action.data.dueDate)
                    : null,
                  projectId: defaultProject.id,
                  ownerId: userId,
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
  @CircuitBreaker({ failureThreshold: 5, resetTimeout: 10000 })
  async parseNaturalLanguageTask(
    input: string,
    projectId?: string,
    timezone?: string,
    fast = false,
  ) {
    // Fast deterministic first pass (no LLM): dates, recurrence,
    // #project, @priority, confidence. Enriched by Gemini below.
    const local = this.nlParser.parse(input, new Date());

    // fast: skip Gemini entirely (typing preview, <200ms feedback).
    if (fast) {
      return {
        title: local.title,
        description: undefined,
        dueDate: local.dueAt,
        priority: local.priority,
        estimatedMinutes: undefined,
        tags: [],
        confidence: (local.confidenceScore >= 0.6 ? 'HIGH' : 'LOW') as
          | 'LOW'
          | 'MEDIUM'
          | 'HIGH',
        reasoning: 'Deterministic parse (fast mode, no LLM)',
        projectId: projectId ?? local.projectHint,
        dueAt: local.dueAt?.toISOString(),
        recurrence: local.recurrence,
        projectHint: local.projectHint,
        confidenceScore: local.confidenceScore,
        needsConfirmation: local.confidenceScore < 0.6,
      };
    }

    const result = await this.geminiService.parseNaturalLanguageTask(
      input,
      timezone || 'America/Mexico_City',
    );

    return {
      ...result,
      // Deterministic wins where it is confident; Gemini fills the rest.
      title: local.confidenceScore >= 0.6 ? local.title : result.title,
      dueDate: local.dueAt ?? result.dueDate,
      priority: local.confidenceScore >= 0.6 ? local.priority : result.priority,
      projectId: projectId ?? local.projectHint,
      // v2 additive fields (S1) — existing contract untouched.
      dueAt: (local.dueAt ?? result.dueDate)?.toISOString(),
      recurrence: local.recurrence,
      projectHint: local.projectHint,
      confidenceScore: local.confidenceScore,
      needsConfirmation: local.confidenceScore < 0.6,
    };
  }

  // ============ WELLBEING INDICATORS ============
  @CircuitBreaker({ failureThreshold: 3, resetTimeout: 60000 })
  async getWellbeingIndicators(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    // Default to last 30 days
    const end = endDate || new Date();
    const start =
      startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get daily metrics using AnalyticsRepository
    const dailyMetricsEntities = await this.analyticsRepository.getRange(
      userId,
      start,
      end,
    );
    const dailyMetrics = dailyMetricsEntities.map((dm) => dm.props);

    // Get time sessions using TimerRepository
    const sessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      start,
      end,
    );
    const completedSessions = sessions.filter((s) => s.props.endedAt !== null);

    // Get AI profile if exists
    const profile = await this.aiProfileRepository.findByUserId(userId);

    return this.geminiService.analyzeWellbeing({
      dailyMetrics,
      sessions: completedSessions.map((s) => ({
        id: String(s.id),
        startedAt: s.props.startedAt,
        duration: s.props.duration || 0,
        pauseCount: s.props.pauseCount,
        wasCompleted: s.props.wasCompleted,
      })),
      profile: profile?.props || {
        peakHours: {},
        avgTaskDuration: 0,
        completionRate: 0,
      },
    });
  }

  // ============ WORKFLOW SUGGESTIONS ============
  @CircuitBreaker({ failureThreshold: 5, resetTimeout: 20000 })
  async suggestWorkflow(
    projectName: string,
    projectDescription?: string,
    objectives?: string[],
  ) {
    return this.geminiService.suggestWorkflow(
      projectName,
      projectDescription,
      objectives,
    );
  }

  // ============ TASK DECOMPOSITION ============
  @CircuitBreaker({ failureThreshold: 5, resetTimeout: 15000 })
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

  async updateProfile(userId: string, updateData: Record<string, any>) {
    const profile = await this.aiProfileRepository.findByUserId(userId);

    if (!profile) {
      // Create new profile if it doesn't exist
      const newProfile = await this.aiProfileRepository.findOrCreate(userId);
      // Update with provided data
      const updated = newProfile.clone(updateData);
      const saved = await this.aiProfileRepository.save(updated);
      return saved.props;
    }

    // Update existing profile
    const updated = profile.clone(updateData);
    const saved = await this.aiProfileRepository.save(updated);
    return saved.props;
  }

  async deleteProfile(userId: string) {
    const profile = await this.aiProfileRepository.findByUserId(userId);

    if (profile) {
      await this.aiProfileRepository.delete(String(profile.id));
    }

    return { success: true };
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
          confidence: geminiPrediction.confidence as 'LOW' | 'MEDIUM' | 'HIGH',
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
      (context: WeeklyReportContext) =>
        this.geminiService.generateProductivityReport({
          userId: context.userId,
          scope: context.scope as any,
          metricsSnapshot: context.metricsSnapshot as any,
          sessions: context.sessions as any,
          profile: context.profile as any,
          projectName: undefined,
        }),
    );

    const result = await useCase.execute({ userId, weekStart });
    // S6: charge only for freshly generated reports, never for cache hits.
    if (this.credits && result.isNew) {
      await this.credits.charge(userId, 'report', 'reports/weekly');
    }
    return {
      ...result.report.props,
      isNew: result.isNew,
    };
  }

  @CircuitBreaker({ failureThreshold: 3, resetTimeout: 60000 })
  async generateMonthlyReport(userId: string, monthStart?: Date) {
    // Get the start and end of the month
    const start = monthStart || new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);

    // Get metrics for the month using AnalyticsRepository and TimerRepository
    const dailyMetricsEntities = await this.analyticsRepository.getRange(
      userId,
      start,
      end,
    );
    const dailyMetrics = dailyMetricsEntities.map((dm) => dm.props);

    const sessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      start,
      end,
    );
    const completedSessions = sessions.filter((s) => s.props.endedAt !== null);

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
      sessions: completedSessions.slice(0, 20).map((s) => ({
        id: String(s.id),
        startedAt: s.props.startedAt,
        duration: s.props.duration || 0,
        pauseCount: s.props.pauseCount,
        wasCompleted: s.props.wasCompleted,
      })),
      profile: profile?.props || {
        peakHours: {},
        avgTaskDuration: 0,
        completionRate: 0,
      },
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
        metricsSnapshot: metricsSnapshot as Prisma.InputJsonValue,
        aiModel: 'gemini-1.5-pro',
      },
    });

    // S6: monthly reports always generate fresh — charge accordingly.
    if (this.credits) {
      await this.credits.charge(userId, 'report', 'reports/monthly');
    }

    return {
      ...report,
      id: savedReport.id,
      isNew: true,
    };
  }

  @CircuitBreaker({ failureThreshold: 3, resetTimeout: 60000 })
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
      throw new NotFoundException('Project not found');
    }

    // Get time sessions for project tasks using TimerRepository
    // Get all user sessions and filter by taskId
    const now = new Date();
    const userSessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), // Last year
      now,
    );
    const taskIds = project.tasks.map((t) => t.id);
    const sessions = userSessions
      .filter((s) => s.props.taskId && taskIds.includes(s.props.taskId))
      .filter((s) => s.props.endedAt !== null);

    const metricsSnapshot = {
      projectName: project.name,
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter((t) => t.status === 'COMPLETED')
        .length,
      totalMinutesWorked: sessions.reduce(
        (sum, s) => sum + (s.props.duration || 0),
        0,
      ),
      avgTaskDuration:
        project.tasks.length > 0
          ? sessions.reduce((sum, s) => sum + (s.props.duration || 0), 0) /
            project.tasks.filter((t) => t.status === 'COMPLETED').length
          : 0,
      estimateAccuracy: this.calculateEstimateAccuracy(project.tasks),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projectName: _p, ...numericMetrics } = metricsSnapshot;

    const report = await this.geminiService.generateProductivityReport({
      userId,
      scope: 'PROJECT_SUMMARY',
      metricsSnapshot: numericMetrics,
      sessions: sessions.slice(0, 20).map((s) => ({
        id: String(s.id),
        startedAt: s.props.startedAt,
        duration: s.props.duration || 0,
        pauseCount: s.props.pauseCount,
        wasCompleted: s.props.wasCompleted,
      })),
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
        metricsSnapshot: metricsSnapshot as Prisma.InputJsonValue,
        aiModel: 'gemini-2.0-flash-exp',
      },
    });

    // S6: project reports always generate fresh — charge accordingly.
    if (this.credits) {
      await this.credits.charge(userId, 'report', 'reports/project');
    }

    return {
      ...report,
      id: savedReport.id,
      isNew: true,
    };
  }

  /**
   * Daily briefing (AM: plan the day ahead) or shutdown review (PM: close the
   * day). Stable versioned payload (`daily/v1`) shared with the ritual (005):
   * same keys, same order, every day — only the data values change.
   */
  @CircuitBreaker({ failureThreshold: 3, resetTimeout: 60000 })
  async generateDailyReport(
    userId: string,
    kind: 'AM' | 'PM',
    date?: Date,
  ): Promise<Record<string, unknown>> {
    const day = date ?? new Date();
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const dailyMetricsEntities = await this.analyticsRepository.getRange(
      userId,
      start,
      end,
    );
    const dailyMetrics = dailyMetricsEntities.map((dm) => dm.props);

    const sessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      start,
      end,
    );
    const completedSessions = sessions.filter((s) => s.props.endedAt !== null);

    const tasksDue = await this.prisma.task.count({
      where: {
        ownerId: userId,
        isDeleted: false,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        dueDate: { gte: start, lte: end },
      },
    });
    const tasksCompleted = await this.prisma.task.count({
      where: {
        ownerId: userId,
        status: 'COMPLETED',
        completedAt: { gte: start, lte: end },
      },
    });

    const metricsSnapshot = {
      format: 'daily/v1',
      kind,
      date: start.toISOString().slice(0, 10),
      tasksDue,
      tasksCompleted,
      totalMinutesWorked: dailyMetrics.reduce(
        (sum, d) => sum + d.minutesWorked,
        0,
      ),
      totalPomodoros: dailyMetrics.reduce(
        (sum, d) => sum + d.pomodorosCompleted,
        0,
      ),
    };

    const profile = await this.aiProfileRepository.findByUserId(userId);

    const report = await this.geminiService.generateProductivityReport({
      userId,
      scope: kind === 'AM' ? 'DAILY_AM' : 'DAILY_PM',
      metricsSnapshot,
      sessions: completedSessions.slice(0, 20).map((s) => ({
        id: String(s.id),
        startedAt: s.props.startedAt,
        duration: s.props.duration || 0,
        pauseCount: s.props.pauseCount,
        wasCompleted: s.props.wasCompleted,
      })),
      profile: profile?.props || {
        peakHours: {},
        avgTaskDuration: 0,
        completionRate: 0,
      },
    });

    const savedReport = await this.prisma.productivityReport.create({
      data: {
        userId,
        scope: kind === 'AM' ? 'DAILY_AM' : 'DAILY_PM',
        summary: report.summary,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        recommendations: report.recommendations,
        patterns: report.patterns,
        productivityScore: report.productivityScore,
        metricsSnapshot: metricsSnapshot as Prisma.InputJsonValue,
        aiModel: 'gemini-2.0-flash',
      },
    });

    // S6: daily reports always generate fresh — charge accordingly.
    if (this.credits) {
      await this.credits.charge(userId, 'report', 'reports/daily');
    }

    return {
      ...report,
      id: savedReport.id,
      isNew: true,
    };
  }

  private calculateEstimateAccuracy(
    tasks: {
      estimatedMinutes: number | null;
      actualMinutes: number | null;
      status: string;
    }[],
  ): number {
    const tasksWithEstimates = tasks.filter(
      (t) => t.estimatedMinutes && t.actualMinutes && t.status === 'COMPLETED',
    );

    if (tasksWithEstimates.length === 0) return 0;

    const totalAccuracy = tasksWithEstimates.reduce((sum, t) => {
      const ratio = (t.actualMinutes || 0) / (t.estimatedMinutes || 1);
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
    type ReportScope =
      | 'TASK_COMPLETION'
      | 'PROJECT_SUMMARY'
      | 'PERSONAL_ANALYSIS'
      | 'WEEKLY_SCHEDULED'
      | 'MONTHLY_SCHEDULED'
      | 'DAILY_AM'
      | 'DAILY_PM';

    const reports = await this.reportRepository.findByUserId(userId, {
      // Core ReportScope predates DAILY_* (005 extends it there); the Prisma
      // layer already accepts the new values, so this cast is scope-widening.
      scope: options?.scope as ReportScope | undefined as never,
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

  // ============ ASK (ODD 004 S2) ============

  async ask(
    userId: string,
    question: string,
    limit?: number,
  ): Promise<{ answer: string; citations: Citation[] }> {
    if (!this.retrieval || !this.llm) {
      throw new ServiceUnavailableException('ask not configured');
    }
    // S6: charge before the LLM call — a 402 must not spend a completion.
    if (this.credits) {
      await this.credits.charge(userId, 'ask', question.slice(0, 200));
    }
    const citations = await this.retrieval.retrieve(
      userId,
      question,
      limit ?? 8,
    );
    const context = citations
      .map((c) => `[${c.type} ${c.id}] ${c.title}: ${c.excerpt}`)
      .join('\n');
    const answer = await this.llm.chat(
      [
        { role: 'system', content: ASK_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Pregunta: ${question}\n\nFuentes:\n${context}`,
        },
      ],
      { complexity: 'low' },
    );
    return { answer, citations };
  }

  // ============ AGENT TOOLS (ODD 004 S3) ============

  async proposePlan(
    userId: string,
    calls: AgentToolCall[],
  ): Promise<AgentPlan> {
    if (!this.agentTools) {
      throw new ServiceUnavailableException('agent tools not configured');
    }
    return this.agentTools.propose(userId, calls);
  }

  /**
   * Stateless execute: the client re-sends the calls; the server re-validates
   * them and re-derives `requiresConfirmation` with the same pure policy as
   * propose — it never trusts any client-side flag.
   */
  async executePlan(
    userId: string,
    planId: string,
    calls: AgentToolCall[],
    confirmed: boolean,
  ): Promise<AgentExecuteResult> {
    if (!this.agentTools) {
      throw new ServiceUnavailableException('agent tools not configured');
    }
    const fresh = await this.agentTools.propose(userId, calls);
    const result = await this.agentTools.execute(
      userId,
      {
        planId,
        steps: fresh.steps,
        requiresConfirmation: planRequiresConfirmation(calls),
        reason: planReason(calls),
      },
      confirmed,
    );
    // S6: charge per successfully executed step (failed steps cost nothing).
    if (this.credits) {
      for (const step of result.executed) {
        if (step.ok) {
          await this.credits.charge(
            userId,
            'tool',
            `${step.tool} (plan ${planId})`,
          );
        }
      }
    }
    return result;
  }

  // ============ USAGE (ODD 004 S6) ============

  async getUsage(userId: string) {
    if (!this.credits) {
      throw new ServiceUnavailableException('credits not configured');
    }
    return this.credits.getUsage(userId);
  }

  async rechargeCredits(userId: string, amount: number) {
    if (!this.credits) {
      throw new ServiceUnavailableException('credits not configured');
    }
    return this.credits.recharge(userId, amount);
  }
}
