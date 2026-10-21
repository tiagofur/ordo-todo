import {
  BadRequestException,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import type { TaskRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { DayPlanService, type DayPlanView } from '../tasks/day-plan.service';
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
    @Optional()
    @Inject('TaskRepository')
    private readonly taskRepository?: TaskRepository,
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
      .filter((t) => {
        const due = toDateKey(t.dueDate, timezone);
        return due !== null && due < todayKey;
      })
      .map((t) => ({
        taskId: t.taskId,
        title: t.title,
        dueDateKey: toDateKey(t.dueDate, timezone) as string,
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
    const now = new Date();
    const row = await this.prisma.ritualDay.upsert({
      where: { userId_date: { userId, date: startOfTodayIn(timezone) } },
      create: {
        userId,
        date: startOfTodayIn(timezone),
        morningStatus: 'DONE',
        morningAt: now,
        morningTop3: top3,
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
      update: { morningStatus: 'SKIPPED', morningAt: now },
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
    if (!this.taskRepository) return [];
    const tasks = await this.taskRepository.findByOwnerId(userId);
    return tasks
      .filter(
        (t) => t.props.status === 'TODO' || t.props.status === 'IN_PROGRESS',
      )
      .map((t) => ({
        taskId: String(t.id),
        title: t.props.title,
        dueDate: (t.props.dueDate ?? null) as Date | null,
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

// "Today" key + midnight in the given IANA timezone (same pattern as the
// scheduling engine and DayPlanService — never server-local).
const toTodayKey = (timezone: string): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

export const startOfTodayIn = (timezone: string): Date => {
  const todayKey = toTodayKey(timezone);
  const [y, mo, d] = todayKey.split('-').map(Number);
  const guess = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(guess);
  const get = (t: string): number =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);
  const wallAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24,
    get('minute'),
    get('second'),
  );
  return new Date(Date.UTC(y, mo - 1, d, 0, 0, 0) - (wallAsUtc - guess.getTime()));
};
