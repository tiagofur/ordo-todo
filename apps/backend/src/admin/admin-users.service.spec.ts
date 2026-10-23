import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminUsersService, AdminIdentity } from './admin-users.service';
import { AuthAuditService } from '../auth/auth-audit.service';
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
        { provide: AuthAuditService, useValue: mockAuthAuditService },
      ],
    }).compile();

    service = module.get(AdminUsersService);
    mockUserRepository.findById.mockReset().mockResolvedValue(user());
    mockUserRepository.updateProps.mockReset().mockResolvedValue(undefined);
    mockAuthAuditService.logEvent.mockReset().mockResolvedValue(undefined);
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

    const error = await service
      .blockUser('nope', admin)
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NotFoundException);
    expect(error.getResponse()).toMatchObject({ code: 'USER_NOT_FOUND' });
  });

  it('unblocks a user and records the audit trail', async () => {
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

  it('rejects unblocking an unknown user', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(service.unblockUser('nope', admin)).rejects.toThrow(
      NotFoundException,
    );
  });
});
