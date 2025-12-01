import { Entity, EntityProps } from "../../shared/entity";

export type ReportScope =
  | "TASK_COMPLETION"
  | "PROJECT_SUMMARY"
  | "PERSONAL_ANALYSIS"
  | "WEEKLY_SCHEDULED"
  | "MONTHLY_SCHEDULED";

export interface MetricsSnapshot {
  tasksCreated?: number;
  tasksCompleted?: number;
  minutesWorked?: number;
  pomodorosCompleted?: number;
  focusScore?: number;
  sessionsCount?: number;
}

export interface ProductivityReportProps extends EntityProps {
  userId: string;
  taskId?: string;
  projectId?: string;
  scope: ReportScope;

  // AI-generated insights
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  patterns: string[];
  productivityScore: number; // 0-100

  // Historical snapshot
  metricsSnapshot: MetricsSnapshot;

  // Metadata
  generatedAt?: Date;
  aiModel?: string;
}

export class ProductivityReport extends Entity<ProductivityReportProps> {
  constructor(props: ProductivityReportProps) {
    super({
      ...props,
      strengths: props.strengths ?? [],
      weaknesses: props.weaknesses ?? [],
      recommendations: props.recommendations ?? [],
      patterns: props.patterns ?? [],
      productivityScore: Math.min(100, Math.max(0, props.productivityScore ?? 0)),
      metricsSnapshot: props.metricsSnapshot ?? {},
      generatedAt: props.generatedAt ?? new Date(),
      aiModel: props.aiModel ?? "gemini-2.0-flash-exp",
    });

    // Validate productivityScore range
    if (props.productivityScore < 0 || props.productivityScore > 100) {
      throw new Error("Productivity score must be between 0 and 100");
    }

    // Validate summary is not empty
    if (!props.summary || props.summary.trim().length === 0) {
      throw new Error("Summary cannot be empty");
    }
  }

  static create(props: Omit<ProductivityReportProps, "id" | "generatedAt" | "aiModel">): ProductivityReport {
    return new ProductivityReport({
      ...props,
      generatedAt: new Date(),
      aiModel: "gemini-2.0-flash-exp",
    });
  }

  /**
   * Get a human-readable label for the scope
   */
  getScopeLabel(): string {
    switch (this.props.scope) {
      case "TASK_COMPLETION":
        return "Task Completion Report";
      case "PROJECT_SUMMARY":
        return "Project Summary";
      case "PERSONAL_ANALYSIS":
        return "Personal Analysis";
      case "WEEKLY_SCHEDULED":
        return "Weekly Report";
      case "MONTHLY_SCHEDULED":
        return "Monthly Report";
      default:
        return "Report";
    }
  }

  /**
   * Get a color for the productivity score
   */
  getScoreColor(): "green" | "yellow" | "red" {
    if (this.props.productivityScore >= 80) return "green";
    if (this.props.productivityScore >= 60) return "yellow";
    return "red";
  }

  /**
   * Check if this is a good productivity score
   */
  isGoodScore(): boolean {
    return this.props.productivityScore >= 70;
  }

  /**
   * Get a summary of the metrics snapshot
   */
  getMetricsSummary(): string {
    const m = this.props.metricsSnapshot;
    const parts: string[] = [];

    if (m.tasksCompleted !== undefined) {
      parts.push(`${m.tasksCompleted} tasks completed`);
    }
    if (m.minutesWorked !== undefined) {
      const hours = Math.floor(m.minutesWorked / 60);
      const mins = m.minutesWorked % 60;
      if (hours > 0) {
        parts.push(`${hours}h ${mins}m worked`);
      } else {
        parts.push(`${mins}m worked`);
      }
    }
    if (m.pomodorosCompleted !== undefined && m.pomodorosCompleted > 0) {
      parts.push(`${m.pomodorosCompleted} pomodoros`);
    }

    return parts.join(", ") || "No metrics available";
  }

  /**
   * Check if this report has actionable recommendations
   */
  hasRecommendations(): boolean {
    return this.props.recommendations.length > 0;
  }

  /**
   * Get the top N recommendations
   */
  getTopRecommendations(limit: number = 3): string[] {
    return this.props.recommendations.slice(0, limit);
  }
}
