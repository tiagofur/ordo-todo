import { Inject, Injectable, Optional } from '@nestjs/common';
import type { TaskRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
  planDay,
  type DayPlan,
  type PlanDayInput,
  type PlanTaskInput,
} from './day-planner';
import { replan, type PlanChange, type ReplanTrigger } from './replan';
import { selectDayPlanCandidates } from './candidate-criteria';

// Thin Nest wrapper around the pure planner (T2) plus explicit replan
// triggers (ODD 005 S3, T3a).
//
// NOTE on @Optional deps: the pure planDay path needs no infrastructure and
// the T2 ai-optimal-schedule.spec instantiates this service with zero
// providers (PRESERVE: that spec stays untouched and green). Trigger methods
// guard with a clear error when the deps are missing; in production
// SchedulingModule imports RepositoriesModule so they always resolve.
// PrismaService comes from @Global DatabaseModule (no import needed).
//
// TODO(ODD 005 T5 / ODD 006 ritual / future cron): wire these triggers to
// real write paths — replanOnTaskCompleted into tasks.complete,
// replanOnTaskOverrun into the timer/task-duration update path, and
// replanOnDayStart into the morning ritual worker. T3 only exposes them.
@Injectable()
export class SchedulingService {
  constructor(
    @Optional()
    @Inject('TaskRepository')
    private readonly taskRepository?: TaskRepository,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  planDay(input: PlanDayInput): DayPlan {
    return planDay(input);
  }

  async replanOnDayStart(userId: string): Promise<ReplanResult> {
    // First plan of the day: no previous plan -> every block is `added`.
    return this.runTrigger(userId, { kind: 'day-start' }, {});
  }

  async replanOnTaskCompleted(
    userId: string,
    completedTaskId: string,
    opts: ReplanOptions = {},
  ): Promise<ReplanResult> {
    return this.runTrigger(
      userId,
      { kind: 'completed', taskId: completedTaskId },
      opts,
      // The completed task is out even if the repo read still shows it open.
      (candidates) => candidates.filter((c) => c.taskId !== completedTaskId),
    );
  }

  async replanOnTaskOverrun(
    userId: string,
    taskId: string,
    actualMinutes: number,
    opts: ReplanOptions = {},
  ): Promise<ReplanResult> {
    return this.runTrigger(
      userId,
      { kind: 'overrun', taskId, actualMinutes },
      opts,
      (candidates) =>
        candidates.map((c) =>
          c.taskId === taskId ? { ...c, estimatedMinutes: actualMinutes } : c,
        ),
    );
  }

  private async runTrigger(
    userId: string,
    trigger: ReplanTrigger,
    opts: ReplanOptions,
    adjust: (candidates: PlanTaskInput[]) => PlanTaskInput[] = (c) => c,
  ): Promise<ReplanResult> {
    const taskRepository = this.taskRepository;
    const prisma = this.prisma;
    if (!taskRepository || !prisma) {
      throw new Error(
        'SchedulingService replan triggers need TaskRepository and ' +
          'PrismaService: import SchedulingModule (with RepositoriesModule).',
      );
    }
    // DECISION: tasks come from TaskRepository (same read path + same shared
    // candidate criterion as T2 buildDayPlan), user/timezone and calendar
    // blocks come from Prisma directly (read-only for ExternalCalendarBlock).
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const timezone = user?.timezone || 'America/Mexico_City';
    // "Today" in the user's timezone (same pattern as tasks.findToday).
    const todayKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const tasks = await taskRepository.findByOwnerId(userId);
    const candidates = adjust(
      selectDayPlanCandidates({
        tasks,
        timezone,
        todayKey,
        weekFromNowMs: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }),
    );
    const events = await this.todayEvents(prisma, userId, timezone, todayKey);

    // TODO(ODD 005 T4+): read working hours from user preferences once they
    // exist (no working-hours field in UserPreferences yet — same T2 default).
    return replan({
      previous: opts.previous ?? EMPTY_PLAN,
      frozenTaskIds: opts.frozenTaskIds ?? [],
      tasks: candidates,
      events,
      workingHours: {
        start: '09:00',
        end: '18:00',
        lunchStart: '13:00',
        lunchEnd: '14:00',
      },
      trigger,
    });
  }

  // Real synced calendar events (ODD 010) overlapping the user's today,
  // mapped to HH:MM in the user's timezone. Read-only.
  private async todayEvents(
    prisma: PrismaService,
    userId: string,
    timezone: string,
    todayKey: string,
  ): Promise<{ start: string; end: string }[]> {
    const dayStart = zonedDayStartUtc(todayKey, timezone);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const blocks = await prisma.externalCalendarBlock.findMany({
      where: {
        userId,
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart },
      },
      orderBy: { startAt: 'asc' },
    });
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    return blocks.map((b) => ({
      start: fmt.format(b.startAt),
      end: fmt.format(b.endAt),
    }));
  }
}

export interface ReplanOptions {
  previous?: DayPlan;
  frozenTaskIds?: string[];
}

export interface ReplanResult {
  plan: DayPlan;
  changes: PlanChange[];
}

const EMPTY_PLAN: DayPlan = { blocks: [], unscheduled: [] };

// UTC instant of 00:00 on `todayKey` (YYYY-MM-DD) in `timezone`, via the
// standard guess-and-correct offset algorithm. May be off by ~1h for events
// near midnight on DST transition days (query window only; HH:MM mapping
// stays exact) — acceptable for v1.
const zonedDayStartUtc = (todayKey: string, timezone: string): Date => {
  const asUtc = new Date(`${todayKey}T00:00:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(asUtc);
  const get = (type: string): number =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  const wallAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24,
    get('minute'),
    get('second'),
  );
  return new Date(asUtc.getTime() + (asUtc.getTime() - wallAsUtc));
};
