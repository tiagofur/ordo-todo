import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminUsersService, AdminIdentity } from './admin-users.service';
import { AuthAuditService } from '../auth/auth-audit.service';
import { PrismaService } from '../database/prisma.service';
import { User } from '@ordo-todo/core';

describe('AdminUsersService (ODD 019 S3)', () => {
  let service: AdminUsersService;

  const mockUserRepository = {
    findById: jest.fn(),
    updateProps: jest.fn(),
  };

  const mockAuthAuditService = {
    logEvent: jest.fn().mockResolvedValue(undefined),
  };

  const prisma = {
    subscription: { upsert: jest.fn() },
  };

  const admin: AdminIdentity = { id: 'admin-1', email: 'admin@example.com' };

  const user = (overrides: Record<string, unknown> = {}) =>
    new User(
      {
        id: 'user-2',
        name: 'Victim',
        username: 'victim',
        email: 'victim@example.com',
        ...overrides,
      },
      'draft',
    );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: 'UserRepository', useValue: mockUserRepository },
        { provide: PrismaService, useValue: prisma },
        { provide: AuthAuditService, useValue: mockAuthAuditService },
      ],
    }).compile();

    service = module.get(AdminUsersService);
    mockUserRepository.findById.mockReset().mockResolvedValue(user());
    mockUserRepository.updateProps.mockReset().mockResolvedValue(undefined);
    mockAuthAuditService.logEvent.mockReset().mockResolvedValue(undefined);
    prisma.subscription.upsert
      .mockReset()
      .mockImplementation((args: any) => Promise.resolve(args.create ?? {}));
  });

  it('blocks a user with status, timestamp and audit trail', async () => {
    const result = await service.blockUser('user-2', admin, {
      ip: '1.2.3.4',
    });

    expect(result).toEqual({ id: 'user-2', status: 'BLOCKED' });
    expect(mockUserRepository.updateProps).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-2' }),
      { status: 'BLOCKED', blockedAt: expect.any(Date) },
    );
    expect(mockAuthAuditService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ADMIN_USER_BLOCKED',
        userId: 'user-2',
        metadata: { adminEmail: admin.email },
      }),
    );
  });

  it('never lets the admin block their own account', async () => {
    mockUserRepository.findById.mockResolvedValue(
      user({ id: admin.id, email: admin.email, username: 'admin' }),
    );

    await expect(service.blockUser(admin.id, admin)).rejects.toThrow(
      BadRequestException,
    );

    const selfError = (await service
      .blockUser(admin.id, admin)
      .catch((e: unknown) => e)) as BadRequestException;
    expect(selfError.getResponse()).toMatchObject({
      code: 'ADMIN_SELF_BLOCK',
    });
    expect(mockUserRepository.updateProps).not.toHaveBeenCalled();
  });

  it('rejects blocking an unknown user (404 USER_NOT_FOUND)', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const error = (await service
      .blockUser('nope', admin)
      .catch((e: unknown) => e)) as NotFoundException;

    expect(error).toBeInstanceOf(NotFoundException);
    expect(error.getResponse()).toMatchObject({ code: 'USER_NOT_FOUND' });
  });

  it('re-blocking an already blocked user is a no-op (N2)', async () => {
    mockUserRepository.findById.mockResolvedValue(user({ status: 'BLOCKED' }));
    mockUserRepository.updateProps.mockClear();

    const result = await service.blockUser('user-2', admin);

    expect(result).toEqual({ id: 'user-2', status: 'BLOCKED' });
    expect(mockUserRepository.updateProps).not.toHaveBeenCalled();
    expect(mockAuthAuditService.logEvent).not.toHaveBeenCalled();
  });

  it('unblocks a user and records the audit trail', async () => {
    mockUserRepository.findById.mockResolvedValue(user({ status: 'BLOCKED' }));

    const result = await service.unblockUser('user-2', admin);

    expect(result).toEqual({ id: 'user-2', status: 'ACTIVE' });
    expect(mockUserRepository.updateProps).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-2' }),
      { status: 'ACTIVE', blockedAt: null },
    );
    expect(mockAuthAuditService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ADMIN_USER_UNBLOCKED',
        metadata: { adminEmail: admin.email },
      }),
    );
  });

  it('re-unblocking an active user is a no-op (N-B4)', async () => {
    const result = await service.unblockUser('user-2', admin);

    expect(result).toEqual({ id: 'user-2', status: 'ACTIVE' });
    expect(mockUserRepository.updateProps).not.toHaveBeenCalled();
    expect(mockAuthAuditService.logEvent).not.toHaveBeenCalled();
  });

  it('rejects unblocking an unknown user', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(service.unblockUser('nope', admin)).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('grantPro / revokePro (ODD 019 S4)', () => {
    it('grants Pro for N days', async () => {
      const result = await service.grantPro('user-2', 30, admin);

      expect(prisma.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-2' },
          update: expect.objectContaining({ plan: 'PRO', status: 'ACTIVE' }),
        }),
      );
      const call = prisma.subscription.upsert.mock.calls[0][0];
      expect(call.update.stripeCurrentPeriodEnd).toBeInstanceOf(Date);
      expect(result).toMatchObject({ id: 'user-2', plan: 'PRO' });
      expect(mockAuthAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ADMIN_PRO_GRANTED',
          metadata: { adminEmail: admin.email, days: 30 },
        }),
      );
    });

    it('grants indefinite Pro (null = no expiry)', async () => {
      await service.grantPro('user-2', null, admin);

      const call = prisma.subscription.upsert.mock.calls[0][0];
      expect(call.create.stripeCurrentPeriodEnd).toBeNull();
    });

    it('rejects invalid day counts', async () => {
      const error = (await service
        .grantPro('user-2', 0, admin)
        .catch((e: unknown) => e)) as BadRequestException;

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toMatchObject({ code: 'INVALID_PRO_DAYS' });
      expect(prisma.subscription.upsert).not.toHaveBeenCalled();
    });

    it('revokes Pro back to FREE keeping the row', async () => {
      const result = await service.revokePro('user-2', admin);

      expect(prisma.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-2' },
          update: { plan: 'FREE' },
        }),
      );
      expect(result).toEqual({ id: 'user-2', plan: 'FREE' });
      expect(mockAuthAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ADMIN_PRO_REVOKED' }),
      );
    });
  });
});
