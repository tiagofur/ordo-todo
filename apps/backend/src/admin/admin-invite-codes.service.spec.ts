import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminInviteCodesService } from './admin-invite-codes.service';
import { AuthAuditService } from '../auth/auth-audit.service';
import { PrismaService } from '../database/prisma.service';
import { InviteCode } from '@ordo-todo/core';

const admin = { id: 'admin-1', email: 'admin@example.com' };

const inviteRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'ic-1',
  code: 'ORDO-7KM2-QP9X',
  label: 'beta',
  maxUses: 5,
  usedCount: 2,
  expiresAt: null,
  isActive: true,
  createdAt: new Date(),
  ...overrides,
});

describe('AdminInviteCodesService (ODD 019 S4)', () => {
  let service: AdminInviteCodesService;

  const inviteCodeRepository = {
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    listAll: jest.fn(),
    consume: jest.fn(),
    release: jest.fn(),
    recordRedemption: jest.fn(),
    findRedemptionByUserId: jest.fn(),
    countRedemptions: jest.fn(),
  };

  const prisma = {
    inviteCode: { findUniqueOrThrow: jest.fn() },
    inviteRedemption: { count: jest.fn() },
  };

  const authAuditService = { logEvent: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminInviteCodesService,
        { provide: 'InviteCodeRepository', useValue: inviteCodeRepository },
        { provide: PrismaService, useValue: prisma },
        { provide: AuthAuditService, useValue: authAuditService },
      ],
    }).compile();

    service = module.get(AdminInviteCodesService);
    Object.values(inviteCodeRepository).forEach((fn) => fn.mockReset());
    prisma.inviteCode.findUniqueOrThrow
      .mockReset()
      .mockResolvedValue(inviteRow());
    prisma.inviteRedemption.count.mockReset().mockResolvedValue(2);
    authAuditService.logEvent.mockReset().mockResolvedValue(undefined);
  });

  it('creates a code through the use case, with creator and audit trail', async () => {
    inviteCodeRepository.findByCode.mockResolvedValue(null);
    inviteCodeRepository.save.mockImplementation(async (invite: InviteCode) =>
      invite.clone({ id: 'ic-new' }),
    );

    const created = await service.create(
      { label: 'amigos', maxUses: 3 },
      admin,
    );

    expect(inviteCodeRepository.save).toHaveBeenCalled();
    expect(created.code).toMatch(/^ORDO-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(created).toMatchObject({ redemptions: 2 });
    expect(authAuditService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'INVITE_CODE_CREATED',
        metadata: { adminEmail: admin.email, code: expect.any(String) },
      }),
    );
  });

  it('lists codes with live redemption counts', async () => {
    inviteCodeRepository.listAll.mockResolvedValue([
      new InviteCode({
        id: 'ic-1',
        code: 'ORDO-7KM2-QP9X',
        maxUses: 5,
        usedCount: 2,
        isActive: true,
      }),
    ]);

    const list = await service.list();

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      code: 'ORDO-7KM2-QP9X',
      usedCount: 2,
      redemptions: 2,
    });
  });

  it('maps an unknown id to 404 INVITE_NOT_FOUND (N-B2)', async () => {
    inviteCodeRepository.findById.mockResolvedValue(null);

    const error = (await service
      .deactivate('nope', admin)
      .catch((e: unknown) => e)) as NotFoundException;

    expect(error).toBeInstanceOf(NotFoundException);
    expect(error.getResponse()).toMatchObject({ code: 'INVITE_NOT_FOUND' });
    expect(authAuditService.logEvent).not.toHaveBeenCalled();
  });

  it('deactivates and audits only when the state actually changed', async () => {
    inviteCodeRepository.findById.mockResolvedValue(
      new InviteCode({
        id: 'ic-1',
        code: 'ORDO-7KM2-QP9X',
        maxUses: 5,
        usedCount: 2,
        isActive: true,
      }),
    );
    inviteCodeRepository.update.mockImplementation(
      async (invite: InviteCode) => invite,
    );

    await service.deactivate('ic-1', admin);

    expect(inviteCodeRepository.update).toHaveBeenCalled();
    expect(authAuditService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'INVITE_CODE_DEACTIVATED' }),
    );

    // Already inactive: idempotent, no duplicate audit row.
    inviteCodeRepository.update.mockClear();
    authAuditService.logEvent.mockClear();
    inviteCodeRepository.findById.mockResolvedValue(
      new InviteCode({
        id: 'ic-1',
        code: 'ORDO-7KM2-QP9X',
        maxUses: 5,
        usedCount: 2,
        isActive: false,
      }),
    );

    await service.deactivate('ic-1', admin);

    expect(inviteCodeRepository.update).not.toHaveBeenCalled();
    expect(authAuditService.logEvent).not.toHaveBeenCalled();
  });
});
