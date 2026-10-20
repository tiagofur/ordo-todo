import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SchedulingService } from '../scheduling/scheduling.service';
import type { DayPlan, PlanBlock } from '../scheduling/day-planner';
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
    const existing = await this.latestProposal(userId);
    if (existing) return this.toView(existing);
    // No proposal yet: build the first plan of the day and persist it.
    const { plan, changes } = await this.scheduling.replanOnDayStart(userId);
    const created = await this.prisma.dayPlanProposal.create({
      data: {
        userId,
        date: startOfTodayUtc(),
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
      where: { id: proposal.id },
      data: { frozenTaskIds },
    });
    return this.toView(updated);
  }

  async unfreeze(userId: string, taskId: string): Promise<DayPlanView> {
    const proposal = await this.requireProposed(userId);
    const updated = await this.prisma.dayPlanProposal.update({
      where: { id: proposal.id },
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
    for (const block of asBlocks(proposal.blocks)) {
      await this.prisma.task.update({
        where: { id: block.taskId },
        data: {
          doDate: proposal.date,
          scheduledTime: block.start,
          scheduledEndTime: block.end,
          isTimeBlocked: true,
        },
      });
    }
    const updated = await this.prisma.dayPlanProposal.update({
      where: { id: proposal.id },
      data: { status: 'APPLIED' },
    });
    return this.toView(updated);
  }

  private latestProposal(userId: string) {
    return this.prisma.dayPlanProposal.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
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

export type { DayPlan };

const asBlocks = (value: unknown): PlanBlock[] =>
  Array.isArray(value) ? (value as PlanBlock[]) : [];

const asChanges = (value: unknown): PlanChange[] =>
  Array.isArray(value) ? (value as PlanChange[]) : [];

const startOfTodayUtc = (): Date => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};
