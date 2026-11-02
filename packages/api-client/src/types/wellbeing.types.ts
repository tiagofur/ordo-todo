/**
 * Burnout prevention / Wellbeing types.
 *
 * Mirrors the backend (`BurnoutPreventionService`): these are the shapes the
 * API actually returns. Do not extend them with aspirational fields — the UI
 * covers display fallbacks on its side.
 */

export type BurnoutRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface BurnoutWarning {
    type:
        | 'LATE_NIGHTS'
        | 'WEEKEND_WORK'
        | 'NO_BREAKS'
        | 'OVERLOAD'
        | 'DECLINING_PERFORMANCE'
        | 'LONG_HOURS';
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    message: string;
    recommendation: string;
}

export interface WorkPatternAnalysis {
    lateNightPercentage: number;
    lateNightDays: number;
    weekendWorkPercentage: number;
    weekendDays: number;
    avgSessionWithoutBreak: number;
    longestSessionWithoutBreak: number;
    avgDailyWorkHours: number;
    urgentTaskCount: number;
    overdueTaskCount: number;
    taskLoadTrend: 'INCREASING' | 'STABLE' | 'DECLINING';
    completionRateTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    recentCompletionRate: number;
}

export interface BurnoutAnalysis {
    riskLevel: BurnoutRiskLevel;
    riskScore: number;
    patterns: WorkPatternAnalysis;
    warnings: BurnoutWarning[];
    aiInsights?: string;
}

export interface RestRecommendation {
    type:
        | 'TAKE_BREAK'
        | 'END_DAY'
        | 'WEEKEND_OFF'
        | 'DELEGATE_TASKS'
        | 'REDUCE_WORKLOAD';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
    suggestedAction?: string;
}

export interface BurnoutIntervention {
    type: 'GENTLE_REMINDER' | 'STRONG_WARNING' | 'CRITICAL_ALERT';
    title: string;
    message: string;
    recommendations: string[];
    shouldNotify: boolean;
}

export interface WellbeingSummary {
    weekStart: string | Date;
    weekEnd: string | Date;
    overallScore: number;
    burnoutRisk: BurnoutRiskLevel;
    highlights: string[];
    concerns: string[];
    recommendations: string[];
    metrics: {
        totalHoursWorked: number;
        tasksCompleted: number;
        avgFocusSessionLength: number;
        breaksTaken: number;
        latestWorkTime: string;
        weekendHours: number;
    };
}
