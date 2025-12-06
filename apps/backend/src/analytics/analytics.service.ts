import { Injectable, Inject } from '@nestjs/common';
import type { AnalyticsRepository, TimerRepository } from '@ordo-todo/core';
import { GetDailyMetricsUseCase } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('AnalyticsRepository')
    private readonly analyticsRepository: AnalyticsRepository,
    @Inject('TimerRepository')
    private readonly timerRepository: TimerRepository,
    private readonly prisma: PrismaService,
  ) { }

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

    const currentWeekMetrics = await this.analyticsRepository.getRange(userId, startOfWeek, endOfWeek);
    const lastWeekMetrics = await this.analyticsRepository.getRange(userId, startOfLastWeek, endOfLastWeek);

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
        minutes: current.minutes - last.minutes
      }
    };
  }

  async getHeatmapData(userId: string) {
    const start = this.getStartOfWeek(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const sessions = await this.timerRepository.findByUserIdAndDateRange(userId, start, end);

    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const heatmap = days.map(day => ({
      day,
      hours: Array.from({ length: 24 }, (_, hour) => ({ hour, value: 0 }))
    }));

    sessions.forEach(session => {
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

    const sessions = await this.prisma.timeSession.findMany({
      where: {
        userId,
        startedAt: { gte: start, lte: end }
      },
      include: {
        task: {
          include: { project: true }
        }
      }
    });

    const distribution: Record<string, number> = {};
    sessions.forEach(s => {
      // @ts-ignore
      const project = s.task?.project?.name || 'Sin Proyecto';
      const mins = Math.round((s.duration || 0) / 60);
      distribution[project] = (distribution[project] || 0) + mins;
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  async getTaskStatusDistribution(userId: string) {
    // @ts-ignore
    const tasks = await this.prisma.task.groupBy({
      by: ['status'],
      where: {
        assigneeId: userId,
      },
      _count: { id: true }
    });

    // @ts-ignore
    return tasks.map(t => ({ status: t.status, count: t._count.id }));
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
