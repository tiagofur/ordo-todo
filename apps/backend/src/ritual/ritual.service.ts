import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { TaskRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
  DayPlanService,
  startOfTodayIn,
  type DayPlanView,
} from '../tasks/day-plan.service';
import { toDateKey } from '../scheduling/candidate-criteria';

// ODD 006 S1 (T1): morning ritual — present the day plan (005) + overdue +
// suggested top-3; persist complete/skip per day. Never blocks the app.
//
// Reads: plan via DayPlanService (TasksModule), open tasks via TaskRepository
// (RepositoriesModule), user/timezone + ritual rows via Prisma.
// DI: RitualModule imports TasksModule + RepositoriesModule (no cycles:
// neither imports RitualModule back). PrismaService via @Global DatabaseModule.
@Injectable()
export class RitualService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dayPlans: DayPlanService,
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository,
  ) {}

  async getMorning(userId: string): Promise<MorningView> {
    const timezone = await this.userTimezone(userId);
    const todayKey = toTodayKey(timezone);
    const [plan, tasks, ritual] = await Promise.all([
      this.dayPlans.getDayPlan(userId),
      this.openTasks(userId),
      this.prisma.ritualDay.findUnique({
        where: { userId_date: { userId, date: startOfTodayIn(timezone) } },
      }),
    ]);
    // Suggested top-3: first 3 blocks in engine order (documented rule).
    const suggestedTop3 = plan.blocks.slice(0, 3).map((b) => b.taskId);
    const overdue = tasks
      .map((t) => ({ ...t, dueKey: toDateKey(t.dueDate, timezone) }))
      .filter((t) => t.dueKey !== null && t.dueKey < todayKey)
      .map((t) => ({
        taskId: t.taskId,
        title: t.title,
        dueDateKey: t.dueKey as string,
      }));
    return {
      plan,
      overdue,
      suggestedTop3,
      ritual: ritual ? toView(ritual) : null,
    };
  }

  async completeMorning(
    userId: string,
    top3: string[],
  ): Promise<RitualDayView> {
    const timezone = await this.userTimezone(userId);
    const plan = await this.dayPlans.getDayPlan(userId);
    const inPlan = new Set(plan.blocks.map((b) => b.taskId));
    const outside = top3.filter((id) => !inPlan.has(id));
    if (outside.length > 0) {
      throw new BadRequestException(
        `Top-3 tasks must be in today's plan (not in plan: ${outside.join(', ')})`,
      );
    }
    if (new Set(top3).size !== top3.length) {
      throw new BadRequestException('Top-3 must not contain duplicates');
    }
    const now = new Date();
    const row = await this.prisma.ritualDay.upsert({
      where: { userId_date: { userId, date: startOfTodayIn(timezone) } },
      create: {
        userId,
        date: startOfTodayIn(timezone),
        morningStatus: 'DONE',
        morningAt: now,
        morningTop3: top3,
        // Proxy: completion time (DayPlanView exposes no plan-createdAt;
        // threading it through would be scope creep).
        morningPlannedAt: now,
      },
      update: {
        morningStatus: 'DONE',
        morningAt: now,
        morningTop3: top3,
        morningPlannedAt: now,
      },
    });
    return toView(row);
  }

  async skipMorning(userId: string): Promise<RitualDayView> {
    const timezone = await this.userTimezone(userId);
    const now = new Date();
    const row = await this.prisma.ritualDay.upsert({
      where: { userId_date: { userId, date: startOfTodayIn(timezone) } },
      create: {
        userId,
        date: startOfTodayIn(timezone),
        morningStatus: 'SKIPPED',
        morningAt: now,
      },
      // Clear any previous complete() data: SKIPPED must not keep a stale top-3.
      update: {
        morningStatus: 'SKIPPED',
        morningAt: now,
        morningTop3: [],
        morningPlannedAt: null,
      },
    });
    return toView(row);
  }

  private async userTimezone(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    return user?.timezone || 'America/Mexico_City';
  }

  private async openTasks(
    userId: string,
  ): Promise<{ taskId: string; title: string; dueDate: Date | null }[]> {
    const tasks = await this.taskRepository.findByOwnerId(userId);
    return tasks
      .filter(
        (t) => t.props.status === 'TODO' || t.props.status === 'IN_PROGRESS',
      )
      .map((t) => ({
        taskId: String(t.id),
        title: t.props.title,
        dueDate: t.props.dueDate ?? null,
      }));
  }
}

export interface OverdueTask {
  taskId: string;
  title: string;
  dueDateKey: string;
}

export interface RitualDayView {
  morningStatus: 'PENDING' | 'DONE' | 'SKIPPED';
  morningAt: Date | null;
  morningTop3: string[];
  morningPlannedAt: Date | null;
  eveningStatus: 'PENDING' | 'DONE' | 'SKIPPED';
  eveningAt: Date | null;
}

export interface MorningView {
  plan: DayPlanView;
  overdue: OverdueTask[];
  suggestedTop3: string[];
  ritual: RitualDayView | null;
}

type RitualRow = {
  morningStatus: RitualDayView['morningStatus'];
  morningAt: Date | null;
  morningTop3: string[];
  morningPlannedAt: Date | null;
  eveningStatus: RitualDayView['eveningStatus'];
  eveningAt: Date | null;
};

const toView = (row: RitualRow): RitualDayView => ({
  morningStatus: row.morningStatus,
  morningAt: row.morningAt,
  morningTop3: row.morningTop3,
  morningPlannedAt: row.morningPlannedAt,
  eveningStatus: row.eveningStatus,
  eveningAt: row.eveningAt,
});

// "Today" key in the given IANA timezone (never server-local).
const toTodayKey = (timezone: string): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
