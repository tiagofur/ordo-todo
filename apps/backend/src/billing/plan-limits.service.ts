import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PLANS, type PlanId } from '@ordo-todo/config';
import { PrismaService } from '../database/prisma.service';

/**
 * Statuses that mean the user never completed a payment: their plan is
 * always FREE regardless of what the row says. Everything else (ACTIVE,
 * TRIALING, PAST_DUE, CANCELED, UNPAID) keeps its plan — T4 turns CANCELED
 * into a grace period before dropping to FREE, and PAST_DUE must never
 * block reading/exporting (ODD 012 S4).
 */
const NEVER_PAID_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.INCOMPLETE,
  SubscriptionStatus.INCOMPLETE_EXPIRED,
];

type LimitedResource = 'workspaces' | 'projects' | 'storage';

const RESOURCE_LABELS: Record<LimitedResource, string> = {
  workspaces: 'espacios de trabajo',
  projects: 'proyectos',
  storage: 'almacenamiento',
};

const PLAN_LABELS: Record<PlanId, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
  enterprise: 'Enterprise',
};

/**
 * Plan enforcement (ODD 012 S4). The limits come from the single plans
 * table in @ordo-todo/config. Enforcement is creation-time only: reading,
 * editing and exporting existing data is never blocked by billing, and the
 * workspace owner's plan governs the workspace's resources (a Free member
 * of a Team workspace is not limited by their own plan).
 */
@Injectable()
export class PlanLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The plan that actually governs this user: FREE when they have no
   * subscription row or never completed checkout.
   */
  async getEffectivePlanId(userId: string): Promise<PlanId> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    });
    if (!subscription || NEVER_PAID_STATUSES.includes(subscription.status)) {
      return 'free';
    }
    return subscription.plan.toLowerCase() as PlanId;
  }

  async assertWithinWorkspaceLimit(ownerUserId: string): Promise<void> {
    const planId = await this.getEffectivePlanId(ownerUserId);
    const limit = PLANS[planId].limits.workspaces;
    if (limit === -1) {
      return;
    }
    const count = await this.prisma.workspace.count({
      where: { ownerId: ownerUserId },
    });
    if (count >= limit) {
      throw this.limitReached(planId, 'workspaces', limit);
    }
  }

  /**
   * The workspace owner's plan decides how many projects the workspace can
   * hold — creating a project in someone else's paid workspace never hits
   * your personal Free limit.
   */
  async assertWithinProjectLimit(workspaceId: string): Promise<void> {
    const planId = await this.ownerPlanId(workspaceId);
    if (!planId) {
      return; // orphan workspace (owner removed): nothing to enforce against
    }
    const limit = PLANS[planId].limits.projects;
    if (limit === -1) {
      return;
    }
    const count = await this.prisma.project.count({
      where: { workspaceId, isDeleted: false },
    });
    if (count >= limit) {
      throw this.limitReached(planId, 'projects', limit);
    }
  }

  async assertWithinTaskStorageLimit(
    taskId: string,
    incomingBytes: number,
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        project: {
          select: {
            workspace: { select: { id: true, ownerId: true } },
          },
        },
      },
    });
    if (!task) {
      return; // unknown task fails later on its own foreign key
    }
    const ownerId = task.project.workspace.ownerId;
    if (!ownerId) {
      return;
    }
    const planId = await this.getEffectivePlanId(ownerId);
    const storageGb = PLANS[planId].limits.storageGb;
    if (storageGb === null || storageGb === -1) {
      return; // null = custom (enterprise), -1 = unlimited
    }
    const limitBytes = Math.floor(storageGb * 1e9);
    const used = await this.prisma.attachment.aggregate({
      _sum: { filesize: true },
      where: { task: { project: { workspaceId: task.project.workspace.id } } },
    });
    const usedBytes = used._sum.filesize ?? 0;
    if (usedBytes + incomingBytes > limitBytes) {
      throw this.limitReached(planId, 'storage', limitBytes);
    }
  }

  private async ownerPlanId(workspaceId: string): Promise<PlanId | undefined> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });
    if (!workspace?.ownerId) {
      return undefined;
    }
    return this.getEffectivePlanId(workspace.ownerId);
  }

  /**
   * 402 with an actionable message + upsell payload so the UI can render a
   * "Ver planes" action straight from the error (ODD 012 S4).
   */
  private limitReached(
    planId: PlanId,
    resource: LimitedResource,
    limit: number,
  ): HttpException {
    const message =
      resource === 'storage'
        ? `Llegaste al límite de ${formatBytes(limit)} de ${RESOURCE_LABELS.storage} en el plan ${PLAN_LABELS[planId]}. Mejora tu plan para ampliarlo.`
        : `Llegaste al límite de ${limit} ${RESOURCE_LABELS[resource]} en el plan ${PLAN_LABELS[planId]}. Mejora tu plan para crear más.`;
    return new HttpException(
      {
        message,
        error: 'PLAN_LIMIT_REACHED',
        plan: planId,
        resource,
        limit,
        upgradeUrl: '/settings/billing',
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1e9;
  return gb < 1
    ? `${Math.round(gb * 1000)} MB`
    : `${Math.round(gb * 10) / 10} GB`;
}
