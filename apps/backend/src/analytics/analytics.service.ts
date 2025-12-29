import { Injectable, Inject } from '@nestjs/common';
import type {
  AnalyticsRepository,
  TimerRepository,
  TaskRepository,
  WorkspaceRepository,
} from '@ordo-todo/core';
import { GetDailyMetricsUseCase } from '@ordo-todo/core';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('AnalyticsRepository')
    private readonly analyticsRepository: AnalyticsRepository,
    @Inject('TimerRepository')
    private readonly timerRepository: TimerRepository,
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository,
    @Inject('WorkspaceRepository')
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async getDailyMetrics(userId: string, date?: Date) {
    const getDailyMetricsUseCase = new GetDailyMetricsUseCase(
      this.analyticsRepository,
    );
    const targetDate = date ?? new Date();
    const metrics = await getDailyMetricsUseCase.execute(userId, targetDate);
    return metrics.props;
  }

  async getWeeklyMetrics(userId: string, weekStart?: Date) {
    const startDate = weekStart ?? this.getStartOfWeek(new Date());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const metrics = await this.analyticsRepository.getRange(
      userId,
      startDate,
      endDate,
    );

    return metrics.map((m) => m.props);
  }

  async getMonthlyMetrics(userId: string, monthStart?: Date) {
    const startDate = monthStart ?? this.getStartOfMonth(new Date());
    const endDate = this.getEndOfMonth(startDate);

    const metrics = await this.analyticsRepository.getRange(
      userId,
      startDate,
      endDate,
    );

    return metrics.map((m) => m.props);
  }

  async getDateRangeMetrics(userId: string, startDate: Date, endDate: Date) {
    const metrics = await this.analyticsRepository.getRange(
      userId,
      startDate,
      endDate,
    );

    return metrics.map((m) => m.props);
  }

  async getDashboardStats(userId: string) {
    const today = new Date();
    const startOfWeek = this.getStartOfWeek(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const currentWeekMetrics = await this.analyticsRepository.getRange(
      userId,
      startOfWeek,
      endOfWeek,
    );
    const lastWeekMetrics = await this.analyticsRepository.getRange(
      userId,
      startOfLastWeek,
      endOfLastWeek,
    );

    const summarize = (metrics: any[]) => ({
      pomodoros: metrics.reduce((acc, m) => acc + m.props.pomodorosCount, 0),
      tasks: metrics.reduce((acc, m) => acc + m.props.tasksCompletedCount, 0),
      minutes: metrics.reduce((acc, m) => acc + m.props.focusDuration, 0),
    });

    const current = summarize(currentWeekMetrics);
    const last = summarize(lastWeekMetrics);

    const avgPerDay = Math.round(current.pomodoros / 7);

    return {
      ...current,
      avgPerDay,
      trends: {
        pomodoros: current.pomodoros - last.pomodoros,
        tasks: current.tasks - last.tasks,
        minutes: current.minutes - last.minutes,
      },
    };
  }

  async getHeatmapData(userId: string) {
    const start = this.getStartOfWeek(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const sessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      start,
      end,
    );

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const heatmap = days.map((day) => ({
      day,
      hours: Array.from({ length: 24 }, (_, hour) => ({ hour, value: 0 })),
    }));

    sessions.forEach((session) => {
      const sDate = new Date(session.props.startedAt);
      const dayIndex = sDate.getDay();
      const hour = sDate.getHours();
      const duration = Math.round((session.props.duration || 0) / 60);

      heatmap[dayIndex].hours[hour].value += duration;
    });

    const sunday = heatmap.shift();
    if (sunday) heatmap.push(sunday);

    return heatmap;
  }

  async getProjectTimeDistribution(userId: string) {
    const start = this.getStartOfWeek(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const sessions = await this.timerRepository.findByUserIdWithTaskAndProject(
      userId,
      start,
      end,
    );

    const distribution: Record<string, number> = {};
    sessions.forEach((s) => {
      const project = s.task?.project?.name || 'Sin Proyecto';
      const mins = Math.round((s.duration || 0) / 60);
      distribution[project] = (distribution[project] || 0) + mins;
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  async getTaskStatusDistribution(userId: string) {
    const tasks = await this.taskRepository.groupByStatus(userId);
    return tasks;
  }

  // ============ TEAM REPORTS (FOR MANAGERS) ============

  /**
   * Get aggregate team metrics for a workspace
   * Only accessible by ADMIN/OWNER roles
   */
  async getTeamMetrics(workspaceId: string, startDate?: Date, endDate?: Date) {
    const start = startDate || this.getStartOfWeek(new Date());
    const end = endDate || new Date();

    const members =
      await this.workspaceRepository.listMembersWithUser(workspaceId);

    const memberIds = members.map((m) => m.userId);

    const allMetrics: Array<{
      userId: string;
      tasksCompleted: number;
      minutesWorked: number;
      pomodorosCompleted: number;
      focusScore: number | null;
    }> = [];

    for (const userId of memberIds) {
      const metrics = await this.analyticsRepository.getRange(
        userId,
        start,
        end,
      );
      allMetrics.push(
        ...metrics.map((m) => ({
          userId: m.props.userId,
          tasksCompleted: m.props.tasksCompleted,
          minutesWorked: m.props.minutesWorked,
          pomodorosCompleted: m.props.pomodorosCompleted,
          focusScore: m.props.focusScore ?? null,
        })),
      );
    }

    const teamTotals = {
      totalTasksCompleted: allMetrics.reduce(
        (sum, m) => sum + m.tasksCompleted,
        0,
      ),
      totalMinutesWorked: allMetrics.reduce(
        (sum, m) => sum + m.minutesWorked,
        0,
      ),
      totalPomodoros: allMetrics.reduce(
        (sum, m) => sum + m.pomodorosCompleted,
        0,
      ),
      avgFocusScore:
        allMetrics.length > 0
          ? allMetrics.reduce((sum, m) => sum + (m.focusScore || 0), 0) /
            allMetrics.length
          : 0,
      activeMembersCount: new Set(allMetrics.map((m) => m.userId)).size,
    };

    const memberBreakdown = members.map((member) => {
      const memberMetrics = allMetrics.filter(
        (m) => m.userId === member.userId,
      );
      return {
        user: member.user,
        role: member.role,
        tasksCompleted: memberMetrics.reduce(
          (sum, m) => sum + m.tasksCompleted,
          0,
        ),
        minutesWorked: memberMetrics.reduce(
          (sum, m) => sum + m.minutesWorked,
          0,
        ),
        pomodorosCompleted: memberMetrics.reduce(
          (sum, m) => sum + m.pomodorosCompleted,
          0,
        ),
        avgFocusScore:
          memberMetrics.length > 0
            ? memberMetrics.reduce((sum, m) => sum + (m.focusScore || 0), 0) /
              memberMetrics.length
            : 0,
        activeDays: memberMetrics.filter((m) => m.minutesWorked > 0).length,
      };
    });

    memberBreakdown.sort((a, b) => b.tasksCompleted - a.tasksCompleted);

    return {
      period: { start, end },
      teamTotals,
      memberBreakdown,
      topPerformers: memberBreakdown.slice(0, 3),
    };
  }

  // ============ PRODUCTIVITY STREAK ============

  /**
   * Get current productivity streak for a user
   */
  async getProductivityStreak(userId: string) {
    const metrics = await this.analyticsRepository.getRangeDescending(
      userId,
      90,
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const metric of metrics) {
      const isProductive =
        metric.props.tasksCompleted > 0 || metric.props.minutesWorked > 30;

      if (isProductive) {
        if (lastDate === null) {
          tempStreak = 1;
          currentStreak = 1;
        } else {
          const dayDiff = Math.floor(
            (lastDate.getTime() - metric.props.date.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (dayDiff === 1) {
            tempStreak++;
            if (currentStreak === tempStreak - 1) {
              currentStreak = tempStreak;
            }
          } else {
            tempStreak = 1;
          }
        }

        longestStreak = Math.max(longestStreak, tempStreak);
        lastDate = metric.props.date;
      } else {
        if (tempStreak > 0 && currentStreak === tempStreak) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }

    const productiveDays = metrics.filter(
      (m) => m.props.tasksCompleted > 0 || m.props.minutesWorked > 30,
    ).length;
    const avgDailyTasks =
      productiveDays > 0
        ? metrics.reduce((sum, m) => sum + m.props.tasksCompleted, 0) /
          productiveDays
        : 0;

    return {
      currentStreak,
      longestStreak,
      productiveDaysLast90: productiveDays,
      avgDailyTasks: Math.round(avgDailyTasks * 10) / 10,
      streakStatus:
        currentStreak >= 7
          ? 'excellent'
          : currentStreak >= 3
            ? 'good'
            : 'building',
    };
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getStartOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getEndOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  }
}
