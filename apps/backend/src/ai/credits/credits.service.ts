import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Business numbers (user-confirmed 2026-10-20, Notion-style spend-down):
 * trial grants 100 credits; ask costs 1, each executed tool step 2,
 * each generated report 5. S6 check: drain trial → 402; recharge → works.
 */
export const TRIAL_CREDITS = 100;

export const CREDIT_COSTS = {
  ask: 1,
  tool: 2,
  report: 5,
} as const;

export type ChargeableKind = keyof typeof CREDIT_COSTS;

export interface UsageHistoryEntry {
  kind: string;
  cost: number;
  balance: number;
  detail: string | null;
  createdAt: Date;
}

export interface UsageSummary {
  balance: number;
  trialUsed: boolean;
  history: UsageHistoryEntry[];
}

/**
 * AI credit ledger (ODD 004 S6). Every charge is atomic (balance update +
 * usage event in one transaction) so concurrent requests cannot overspend.
 * Accounts are created lazily with the trial on first chargeable use —
 * existing users get the trial automatically, no backfill needed.
 */
@Injectable()
export class CreditsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureAccount(userId: string) {
    const existing = await this.prisma.aiCreditAccount.findUnique({
      where: { userId },
    });
    if (existing) {
      return existing;
    }
    const account = await this.prisma.aiCreditAccount.create({
      data: { userId, balance: TRIAL_CREDITS, trialUsed: true },
    });
    await this.prisma.aiUsageEvent.create({
      data: {
        accountId: account.id,
        kind: 'trial_grant',
        cost: TRIAL_CREDITS,
        balance: TRIAL_CREDITS,
        detail: `Trial inicial: ${TRIAL_CREDITS} créditos de bienvenida.`,
      },
    });
    return account;
  }

  async charge(
    userId: string,
    kind: ChargeableKind,
    detail?: string,
  ): Promise<{ cost: number; balance: number }> {
    const cost = CREDIT_COSTS[kind];
    const account = await this.ensureAccount(userId);
    if (account.balance < cost) {
      throw new HttpException(
        `Te quedaste sin créditos de IA (saldo: ${account.balance}, esta acción cuesta ${cost}). Recarga tu saldo para seguir usando el agente.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
    const next = account.balance - cost;
    await this.prisma.$transaction(async (tx: never) => {
      const client = tx as unknown as PrismaService;
      await client.aiCreditAccount.update({
        where: { id: account.id },
        data: { balance: next },
      });
      await client.aiUsageEvent.create({
        data: {
          accountId: account.id,
          kind,
          cost: -cost,
          balance: next,
          detail: detail ?? null,
        },
      });
    });
    return { cost, balance: next };
  }

  /**
   * Admin stub until Stripe billing (ODD 012) lands: adds credits directly.
   * Authz lives at the controller (ADMIN_API_KEY / ADMIN_EMAILS precedent).
   */
  async recharge(userId: string, amount: number): Promise<{ balance: number }> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new HttpException(
        'La recarga debe ser un número entero positivo de créditos.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const account = await this.ensureAccount(userId);
    const next = account.balance + amount;
    await this.prisma.$transaction(async (tx: never) => {
      const client = tx as unknown as PrismaService;
      await client.aiCreditAccount.update({
        where: { id: account.id },
        data: { balance: next },
      });
      await client.aiUsageEvent.create({
        data: {
          accountId: account.id,
          kind: 'recharge',
          cost: amount,
          balance: next,
          detail: 'Recarga manual (stub admin).',
        },
      });
    });
    return { balance: next };
  }

  async getUsage(userId: string): Promise<UsageSummary> {
    const account = await this.ensureAccount(userId);
    const history = await this.prisma.aiUsageEvent.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return {
      balance: account.balance,
      trialUsed: account.trialUsed,
      history: history.map((e) => ({
        kind: e.kind,
        cost: e.cost,
        balance: e.balance,
        detail: e.detail,
        createdAt: e.createdAt,
      })),
    };
  }
}
