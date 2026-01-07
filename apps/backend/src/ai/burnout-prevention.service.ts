import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GeminiAIService } from './gemini-ai.service';
import type { TimerRepository } from '@ordo-todo/core';

/**
 * Risk levels for burnout assessment
 */
export type BurnoutRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

/**
 * Work pattern analysis result
 */
export interface WorkPatternAnalysis {
  // Late night work (after 10pm)
  lateNightPercentage: number;
  lateNightDays: number;

  // Weekend work
  weekendWorkPercentage: number;
  weekendDays: number;

  // Session patterns
  avgSessionWithoutBreak: number; // minutes
  longestSessionWithoutBreak: number; // minutes
  avgDailyWorkHours: number;

  // Overload indicators
  urgentTaskCount: number;
  overdueTaskCount: number;
  taskLoadTrend: 'INCREASING' | 'STABLE' | 'DECREASING';

  // Completion patterns
  completionRateTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  recentCompletionRate: number;
}

/**
 * Full burnout analysis result
 */
export interface BurnoutAnalysis {
  riskLevel: BurnoutRiskLevel;
  riskScore: number; // 0-100
  patterns: WorkPatternAnalysis;
  warnings: BurnoutWarning[];
  aiInsights?: string;
}

/**
 * Specific warning about burnout risk
 */
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

/**
 * Rest recommendation
 */
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

/**
 * Intervention for critical cases
 */
export interface Intervention {
  type: 'GENTLE_REMINDER' | 'STRONG_WARNING' | 'CRITICAL_ALERT';
  title: string;
  message: string;
  recommendations: string[];
  shouldNotify: boolean;
}

/**
 * Weekly wellbeing summary
 */
export interface WellbeingSummary {
  weekStart: Date;
  weekEnd: Date;
  overallScore: number; // 0-100
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

@Injectable()
export class BurnoutPreventionService {
  private readonly logger = new Logger(BurnoutPreventionService.name);

  // Configurable thresholds
  private readonly THRESHOLDS = {
    // Hours
    maxHealthyDailyHours: 8,
    warningDailyHours: 10,
    criticalDailyHours: 12,

    // Late night (hour of day)
    lateNightStartHour: 22, // 10pm
    earlyMorningEndHour: 6, // 6am

    // Session lengths (minutes)
    maxHealthySessionWithoutBreak: 90,
    warningSessionWithoutBreak: 120,

    // Percentages
    maxHealthyWeekendWork: 10, // 10% of weekly work on weekends is okay
    warningWeekendWork: 25,
    maxHealthyLateNight: 5, // 5% late night is okay
    warningLateNight: 15,

    // Task load
    urgentTaskWarning: 5,
    overdueTaskWarning: 3,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiAI: GeminiAIService,
    @Inject('TimerRepository')
    private readonly timerRepository: TimerRepository,
  ) {}

  /**
   * Analyze work patterns for the last N days
   */
  async analyzeWorkPatterns(
    userId: string,
    days = 14,
  ): Promise<WorkPatternAnalysis> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all work sessions in the period using TimerRepository
    const sessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      startDate,
      new Date(),
    );

    // Filter to work sessions only
    const workSessions = sessions.filter(
      (s) => s.props.type === 'WORK' && s.props.duration !== null,
    );

    // Calculate late night work
    const lateNightSessions = workSessions.filter((s) => {
      const hour = new Date(s.props.startedAt).getHours();
      return (
        hour >= this.THRESHOLDS.lateNightStartHour ||
        hour < this.THRESHOLDS.earlyMorningEndHour
      );
    });
    const lateNightMinutes = lateNightSessions.reduce(
      (sum, s) => sum + (s.props.duration || 0),
      0,
    );
    const totalMinutes = workSessions.reduce(
      (sum, s) => sum + (s.props.duration || 0),
      0,
    );
    const lateNightPercentage =
      totalMinutes > 0 ? (lateNightMinutes / totalMinutes) * 100 : 0;

    // Count unique late night days
    const lateNightDays = new Set(
      lateNightSessions.map(
        (s) => new Date(s.props.startedAt).toISOString().split('T')[0],
      ),
    ).size;

