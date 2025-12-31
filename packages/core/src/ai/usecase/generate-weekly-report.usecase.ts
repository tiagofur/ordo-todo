import { UseCase } from "../../shared/use-case";
import { ProductivityReport } from "../model/productivity-report.entity";
import { ProductivityReportRepository } from "../provider/productivity-report.repository";
import type { AnalyticsRepository } from "../../analytics/provider/analytics.repository";
import type { TimerRepository } from "../../timer/provider/timer.repository";
import type { AIProfileRepository } from "../provider/ai-profile.repository";
import type { DailyMetrics } from "../../analytics/model/daily-metrics.entity";
import type { TimeSession } from "../../timer/model/time-session.entity";

export interface GenerateWeeklyReportInput {
  userId: string;
  weekStart?: Date; // If not provided, use current week
}

export interface GenerateWeeklyReportOutput {
  report: ProductivityReport;
  isNew: boolean; // true if report was newly generated, false if existing
}

/**
 * Data needed from external AI service
 */
export interface WeeklyReportData {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  patterns: string[];
  productivityScore: number;
}

export interface WeeklyReportContext {
  userId: string;
  scope: string;
  metricsSnapshot: {
    tasksCreated: number;
    tasksCompleted: number;
    minutesWorked: number;
    pomodorosCompleted: number;
    focusScore: number;
    sessionsCount: number;
  };
  sessions: Array<{
    startedAt: Date;
    endedAt?: Date;
    duration?: number;
    taskId?: string;
    userId: string;
    type: string;
    wasCompleted: boolean;
  }>;
  profile?: {
    userId: string;
    peakHours: Record<number, number>;
    peakDays: Record<number, number>;
    avgTaskDuration: number;
    completionRate: number;
    categoryPreferences: Record<string, number>;
  };
}

export class GenerateWeeklyReportUseCase implements UseCase<
  GenerateWeeklyReportInput,
  GenerateWeeklyReportOutput
> {
  constructor(
    private readonly reportRepository: ProductivityReportRepository,
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly timerRepository: TimerRepository,
    private readonly aiProfileRepository: AIProfileRepository,
    private readonly generateReportData: (
      context: WeeklyReportContext,
    ) => Promise<WeeklyReportData>,
  ) {}

  async execute(
    input: GenerateWeeklyReportInput,
  ): Promise<GenerateWeeklyReportOutput> {
    const { userId, weekStart } = input;

    // Calculate week range
    const startDate = weekStart || this.getWeekStart(new Date());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // Check if report already exists for this week
    const existing = await this.reportRepository.findLatestByScope(
      userId,
      "WEEKLY_SCHEDULED",
    );

    if (existing && this.isSameWeek(existing.props.generatedAt!, startDate)) {
      return { report: existing, isNew: false };
    }

    // Gather data for report generation
    const [dailyMetrics, sessions, profile] = await Promise.all([
      this.analyticsRepository.getRange(userId, startDate, endDate),
      this.timerRepository.findByUserIdAndDateRange(userId, startDate, endDate),
      this.aiProfileRepository.findByUserId(userId),
    ]);

    // Calculate metrics snapshot
    const metricsSnapshot = {
      tasksCreated: dailyMetrics.reduce(
        (sum: number, m: DailyMetrics) => sum + m.props.tasksCreated,
        0,
      ),
      tasksCompleted: dailyMetrics.reduce(
        (sum: number, m: DailyMetrics) => sum + m.props.tasksCompleted,
        0,
      ),
      minutesWorked: dailyMetrics.reduce(
        (sum: number, m: DailyMetrics) => sum + m.props.minutesWorked,
        0,
      ),
      pomodorosCompleted: dailyMetrics.reduce(
        (sum: number, m: DailyMetrics) => sum + m.props.pomodorosCompleted,
        0,
      ),
      focusScore:
        dailyMetrics.length > 0
          ? dailyMetrics.reduce(
              (sum: number, m: DailyMetrics) => sum + (m.props.focusScore ?? 0),
              0,
            ) / dailyMetrics.length
          : 0,
      sessionsCount: sessions.length,
    };

    // Generate AI insights
    const reportData = await this.generateReportData({
      userId,
      scope: "WEEKLY_SCHEDULED",
      metricsSnapshot,
      sessions: sessions.map((s: TimeSession) => s.props),
      profile: profile?.props,
    });

    // Create and save report
    const report = ProductivityReport.create({
      userId,
      scope: "WEEKLY_SCHEDULED",
      summary: reportData.summary,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendations: reportData.recommendations,
      patterns: reportData.patterns,
      productivityScore: reportData.productivityScore,
      metricsSnapshot,
    });

    const savedReport = await this.reportRepository.save(report);

    return { report: savedReport, isNew: true };
  }

  /**
   * Get the start of the week (Monday) for a given date
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  /**
   * Check if two dates are in the same week
   */
  private isSameWeek(date1: Date, date2: Date): boolean {
    const start1 = this.getWeekStart(date1);
    const start2 = this.getWeekStart(date2);
    return start1.getTime() === start2.getTime();
  }
}
