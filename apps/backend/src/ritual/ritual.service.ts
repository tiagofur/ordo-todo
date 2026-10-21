import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { TaskRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { AIService } from '../ai/ai.service';
import {
  DayPlanService,
  startOfTodayIn,
  type DayPlanView,
} from '../tasks/day-plan.service';
import { toDateKey } from '../scheduling/candidate-criteria';
import {
  EveningMoveDestination,
  type EveningMoveDto,
} from './dto/evening-move.dto';

// ODD 006 S1 (T1): morning ritual — present the day plan (005) + overdue +
// suggested top-3; persist complete/skip per day. Never blocks the app.
// ODD 006 S2 (T2): evening ritual — completed vs plan, pending tasks moved
// with destination + reason, shutdown complete + disconnect suggestion.
//
// Reads: plan via DayPlanService (TasksModule), tasks via TaskRepository
// (RepositoriesModule), PM summary via AIService (AIModule), user/timezone
// + ritual rows via Prisma.
// DI: RitualModule imports TasksModule + RepositoriesModule + AIModule (no
// cycles: none imports RitualModule back). PrismaService via @Global
// DatabaseModule. AIModule is imported DIRECTLY (not transitively through
// TasksModule) because Nest does not re-export transitive imports —
// TasksModule imports AIModule but only exports TasksService/DayPlanService.
@Injectable()
export class RitualService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dayPlans: DayPlanService,
    private readonly ai: AIService,
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

  // ODD 006 S2 (T2): evening ritual.
  async getEvening(userId: string): Promise<EveningView> {
    const timezone = await this.userTimezone(userId);
    const todayKey = toTodayKey(timezone);
    // The PM summary degrades to null: generateDailyReport charges AI credits
    // (402 without balance) and can 503 on open circuit — a GET must never
    // block the ritual nor drain credits per view. Plan/tasks/state always load.
    const [summary, plan, tasks, ritual] = await Promise.all([
      this.ai.generateDailyReport(userId, 'PM').catch(() => null),
      this.dayPlans.getDayPlan(userId),
      this.taskRepository.findByOwnerId(userId),
      this.prisma.ritualDay.findUnique({
        where: { userId_date: { userId, date: startOfTodayIn(timezone) } },
      }),
    ]);
    // completed = COMPLETED with completedAt today in the user's timezone
    // (pure key filter, same pattern as morning overdue).
    const completed = tasks
      .filter(
        (t) =>
          t.props.status === 'COMPLETED' &&
          toDateKey(t.props.completedAt ?? null, timezone) === todayKey,
      )
      .map((t) => ({ taskId: String(t.id), title: t.props.title }));
    // pending = open tasks still in today's plan blocks.
    const openIds = new Map(
      tasks
        .filter(
          (t) => t.props.status === 'TODO' || t.props.status === 'IN_PROGRESS',
        )
        .map((t) => [String(t.id), t.props.title]),
    );
    const pending = plan.blocks
      .filter((b) => openIds.has(b.taskId))
      .map((b) => ({
        taskId: b.taskId,
        title: openIds.get(b.taskId) as string,
      }));
    return {
      summary,
      completed,
      pending,
      ritual: ritual ? toView(ritual) : null,
    };
  }

  async completeEvening(
    userId: string,
    moves: EveningMoveDto[],
  ): Promise<EveningCompleteView> {
    const timezone = await this.userTimezone(userId);
    const todayKey = toTodayKey(timezone);
    const [plan, tasks] = await Promise.all([
      this.dayPlans.getDayPlan(userId),
      this.taskRepository.findByOwnerId(userId),
    ]);
    const openIds = new Set(
      tasks
        .filter(
          (t) => t.props.status === 'TODO' || t.props.status === 'IN_PROGRESS',
        )
        .map((t) => String(t.id)),
    );
    const inPlan = new Set(plan.blocks.map((b) => b.taskId));
    const pendingIds = new Set([...inPlan].filter((id) => openIds.has(id)));
    // Duplicate taskIds in one close would last-win silently inside the
    // transaction: reject like the morning top-3 does.
    const seen = new Set<string>();
    for (const m of moves) {
      if (seen.has(m.taskId)) {
        throw new BadRequestException(
          `Duplicate move for task ${m.taskId}: one destination per task`,
        );
      }
      seen.add(m.taskId);
    }
    const validated = moves.map((m) =>
      this.toTaskWrite(m, timezone, todayKey, pendingIds),
    );
    const now = new Date();
    const stored = moves.map((m) => ({
      taskId: m.taskId,
      destination: m.destination,
      // Persist `date` only for date-destination moves (a stray client date
      // on tomorrow/archived moves is ignored, not stored).
      ...(m.destination === EveningMoveDestination.DATE && m.date
        ? { date: m.date }
        : {}),
      reason: m.reason,
    }));
    // All validation happens above (400s throw BEFORE any write). Task
    // updates + the ritual upsert run atomically (array-form $transaction,
    // day-plan apply precedent) — no partial state on multi-move closes.
    await this.prisma.$transaction([
      ...validated.map((v) =>
        this.prisma.task.update({
          where: { id: v.taskId, ownerId: userId },
          data: v.data,
        }),
      ),
      this.prisma.ritualDay.upsert({
        where: { userId_date: { userId, date: startOfTodayIn(timezone) } },
        create: {
          userId,
          date: startOfTodayIn(timezone),
          eveningStatus: 'DONE',
          eveningAt: now,
          eveningMoves: stored,
        },
        update: {
          eveningStatus: 'DONE',
          eveningAt: now,
          eveningMoves: stored,
        },
      }),
    ]);
    // Explicit product decision (S2 "cada una con destino"): partial closes
    // are allowed (a subset of pendings), and the response reports the rest
    // as `unmoved` so the UI can show them instead of silently dropping them.
    const movedIds = new Set(moves.map((m) => m.taskId));
    const unmoved = [...pendingIds].filter((id) => !movedIds.has(id));
    return {
      shutdownComplete: true,
      suggestion: shutdownSuggestion(timezone),
      unmoved,
    };
  }

  // Validate one move (throws 400) and map it to its task write.
  // Tenant check: every update carries `where: { id, ownerId }`.
  private toTaskWrite(
    move: EveningMoveDto,
    timezone: string,
    todayKey: string,
    pendingIds: Set<string>,
  ): { taskId: string; data: Record<string, unknown> } {
    if (!pendingIds.has(move.taskId)) {
      throw new BadRequestException(
        `Task ${move.taskId} is not pending in today's plan`,
      );
    }
    if (move.destination === EveningMoveDestination.TOMORROW) {
      return {
        taskId: move.taskId,
        data: { doDate: startOfTomorrowIn(timezone) },
      };
    }
    if (move.destination === EveningMoveDestination.DATE) {
      if (!move.date) {
        throw new BadRequestException(
          `Move for ${move.taskId} needs a date when destination is 'date'`,
        );
      }
      const parsed = parseDateKeyIn(move.date, timezone);
      if (!parsed || move.date < todayKey) {
        throw new BadRequestException(
          `Move for ${move.taskId} has an invalid or past date (want YYYY-MM-DD, today or later)`,
        );
      }
      return { taskId: move.taskId, data: { doDate: parsed } };
    }
    // ARCHIVED: DECISION (documented) — status CANCELLED, NOT soft-delete.
    // The repo has no "archive" concept for tasks; soft-delete (isDeleted +
    // deletedAt, tasks.service remove) means "deleted" and hides the task
    // from every list, while CANCELLED keeps it visible in history and is
    // trivially reversible — the safe semantic for a 1-touch ritual step
    // with no confirmation. CANCELLED is excluded from open tasks by the
    // same TODO/IN_PROGRESS filters ritual + reports already use.
    return {
      taskId: move.taskId,
      data: { status: 'CANCELLED' },
    };
  }

  async skipEvening(userId: string): Promise<RitualDayView> {
    const timezone = await this.userTimezone(userId);
    const now = new Date();
    const row = await this.prisma.ritualDay.upsert({
      where: { userId_date: { userId, date: startOfTodayIn(timezone) } },
      create: {
        userId,
        date: startOfTodayIn(timezone),
        eveningStatus: 'SKIPPED',
        eveningAt: now,
      },
      // Clear any previous complete() data: SKIPPED must not keep stale moves.
      update: {
        eveningStatus: 'SKIPPED',
        eveningAt: now,
        eveningMoves: [],
      },
    });
    return toView(row);
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

export interface EveningTask {
  taskId: string;
  title: string;
}

export interface EveningView {
  summary: Record<string, unknown> | null;
  completed: EveningTask[];
  pending: EveningTask[];
  ritual: RitualDayView | null;
}

export interface EveningCompleteView {
  shutdownComplete: boolean;
  suggestion: string;
  unmoved: string[];
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

// Midnight starting TOMORROW in the given IANA timezone, as an instant.
// Hermetic: date-key arithmetic only (parse today key → add one calendar
// day → noon-anchored offset probe, same technique as startOfTodayIn).
// Exported for the spec (pure, hermetic).
export const startOfTomorrowIn = (timezone: string): Date => {
  const todayKey = toTodayKey(timezone);
  const tomorrowKey = addDaysToKey(todayKey, 1);
  return midnightForKeyIn(tomorrowKey, timezone);
};

// Parse a YYYY-MM-DD key into the midnight instant of that day in the
// given IANA timezone. Returns null for malformed/non-existent dates
// (wrong shape, month 13, Feb 30, …). Exported for the spec.
export const parseDateKeyIn = (key: string, timezone: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [y, mo, d] = key.split('-').map(Number);
  const probe = new Date(Date.UTC(y, mo - 1, d));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== mo - 1 ||
    probe.getUTCDate() !== d
  ) {
    return null;
  }
  return midnightForKeyIn(key, timezone);
};

const addDaysToKey = (key: string, days: number): string => {
  const [y, mo, d] = key.split('-').map(Number);
  const shifted = new Date(Date.UTC(y, mo - 1, d + days));
  return shifted.toISOString().slice(0, 10);
};

// Midnight instant of a YYYY-MM-DD key in an IANA timezone: format the
// noon-anchored guess back through the TZ to recover the wall-clock
// offset, then subtract. Same technique as startOfTodayIn.
const midnightForKeyIn = (key: string, timezone: string): Date => {
  const [y, mo, d] = key.split('-').map(Number);
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
  const midnightUtc = Date.UTC(y, mo - 1, d);
  return new Date(midnightUtc - (wallAsUtc - guess.getTime()));
};

// Disconnect suggestions, rotated deterministically: day-of-year % N.
// NO randomness — the same user-TZ day always yields the same suggestion,
// which keeps the contract testable. Default product locale is ES.
const SHUTDOWN_SUGGESTIONS = [
  'Cierra el portátil y sal a caminar 10 minutos sin pantallas.',
  'Apaga las notificaciones de trabajo hasta mañana.',
  'Escribe en una línea qué fue lo mejor de hoy.',
  'Ordena tu escritorio: mañana tu yo te lo agradecerá.',
  'Prepara la ropa o la mochila de mañana y desconecta.',
  'Llama o escribe a alguien que te importe.',
  'Lee unas páginas de un libro antes de dormir.',
] as const;

// Exported for the spec (pure, hermetic).
export const shutdownSuggestion = (timezone: string): string => {
  const todayKey = toTodayKey(timezone);
  const [y, mo, d] = todayKey.split('-').map(Number);
  const dayOfYear =
    Math.floor(
      (Date.UTC(y, mo - 1, d) - Date.UTC(y, 0, 1)) / (24 * 60 * 60 * 1000),
    ) + 1;
  return SHUTDOWN_SUGGESTIONS[(dayOfYear - 1) % SHUTDOWN_SUGGESTIONS.length];
};
