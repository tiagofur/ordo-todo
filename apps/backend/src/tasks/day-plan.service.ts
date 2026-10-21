import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SchedulingService } from '../scheduling/scheduling.service';
import type { PlanBlock } from '../scheduling/day-planner';
import type { PlanChange } from '../scheduling/replan';

// ODD 005 S3 (T3b): day-plan proposal persistence + freeze/apply.
// Owns the DayPlanProposal lifecycle: latest PROPOSED proposal per user,
// frozen-block edits, and apply (writes doDate/scheduledTime back to Task).
//
// TODO(ODD 005 T5 / ODD 006 ritual): surface dismissed proposals + accept/
// reject UX on top of this service; wire replan triggers after task writes.
@Injectable()
export class DayPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduling: SchedulingService,
  ) {}

  async getDayPlan(userId: string): Promise<DayPlanView> {
    const existing = await this.latestProposed(userId);
    if (existing) return this.toView(existing);
    // No PROPOSED proposal (none yet, or the last one was APPLIED/DISMISSED):
    // build the first plan of the day and persist it.
    const timezone = await this.userTimezone(userId);
    const { plan, changes } = await this.scheduling.replanOnDayStart(userId);
    const created = await this.prisma.dayPlanProposal.create({
      data: {
        userId,
        date: startOfTodayIn(timezone),
        blocks: plan.blocks as unknown as object,
        changes: changes as unknown as object,
        status: 'PROPOSED',
      },
    });
    return this.toView(created);
  }

  async freeze(userId: string, taskId: string): Promise<DayPlanView> {
    const proposal = await this.requireProposed(userId);
    const blocks = asBlocks(proposal.blocks);
    if (!blocks.some((b) => b.taskId === taskId)) {
      throw new NotFoundException(
        `Task ${taskId} is not in the current day plan`,
      );
    }
    const frozenTaskIds = proposal.frozenTaskIds.includes(taskId)
      ? proposal.frozenTaskIds
      : [...proposal.frozenTaskIds, taskId];
    const updated = await this.prisma.dayPlanProposal.update({
      where: { id: proposal.id, userId },
      data: { frozenTaskIds },
    });
    return this.toView(updated);
  }

  async unfreeze(userId: string, taskId: string): Promise<DayPlanView> {
    const proposal = await this.requireProposed(userId);
    const updated = await this.prisma.dayPlanProposal.update({
      where: { id: proposal.id, userId },
      data: {
        frozenTaskIds: proposal.frozenTaskIds.filter((id) => id !== taskId),
      },
    });
    return this.toView(updated);
  }

  async apply(userId: string, proposalId: string): Promise<DayPlanView> {
    const proposal = await this.prisma.dayPlanProposal.findFirst({
      where: { id: proposalId, userId },
    });
    if (!proposal) {
      throw new NotFoundException('Day-plan proposal not found');
    }
    if (proposal.status !== 'PROPOSED') {
      throw new ConflictException(
        `Proposal ${proposalId} is already ${proposal.status}`,
      );
    }
    // Apply = write the plan onto the tasks (doDate + time block).
    // Tenant check + atomicity: only tasks owned by the caller, all writes
    // plus the status flip in one transaction (no partial state, no writes
    // to another user's tasks if a proposal is ever corrupt/manipulated).
    const blocks = asBlocks(proposal.blocks);
    const owned = await this.prisma.task.findMany({
      where: {
        id: { in: blocks.map((b) => b.taskId) },
        ownerId: userId,
      },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((t) => t.id));
    const missing = blocks
      .map((b) => b.taskId)
      .filter((id) => !ownedIds.has(id));
    if (missing.length > 0) {
      throw new ConflictException(
        `Cannot apply: tasks no longer available (${missing.join(', ')})`,
      );
    }
    const results = await this.prisma.$transaction([
      ...blocks.map((block) =>
        this.prisma.task.update({
          where: { id: block.taskId },
          data: {
            doDate: proposal.date,
            scheduledTime: block.start,
            scheduledEndTime: block.end,
            isTimeBlocked: true,
          },
        }),
      ),
      this.prisma.dayPlanProposal.update({
        where: { id: proposal.id },
        data: { status: 'APPLIED' },
      }),
    ]);
    const updated = results[results.length - 1];
    return this.toView(updated);
  }

  private latestProposed(userId: string) {
    return this.prisma.dayPlanProposal.findFirst({
      where: { userId, status: 'PROPOSED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async userTimezone(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    return user?.timezone || 'America/Mexico_City';
  }

  private async requireProposed(userId: string) {
    const proposal = await this.prisma.dayPlanProposal.findFirst({
      where: { userId, status: 'PROPOSED' },
      orderBy: { createdAt: 'desc' },
    });
    if (!proposal) {
      throw new NotFoundException('No proposed day plan for today');
    }
    return proposal;
  }

  private toView(
    proposal: ProposalRow & { blocks: unknown; changes: unknown },
  ): DayPlanView {
    return {
      proposalId: proposal.id,
      status: proposal.status,
      blocks: asBlocks(proposal.blocks),
      frozenTaskIds: proposal.frozenTaskIds,
      changes: asChanges(proposal.changes),
    };
  }
}

// Prisma model row (blocks/changes are Json on the wire).
type ProposalRow = {
  id: string;
  frozenTaskIds: string[];
  status: 'PROPOSED' | 'APPLIED' | 'DISMISSED';
};

export interface DayPlanView {
  proposalId: string;
  status: 'PROPOSED' | 'APPLIED' | 'DISMISSED';
  blocks: PlanBlock[];
  frozenTaskIds: string[];
  changes: PlanChange[];
}

const asBlocks = (value: unknown): PlanBlock[] =>
  Array.isArray(value) ? (value as PlanBlock[]) : [];

const asChanges = (value: unknown): PlanChange[] =>
  Array.isArray(value) ? (value as PlanChange[]) : [];

// Midnight starting `today` in the given IANA timezone (proposal `date`
// aligns with the engine, which plans in the user's timezone — never UTC).
// Exported for the spec (pure, hermetic).
export const startOfTodayIn = (timezone: string): Date => {
  const todayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
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
  return new Date(
    Date.UTC(y, mo - 1, d, 0, 0, 0) - (wallAsUtc - guess.getTime()),
  );
};
