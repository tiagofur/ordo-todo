import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { CreditsService, CREDIT_COSTS, TRIAL_CREDITS } from './credits.service';
import { PrismaService } from '../../database/prisma.service';

describe('CreditsService (ODD 004 S6)', () => {
  let service: CreditsService;

  const mockAccount = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const mockEvent = { create: jest.fn(), findMany: jest.fn() };
  const mockPrisma = {
    aiCreditAccount: mockAccount,
    aiUsageEvent: mockEvent,
    $transaction: jest.fn(async (fn: (tx: unknown) => unknown) =>
      fn({ aiCreditAccount: mockAccount, aiUsageEvent: mockEvent }),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CreditsService>(CreditsService);
  });

  describe('business numbers (user-confirmed 2026-10-20)', () => {
    it('trial grants 100 credits, Notion-style costs 1/2/5', () => {
      expect(TRIAL_CREDITS).toBe(100);
      expect(CREDIT_COSTS).toEqual({ ask: 1, tool: 2, report: 5 });
    });
  });

  describe('ensureAccount (lazy trial grant)', () => {
    it('creates an account with the trial on first use', async () => {
      mockAccount.findUnique.mockResolvedValue(null);
      mockAccount.create.mockResolvedValue({
        id: 'a1',
        userId: 'u1',
        balance: 100,
        trialUsed: true,
      });
      mockEvent.create.mockResolvedValue({});

      const account = await service.ensureAccount('u1');

      expect(mockAccount.create).toHaveBeenCalledWith({
        data: { userId: 'u1', balance: 100, trialUsed: true },
      });
      expect(mockEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          kind: 'trial_grant',
          cost: 100,
          balance: 100,
        }),
      });
      expect(account.balance).toBe(100);
    });

    it('returns the existing account without re-granting', async () => {
      mockAccount.findUnique.mockResolvedValue({
        id: 'a1',
        userId: 'u1',
        balance: 42,
        trialUsed: true,
      });

      const account = await service.ensureAccount('u1');

      expect(account.balance).toBe(42);
      expect(mockAccount.create).not.toHaveBeenCalled();
      expect(mockEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('charge', () => {
    it('deducts the cost and records the event', async () => {
      mockAccount.findUnique.mockResolvedValue({
        id: 'a1',
        userId: 'u1',
        balance: 100,
        trialUsed: true,
      });
      mockAccount.update.mockResolvedValue({ balance: 99 });
      mockEvent.create.mockResolvedValue({});

      const result = await service.charge('u1', 'ask', 'ai/ask');

      expect(result).toEqual({ cost: 1, balance: 99 });
      expect(mockEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          kind: 'ask',
          cost: -1,
          balance: 99,
          detail: 'ai/ask',
        }),
      });
    });

    it('402s with an actionable message when the balance is short', async () => {
      mockAccount.findUnique.mockResolvedValue({
        id: 'a1',
        userId: 'u1',
        balance: 0,
        trialUsed: true,
      });

      const error = await service
        .charge('u1', 'report', 'daily')
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(402);
      expect((error as HttpException).message).toMatch(/créditos|credits/i);
      expect(mockAccount.update).not.toHaveBeenCalled();
      expect(mockEvent.create).not.toHaveBeenCalled();
    });

    it('grants the trial first when the user has no account', async () => {
      mockAccount.findUnique.mockResolvedValue(null);
      mockAccount.create.mockResolvedValue({
        id: 'a1',
        userId: 'u1',
        balance: 100,
        trialUsed: true,
      });
      mockAccount.update.mockResolvedValue({ balance: 98 });
      mockEvent.create.mockResolvedValue({});

      const result = await service.charge('u1', 'tool', 'create_task');

      expect(result).toEqual({ cost: 2, balance: 98 });
    });
  });

  describe('recharge (admin stub)', () => {
    it('adds credits and records a recharge event', async () => {
      mockAccount.findUnique.mockResolvedValue({
        id: 'a1',
        userId: 'u1',
        balance: 0,
        trialUsed: true,
      });
      mockAccount.update.mockResolvedValue({ balance: 50 });
      mockEvent.create.mockResolvedValue({});

      const result = await service.recharge('u1', 50);

      expect(result.balance).toBe(50);
      expect(mockEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          kind: 'recharge',
          cost: 50,
          balance: 50,
        }),
      });
    });
  });

  describe('getUsage', () => {
    it('returns balance plus recent history', async () => {
      mockAccount.findUnique.mockResolvedValue({
        id: 'a1',
        userId: 'u1',
        balance: 97,
        trialUsed: true,
      });
      mockEvent.findMany.mockResolvedValue([
        { kind: 'ask', cost: -1, balance: 99 },
        { kind: 'tool', cost: -2, balance: 97 },
      ]);

      const usage = await service.getUsage('u1');

      expect(usage.balance).toBe(97);
      expect(usage.trialUsed).toBe(true);
      expect(usage.history).toHaveLength(2);
      expect(mockEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });
  });
});
