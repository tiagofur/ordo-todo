import { Test, TestingModule } from '@nestjs/testing';
import { InviteCode } from '@ordo-todo/core';
import { PrismaInviteCodeRepository } from './prisma-invite-code.repository';
import { PrismaService } from '../database/prisma.service';

// TZ-hermetic: fixed UTC instants only.
const NOW = new Date('2026-01-15T12:00:00.000Z');

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'ic-1',
  code: 'ORDO-7KM2-QP9X',
  label: 'beta',
  maxUses: 3,
  usedCount: 1,
  expiresAt: null,
  isActive: true,
  createdById: 'admin-1',
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

describe('PrismaInviteCodeRepository (ODD 019 S1)', () => {
  let repository: PrismaInviteCodeRepository;

  const prisma = {
    inviteCode: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    inviteRedemption: {
      create: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaInviteCodeRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get(PrismaInviteCodeRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it('maps a persisted row to the domain entity', async () => {
    prisma.inviteCode.findUnique.mockResolvedValue(row());

    const invite = await repository.findById('ic-1');

    expect(invite).toBeInstanceOf(InviteCode);
    expect(invite!.code).toBe('ORDO-7KM2-QP9X');
    expect(invite!.remainingUses()).toBe(2);
    expect(invite!.createdById).toBe('admin-1');
  });

  it('normalizes the code before looking it up', async () => {
    prisma.inviteCode.findUnique.mockResolvedValue(null);

    await repository.findByCode('  ordo-7km2-qp9x ');

    expect(prisma.inviteCode.findUnique).toHaveBeenCalledWith({
      where: { code: 'ORDO-7KM2-QP9X' },
    });
  });

  it('persists every domain field on save', async () => {
    prisma.inviteCode.create.mockResolvedValue(row({ id: 'new-id' }));
    const invite = new InviteCode({
      id: 'new-id',
      code: 'ORDO-7KM2-QP9X',
      label: 'beta',
      maxUses: 3,
      usedCount: 0,
      expiresAt: null,
      isActive: true,
      createdById: 'admin-1',
    });

    await repository.save(invite);

    expect(prisma.inviteCode.create).toHaveBeenCalledWith({
      data: {
        id: 'new-id',
        code: 'ORDO-7KM2-QP9X',
        label: 'beta',
        maxUses: 3,
        usedCount: 0,
        expiresAt: null,
        isActive: true,
        createdById: 'admin-1',
      },
    });
  });

  describe('consume (atomic guard)', () => {
    const rawSql = () => {
      const [strings, ...values] = prisma.$executeRaw.mock.calls[0] as [
        TemplateStringsArray,
        ...unknown[],
      ];
      return { sql: strings.join('?').replace(/\s+/g, ' '), values };
    };

    it('increments only while every redeemability rule holds in the database', async () => {
      prisma.$executeRaw.mockResolvedValue(1);

      await expect(repository.consume('ic-1', NOW)).resolves.toBe(true);

      const { sql, values } = rawSql();
      expect(sql).toContain('"usedCount" = "usedCount" + 1');
      expect(sql).toContain('"isActive" = true');
      expect(sql).toContain('"expiresAt" IS NULL OR "expiresAt" >');
      expect(sql).toContain('"usedCount" < "maxUses"');
      expect(values).toEqual(['ic-1', NOW]);
    });

    it('reports a lost race when no row was updated', async () => {
      prisma.$executeRaw.mockResolvedValue(0);

      await expect(repository.consume('ic-1', NOW)).resolves.toBe(false);
    });
  });

  it('release decrements but never below zero', async () => {
    prisma.inviteCode.updateMany.mockResolvedValue({ count: 1 });

    await repository.release('ic-1');

    expect(prisma.inviteCode.updateMany).toHaveBeenCalledWith({
      where: { id: 'ic-1', usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
  });

  it('update only touches mutable fields (label, isActive)', async () => {
    prisma.inviteCode.update.mockResolvedValue(row({ isActive: false }));
    const invite = new InviteCode({
      id: 'ic-1',
      code: 'ORDO-7KM2-QP9X',
      label: 'beta',
      maxUses: 3,
      usedCount: 1,
      isActive: false,
    });

    const updated = await repository.update(invite);

    expect(prisma.inviteCode.update).toHaveBeenCalledWith({
      where: { id: 'ic-1' },
      data: { label: 'beta', isActive: false },
    });
    expect(updated.isActive).toBe(false);
  });

  it('records, finds and counts redemptions', async () => {
    const redemption = {
      id: 'ir-1',
      inviteCodeId: 'ic-1',
      userId: 'user-1',
      redeemedAt: NOW,
    };
    prisma.inviteRedemption.create.mockResolvedValue(redemption);
    prisma.inviteRedemption.findUnique.mockResolvedValue(redemption);
    prisma.inviteRedemption.count.mockResolvedValue(2);

    await expect(
      repository.recordRedemption('ic-1', 'user-1'),
    ).resolves.toEqual(redemption);
    expect(prisma.inviteRedemption.create).toHaveBeenCalledWith({
      data: { inviteCodeId: 'ic-1', userId: 'user-1' },
    });
    await expect(repository.findRedemptionByUserId('user-1')).resolves.toEqual(
      redemption,
    );
    await expect(repository.countRedemptions('ic-1')).resolves.toBe(2);
  });
});
