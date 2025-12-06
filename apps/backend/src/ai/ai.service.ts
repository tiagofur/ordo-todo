import { Injectable, Inject } from '@nestjs/common';
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
} from '@ordo-todo/core';
import { GeminiAIService } from './gemini-ai.service';

@Injectable()
export class AIService {
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
  ) { }

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
        localPrediction.estimatedMinutes
      );

      // If Gemini provides a result, use it.
      // We assume Gemini result structure might be slightly different or we just map it.
      if (geminiPrediction.confidence !== 'LOW') {
        return {
          estimatedMinutes: geminiPrediction.estimatedMinutes,
          confidence: geminiPrediction.confidence as any,
          reasoning: `🤖 ${geminiPrediction.reasoning}`,
          source: 'AI'
        };
      }
    }

    return {
      ...localPrediction,
      source: 'Local'
    };
  }

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
}
