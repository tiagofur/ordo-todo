/**
 * Burnout prevention / Wellbeing types
 */

export type BurnoutRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface BurnoutAnalysis {
    riskLevel: BurnoutRiskLevel;
    riskScore: number;
    riskFactors: string[];
    metrics: {
        avgDailyFocusTime: number;
        avgDailyBreakTime: number;
        consecutiveWorkingDays: number;
        weekendWorkFrequency: number;
        overtimeHoursLastWeek: number;
    };
    recommendations: string[];
    lastAnalyzedAt: string | Date;
}

export interface WorkPatterns {
    peakHours: number[];
    peakDays: number[];
    avgSessionDuration: number;
    mostProductiveTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
    avgTasksPerDay: number;
    focusSessionsPerDay: number;
    breakFrequency: number;
}

export interface RestRecommendation {
    type: 'BREAK' | 'SHORT_WALK' | 'MEAL' | 'EXERCISE' | 'SLEEP' | 'VACATION';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    message: string;
    suggestedDuration?: number;
    suggestedTime?: string;
}

export interface BurnoutIntervention {
    needsIntervention: boolean;
    severity: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
    suggestedActions: string[];
    immediateBreakNeeded: boolean;
    suggestedBreakDuration?: number;
    alertMessage?: string;
}

export type WellbeingTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';

export interface WeeklyWellbeingSummary {
    weekStartDate: string | Date;
    weekEndDate: string | Date;
    overallScore: number;
    trend: WellbeingTrend;
    focusTimeTotal: number;
    breakTimeTotal: number;
    tasksCompleted: number;
    averageStressLevel: number;
    insights: string[];
    comparedToLastWeek: {
        focusTime: number;
        productivity: number;
        breaks: number;
    };
}