    // Calculate weekend work
    const weekendSessions = workSessions.filter((s) => {
      const day = new Date(s.props.startedAt).getDay();
      return day === 0 || day === 6; // Sunday = 0, Saturday = 6
    });
    const weekendMinutes = weekendSessions.reduce(
      (sum, s) => sum + (s.props.duration || 0),
      0,
    );
    const weekendWorkPercentage =
      totalMinutes > 0 ? (weekendMinutes / totalMinutes) * 100 : 0;
    const weekendDays = new Set(
      weekendSessions.map((s) => new Date(s.props.startedAt).toDateString()),
    ).size;

    // Calculate session lengths
    const sessionLengths = workSessions.map((s) => s.props.duration || 0);
    const avgSessionWithoutBreak =
      sessionLengths.length > 0
        ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length
        : 0;
    const longestSessionWithoutBreak = Math.max(...sessionLengths, 0);

    // Calculate daily work hours
    const dailyMinutes = new Map<string, number>();
    for (const session of workSessions) {
      const dateKey = new Date(session.props.startedAt).toISOString().split('T')[0];
      dailyMinutes.set(
        dateKey,
        (dailyMinutes.get(dateKey) || 0) + (session.props.duration || 0),
      );
    }
    const avgDailyWorkHours =
      dailyMinutes.size > 0
        ? Array.from(dailyMinutes.values()).reduce((a, b) => a + b, 0) /
          dailyMinutes.size /
          60
        : 0;

    // Get task overload indicators
    const [urgentTasks, overdueTasks] = await Promise.all([
      this.prisma.task.count({
        where: {
          OR: [{ ownerId: userId }, { assigneeId: userId }],
          priority: 'URGENT',
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      }),
      this.prisma.task.count({
        where: {
          OR: [{ ownerId: userId }, { assigneeId: userId }],
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    // Calculate task load trend (compare last 7 days vs previous 7 days)
    const taskLoadTrend = await this.calculateTaskLoadTrend(userId);

    // Calculate completion rate trend
    const { trend: completionRateTrend, recentRate: recentCompletionRate } =
      await this.calculateCompletionRateTrend(userId);

    return {
      lateNightPercentage,
      lateNightDays,
      weekendWorkPercentage,
      weekendDays,
      avgSessionWithoutBreak,
      longestSessionWithoutBreak,
      avgDailyWorkHours,
      urgentTaskCount: urgentTasks,
      overdueTaskCount: overdueTasks,
      taskLoadTrend,
      completionRateTrend,
      recentCompletionRate,
    };
  }

  /**
   * Full burnout risk analysis
   */
  async analyzeBurnoutRisk(userId: string): Promise<BurnoutAnalysis> {
    const patterns = await this.analyzeWorkPatterns(userId);
    const warnings = this.generateWarnings(patterns);
    const riskScore = this.calculateRiskScore(patterns, warnings);
    const riskLevel = this.getRiskLevel(riskScore);

    // Get AI insights for moderate+ risk
    let aiInsights: string | undefined;
    if (riskScore >= 40) {
      aiInsights = await this.generateAIInsights(patterns, warnings);
    }

    return {
      riskLevel,
      riskScore,
      patterns,
      warnings,
      aiInsights,
    };
  }

  /**
   * Get personalized rest recommendations
   */
  async getRestRecommendations(userId: string): Promise<RestRecommendation[]> {
    const analysis = await this.analyzeBurnoutRisk(userId);
    const recommendations: RestRecommendation[] = [];

    // Check if currently working using TimerRepository
    const activeSession = await this.timerRepository.findActiveSession(userId);

    if (activeSession) {
      const sessionMinutes = Math.floor(
        (Date.now() - new Date(activeSession.props.startedAt).getTime()) / 60000,
      );

      if (sessionMinutes >= this.THRESHOLDS.warningSessionWithoutBreak) {
        recommendations.push({
          type: 'TAKE_BREAK',
          priority: 'HIGH',
          message: `Llevas ${sessionMinutes} minutos trabajando sin parar. Tu cerebro necesita un descanso.`,
          suggestedAction: 'Toma 10-15 minutos de descanso',
        });
      } else if (
        sessionMinutes >= this.THRESHOLDS.maxHealthySessionWithoutBreak
      ) {
        recommendations.push({
          type: 'TAKE_BREAK',
          priority: 'MEDIUM',
          message: `Has trabajado ${sessionMinutes} minutos. Un pequeño descanso mejorará tu enfoque.`,
          suggestedAction: 'Considera una pausa de 5 minutos',
        });
      }
    }

    // Check time of day
    const currentHour = new Date().getHours();
    if (
      currentHour >= this.THRESHOLDS.lateNightStartHour ||
      currentHour < this.THRESHOLDS.earlyMorningEndHour
    ) {
      recommendations.push({
        type: 'END_DAY',
        priority: 'HIGH',
        message:
          'Es tarde. El descanso nocturno es crucial para tu productividad mañana.',
        suggestedAction: 'Guarda tu trabajo y descansa',
      });
    }

    // Check today's total hours using TimerRepository
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      today,
      new Date(),
    );
    const todayHours =
      todaySessions
        .filter((s) => s.props.duration !== null)
        .reduce((sum, s) => sum + (s.props.duration || 0), 0) / 60;

    if (todayHours >= this.THRESHOLDS.criticalDailyHours) {
      recommendations.push({
        type: 'END_DAY',
        priority: 'HIGH',
        message: `Has trabajado ${todayHours.toFixed(1)} horas hoy. Es momento de desconectar.`,
        suggestedAction: 'Termina por hoy y retoma mañana con energía renovada',
      });
    } else if (todayHours >= this.THRESHOLDS.warningDailyHours) {
      recommendations.push({
        type: 'END_DAY',
        priority: 'MEDIUM',
        message: `Llevas ${todayHours.toFixed(1)} horas trabajando. No olvides cuidarte.`,
      });
    }

    // Weekend recommendation
    const dayOfWeek = new Date().getDay();
    if (
      (dayOfWeek === 0 || dayOfWeek === 6) &&
      analysis.patterns.weekendWorkPercentage >
        this.THRESHOLDS.warningWeekendWork
    ) {
      recommendations.push({
        type: 'WEEKEND_OFF',
        priority: 'MEDIUM',
        message:
          'Los fines de semana sin trabajo mejoran tu productividad semanal.',
        suggestedAction: 'Intenta desconectar completamente los domingos',
      });
    }

    // Overload recommendations
    if (
      analysis.patterns.urgentTaskCount > this.THRESHOLDS.urgentTaskWarning ||
      analysis.patterns.overdueTaskCount > this.THRESHOLDS.overdueTaskWarning
    ) {
      recommendations.push({
        type: 'REDUCE_WORKLOAD',
        priority: 'HIGH',
        message: 'Tu carga de trabajo parece excesiva. Priorizar es clave.',
        suggestedAction:
          'Revisa tus tareas y delega o pospone las menos urgentes',
      });
    }

    return recommendations.sort((a, b) => {
      const priorities = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  }

  /**
   * Check if user needs an intervention (proactive notification)
   */
  async checkForIntervention(userId: string): Promise<Intervention | null> {
    const analysis = await this.analyzeBurnoutRisk(userId);

    if (analysis.riskLevel === 'CRITICAL') {
      return {
        type: 'CRITICAL_ALERT',
        title: '⚠️ Tu bienestar es importante',
        message:
          'Hemos detectado patrones de trabajo que podrían afectar tu salud. ' +
          'El agotamiento es real y prevenirlo es más fácil que recuperarse de él.',
        recommendations: [
          'Toma un descanso prolongado lo antes posible',
          'Habla con tu equipo sobre redistribuir la carga',
          'Considera reducir tus compromisos esta semana',
        ],
        shouldNotify: true,
      };
    }

    if (analysis.riskLevel === 'HIGH') {
      return {
        type: 'STRONG_WARNING',
        title: '🔔 Cuidado con el agotamiento',
        message:
          'Tus patrones de trabajo recientes sugieren que podrías estar sobrecargado. ' +
          'Un pequeño ajuste ahora puede evitar problemas mayores.',
        recommendations: [
          'Programa descansos regulares',
          'Evita trabajar después de las 9pm',
          'Reserva al menos un día del fin de semana para descansar',
        ],
        shouldNotify: true,
      };
    }

    if (analysis.riskLevel === 'MODERATE' && analysis.warnings.length >= 2) {
      return {
        type: 'GENTLE_REMINDER',
        title: '💡 Un recordatorio amigable',
        message:
          'Has estado trabajando bastante. Recuerda que el descanso también es productivo.',
        recommendations: ['Toma pausas cortas cada 90 minutos'],
        shouldNotify: false, // Only show in dashboard, don't push notification
      };
    }

    return null;
  }

  /**
   * Generate weekly wellbeing summary
   */
  async generateWeeklyWellbeingSummary(
    userId: string,
  ): Promise<WellbeingSummary> {
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    // Get week's sessions using TimerRepository
    const sessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      weekStart,
      weekEnd,
    );

    // Filter to work sessions only
    const workSessions = sessions.filter(
      (s) => s.props.type === 'WORK' && s.props.duration !== null,
    );

    // Get week's completed tasks
    const completedTasks = await this.prisma.task.count({
      where: {
        OR: [{ ownerId: userId }, { assigneeId: userId }],
        status: 'COMPLETED',
        completedAt: { gte: weekStart, lte: weekEnd },
      },
    });

    // Calculate metrics
    const totalMinutes = workSessions.reduce(
      (sum, s) => sum + (s.props.duration || 0),
      0,
    );
    const totalHoursWorked = totalMinutes / 60;

    const sessionLengths = sessions.map((s) => s.duration || 0);
    const avgFocusSessionLength =
      sessionLengths.length > 0
        ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length
        : 0;

    // Count breaks (sessions that started within 30 min of previous session ending)
    let breaksTaken = 0;
    const sortedSessions = [...sessions].sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    );
    for (let i = 1; i < sortedSessions.length; i++) {
      const prevEnd =
        new Date(sortedSessions[i - 1].startedAt).getTime() +
        (sortedSessions[i - 1].duration || 0) * 60000;
      const currStart = new Date(sortedSessions[i].startedAt).getTime();
      const gapMinutes = (currStart - prevEnd) / 60000;
      if (gapMinutes >= 5 && gapMinutes <= 30) {
        breaksTaken++;
      }
    }

    // Find latest work time
    const latestSession = sessions.reduce((latest, s) => {
      const hour = new Date(s.startedAt).getHours();
      return hour > latest ? hour : latest;
    }, 0);
    const latestWorkTime = `${latestSession}:00`;

    // Weekend hours
    const weekendSessions = sessions.filter((s) => {
      const day = new Date(s.startedAt).getDay();
      return day === 0 || day === 6;
    });
    const weekendHours =
      weekendSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;

    // Analyze burnout risk
    const burnoutAnalysis = await this.analyzeBurnoutRisk(userId);

    // Calculate overall score (inverse of risk)
    const overallScore = Math.max(0, 100 - burnoutAnalysis.riskScore);

    // Generate highlights and concerns
    const highlights: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    if (completedTasks >= 10) {
      highlights.push(`Completaste ${completedTasks} tareas esta semana`);
    }
    if (avgFocusSessionLength >= 25 && avgFocusSessionLength <= 60) {
      highlights.push('Sesiones de enfoque de duración óptima');
    }
    if (breaksTaken >= 5) {
      highlights.push(`Tomaste ${breaksTaken} descansos saludables`);
    }
    if (weekendHours < 2) {
      highlights.push('Buen balance de fin de semana');
    }

    for (const warning of burnoutAnalysis.warnings) {
      concerns.push(warning.message);
      recommendations.push(warning.recommendation);
    }

    // Add AI-generated insights if available
    if (burnoutAnalysis.aiInsights) {
      recommendations.push(burnoutAnalysis.aiInsights);
    }

    return {
      weekStart,
      weekEnd,
      overallScore,
      burnoutRisk: burnoutAnalysis.riskLevel,
      highlights,
      concerns,
      recommendations,
      metrics: {
        totalHoursWorked,
        tasksCompleted: completedTasks,
        avgFocusSessionLength,
        breaksTaken,
        latestWorkTime,
        weekendHours,
      },
    };
  }

  // ============ PRIVATE HELPERS ============

  private generateWarnings(patterns: WorkPatternAnalysis): BurnoutWarning[] {
    const warnings: BurnoutWarning[] = [];

    // Late night warning
    if (patterns.lateNightPercentage > this.THRESHOLDS.warningLateNight) {
      warnings.push({
        type: 'LATE_NIGHTS',
        severity:
          patterns.lateNightPercentage > this.THRESHOLDS.warningLateNight * 2
            ? 'SEVERE'
            : 'MODERATE',
        message: `${patterns.lateNightPercentage.toFixed(0)}% de tu trabajo es en horario nocturno`,
        recommendation:
          'Intenta terminar tu trabajo antes de las 10pm para mejor descanso',
      });
    } else if (
      patterns.lateNightPercentage > this.THRESHOLDS.maxHealthyLateNight
    ) {
      warnings.push({
        type: 'LATE_NIGHTS',
        severity: 'MILD',
        message: `Trabajaste ${patterns.lateNightDays} noches esta quincena`,
        recommendation: 'El trabajo nocturno afecta la calidad del sueño',
      });
    }

    // Weekend work warning
    if (patterns.weekendWorkPercentage > this.THRESHOLDS.warningWeekendWork) {
      warnings.push({
        type: 'WEEKEND_WORK',
        severity: patterns.weekendWorkPercentage > 40 ? 'SEVERE' : 'MODERATE',
        message: `${patterns.weekendWorkPercentage.toFixed(0)}% de tu trabajo es en fin de semana`,
        recommendation:
          'Los fines de semana libres mejoran la productividad semanal',
      });
    } else if (
      patterns.weekendWorkPercentage > this.THRESHOLDS.maxHealthyWeekendWork
    ) {
      warnings.push({
        type: 'WEEKEND_WORK',
        severity: 'MILD',
        message: `Trabajaste ${patterns.weekendDays} días de fin de semana`,
        recommendation:
          'Reserva al menos un día del fin de semana para descansar',
      });
    }

    // Session length warning
    if (
      patterns.longestSessionWithoutBreak >
      this.THRESHOLDS.warningSessionWithoutBreak
    ) {
      warnings.push({
        type: 'NO_BREAKS',
        severity:
          patterns.longestSessionWithoutBreak > 180 ? 'SEVERE' : 'MODERATE',
        message: `Tu sesión más larga fue de ${patterns.longestSessionWithoutBreak} minutos sin pausa`,
        recommendation: 'Toma un descanso de 5-10 minutos cada 90 minutos',
      });
    }

    // Long hours warning
    if (patterns.avgDailyWorkHours > this.THRESHOLDS.warningDailyHours) {
      warnings.push({
        type: 'LONG_HOURS',
        severity:
          patterns.avgDailyWorkHours > this.THRESHOLDS.criticalDailyHours
            ? 'SEVERE'
            : 'MODERATE',
        message: `Promedio de ${patterns.avgDailyWorkHours.toFixed(1)} horas diarias`,
        recommendation:
          'Limita tu jornada a 8 horas para mantener la productividad',
      });
    }

    // Overload warning
    if (
      patterns.urgentTaskCount > this.THRESHOLDS.urgentTaskWarning ||
      patterns.overdueTaskCount > this.THRESHOLDS.overdueTaskWarning
    ) {
      warnings.push({
        type: 'OVERLOAD',
        severity:
          patterns.urgentTaskCount > 8 || patterns.overdueTaskCount > 5
            ? 'SEVERE'
            : 'MODERATE',
        message: `${patterns.urgentTaskCount} tareas urgentes, ${patterns.overdueTaskCount} vencidas`,
        recommendation: 'Prioriza y delega. No puedes hacerlo todo.',
      });
    }

    // Declining performance warning
    if (patterns.completionRateTrend === 'DECLINING') {
      warnings.push({
        type: 'DECLINING_PERFORMANCE',
        severity: patterns.recentCompletionRate < 0.5 ? 'SEVERE' : 'MODERATE',
        message: 'Tu tasa de completado está disminuyendo',
        recommendation:
          'Esto puede indicar sobrecarga. Considera reducir compromisos.',
      });
    }

    return warnings;
  }

  private calculateRiskScore(
    patterns: WorkPatternAnalysis,
    warnings: BurnoutWarning[],
  ): number {
    let score = 0;

    // Base scores from patterns
    score += Math.min(25, patterns.lateNightPercentage * 1.5);
    score += Math.min(20, patterns.weekendWorkPercentage * 0.8);
    score += Math.min(15, (patterns.avgDailyWorkHours - 8) * 5);
    score += Math.min(10, patterns.urgentTaskCount * 2);
    score += Math.min(10, patterns.overdueTaskCount * 3);

    // Add severity multipliers from warnings
    for (const warning of warnings) {
      switch (warning.severity) {
        case 'SEVERE':
          score += 10;
          break;
        case 'MODERATE':
          score += 5;
          break;
        case 'MILD':
          score += 2;
          break;
      }
    }

    // Boost if completion rate is declining
    if (patterns.completionRateTrend === 'DECLINING') {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private getRiskLevel(score: number): BurnoutRiskLevel {
    if (score >= 70) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 30) return 'MODERATE';
    return 'LOW';
  }

  private async calculateTaskLoadTrend(
    userId: string,
  ): Promise<'INCREASING' | 'STABLE' | 'DECREASING'> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [recentTasks, previousTasks] = await Promise.all([
      this.prisma.task.count({
        where: {
          OR: [{ ownerId: userId }, { assigneeId: userId }],
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.task.count({
        where: {
          OR: [{ ownerId: userId }, { assigneeId: userId }],
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
    ]);

    const change =
      previousTasks > 0 ? (recentTasks - previousTasks) / previousTasks : 0;

    if (change > 0.2) return 'INCREASING';
    if (change < -0.2) return 'DECREASING';
    return 'STABLE';
  }

  private async calculateCompletionRateTrend(userId: string): Promise<{
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    recentRate: number;
  }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [recentTotal, recentCompleted, previousTotal, previousCompleted] =
      await Promise.all([
        this.prisma.task.count({
          where: {
            OR: [{ ownerId: userId }, { assigneeId: userId }],
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        this.prisma.task.count({
          where: {
            OR: [{ ownerId: userId }, { assigneeId: userId }],
            status: 'COMPLETED',
            completedAt: { gte: sevenDaysAgo },
          },
        }),
        this.prisma.task.count({
          where: {
            OR: [{ ownerId: userId }, { assigneeId: userId }],
            createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
          },
        }),
        this.prisma.task.count({
          where: {
            OR: [{ ownerId: userId }, { assigneeId: userId }],
            status: 'COMPLETED',
            completedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
          },
        }),
      ]);

    const recentRate = recentTotal > 0 ? recentCompleted / recentTotal : 0;
    const previousRate =
      previousTotal > 0 ? previousCompleted / previousTotal : 0;

    const rateDiff = recentRate - previousRate;

    let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
    if (rateDiff > 0.1) trend = 'IMPROVING';
    else if (rateDiff < -0.1) trend = 'DECLINING';

    return { trend, recentRate };
  }

  private async generateAIInsights(
    patterns: WorkPatternAnalysis,
    warnings: BurnoutWarning[],
  ): Promise<string> {
    try {
      const prompt = `Eres un coach de bienestar laboral. Analiza estos patrones de trabajo y da UN consejo personalizado, breve y empático (máximo 2 oraciones):

Patrones:
- Horas promedio diarias: ${patterns.avgDailyWorkHours.toFixed(1)}
- Trabajo nocturno: ${patterns.lateNightPercentage.toFixed(0)}%
- Trabajo en fin de semana: ${patterns.weekendWorkPercentage.toFixed(0)}%
- Tareas urgentes: ${patterns.urgentTaskCount}
- Tareas vencidas: ${patterns.overdueTaskCount}
- Sesión más larga: ${patterns.longestSessionWithoutBreak} minutos

Alertas: ${warnings.map((w) => w.type).join(', ') || 'Ninguna'}

Responde solo con el consejo, sin explicaciones adicionales.`;

      const response = await this.geminiAI.generate('', prompt);

      return response || '';
    } catch (error) {
      this.logger.error('Failed to generate AI insights', error);
      return '';
    }
  }
}
